import { Injectable, Logger } from '@nestjs/common';
import { Prisma, ReputationAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { LeaderboardQueryDto } from './dto/reputation-query.dto';

// Points per action (Module 7). Mirrors @edubridge/shared REPUTATION_POINTS.
const POINTS: Record<ReputationAction, number> = {
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
  HELPFUL_ANSWER: 10,
  REVIEW_CREATED: 20,
  RESOURCE_UPLOADED: 15,
  RECEIVED_LIKE: 1,
};

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Award reputation for an action: record the event, bump the denormalized
   * total, then re-evaluate badge eligibility. Best-effort — never throws into
   * the calling action (reputation is a side effect).
   */
  async award(
    userId: string,
    action: ReputationAction,
    ref?: { refType?: string; refId?: string },
  ): Promise<void> {
    const points = POINTS[action] ?? 0;
    if (!points) return;
    try {
      await this.prisma.$transaction([
        this.prisma.reputationEvent.create({
          data: { userId, action, points, refType: ref?.refType, refId: ref?.refId },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: { reputationPoints: { increment: points } },
        }),
      ]);
      await this.evaluateBadges(userId);
    } catch (e) {
      this.logger.warn(`Failed to award ${action} to ${userId}: ${(e as Error).message}`);
    }
  }

  /** Award any newly-qualified badges and notify the user. */
  async evaluateBadges(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationPoints: true },
    });
    if (!user) return;

    const owned = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { key: true } } },
    });
    const have = new Set(owned.map((b) => b.badge.key));
    const pts = user.reputationPoints;
    const toAward: string[] = [];

    if (pts >= 50 && !have.has('contributor')) toAward.push('contributor');
    if (pts >= 200 && !have.has('campus_expert')) toAward.push('campus_expert');
    if (pts >= 1000 && !have.has('community_leader')) toAward.push('community_leader');

    if (!have.has('placement_expert') && pts >= 50) {
      const placementReviews = await this.prisma.review.count({
        where: { authorId: userId, category: 'PLACEMENT', deletedAt: null },
      });
      if (placementReviews >= 1) toAward.push('placement_expert');
    }
    if (!have.has('transfer_expert')) {
      const stories = await this.prisma.transfer.count({
        where: { userId, isStoryPublic: true, story: { not: null } },
      });
      if (stories >= 1) toAward.push('transfer_expert');
    }

    for (const key of toAward) {
      const badge = await this.prisma.badge.findUnique({ where: { key } });
      if (!badge) continue;
      try {
        await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
        await this.notifications.create({
          recipientId: userId,
          type: 'BADGE_EARNED',
          title: `You earned the ${badge.name} badge! 🏅`,
          data: { badgeKey: key },
        });
      } catch {
        // Unique constraint — already awarded concurrently; ignore.
      }
    }
  }

  async leaderboard(query: LeaderboardQueryDto) {
    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      reputationPoints: { gt: 0 },
      ...(query.collegeId ? { profile: { collegeId: query.collegeId } } : {}),
    };
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { reputationPoints: 'desc' },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
      take: query.limit,
      select: {
        id: true,
        reputationPoints: true,
        profile: {
          select: {
            fullName: true,
            username: true,
            avatarUrl: true,
            college: { select: { id: true, name: true } },
          },
        },
        _count: { select: { userBadges: true } },
      },
    });
    const ranked = users.map((u, i) => ({ ...u, rank: query.skip + i + 1 }));
    return buildPaginatedResult(ranked, query);
  }

  async getUserReputation(userId: string) {
    const [user, badges, recent] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, reputationPoints: true },
      }),
      this.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
        orderBy: { awardedAt: 'desc' },
      }),
      this.prisma.reputationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    return {
      points: user?.reputationPoints ?? 0,
      badges: badges.map((b) => b.badge),
      recentEvents: recent,
    };
  }

  listBadges() {
    return this.prisma.badge.findMany({ orderBy: { threshold: 'asc' } });
  }
}
