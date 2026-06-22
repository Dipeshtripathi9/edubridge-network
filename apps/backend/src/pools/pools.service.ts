import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoolDto } from './dto/pool.dto';

@Injectable()
export class PoolsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCommunityMember(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member) throw new ForbiddenException('Join the community first');
  }

  /** Create a private capped group ("pool") backed by a GROUP chat. */
  async create(userId: string, slug: string, dto: CreatePoolDto) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    await this.assertCommunityMember(community.id, userId);

    const pool = await this.prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          type: 'GROUP',
          communityId: community.id,
          title: dto.title,
          participants: { create: { userId } },
        },
      });
      return tx.pool.create({
        data: {
          communityId: community.id,
          title: dto.title,
          description: dto.description,
          maxMembers: dto.maxMembers,
          createdById: userId,
          chatId: chat.id,
          members: { create: { userId } },
        },
      });
    });
    return { ...pool, memberCount: 1, isMember: true };
  }

  async list(slug: string, userId: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const pools = await this.prisma.pool.findMany({
      where: { communityId: community.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { id: true } },
      },
    });
    return pools.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      maxMembers: p.maxMembers,
      chatId: p.chatId,
      createdById: p.createdById,
      memberCount: p._count.members,
      isMember: p.members.length > 0,
      isFull: p._count.members >= p.maxMembers,
    }));
  }

  /** Pools the user belongs to, across all communities (their "network"). */
  async myPools(userId: string) {
    const memberships = await this.prisma.poolMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      include: {
        pool: {
          include: {
            community: { select: { name: true, slug: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });
    return memberships.map((m) => ({
      id: m.pool.id,
      title: m.pool.title,
      description: m.pool.description,
      maxMembers: m.pool.maxMembers,
      chatId: m.pool.chatId,
      createdById: m.pool.createdById,
      memberCount: m.pool._count.members,
      isFull: m.pool._count.members >= m.pool.maxMembers,
      isMember: true,
      community: m.pool.community,
    }));
  }

  async get(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: {
          include: { user: { select: { id: true, profile: { select: { fullName: true } } } } },
        },
      },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    const isMember = pool.members.some((m) => m.userId === userId);
    return {
      id: pool.id,
      title: pool.title,
      description: pool.description,
      maxMembers: pool.maxMembers,
      chatId: pool.chatId,
      createdById: pool.createdById,
      memberCount: pool._count.members,
      isFull: pool._count.members >= pool.maxMembers,
      isMember,
      // The chat itself is only readable by members (chat participation guard).
      members: pool.members.map((m) => ({
        id: m.user.id,
        fullName: m.user.profile?.fullName ?? 'Student',
      })),
    };
  }

  async join(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    await this.assertCommunityMember(pool.communityId, userId);

    const existing = await this.prisma.poolMember.findUnique({
      where: { poolId_userId: { poolId: id, userId } },
    });
    if (existing) return { joined: true };
    if (pool._count.members >= pool.maxMembers) {
      throw new BadRequestException('This pool is full');
    }
    await this.prisma.$transaction([
      this.prisma.poolMember.create({ data: { poolId: id, userId } }),
      this.prisma.chatParticipant.upsert({
        where: { chatId_userId: { chatId: pool.chatId, userId } },
        update: {},
        create: { chatId: pool.chatId, userId },
      }),
    ]);
    return { joined: true };
  }

  async leave(id: string, userId: string) {
    const pool = await this.prisma.pool.findUnique({ where: { id } });
    if (!pool) throw new NotFoundException('Pool not found');
    await this.prisma.poolMember.deleteMany({ where: { poolId: id, userId } });
    await this.prisma.chatParticipant.deleteMany({ where: { chatId: pool.chatId, userId } });
    return { left: true };
  }
}
