import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  CreateInternshipListingDto,
  InternshipListingQueryDto,
  UpdateInternshipListingDto,
} from './dto/internship-listing.dto';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class InternshipListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: InternshipListingQueryDto) {
    const where: Prisma.InternshipListingWhereInput = {
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { company: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
    const orderBy: Prisma.InternshipListingOrderByWithRelationInput[] = [{ createdAt: 'desc' }, { id: 'asc' }];

    const cacheable = !query.q;
    const cacheKey = `internship-listing:list:${JSON.stringify(query)}`;
    const fetch = async () => {
      const items = await this.prisma.internshipListing.findMany({
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
    const listing = await this.prisma.internshipListing.findUnique({ where: { slug } });
    if (!listing) throw new NotFoundException('Internship listing not found');
    return listing;
  }

  async listCategories() {
    const rows = await this.prisma.internshipListing.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category);
  }

  private async uniqueSlug(title: string) {
    const base = slugify(title) || 'internship';
    let slug = base;
    for (let i = 2; await this.prisma.internshipListing.findUnique({ where: { slug } }); i++) {
      slug = `${base}-${i}`;
    }
    return slug;
  }

  async create(dto: CreateInternshipListingDto) {
    const listing = await this.prisma.internshipListing.create({
      data: {
        ...dto,
        ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}),
        slug: await this.uniqueSlug(dto.title),
      },
    });
    await this.redis.delPattern('internship-listing:list:*');
    return listing;
  }

  async update(id: string, dto: UpdateInternshipListingDto) {
    const existing = await this.prisma.internshipListing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Internship listing not found');
    const listing = await this.prisma.internshipListing.update({
      where: { id },
      data: { ...dto, ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}) },
    });
    await this.redis.delPattern('internship-listing:list:*');
    return listing;
  }

  async remove(id: string) {
    const existing = await this.prisma.internshipListing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Internship listing not found');
    await this.prisma.internshipListing.delete({ where: { id } });
    await this.redis.delPattern('internship-listing:list:*');
    return { success: true };
  }
}
