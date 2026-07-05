import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  CommunityCapability,
  isPlatformAdmin,
  roleHasCapability,
} from '../communities/community-permissions';
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

  async list(query: OpportunityQueryDto, userId?: string) {
    // Global feed scoping (mirrors resources):
    //  - everyone sees topic/startup (and college-less) opportunities;
    //  - other colleges' opportunities stay hidden;
    //  - a VERIFIED student also sees THEIR OWN college's opportunities.
    const scoped = !!(query.communityId || query.collegeId);

    let verifiedCollegeId: string | null = null;
    if (!scoped && userId) {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true, collegeVerification: true },
      });
      if (profile?.collegeVerification === 'VERIFIED') verifiedCollegeId = profile.collegeId ?? null;
    }

    const globalOnly: Prisma.OpportunityWhereInput = {
      collegeId: null,
      OR: [{ communityId: null }, { community: { type: { not: 'COLLEGE' } } }],
    };
    const scopeWhere: Prisma.OpportunityWhereInput = verifiedCollegeId
      ? {
          OR: [
            globalOnly,
            { collegeId: verifiedCollegeId },
            { community: { type: 'COLLEGE', collegeId: verifiedCollegeId } },
          ],
        }
      : globalOnly;

    // Use AND so the search-OR and the scope-OR don't overwrite each other.
    const and: Prisma.OpportunityWhereInput[] = [];
    if (query.q) {
      and.push({
        OR: [
          { title: { contains: query.q, mode: 'insensitive' } },
          { organization: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }
    if (!scoped) and.push(scopeWhere);

    // Scoping rules:
    //  - A COLLEGE community / college hub shows its own opportunities PLUS everything
    //    globally visible (truly-global + interest/startup-community opportunities).
    //  - An interest/startup community shows ONLY its own (category-specific) ones.
    if (query.collegeId) {
      and.push({ OR: [{ collegeId: query.collegeId }, globalOnly] });
    }
    if (query.communityId) {
      const comm = await this.prisma.community.findUnique({
        where: { id: query.communityId },
        select: { type: true },
      });
      and.push(
        comm?.type === 'COLLEGE'
          ? { OR: [{ communityId: query.communityId }, globalOnly] }
          : { communityId: query.communityId },
      );
    }

    const where: Prisma.OpportunityWhereInput = {
      isActive: true,
      approvalStatus: 'APPROVED', // only approved opportunities are public
      ...(query.type ? { type: query.type } : {}),
      ...(query.isRemote !== undefined ? { isRemote: query.isRemote } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(and.length ? { AND: and } : {}),
    };

    // id tiebreaker keeps cursor pagination stable when deadline/createdAt tie.
    const orderBy: Prisma.OpportunityOrderByWithRelationInput[] =
      query.sort === 'deadline'
        ? [{ deadline: 'asc' }, { id: 'desc' }]
        : [{ createdAt: 'desc' }, { id: 'desc' }];

    const items = await this.prisma.opportunity.findMany({
      where,
      orderBy,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
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

  async create(actor: { sub: string; role: string }, dto: CreateOpportunityDto) {
    const isAdmin = isPlatformAdmin(actor.role);
    let isStartup = false;
    let canManageHere = isAdmin;

    if (dto.communityId) {
      const community = await this.prisma.community.findUnique({
        where: { id: dto.communityId },
        select: { type: true },
      });
      if (!community) throw new NotFoundException('Community not found');
      isStartup = community.type === 'STARTUP';
      if (!canManageHere) {
        const member = await this.prisma.communityMember.findUnique({
          where: { communityId_userId: { communityId: dto.communityId, userId: actor.sub } },
        });
        // Must be a member to post in a community.
        if (!member && !isAdmin) {
          throw new ForbiddenException('Join the community to post opportunities');
        }
        canManageHere = roleHasCapability(member?.role, 'VIEW');
      }
      // Startup communities: only admins & the community's managers may post.
      if (isStartup && !canManageHere) {
        throw new ForbiddenException(
          "Only admins & this community's managers can post opportunities here",
        );
      }
    }

    // Admins, and managers posting in their startup community, publish immediately;
    // members submitting to a topic/college community still need manager approval.
    const needsApproval = !!dto.communityId && !isAdmin && !(isStartup && canManageHere);
    const opportunity = await this.prisma.opportunity.create({
      data: {
        ...dto,
        tags: dto.tags ?? [],
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        createdById: actor.sub,
        approvalStatus: needsApproval ? 'PENDING' : 'APPROVED',
        sourceSystem: 'manual',
      },
    });
    await this.invalidate();
    return opportunity;
  }

  /** Capability check against the actor's role in a community. */
  private async assertCommunityCap(
    communityId: string | null,
    actor: { sub: string; role: string },
    cap: CommunityCapability,
  ) {
    if (isPlatformAdmin(actor.role)) return;
    if (communityId) {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId: actor.sub } },
      });
      if (roleHasCapability(member?.role, cap)) return;
    }
    throw new ForbiddenException('Your role cannot perform this action');
  }

  async listPending(actor: { sub: string; role: string }, communityId?: string) {
    if (!isPlatformAdmin(actor.role)) {
      if (!communityId) throw new ForbiddenException('Specify a community you manage');
      // Any manager who can view the dashboard may see the pending queue.
      await this.assertCommunityCap(communityId, actor, 'VIEW');
    }
    return this.prisma.opportunity.findMany({
      where: { approvalStatus: 'PENDING', ...(communityId ? { communityId } : {}) },
      orderBy: { createdAt: 'asc' },
      include: { createdBy: { select: { id: true, profile: { select: { fullName: true } } } } },
    });
  }

  async decide(actor: { sub: string; role: string }, id: string, approve: boolean) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    // Only the Opportunity Head (or Campus Lead / admin) may approve.
    await this.assertCommunityCap(opportunity.communityId, actor, 'APPROVE_OPPORTUNITY');
    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: { approvalStatus: approve ? 'APPROVED' : 'REJECTED', isActive: approve },
      select: { id: true, approvalStatus: true },
    });
    await this.invalidate();
    return updated;
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
    if (
      opportunity.createdById !== userId &&
      !(await this.canModerate(opportunity.communityId, userId, role))
    ) {
      throw new ForbiddenException('Cannot delete this opportunity');
    }
    await this.prisma.opportunity.update({ where: { id }, data: { isActive: false } });
    await this.invalidate();
    return { deleted: true };
  }

  /** Platform admins/mods, or a manager of the opportunity's community, may moderate it. */
  private async canModerate(communityId: string | null, userId: string, role: string): Promise<boolean> {
    if (isPlatformAdmin(role) || role === 'MODERATOR') return true;
    if (!communityId) return false;
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    return roleHasCapability(member?.role, 'MODERATE');
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

    // Candidate pool: approved + active, not-yet-passed deadlines (or no deadline).
    // approvalStatus is essential — without it, PENDING/unapproved submissions
    // (which keep isActive:true) leak into every student's recommended feed.
    const candidates = await this.prisma.opportunity.findMany({
      where: {
        approvalStatus: 'APPROVED',
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
