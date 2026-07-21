import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { CollegeQueryDto } from './dto/college-query.dto';

@Injectable()
export class CollegesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: CollegeQueryDto) {
    const where: Prisma.CollegeWhereInput = {
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.state ? { state: { equals: query.state, mode: 'insensitive' } } : {}),
    };

    // Sort keys (rating / name / nirfRank) are non-unique, so cursor pagination
    // needs a unique tiebreaker (id) — otherwise rows with equal values get
    // duplicated or skipped across pages.
    const primarySort: Prisma.CollegeOrderByWithRelationInput =
      query.sort === 'rating'
        ? { avgRating: 'desc' }
        : query.sort === 'name'
          ? { name: 'asc' }
          : { nirfRank: 'asc' };
    const orderBy: Prisma.CollegeOrderByWithRelationInput[] = [primarySort, { id: 'asc' }];

    const cacheable = !query.q;
    const cacheKey = `college:list:${JSON.stringify(query)}`;
    const fetch = async () => {
      const items = await this.prisma.college.findMany({
        where,
        orderBy,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
        take: query.limit,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          nirfRank: true,
          avgRating: true,
          reviewCount: true,
          avgPlacementPackage: true,
          logoUrl: true,
        },
      });
      return buildPaginatedResult(items, query);
    };

    return cacheable ? this.redis.remember(cacheKey, 60, fetch) : fetch();
  }

  async getBySlug(slug: string) {
    const college = await this.prisma.college.findUnique({
      where: { slug },
      include: { university: { select: { id: true, name: true } } },
    });
    if (!college) throw new NotFoundException('College not found');
    return college;
  }

  /**
   * College Hub overview: header data + the counts shown in the header
   * (verified students, reviews, resources, faqs).
   */
  async getCommunityHub(slug: string) {
    const college = await this.prisma.college.findUnique({
      where: { slug },
      include: { university: { select: { id: true, name: true } } },
    });
    if (!college) throw new NotFoundException('College not found');

    const [verifiedStudents, reviewCount, resourceCount, faqCount] = await Promise.all([
      this.prisma.profile.count({
        where: { collegeId: college.id, collegeVerification: 'VERIFIED' },
      }),
      this.prisma.review.count({ where: { collegeId: college.id, deletedAt: null } }),
      this.prisma.resource.count({ where: { collegeId: college.id, deletedAt: null } }),
      this.prisma.collegeFaq.count({ where: { collegeId: college.id } }),
    ]);

    return {
      college,
      counts: {
        verifiedStudents,
        reviews: reviewCount,
        resources: resourceCount,
        faqs: faqCount,
      },
    };
  }
}
