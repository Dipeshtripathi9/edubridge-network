import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, VerificationMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
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
    private readonly redis: RedisService,
  ) {}

  /** Bust the cached profile so verification-status changes are seen immediately. */
  private async invalidateProfile(userId: string) {
    await this.redis.del(`user:profile:${userId}`);
  }

  // ---------- College-email authentication (send link → click → verified) ----------
  async requestCollegeEmail(userId: string, dto: RequestCollegeEmailDto) {
    const secret = this.config.get<string>('jwt.accessSecret');
    const token = await this.jwt.signAsync(
      { sub: userId, email: dto.email.toLowerCase(), typ: 'college-email' },
      { secret, expiresIn: '15m' },
    );
    const webUrl = this.config.get<string>('appUrl') ?? 'http://localhost:3000';
    const link = `${webUrl}/verify/college-email?token=${token}`;
    // The server doesn't send email; in non-production return the link so the
    // flow stays usable. Never leak it in production.
    const isProd = process.env.NODE_ENV === 'production';
    return { message: 'Verification link sent to your college email.', ...(isProd ? {} : { devLink: link }) };
  }

  /**
   * Verify a signed college-email token belongs to this user. Returns the
   * confirmed (lowercased) email, or null if the token is missing/invalid/expired
   * or doesn't match the user. This is the ONLY source of truth for college-email
   * verification — the client can never self-assert it.
   */
  private async verifyCollegeEmailToken(userId: string, token?: string): Promise<string | null> {
    if (!token) return null;
    try {
      const secret = this.config.get<string>('jwt.accessSecret');
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; typ: string }>(token, { secret });
      if (payload.typ !== 'college-email' || payload.sub !== userId) return null;
      return payload.email.toLowerCase();
    } catch {
      return null;
    }
  }

  async confirmCollegeEmail(userId: string, dto: ConfirmCollegeEmailDto) {
    const email = await this.verifyCollegeEmailToken(userId, dto.token);
    if (!email) throw new BadRequestException('This verification link is invalid or has expired.');
    return { verified: true, email };
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

    // Re-verify the college-email confirmation server-side from the signed token —
    // never trust a client-supplied "verified" flag. Only counts when the token's
    // email matches the college email being submitted.
    const confirmedEmail = await this.verifyCollegeEmailToken(userId, dto.collegeEmailToken);
    const collegeEmailVerified =
      dto.method === VerificationMethod.COLLEGE_EMAIL &&
      !!confirmedEmail &&
      confirmedEmail === dto.collegeEmail?.toLowerCase();

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
      collegeEmailVerified,
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
    await this.invalidateProfile(userId);
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
    // The admin changed the user's verification status — drop their cached profile
    // so they don't see stale PENDING/unverified state for up to the cache TTL.
    await this.invalidateProfile(reqRow.userId);

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
