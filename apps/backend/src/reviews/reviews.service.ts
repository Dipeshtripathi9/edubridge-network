import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ReputationService } from '../reputation/reputation.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CreateCommunityReviewDto, CreateReviewDto, ReviewQueryDto } from './dto/review.dto';

const REVIEW_AUTHOR_SELECT = {
  select: {
    id: true,
    profile: {
      select: { fullName: true, username: true, avatarUrl: true, branch: true, year: true },
    },
  },
};

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly reputation: ReputationService,
  ) {}

  /**
   * Recompute and persist a college's denormalized review aggregates
   * (avgRating, reviewCount) from non-deleted reviews.
   */
  private async recomputeCollegeAggregates(collegeId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { collegeId, deletedAt: null },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.college.update({
      where: { id: collegeId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
    await this.redis.delPattern('college:list:*');
  }

  /**
   * Create a review. Differentiator: only a VERIFIED student of that college
   * may post, and the review is flagged verified.
   */
  async create(userId: string, collegeId: string, dto: CreateReviewDto) {
    const college = await this.prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) throw new NotFoundException('College not found');

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const isVerifiedStudent =
      profile?.collegeId === collegeId && profile?.collegeVerification === 'VERIFIED';
    if (!isVerifiedStudent) {
      throw new ForbiddenException(
        'Only verified students of this college can post a review. Verify your college in your profile first.',
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: {
        collegeId_authorId_category: { collegeId, authorId: userId, category: dto.category },
      },
    });
    if (existing && !existing.deletedAt) {
      throw new BadRequestException(`You already reviewed this college's ${dto.category}`);
    }

    const review = existing
      ? await this.prisma.review.update({
          where: { id: existing.id },
          data: { rating: dto.rating, title: dto.title, body: dto.body, deletedAt: null },
        })
      : await this.prisma.review.create({
          data: {
            collegeId,
            authorId: userId,
            category: dto.category,
            rating: dto.rating,
            title: dto.title,
            body: dto.body,
            isVerified: true,
          },
        });

    await this.recomputeCollegeAggregates(collegeId);
    // Reward only the first time a review is created (not edits/restores).
    if (!existing) {
      await this.reputation.award(userId, 'REVIEW_CREATED', { refType: 'review', refId: review.id });
    }
    return review;
  }

  async list(collegeId: string, query: ReviewQueryDto, userId?: string) {
    const where: Prisma.ReviewWhereInput = {
      collegeId,
      deletedAt: null,
      ...(query.category ? { category: query.category } : {}),
    };
    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      query.sort === 'recent' ? { createdAt: 'desc' } : { upvotes: 'desc' };

    const reviews = await this.prisma.review.findMany({
      where,
      orderBy,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
      take: query.limit,
      include: {
        author: REVIEW_AUTHOR_SELECT,
        votes: userId ? { where: { userId }, select: { value: true } } : false,
      },
    });

    const shaped = reviews.map((r) => {
      const { votes, ...rest } = r as typeof r & { votes?: { value: number }[] };
      return { ...rest, myVote: Array.isArray(votes) && votes.length ? votes[0].value : 0 };
    });
    return buildPaginatedResult(shaped, query);
  }

  /** Per-category rating breakdown for a college. */
  async summary(collegeId: string) {
    const grouped = await this.prisma.review.groupBy({
      by: ['category'],
      where: { collegeId, deletedAt: null },
      _avg: { rating: true },
      _count: true,
    });
    const overall = await this.prisma.review.aggregate({
      where: { collegeId, deletedAt: null },
      _avg: { rating: true },
      _count: true,
    });
    return {
      overall: { avgRating: overall._avg.rating ?? 0, count: overall._count },
      categories: grouped.map((g) => ({
        category: g.category,
        avgRating: g._avg.rating ?? 0,
        count: g._count,
      })),
    };
  }

  // ---------------- Community-manager reviews ----------------
  /** Any member of a community can review its managers/leadership (one per person). */
  async createCommunityReview(userId: string, slug: string, dto: CreateCommunityReviewDto) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const member = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (!member) throw new ForbiddenException('Join the community to review its managers');

    const existing = await this.prisma.review.findUnique({
      where: {
        communityId_authorId_category: {
          communityId: community.id,
          authorId: userId,
          category: 'COMMUNITY_MANAGERS',
        },
      },
    });
    const review =
      existing && !existing.deletedAt
        ? await this.prisma.review.update({
            where: { id: existing.id },
            data: { rating: dto.rating, title: dto.title, body: dto.body },
          })
        : existing
          ? await this.prisma.review.update({
              where: { id: existing.id },
              data: { rating: dto.rating, title: dto.title, body: dto.body, deletedAt: null },
            })
          : await this.prisma.review.create({
              data: {
                communityId: community.id,
                authorId: userId,
                category: 'COMMUNITY_MANAGERS',
                rating: dto.rating,
                title: dto.title,
                body: dto.body,
              },
            });
    return review;
  }

  async listCommunityReviews(slug: string, query: ReviewQueryDto, userId?: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const orderBy: Prisma.ReviewOrderByWithRelationInput =
      query.sort === 'recent' ? { createdAt: 'desc' } : { upvotes: 'desc' };
    const reviews = await this.prisma.review.findMany({
      where: { communityId: community.id, category: 'COMMUNITY_MANAGERS', deletedAt: null },
      orderBy,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
      take: query.limit,
      include: {
        author: REVIEW_AUTHOR_SELECT,
        votes: userId ? { where: { userId }, select: { value: true } } : false,
      },
    });
    const shaped = reviews.map((r) => {
      const { votes, ...rest } = r as typeof r & { votes?: { value: number }[] };
      return { ...rest, myVote: Array.isArray(votes) && votes.length ? votes[0].value : 0 };
    });
    return buildPaginatedResult(shaped, query);
  }

  async communitySummary(slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const agg = await this.prisma.review.aggregate({
      where: { communityId: community.id, category: 'COMMUNITY_MANAGERS', deletedAt: null },
      _avg: { rating: true },
      _count: true,
    });
    return { avgRating: agg._avg.rating ?? 0, count: agg._count };
  }

  async vote(reviewId: string, userId: string, value: number) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.reviewVote.upsert({
      where: { reviewId_userId: { reviewId, userId } },
      update: { value },
      create: { reviewId, userId, value },
    });

    // Recompute vote tallies from source of truth.
    const [up, down] = await Promise.all([
      this.prisma.reviewVote.count({ where: { reviewId, value: 1 } }),
      this.prisma.reviewVote.count({ where: { reviewId, value: -1 } }),
    ]);
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { upvotes: up, downvotes: down },
      select: { id: true, upvotes: true, downvotes: true },
    });
  }

  /** Toggle the verified flag on a review (moderator/admin). */
  async toggleVerified(id: string) {
    const review = await this.prisma.review.findFirst({ where: { id, deletedAt: null } });
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.prisma.review.update({
      where: { id },
      data: { isVerified: !review.isVerified },
      select: { id: true, isVerified: true },
    });
    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review || review.deletedAt) throw new NotFoundException('Review not found');
    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
    if (review.authorId !== userId && !isPrivileged) {
      throw new ForbiddenException('Cannot delete this review');
    }
    await this.prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });
    if (review.collegeId) await this.recomputeCollegeAggregates(review.collegeId);
    return { deleted: true };
  }
}
