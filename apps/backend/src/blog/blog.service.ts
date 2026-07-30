import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { BlogQueryDto, CreateBlogPostDto } from './dto/blog.dto';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

  /**
   * Create a blog post. Differentiator: only a verified student may submit,
   * and every submission starts as PENDING_REVIEW until an admin publishes it.
   */
  async create(userId: string, dto: CreateBlogPostDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (profile?.collegeVerification !== 'VERIFIED') {
      throw new ForbiddenException(
        'Only verified students can write a blog post. Verify your college in your profile first.',
      );
    }

    const baseSlug = slugify(dto.title) || 'post';
    let slug = baseSlug;
    for (let i = 2; await this.prisma.blogPost.findUnique({ where: { slug } }); i++) {
      slug = `${baseSlug}-${i}`;
    }

    const wordCount = dto.body.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const excerpt = dto.body.trim().slice(0, 160);

    return this.prisma.blogPost.create({
      data: {
        slug,
        title: dto.title,
        body: dto.body,
        excerpt,
        category: dto.category,
        readMinutes,
        authorId: userId,
        collegeId: profile.collegeId,
      },
    });
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
