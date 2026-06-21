import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  CreateVerificationRequestDto,
  RejectVerificationDto,
  VerificationQueryDto,
  VerificationUploadUrlDto,
} from './dto/verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) {}

  getUploadUrl(dto: VerificationUploadUrlDto) {
    const key = this.storage.buildKey('verification', dto.fileName);
    return this.storage.getUploadUrl(key, dto.contentType);
  }

  /** Student submits (or re-submits) a verification request. */
  async submit(userId: string, dto: CreateVerificationRequestDto) {
    if (dto.method === VerificationMethod.COLLEGE_EMAIL && !dto.collegeEmail) {
      throw new BadRequestException('collegeEmail is required for the COLLEGE_EMAIL method');
    }
    if (dto.method !== VerificationMethod.COLLEGE_EMAIL && !dto.evidenceKey) {
      throw new BadRequestException('Upload evidence before submitting this method');
    }

    // Replace any pending request rather than stacking duplicates.
    const pending = await this.prisma.verificationRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    const data = {
      userId,
      method: dto.method,
      collegeId: dto.collegeId,
      collegeEmail: dto.collegeEmail,
      evidenceKey: dto.evidenceKey,
      status: 'PENDING' as const,
      note: null,
      reviewedById: null,
      reviewedAt: null,
    };
    const requestRow = pending
      ? await this.prisma.verificationRequest.update({ where: { id: pending.id }, data })
      : await this.prisma.verificationRequest.create({ data });

    // Reflect "pending" on the profile (+ set the college being claimed).
    await this.prisma.profile.update({
      where: { userId },
      data: {
        collegeVerification: 'PENDING',
        ...(dto.collegeId ? { collegeId: dto.collegeId } : {}),
      },
    });
    return requestRow;
  }

  async mine(userId: string) {
    return this.prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { college: { select: { id: true, name: true } } },
    });
  }

  // ---------------- Admin ----------------
  async listForReview(query: VerificationQueryDto) {
    const items = await this.prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      skip: query.skip,
      take: query.limit,
      include: {
        college: { select: { id: true, name: true } },
        user: {
          select: { id: true, email: true, profile: { select: { fullName: true, branch: true, year: true } } },
        },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async decide(adminId: string, id: string, approve: boolean, note?: string) {
    const reqRow = await this.prisma.verificationRequest.findUnique({ where: { id } });
    if (!reqRow) throw new NotFoundException('Verification request not found');
    if (reqRow.status !== 'PENDING') throw new ForbiddenException('Request already reviewed');

    const status = approve ? 'APPROVED' : 'REJECTED';
    await this.prisma.$transaction([
      this.prisma.verificationRequest.update({
        where: { id },
        data: { status, note, reviewedById: adminId, reviewedAt: new Date() },
      }),
      this.prisma.profile.update({
        where: { userId: reqRow.userId },
        data: {
          collegeVerification: approve ? 'VERIFIED' : 'REJECTED',
          ...(approve && reqRow.collegeId ? { collegeId: reqRow.collegeId } : {}),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: approve ? 'verification.approve' : 'verification.reject',
          entity: 'verification_request',
          entityId: id,
          metadata: { userId: reqRow.userId, note },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: reqRow.userId,
      type: 'SYSTEM',
      title: approve ? 'You are now a verified student ✅' : 'Verification request declined',
      body: approve
        ? 'You can now post reviews and access verified-only features.'
        : note || 'Please re-submit with clearer proof.',
    });

    return { id, status };
  }
}
