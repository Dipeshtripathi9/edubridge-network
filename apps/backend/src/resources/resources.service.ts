import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ReputationService } from '../reputation/reputation.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
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
    const resource = await this.prisma.resource.create({
      data: {
        uploaderId: userId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        tags: dto.tags ?? [],
        collegeTag: dto.collegeTag,
        courseTag: dto.courseTag,
      },
      include: { uploader: UPLOADER_SELECT },
    });
    await this.reputation.award(userId, 'RESOURCE_UPLOADED', {
      refType: 'resource',
      refId: resource.id,
    });
    return resource;
  }

  async list(query: ResourceQueryDto) {
    const where: Prisma.ResourceWhereInput = {
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' } } : {}),
    };
    const orderBy: Prisma.ResourceOrderByWithRelationInput =
      query.sort === 'top'
        ? { avgRating: 'desc' }
        : query.sort === 'downloads'
          ? { downloadCount: 'desc' }
          : { createdAt: 'desc' };

    const items = await this.prisma.resource.findMany({
      where,
      orderBy,
      skip: query.skip,
      take: query.limit,
      include: { uploader: UPLOADER_SELECT },
    });
    return buildPaginatedResult(items, query);
  }

  async getOne(id: string, userId?: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, deletedAt: null },
      include: {
        uploader: UPLOADER_SELECT,
        ratings: userId ? { where: { userId }, select: { value: true } } : false,
        bookmarks: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    const { ratings, bookmarks, ...rest } = resource as typeof resource & {
      ratings?: { value: number }[];
      bookmarks?: unknown[];
    };
    return {
      ...rest,
      myRating: Array.isArray(ratings) && ratings.length ? ratings[0].value : 0,
      bookmarkedByMe: Array.isArray(bookmarks) && bookmarks.length > 0,
    };
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

    const url = await this.storage.getDownloadUrl(resource.fileKey);
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
