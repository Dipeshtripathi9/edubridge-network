import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/services/token.service';
import { AuditService } from './audit.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  AdminUserQueryDto,
  AuditQueryDto,
  CreateReportDto,
  ModerateContentDto,
  ReportQueryDto,
  ResolveReportDto,
  SetUserRoleDto,
  SetUserStatusDto,
  VerifyCollegeDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  // ---------------- Reports (user-facing create + admin queue) ----------------
  createReport(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reportedUserId: dto.reportedUserId,
        reason: dto.reason,
        details: dto.details,
      },
    });
  }

  async listReports(query: ReportQueryDto) {
    const where: Prisma.ReportWhereInput = query.status ? { status: query.status } : {};
    const items = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        reporter: { select: { id: true, profile: { select: { fullName: true } } } },
        reportedUser: { select: { id: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async resolveReport(adminId: string, id: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    const updated = await this.prisma.report.update({
      where: { id },
      data: { status: dto.status, resolvedById: adminId, resolvedAt: new Date() },
    });
    await this.audit.log(adminId, 'report.resolve', {
      entity: 'report',
      entityId: id,
      metadata: { status: dto.status, note: dto.note },
    });
    return updated;
  }

  // ---------------- User management ----------------
  async listUsers(query: AdminUserQueryDto) {
    const where: Prisma.UserWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.q
        ? {
            OR: [
              { email: { contains: query.q, mode: 'insensitive' } },
              { profile: { fullName: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const items = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        reputationPoints: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
            collegeVerification: true,
            college: { select: { name: true } },
          },
        },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async setUserStatus(adminId: string, userId: string, dto: SetUserStatusDto) {
    if (userId === adminId) throw new ForbiddenException('You cannot change your own status');
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found');
    if (target.role === 'SUPER_ADMIN') throw new ForbiddenException('Cannot moderate a super admin');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
    });
    // Kill active sessions when suspending or banning.
    if (dto.status === 'BANNED' || dto.status === 'SUSPENDED') {
      await this.tokens.revokeAllForUser(userId);
    }
    await this.audit.log(adminId, 'user.status', {
      entity: 'user',
      entityId: userId,
      metadata: { status: dto.status, reason: dto.reason },
    });
    return { id: user.id, status: user.status };
  }

  async setUserRole(adminId: string, userId: string, dto: SetUserRoleDto) {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found');
    const user = await this.prisma.user.update({ where: { id: userId }, data: { role: dto.role } });
    await this.audit.log(adminId, 'user.role', {
      entity: 'user',
      entityId: userId,
      metadata: { role: dto.role },
    });
    return { id: user.id, role: user.role };
  }

  async verifyCollege(adminId: string, userId: string, dto: VerifyCollegeDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    const updated = await this.prisma.profile.update({
      where: { userId },
      data: { collegeVerification: dto.status },
    });
    await this.audit.log(adminId, 'user.verify_college', {
      entity: 'user',
      entityId: userId,
      metadata: { status: dto.status },
    });
    return { userId, collegeVerification: updated.collegeVerification };
  }

  // ---------------- Content moderation (soft delete) ----------------
  async moderateContent(adminId: string, dto: ModerateContentDto) {
    const now = new Date();
    switch (dto.type) {
      case 'post':
        await this.prisma.post.update({
          where: { id: dto.id },
          data: { deletedAt: now, status: 'REMOVED' },
        });
        break;
      case 'comment':
        await this.prisma.comment.update({ where: { id: dto.id }, data: { deletedAt: now } });
        break;
      case 'review':
        await this.prisma.review.update({ where: { id: dto.id }, data: { deletedAt: now } });
        break;
      case 'resource':
        await this.prisma.resource.update({ where: { id: dto.id }, data: { deletedAt: now } });
        break;
    }
    await this.audit.log(adminId, 'content.remove', { entity: dto.type, entityId: dto.id });
    return { removed: true };
  }

  // ---------------- Audit logs ----------------
  async listAuditLogs(query: AuditQueryDto) {
    const items = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: { actor: { select: { id: true, profile: { select: { fullName: true } } } } },
    });
    return buildPaginatedResult(items, query);
  }

  // ---------------- Analytics ----------------
  async analytics() {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      dau,
      mau,
      newToday,
      newThisWeek,
      posts,
      postsThisWeek,
      comments,
      communities,
      reviews,
      resources,
      activeOpportunities,
      openReports,
      topCommunities,
      topColleges,
      topContributors,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: dayAgo } } }),
      this.prisma.user.count({ where: { lastLoginAt: { gte: monthAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.post.count({ where: { deletedAt: null, createdAt: { gte: weekAgo } } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.community.count(),
      this.prisma.review.count({ where: { deletedAt: null } }),
      this.prisma.resource.count({ where: { deletedAt: null } }),
      this.prisma.opportunity.count({ where: { isActive: true } }),
      this.prisma.report.count({ where: { status: 'OPEN' } }),
      this.prisma.community.findMany({
        orderBy: { memberCount: 'desc' },
        take: 5,
        select: { id: true, name: true, slug: true, memberCount: true, type: true },
      }),
      this.prisma.college.findMany({
        orderBy: { reviewCount: 'desc' },
        take: 5,
        select: { id: true, name: true, reviewCount: true, avgRating: true },
      }),
      this.prisma.user.findMany({
        orderBy: { reputationPoints: 'desc' },
        take: 5,
        where: { reputationPoints: { gt: 0 } },
        select: { id: true, reputationPoints: true, profile: { select: { fullName: true } } },
      }),
    ]);

    return {
      users: { total: totalUsers, dau, mau, newToday, newThisWeek, stickiness: mau ? +(dau / mau).toFixed(2) : 0 },
      content: { posts, postsThisWeek, comments, communities, reviews, resources, activeOpportunities },
      moderation: { openReports },
      topCommunities,
      topColleges,
      topContributors,
    };
  }
}
