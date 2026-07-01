import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, VerificationMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import {
  CreateVerificationRequestDto,
  RequestCollegeEmailDto,
  ConfirmCollegeEmailDto,
  VerificationQueryDto,
  VerificationUploadUrlDto,
} from './dto/verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------- College-email authentication (send link → click → verified) ----------
  async requestCollegeEmail(userId: string, dto: RequestCollegeEmailDto) {
    const secret = this.config.get<string>('jwt.accessSecret');
    const token = await this.jwt.signAsync(
      { sub: userId, email: dto.email.toLowerCase(), typ: 'college-email' },
      { secret, expiresIn: '15m' },
    );
    const webUrl = this.config.get<string[]>('corsOrigins')?.[0] ?? 'http://localhost:3000';
    const link = `${webUrl}/verify/college-email?token=${token}`;
    // Email delivery would go here; not configured in dev, so the link is returned
    // (non-production only) so the flow stays testable.
    const isProd = process.env.NODE_ENV === 'production';
    return { message: 'Verification link sent to your college email.', ...(isProd ? {} : { devLink: link }) };
  }

  async confirmCollegeEmail(userId: string, dto: ConfirmCollegeEmailDto) {
    try {
      const secret = this.config.get<string>('jwt.accessSecret');
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; typ: string }>(dto.token, { secret });
      if (payload.typ !== 'college-email' || payload.sub !== userId) {
        throw new BadRequestException('Invalid verification link');
      }
      return { verified: true, email: payload.email };
    } catch {
      throw new BadRequestException('This verification link is invalid or has expired.');
    }
  }

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
      collegeName: dto.collegeName?.trim() || null,
      collegeEmail: dto.collegeEmail,
      collegeEmailVerified: dto.collegeEmailVerified ?? false,
      feedback: dto.feedback ?? undefined,
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
        ...(dto.course ? { branch: dto.course.trim() } : {}),
        ...(dto.year ? { year: dto.year } : {}),
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

  /** Admin analysis: verified students' honest feedback, grouped by college. */
  async analysis() {
    const rows = await this.prisma.verificationRequest.findMany({
      where: { status: 'APPROVED', feedback: { not: Prisma.JsonNull } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        college: { select: { id: true, name: true } },
        user: {
          select: { id: true, email: true, profile: { select: { fullName: true, branch: true, year: true } } },
        },
      },
    });

    // Group by college (directory name or free-typed name).
    const groups = new Map<string, { college: string; students: typeof rows }>();
    for (const r of rows) {
      const name = r.college?.name ?? r.collegeName ?? 'Unspecified';
      const g = groups.get(name) ?? { college: name, students: [] as typeof rows };
      g.students.push(r);
      groups.set(name, g);
    }
    return Array.from(groups.values()).sort((a, b) => b.students.length - a.students.length);
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
