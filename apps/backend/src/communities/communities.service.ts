import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommunityRole, CommunityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/query.dto';
import {
  CommunityCapability,
  isPlatformAdmin,
  roleHasCapability,
} from './community-permissions';

// Roles that act as a "head" of a community (full management privilege).
const HEAD_ROLES: CommunityRole[] = [
  'ADMIN',
  'CAMPUS_LEAD',
  'OPPORTUNITY_HEAD',
  'STUDENT_RELATIONS_HEAD',
];
const isHead = (r?: CommunityRole | null) => !!r && HEAD_ROLES.includes(r);
const isMod = (r?: CommunityRole | null) => !!r && (r === 'MODERATOR' || HEAD_ROLES.includes(r));

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
    private readonly notifications: NotificationsService,
  ) {}

  private async invalidate(slug?: string) {
    await this.redis.delPattern('community:list:*');
    if (slug) await this.redis.del(`community:slug:${slug}`);
  }

  /** Recompute the denormalized member count from the source of truth. */
  private async syncMemberCount(communityId: string) {
    const count = await this.prisma.communityMember.count({ where: { communityId } });
    await this.prisma.community.update({ where: { id: communityId }, data: { memberCount: count } });
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
    let myRole: string | null = null;
    if (userId) {
      const m = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: community.id, userId } },
      });
      isMember = !!m;
      myRole = m?.role ?? null;
    }
    return { ...community, isMember, myRole };
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

  /** Require global admin/mod OR a community ADMIN (level 'ADMIN') / mod (level 'MOD'). */
  private async assertCommunityPrivilege(
    communityId: string,
    actor: { sub: string; role: string },
    level: 'ADMIN' | 'MOD',
  ) {
    const globalOk =
      actor.role === 'ADMIN' ||
      actor.role === 'SUPER_ADMIN' ||
      (level === 'MOD' && actor.role === 'MODERATOR');
    if (globalOk) return;
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: actor.sub } },
    });
    const ok = level === 'ADMIN' ? isHead(member?.role) : isMod(member?.role);
    if (!ok) throw new ForbiddenException('Insufficient community privileges');
  }

  /** Lock an action to the role whose job it is (Campus Lead/ADMIN are full). */
  private async assertCapability(
    communityId: string,
    actor: { sub: string; role: string },
    cap: CommunityCapability,
  ) {
    if (isPlatformAdmin(actor.role)) return;
    // Platform moderators retain community moderation + viewing.
    if (actor.role === 'MODERATOR' && (cap === 'MODERATE' || cap === 'VIEW')) return;
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId: actor.sub } },
    });
    if (!roleHasCapability(member?.role, cap)) {
      throw new ForbiddenException('Your role cannot perform this action');
    }
  }

  private async resolveMember(slug: string, targetUserId: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId: targetUserId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return { community, member };
  }

  async setMemberRole(
    slug: string,
    actor: { sub: string; role: string },
    targetUserId: string,
    role: CommunityRole,
  ) {
    const { community, member } = await this.resolveMember(slug, targetUserId);
    // Roles are managed by platform admins only — community managers cannot
    // change anyone's role.
    if (!isPlatformAdmin(actor.role)) {
      throw new ForbiddenException('Only a platform admin can change member roles');
    }
    const updated = await this.prisma.communityMember.update({
      where: { id: member.id },
      data: { role },
      select: { userId: true, role: true },
    });
    await this.invalidate(slug);
    return updated;
  }

  async moderateMember(
    slug: string,
    actor: { sub: string; role: string },
    targetUserId: string,
    action: 'mute' | 'unmute' | 'ban' | 'unban',
    minutes?: number,
  ) {
    if (targetUserId === actor.sub) {
      throw new ForbiddenException('You cannot moderate yourself');
    }
    const { community, member } = await this.resolveMember(slug, targetUserId);
    await this.assertCapability(community.id, actor, 'MODERATE');
    if (member.role === 'ADMIN') {
      throw new ForbiddenException('Cannot moderate a community admin');
    }

    const data =
      action === 'mute'
        ? { mutedUntil: new Date(Date.now() + (minutes ?? 60) * 60 * 1000) }
        : action === 'unmute'
          ? { mutedUntil: null }
          : action === 'ban'
            ? { bannedAt: new Date() }
            : { bannedAt: null };

    const updated = await this.prisma.communityMember.update({
      where: { id: member.id },
      data,
      select: { userId: true, mutedUntil: true, bannedAt: true },
    });
    return updated;
  }

  // ---------------- Community head applications ----------------
  private static readonly APPLICABLE_ROLES: CommunityRole[] = [
    'CAMPUS_LEAD',
    'OPPORTUNITY_HEAD',
    'STUDENT_RELATIONS_HEAD',
    'MODERATOR',
  ];

  /** A verified student member applies to lead a community. */
  // ---------------- Hiring (per-community head/manager applications) ----------------
  /** Admin opens/closes hiring for a specific community, with an optional requirement note. */
  async setCommunityHiring(slug: string, open: boolean, note?: string | null) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const updated = await this.prisma.community.update({
      where: { id: community.id },
      data: { hiringOpen: open, hiringNote: note ?? null },
      select: { slug: true, hiringOpen: true, hiringNote: true },
    });
    await this.invalidate(slug);
    return updated;
  }

  async applyForHead(userId: string, slug: string, requestedRole: CommunityRole, pitch?: string) {
    if (!CommunitiesService.APPLICABLE_ROLES.includes(requestedRole)) {
      throw new BadRequestException('Invalid role to apply for');
    }
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    if (!community.hiringOpen) {
      throw new ForbiddenException('This community is not hiring managers right now');
    }

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (profile?.collegeVerification !== 'VERIFIED') {
      throw new ForbiddenException('Only verified students can apply to lead a community');
    }
    // Ensure they're a member.
    await this.prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: community.id, userId } },
      update: {},
      create: { communityId: community.id, userId },
    });
    await this.syncMemberCount(community.id);

    const pending = await this.prisma.communityHeadApplication.findFirst({
      where: { userId, communityId: community.id, status: 'PENDING' },
    });
    const data = { userId, communityId: community.id, requestedRole, pitch, status: 'PENDING' as const };
    return pending
      ? this.prisma.communityHeadApplication.update({ where: { id: pending.id }, data })
      : this.prisma.communityHeadApplication.create({ data });
  }

  async myHeadApplications(userId: string) {
    return this.prisma.communityHeadApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { community: { select: { id: true, name: true, slug: true } } },
    });
  }

  async listHeadApplications(query: PaginationDto) {
    const items = await this.prisma.communityHeadApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      skip: query.skip,
      take: query.limit,
      include: {
        community: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  /** Admin approves a head application → assigns the requested community role. */
  async decideHeadApplication(adminId: string, id: string, approve: boolean, note?: string) {
    const appRow = await this.prisma.communityHeadApplication.findUnique({ where: { id } });
    if (!appRow) throw new NotFoundException('Application not found');
    if (appRow.status !== 'PENDING') throw new ForbiddenException('Already reviewed');

    await this.prisma.communityHeadApplication.update({
      where: { id },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
        note,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
    if (approve) {
      await this.prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: appRow.communityId, userId: appRow.userId } },
        update: { role: appRow.requestedRole },
        create: { communityId: appRow.communityId, userId: appRow.userId, role: appRow.requestedRole },
      });
      await this.syncMemberCount(appRow.communityId);
      await this.invalidate();
    }
    await this.notifications.create({
      recipientId: appRow.userId,
      type: 'SYSTEM',
      title: approve
        ? `You're now ${appRow.requestedRole.replace(/_/g, ' ').toLowerCase()} 🎉`
        : 'Community head application declined',
      body: approve ? 'You can now help lead your community.' : note ?? undefined,
    });
    return { id, status: approve ? 'APPROVED' : 'REJECTED' };
  }

  /** Admin directly appoints a head by email. */
  async appointHead(slug: string, email: string, role: CommunityRole) {
    if (!CommunitiesService.APPLICABLE_ROLES.includes(role) && role !== 'ADMIN') {
      throw new BadRequestException('Invalid head role');
    }
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No user with that email');

    await this.prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: community.id, userId: user.id } },
      update: { role },
      create: { communityId: community.id, userId: user.id, role },
    });
    await this.syncMemberCount(community.id);
    await this.invalidate(slug);
    await this.notifications.create({
      recipientId: user.id,
      type: 'SYSTEM',
      title: `You've been appointed ${role.replace(/_/g, ' ').toLowerCase()} of ${community.name}`,
    });
    return { userId: user.id, communityId: community.id, role };
  }

  /** Communities the user manages (holds a head/mod role in) — their leadership dashboard. */
  async myManagedCommunities(userId: string) {
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId, role: { not: 'MEMBER' } },
      orderBy: { joinedAt: 'desc' },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            memberCount: true,
          },
        },
      },
    });
    return memberships.map((m) => ({ role: m.role, community: m.community }));
  }

  // ---------------- Help requests (startup communities) ----------------
  /** Any member can raise a help request; community managers see & resolve them. */
  async submitHelp(userId: string, slug: string, body: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (!member) throw new ForbiddenException('Join the community to ask for help');
    return this.prisma.helpRequest.create({ data: { communityId: community.id, userId, body } });
  }

  async listHelp(slug: string, query: PaginationDto) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const items = await this.prisma.helpRequest.findMany({
      where: { communityId: community.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], // OPEN before RESOLVED
      skip: query.skip,
      take: query.limit,
      include: { user: { select: { id: true, profile: { select: { fullName: true } } } } },
    });
    return buildPaginatedResult(items, query);
  }

  async resolveHelp(slug: string, actor: { sub: string; role: string }, id: string) {
    const community = await this.resolveCommunityForCap(slug, actor, 'RESOLVE_HELP');
    const help = await this.prisma.helpRequest.findUnique({ where: { id } });
    if (!help || help.communityId !== community.id) {
      throw new NotFoundException('Help request not found in this community');
    }
    await this.prisma.helpRequest.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedById: actor.sub, resolvedAt: new Date() },
    });
    return { id, status: 'RESOLVED' };
  }

  // ---------------- Head monitoring ----------------
  private async resolveCommunityForCap(
    slug: string,
    actor: { sub: string; role: string },
    cap: CommunityCapability,
  ) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    await this.assertCapability(community.id, actor, cap);
    return community;
  }

  /** Recent posts in the community (incl. removed) for activity monitoring. */
  async getActivity(slug: string, actor: { sub: string; role: string }, query: PaginationDto) {
    const community = await this.resolveCommunityForCap(slug, actor, 'VIEW');
    const posts = await this.prisma.post.findMany({
      where: { communityId: community.id },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      select: {
        id: true,
        body: true,
        kind: true,
        status: true,
        isPinned: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        author: { select: { id: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(posts, query);
  }

  async getReports(slug: string, actor: { sub: string; role: string }, query: PaginationDto) {
    const community = await this.resolveCommunityForCap(slug, actor, 'VIEW');
    const items = await this.prisma.report.findMany({
      where: { communityId: community.id, status: { in: ['OPEN', 'REVIEWING'] } },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: { reporter: { select: { id: true, profile: { select: { fullName: true } } } } },
    });
    return buildPaginatedResult(items, query);
  }

  async resolveReport(
    slug: string,
    actor: { sub: string; role: string },
    reportId: string,
    status: 'RESOLVED' | 'DISMISSED',
  ) {
    const community = await this.resolveCommunityForCap(slug, actor, 'MODERATE');
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report || report.communityId !== community.id) {
      throw new NotFoundException('Report not found in this community');
    }
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status, resolvedById: actor.sub, resolvedAt: new Date() },
    });
    return { id: reportId, status };
  }

  async getAnalytics(slug: string, actor: { sub: string; role: string }) {
    const community = await this.resolveCommunityForCap(slug, actor, 'VIEW');
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [posts, postsThisWeek, comments, openReports, topMembers] = await Promise.all([
      this.prisma.post.count({ where: { communityId: community.id, deletedAt: null } }),
      this.prisma.post.count({
        where: { communityId: community.id, deletedAt: null, createdAt: { gte: weekAgo } },
      }),
      this.prisma.comment.count({
        where: { deletedAt: null, post: { communityId: community.id } },
      }),
      this.prisma.report.count({ where: { communityId: community.id, status: 'OPEN' } }),
      this.prisma.communityMember.findMany({
        where: { communityId: community.id },
        take: 200,
        include: {
          user: { select: { id: true, reputationPoints: true, profile: { select: { fullName: true } } } },
        },
      }),
    ]);
    const topContributors = topMembers
      .sort((a, b) => b.user.reputationPoints - a.user.reputationPoints)
      .slice(0, 5)
      .map((m) => ({
        id: m.user.id,
        fullName: m.user.profile?.fullName ?? 'Student',
        reputationPoints: m.user.reputationPoints,
        role: m.role,
      }));
    return {
      members: community.memberCount,
      posts,
      postsThisWeek,
      comments,
      openReports,
      topContributors,
    };
  }
}
