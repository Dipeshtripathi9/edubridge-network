import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { ScholarshipQueryDto } from './dto/scholarship-query.dto';

@Injectable()
export class ScholarshipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: ScholarshipQueryDto) {
    const where: Prisma.ScholarshipWhereInput = {
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
    };

    // Sort keys are non-unique, so cursor pagination needs a unique tiebreaker
    // (id) — otherwise rows with equal values get duplicated or skipped
    // across pages.
    const primarySort: Prisma.ScholarshipOrderByWithRelationInput =
      query.sort === 'amount'
        ? { amountPerYear: 'desc' }
        : query.sort === 'title'
          ? { title: 'asc' }
          : { deadline: 'asc' };
    const orderBy: Prisma.ScholarshipOrderByWithRelationInput[] = [primarySort, { id: 'asc' }];

    const cacheable = !query.q;
    const cacheKey = `scholarship:list:${JSON.stringify(query)}`;
    const fetch = async () => {
      const items = await this.prisma.scholarship.findMany({
        where,
        orderBy,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
        take: query.limit,
      });
      return buildPaginatedResult(items, query);
    };

    return cacheable ? this.redis.remember(cacheKey, 60, fetch) : fetch();
  }

  async getBySlug(slug: string) {
    const scholarship = await this.prisma.scholarship.findUnique({ where: { slug } });
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    return scholarship;
  }

  async listCategories() {
    const rows = await this.prisma.scholarship.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  }
}
