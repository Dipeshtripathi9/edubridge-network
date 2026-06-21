import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommunityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/query.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async invalidate(slug?: string) {
    await this.redis.delPattern('community:list:*');
    if (slug) await this.redis.del(`community:slug:${slug}`);
  }

  async createCommunity(userId: string, dto: CreateCommunityDto) {
    if (dto.type === CommunityType.COLLEGE && !dto.collegeId) {
      throw new BadRequestException('collegeId is required for COLLEGE communities');
    }
    if (dto.type === CommunityType.TOPIC && !dto.topic) {
      throw new BadRequestException('topic is required for TOPIC communities');
    }

    let slug = slugify(dto.name);
    const clash = await this.prisma.community.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;

    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        type: dto.type,
        visibility: dto.visibility,
        topic: dto.topic,
        collegeId: dto.collegeId,
        iconUrl: dto.iconUrl,
        bannerUrl: dto.bannerUrl,
        createdById: userId,
        memberCount: 1,
        members: { create: { userId, role: 'ADMIN' } },
      },
    });
    await this.invalidate();
    return community;
  }

  async listCommunities(query: CommunityQueryDto, userId?: string) {
    const cacheKey = `community:list:${JSON.stringify(query)}`;
    const where: Prisma.CommunityWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.topic ? { topic: query.topic } : {}),
      ...(query.collegeId ? { collegeId: query.collegeId } : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
    };

    // Cache only anonymous, non-search listings (membership flag is user-specific).
    const cacheable = !userId && !query.q;
    const fetch = async () => {
      const items = await this.prisma.community.findMany({
        where,
        orderBy: { memberCount: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { college: { select: { id: true, name: true, slug: true, logoUrl: true } } },
      });
      return buildPaginatedResult(items, query);
    };

    const result = cacheable ? await this.redis.remember(cacheKey, 30, fetch) : await fetch();

    if (userId) {
      const ids = result.data.map((c) => c.id);
      const memberships = await this.prisma.communityMember.findMany({
        where: { userId, communityId: { in: ids } },
        select: { communityId: true },
      });
      const joined = new Set(memberships.map((m) => m.communityId));
      result.data = result.data.map((c) => ({ ...c, isMember: joined.has(c.id) }));
    }
    return result;
  }

  async getCommunityBySlug(slug: string, userId?: string) {
    const community = await this.redis.remember(`community:slug:${slug}`, 60, async () => {
      const c = await this.prisma.community.findUnique({
        where: { slug },
        include: { college: true },
      });
      if (!c) throw new NotFoundException('Community not found');
      return c;
    });

    let isMember = false;
    if (userId) {
      const m = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: community.id, userId } },
      });
      isMember = !!m;
    }
    return { ...community, isMember };
  }

  async joinCommunity(userId: string, slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (existing) return { joined: true };

    await this.prisma.$transaction([
      this.prisma.communityMember.create({ data: { communityId: community.id, userId } }),
      this.prisma.community.update({
        where: { id: community.id },
        data: { memberCount: { increment: 1 } },
      }),
    ]);
    await this.invalidate(slug);
    return { joined: true };
  }

  async leaveCommunity(userId: string, slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (!existing) return { joined: false };

    await this.prisma.$transaction([
      this.prisma.communityMember.delete({
        where: { communityId_userId: { communityId: community.id, userId } },
      }),
      this.prisma.community.update({
        where: { id: community.id },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);
    await this.invalidate(slug);
    return { joined: false };
  }

  async listMembers(slug: string, query: CommunityQueryDto) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const members = await this.prisma.communityMember.findMany({
      where: { communityId: community.id },
      skip: query.skip,
      take: query.limit,
      orderBy: { joinedAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            reputationPoints: true,
            profile: { select: { fullName: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
    return buildPaginatedResult(members, query);
  }

  /** Internal helper: require the user to be a moderator/admin of a community. */
  async assertModerator(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member || member.role === 'MEMBER') {
      throw new ForbiddenException('Moderator privileges required');
    }
  }
}
