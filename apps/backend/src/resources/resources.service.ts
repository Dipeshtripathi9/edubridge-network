import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ReputationService } from '../reputation/reputation.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateResourceDto,
  RateResourceDto,
  ResourceQueryDto,
  UploadUrlDto,
} from './dto/resource.dto';

const UPLOADER_SELECT = {
  select: {
    id: true,
    reputationPoints: true,
    profile: { select: { fullName: true, username: true, avatarUrl: true } },
  },
};

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly reputation: ReputationService,
  ) {}

  async getUploadUrl(dto: UploadUrlDto) {
    const key = this.storage.buildKey('resources', dto.fileName);
    return this.storage.getUploadUrl(key, dto.contentType);
  }

  async create(userId: string, dto: CreateResourceDto) {
    if (!dto.externalUrl && !dto.fileKey) {
      throw new BadRequestException('Provide a link (externalUrl) or an uploaded file');
    }
    const resource = await this.prisma.resource.create({
      data: {
        uploaderId: userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        externalUrl: dto.externalUrl,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        tags: dto.tags ?? [],
        collegeTag: dto.collegeTag,
        courseTag: dto.courseTag,
        collegeId: dto.collegeId,
        communityId: dto.communityId,
      },
      include: { uploader: UPLOADER_SELECT },
    });
    await this.reputation.award(userId, 'RESOURCE_UPLOADED', {
      refType: 'resource',
      refId: resource.id,
    });
    return resource;
  }

  async list(query: ResourceQueryDto, userId?: string) {
    const where: Prisma.ResourceWhereInput = {
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.collegeId ? { collegeId: query.collegeId } : {}),
      ...(query.communityId ? { communityId: query.communityId } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
    };
    const sortBy: Prisma.ResourceOrderByWithRelationInput =
      query.sort === 'top'
        ? { avgRating: 'desc' }
        : query.sort === 'downloads'
          ? { downloadCount: 'desc' }
          : { createdAt: 'desc' };
    // Featured resources surface first.
    const orderBy: Prisma.ResourceOrderByWithRelationInput[] = [{ isFeatured: 'desc' }, sortBy];

    const items = await this.prisma.resource.findMany({
      where,
      orderBy,
      skip: query.skip,
      take: query.limit,
      include: { uploader: UPLOADER_SELECT },
    });
    // Annotate which of these the current user has liked.
    let likedIds = new Set<string>();
    if (userId && items.length) {
      const likes = await this.prisma.resourceLike.findMany({
        where: { userId, resourceId: { in: items.map((i) => i.id) } },
        select: { resourceId: true },
      });
      likedIds = new Set(likes.map((l) => l.resourceId));
    }
    return buildPaginatedResult(
      items.map((i) => ({ ...i, likedByMe: likedIds.has(i.id) })),
      query,
    );
  }

  async getOne(id: string, userId?: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, deletedAt: null },
      include: {
        uploader: UPLOADER_SELECT,
        ratings: userId ? { where: { userId }, select: { value: true } } : false,
        bookmarks: userId ? { where: { userId }, select: { id: true } } : false,
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    const { ratings, bookmarks, likes, ...rest } = resource as typeof resource & {
      ratings?: { value: number }[];
      bookmarks?: unknown[];
      likes?: unknown[];
    };
    return {
      ...rest,
      myRating: Array.isArray(ratings) && ratings.length ? ratings[0].value : 0,
      bookmarkedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
      likedByMe: Array.isArray(likes) && likes.length > 0,
    };
  }

  /** Toggle a like on a resource. */
  async toggleLike(id: string, userId: string) {
    const existing = await this.prisma.resourceLike.findUnique({
      where: { resourceId_userId: { resourceId: id, userId } },
    });
    if (existing) {
      await this.prisma.$transaction([
        this.prisma.resourceLike.delete({ where: { id: existing.id } }),
        this.prisma.resource.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
      ]);
      return { liked: false };
    }
    await this.prisma.$transaction([
      this.prisma.resourceLike.create({ data: { resourceId: id, userId } }),
      this.prisma.resource.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
    ]);
    return { liked: true };
  }

  async listComments(id: string, query: PaginationDto) {
    const items = await this.prisma.resourceComment.findMany({
      where: { resourceId: id },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: { user: UPLOADER_SELECT },
    });
    return buildPaginatedResult(items, query);
  }

  async addComment(id: string, userId: string, body: string) {
    const resource = await this.prisma.resource.findFirst({ where: { id, deletedAt: null } });
    if (!resource) throw new NotFoundException('Resource not found');
    const [comment] = await this.prisma.$transaction([
      this.prisma.resourceComment.create({
        data: { resourceId: id, userId, body },
        include: { user: UPLOADER_SELECT },
      }),
      this.prisma.resource.update({ where: { id }, data: { commentCount: { increment: 1 } } }),
    ]);
    return comment;
  }

  /** Bump the share counter (called when a user copies/shares the link). */
  async share(id: string) {
    const updated = await this.prisma.resource.update({
      where: { id },
      data: { shareCount: { increment: 1 } },
      select: { shareCount: true },
    });
    return updated;
  }

  /** Record a download and return a (presigned) download URL. */
  async download(id: string, userId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, deletedAt: null },
    });
    if (!resource) throw new NotFoundException('Resource not found');

    await this.prisma.$transaction([
      this.prisma.resourceDownload.create({ data: { resourceId: id, userId } }),
      this.prisma.resource.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    // External (Google Drive) link → return it directly; otherwise presign the S3 file.
    if (resource.externalUrl) {
      return { url: resource.externalUrl, configured: true };
    }
    const url = resource.fileKey ? await this.storage.getDownloadUrl(resource.fileKey) : null;
    return { url, configured: this.storage.isConfigured };
  }

  async rate(id: string, userId: string, dto: RateResourceDto) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, deletedAt: null },
    });
    if (!resource) throw new NotFoundException('Resource not found');

    await this.prisma.resourceRating.upsert({
      where: { resourceId_userId: { resourceId: id, userId } },
      update: { value: dto.value },
      create: { resourceId: id, userId, value: dto.value },
    });

    const agg = await this.prisma.resourceRating.aggregate({
      where: { resourceId: id },
      _avg: { value: true },
      _count: true,
    });
    return this.prisma.resource.update({
      where: { id },
      data: { avgRating: agg._avg.value ?? 0, ratingCount: agg._count },
      select: { id: true, avgRating: true, ratingCount: true },
    });
  }

  async toggleBookmark(id: string, userId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, deletedAt: null },
    });
    if (!resource) throw new NotFoundException('Resource not found');

    const existing = await this.prisma.resourceBookmark.findUnique({
      where: { resourceId_userId: { resourceId: id, userId } },
    });
    if (existing) {
      await this.prisma.resourceBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.resourceBookmark.create({ data: { resourceId: id, userId } });
    return { bookmarked: true };
  }

  async myBookmarks(userId: string) {
    const bookmarks = await this.prisma.resourceBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { resource: { include: { uploader: UPLOADER_SELECT } } },
    });
    return bookmarks.map((b) => b.resource);
  }

  /** Feature/unfeature a resource (moderator/admin) so it surfaces first. */
  async toggleFeature(id: string) {
    const resource = await this.prisma.resource.findFirst({ where: { id, deletedAt: null } });
    if (!resource) throw new NotFoundException('Resource not found');
    const updated = await this.prisma.resource.update({
      where: { id },
      data: { isFeatured: !resource.isFeatured },
      select: { id: true, isFeatured: true },
    });
    return updated;
  }

  async remove(id: string, userId: string, role: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource || resource.deletedAt) throw new NotFoundException('Resource not found');
    const isPrivileged = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR';
    if (resource.uploaderId !== userId && !isPrivileged) {
      throw new ForbiddenException('Cannot delete this resource');
    }
    await this.prisma.resource.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }
}
