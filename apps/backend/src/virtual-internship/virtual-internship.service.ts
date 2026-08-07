import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateSourceType, EnrollmentStatus, VirtualInternshipEvaluationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CertificatesService } from '../internships/certificates/certificates.service';
import { getVirtualInternshipFee } from './pricing.constants';
import {
  ConfirmPaymentDto,
  EnrollVirtualInternshipDto,
  EvaluateEnrollmentDto,
  SubmitPaymentReferenceDto,
  VirtualInternshipQueryDto,
} from './dto/virtual-internship.dto';
import { buildPaginatedResult } from '../common/dto/pagination.dto';

const ACTIVE_STATUSES: EnrollmentStatus[] = [EnrollmentStatus.PENDING_PAYMENT, EnrollmentStatus.ACTIVE];

@Injectable()
export class VirtualInternshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly certificates: CertificatesService,
  ) {}

  // ---------------- Student ----------------

  async enroll(userId: string, dto: EnrollVirtualInternshipDto) {
    const existing = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException('You already have an in-progress Virtual Internship enrollment');
    }
    return this.prisma.virtualInternshipEnrollment.create({
      data: {
        userId,
        track: dto.track,
        feeAmount: getVirtualInternshipFee(dto.track),
        status: EnrollmentStatus.PENDING_PAYMENT,
      },
    });
  }

  async myEnrollment(userId: string) {
    return this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitPaymentReference(userId: string, id: string, dto: SubmitPaymentReferenceDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Payment reference can only be updated before it is confirmed');
    }
    return this.prisma.virtualInternshipEnrollment.update({
      where: { id },
      data: { paymentReferenceNote: dto.paymentReferenceNote },
    });
  }

  // ---------------- Admin ----------------

  async listEnrollments(query: VirtualInternshipQueryDto) {
    const items = await this.prisma.virtualInternshipEnrollment.findMany({
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

  async confirmPayment(adminId: string, id: string, dto: ConfirmPaymentDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Payment already confirmed for this enrollment');
    }

    await this.prisma.$transaction([
      this.prisma.virtualInternshipEnrollment.update({
        where: { id },
        data: {
          status: EnrollmentStatus.ACTIVE,
          paidAt: new Date(),
          paymentConfirmedById: adminId,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'virtual_internship.confirm_payment',
          entity: 'virtual_internship_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId, mentorNote: dto.mentorNote },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_PAYMENT_CONFIRMED',
      title: 'Payment confirmed — your Virtual Internship is active! 🎉',
      body: 'Head to your track schedule to get started.',
    });

    return { id, status: EnrollmentStatus.ACTIVE };
  }

  async evaluate(adminId: string, id: string, dto: EvaluateEnrollmentDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Enrollment must be active before it can be evaluated');
    }

    const evaluationStatus = dto.passed
      ? VirtualInternshipEvaluationStatus.PASSED
      : VirtualInternshipEvaluationStatus.FAILED;

    await this.prisma.$transaction([
      this.prisma.virtualInternshipEnrollment.update({
        where: { id },
        data: {
          evaluationStatus,
          evaluatedAt: new Date(),
          evaluatedById: adminId,
          evaluationNote: dto.note,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'virtual_internship.evaluate',
          entity: 'virtual_internship_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId, passed: dto.passed, note: dto.note },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_TASK_REVIEWED',
      title: dto.passed ? 'Your final project passed review 🎉' : 'Your final project needs revision',
      body: dto.passed
        ? 'Nice work — your certificate will be issued shortly.'
        : dto.note ?? 'Your mentor left feedback — check with them on next steps.',
    });

    return { id, evaluationStatus };
  }

  async complete(adminId: string, id: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({
      where: { id },
      include: { user: { select: { profile: { select: { fullName: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Enrollment must be active to complete');
    }
    if (enrollment.evaluationStatus !== VirtualInternshipEvaluationStatus.PASSED) {
      throw new BadRequestException('Final project must pass evaluation before completing this enrollment');
    }

    const completedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.virtualInternshipEnrollment.update({
        where: { id },
        data: {
          status: EnrollmentStatus.COMPLETED,
          completedAt,
          completedById: adminId,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'virtual_internship.complete',
          entity: 'virtual_internship_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId },
        },
      }),
    ]);

    const cert = await this.certificates.issue({
      sourceType: CertificateSourceType.VIRTUAL_INTERNSHIP,
      sourceId: enrollment.id,
      recipientId: enrollment.userId,
      recipientName: enrollment.user.profile?.fullName ?? 'EduBridge Student',
      track: enrollment.track,
    });

    return { id, status: EnrollmentStatus.COMPLETED, certificateId: cert.id };
  }
}
