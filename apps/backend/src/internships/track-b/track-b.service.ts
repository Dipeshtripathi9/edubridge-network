import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateSourceType, TrackBAllocationType, TrackBApplicationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CertificatesService } from '../certificates/certificates.service';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import {
  AllocateTrackBDto,
  ApplyTrackBDto,
  PayoutSentDto,
  ReviewTrackBDto,
  SubmitTrackBWorkDto,
  TrackBQueryDto,
} from './dto/track-b.dto';

const ACTIVE_STATUSES: TrackBApplicationStatus[] = [
  TrackBApplicationStatus.PENDING,
  TrackBApplicationStatus.ALLOCATED,
  TrackBApplicationStatus.SUBMITTED,
];

@Injectable()
export class TrackBService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly certificates: CertificatesService,
  ) {}

  // ---------------- Student ----------------

  async apply(userId: string, dto: ApplyTrackBDto) {
    const existing = await this.prisma.trackBApplication.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException('You already have an in-progress Track B application');
    }
    return this.prisma.trackBApplication.create({
      data: {
        userId,
        skills: dto.skills,
        portfolioUrl: dto.portfolioUrl,
        bio: dto.bio,
        status: TrackBApplicationStatus.PENDING,
      },
    });
  }

  async myApplication(userId: string) {
    return this.prisma.trackBApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplication(userId: string, role: string, id: string) {
    const application = await this.prisma.trackBApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
    if (application.userId !== userId && !isAdmin) throw new ForbiddenException('Not your application');
    return application;
  }

  async submitWork(userId: string, id: string, dto: SubmitTrackBWorkDto) {
    const application = await this.prisma.trackBApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Not your application');
    if (
      application.status !== TrackBApplicationStatus.ALLOCATED &&
      application.status !== TrackBApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Application is not awaiting a submission');
    }
    return this.prisma.trackBApplication.update({
      where: { id },
      data: {
        status: TrackBApplicationStatus.SUBMITTED,
        submissionUrl: dto.submissionUrl,
        submittedAt: new Date(),
      },
    });
  }

  // ---------------- Admin ----------------

  async listApplications(query: TrackBQueryDto) {
    const items = await this.prisma.trackBApplication.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async allocate(adminId: string, id: string, dto: AllocateTrackBDto) {
    const application = await this.prisma.trackBApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== TrackBApplicationStatus.PENDING) {
      throw new ForbiddenException('Application has already been allocated');
    }
    if (dto.allocationType === TrackBAllocationType.SKILL_BUILDING_TASK && dto.payoutAmount) {
      throw new BadRequestException('Skill-building tasks are unpaid — do not set a payout amount');
    }

    await this.prisma.$transaction([
      this.prisma.trackBApplication.update({
        where: { id },
        data: {
          status: TrackBApplicationStatus.ALLOCATED,
          allocationType: dto.allocationType,
          allocationNote: dto.allocationNote,
          allocatedById: adminId,
          allocatedAt: new Date(),
          ...(dto.allocationType === TrackBAllocationType.PAID_CLIENT_WORK
            ? { payoutAmount: dto.payoutAmount }
            : {}),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'internship.track_b.allocate',
          entity: 'track_b_application',
          entityId: id,
          metadata: { allocationType: dto.allocationType },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: application.userId,
      type: 'INTERNSHIP_APPLICATION_ALLOCATED',
      title: 'You have been allocated internship work',
      body: dto.allocationNote,
      data: { applicationId: id, allocationType: dto.allocationType },
    });

    return { id, status: TrackBApplicationStatus.ALLOCATED };
  }

  async review(adminId: string, id: string, dto: ReviewTrackBDto) {
    const application = await this.prisma.trackBApplication.findUnique({
      where: { id },
      include: { user: { select: { profile: { select: { fullName: true } } } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== TrackBApplicationStatus.SUBMITTED) {
      throw new BadRequestException('Application is not awaiting review');
    }

    const status = dto.approve ? TrackBApplicationStatus.APPROVED : TrackBApplicationStatus.REJECTED;
    await this.prisma.$transaction([
      this.prisma.trackBApplication.update({
        where: { id },
        data: { status, reviewNote: dto.reviewNote, reviewedById: adminId, reviewedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: dto.approve ? 'internship.track_b.approve' : 'internship.track_b.reject',
          entity: 'track_b_application',
          entityId: id,
          metadata: { note: dto.reviewNote },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: application.userId,
      type: 'INTERNSHIP_APPLICATION_REVIEWED',
      title: dto.approve ? 'Your submission was approved 🎉' : 'Your submission needs changes',
      body: dto.reviewNote,
      data: { applicationId: id },
    });

    let certificateId: string | undefined;
    if (dto.approve) {
      const cert = await this.certificates.issue({
        sourceType: CertificateSourceType.TRACK_B_APPLICATION,
        sourceId: application.id,
        recipientId: application.userId,
        recipientName: application.user.profile?.fullName ?? 'EduBridge Student',
        allocationType: application.allocationType ?? undefined,
        metadata:
          application.allocationType === TrackBAllocationType.PAID_CLIENT_WORK && application.payoutAmount
            ? { payoutAmount: application.payoutAmount }
            : undefined,
      });
      certificateId = cert.id;
    }

    return { id, status, certificateId };
  }

  async payoutSent(adminId: string, id: string, dto: PayoutSentDto) {
    const application = await this.prisma.trackBApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.allocationType !== TrackBAllocationType.PAID_CLIENT_WORK) {
      throw new BadRequestException('Only PAID_CLIENT_WORK allocations have a payout');
    }
    if (application.status !== TrackBApplicationStatus.APPROVED) {
      throw new ForbiddenException('Approve the submission before marking the payout sent');
    }
    if (application.payoutSentAt) {
      throw new ForbiddenException('Payout already marked as sent');
    }

    await this.prisma.$transaction([
      this.prisma.trackBApplication.update({
        where: { id },
        data: { payoutSentAt: new Date(), payoutNote: dto.payoutNote },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'internship.track_b.payout_sent',
          entity: 'track_b_application',
          entityId: id,
          metadata: { payoutAmount: application.payoutAmount },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: application.userId,
      type: 'INTERNSHIP_PAYOUT_SENT',
      title: 'Your payout has been sent',
      body: dto.payoutNote,
      data: { applicationId: id, payoutAmount: application.payoutAmount },
    });

    return { id, payoutSentAt: new Date() };
  }
}
