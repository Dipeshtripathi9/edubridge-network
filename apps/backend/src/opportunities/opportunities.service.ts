import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  ApplicationDto,
  CreateOpportunityDto,
  OpportunityQueryDto,
  UpdateOpportunityDto,
} from './dto/opportunity.dto';

// Maps a student's interest tags to the opportunity types they likely care about.
const INTEREST_TYPE_MAP: Record<string, OpportunityType[]> = {
  internships: [OpportunityType.INTERNSHIP],
  placement: [OpportunityType.INTERNSHIP],
  'higher studies': [OpportunityType.FELLOWSHIP, OpportunityType.RESEARCH],
  research: [OpportunityType.RESEARCH, OpportunityType.FELLOWSHIP],
  startups: [OpportunityType.COMPETITION, OpportunityType.FELLOWSHIP],
};

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private invalidate() {
    return this.redis.delPattern('opportunity:list:*');
  }

  async list(query: OpportunityQueryDto) {
    const where: Prisma.OpportunityWhereInput = {
      isActive: true,
      ...(query.type ? { type: query.type } : {}),
      ...(query.collegeId ? { collegeId: query.collegeId } : {}),
      ...(query.isRemote !== undefined ? { isRemote: query.isRemote } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { organization: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.OpportunityOrderByWithRelationInput =
      query.sort === 'deadline' ? { deadline: 'asc' } : { createdAt: 'desc' };

    const items = await this.prisma.opportunity.findMany({
      where,
      orderBy,
      skip: query.skip,
      take: query.limit,
    });
    return buildPaginatedResult(items, query);
  }

  async getOne(id: string, userId?: string) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    let application = null;
    if (userId) {
      application = await this.prisma.application.findUnique({
        where: { opportunityId_userId: { opportunityId: id, userId } },
        select: { id: true, status: true, notes: true },
      });
    }
    return { ...opportunity, myApplication: application };
  }

  async create(userId: string, dto: CreateOpportunityDto) {
    const opportunity = await this.prisma.opportunity.create({
      data: {
        ...dto,
        tags: dto.tags ?? [],
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        createdById: userId,
        sourceSystem: 'manual',
      },
      // collegeId flows through from dto via the spread above
    });
    await this.invalidate();
    return opportunity;
  }

  async update(id: string, userId: string, role: string, dto: UpdateOpportunityDto) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN';
    if (opportunity.createdById !== userId && !isPrivileged) {
      throw new ForbiddenException('Cannot edit this opportunity');
    }
    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}),
      },
    });
    await this.invalidate();
    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN';
    if (opportunity.createdById !== userId && !isPrivileged) {
      throw new ForbiddenException('Cannot delete this opportunity');
    }
    await this.prisma.opportunity.update({ where: { id }, data: { isActive: false } });
    await this.invalidate();
    return { deleted: true };
  }

  // ---------------- Applications (save / apply / track) ----------------
  async upsertApplication(opportunityId: string, userId: string, dto: ApplicationDto) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    return this.prisma.application.upsert({
      where: { opportunityId_userId: { opportunityId, userId } },
      update: { status: dto.status, notes: dto.notes },
      create: { opportunityId, userId, status: dto.status, notes: dto.notes },
    });
  }

  async myApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { opportunity: true },
    });
  }

  async removeApplication(id: string, userId: string) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Not your application');
    await this.prisma.application.delete({ where: { id } });
    return { deleted: true };
  }

  // ---------------- Recommendation engine ----------------
  /**
   * Recommend opportunities by matching a student's interests to opportunity tags
   * and types. Active + upcoming first; ranked by relevance score.
   */
  async recommend(userId: string, limit = 10) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { interests: true },
    });
    const interests = (profile?.interests ?? []).map((i) => i.toLowerCase());

    // Candidate pool: active, not-yet-passed deadlines (or no deadline).
    const candidates = await this.prisma.opportunity.findMany({
      where: {
        isActive: true,
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (interests.length === 0) {
      return candidates.slice(0, limit).map((o) => ({ ...o, score: 0 }));
    }

    const preferredTypes = new Set<OpportunityType>(
      interests.flatMap((i) => INTEREST_TYPE_MAP[i] ?? []),
    );

    const scored = candidates
      .map((o) => {
        const tagOverlap = o.tags.filter((t) => interests.includes(t.toLowerCase())).length;
        const typeBoost = preferredTypes.has(o.type) ? 2 : 0;
        return { ...o, score: tagOverlap * 3 + typeBoost };
      })
      .sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());

    return scored.slice(0, limit);
  }
}
