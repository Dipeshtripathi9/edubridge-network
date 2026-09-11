import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { BlogQueryDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async list(query: BlogQueryDto) {
    const where: Prisma.BlogPostWhereInput = {
      status: 'PUBLISHED',
      ...(query.category ? { category: query.category } : {}),
      ...(query.collegeId ? { collegeId: query.collegeId } : {}),
    };
    const orderBy: Prisma.BlogPostOrderByWithRelationInput[] = [{ publishedAt: 'desc' }, { id: 'desc' }];

    const cacheKey = `blog:list:${JSON.stringify(query)}`;
    const fetch = async () => {
      const items = await this.prisma.blogPost.findMany({
        where,
        orderBy,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
        take: query.limit,
        include: { author: { select: { profile: { select: { fullName: true, collegeVerification: true } } } } },
      });
      return buildPaginatedResult(items, query);
    };

    return this.redis.remember(cacheKey, 60, fetch);
  }

  async getBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { profile: { select: { fullName: true } } } },
        college: { select: { name: true, slug: true } },
      },
    });
    if (!post || post.status !== 'PUBLISHED') throw new NotFoundException('Blog post not found');
    return post;
  }

  async publish(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    const published = await this.prisma.blogPost.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    await this.redis.delPattern('blog:list:*');
    return published;
  }

  async reject(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    const rejected = await this.prisma.blogPost.update({ where: { id }, data: { status: 'REJECTED' } });
    await this.redis.delPattern('blog:list:*');
    return rejected;
  }
}
