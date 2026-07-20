import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateSourceType, EnrollmentStatus, EnrollmentSubtype, EnrollmentTaskStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CertificatesService } from '../certificates/certificates.service';
import { getPricingInfo, getTrackAFee } from '../pricing.constants';
import {
  AssignTaskDto,
  ConfirmPaymentDto,
  EnrollTrackADto,
  ReviewTaskDto,
  SubmitPaymentReferenceDto,
  SubmitTaskWorkDto,
  TrackAQueryDto,
} from './dto/track-a.dto';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';

const ACTIVE_STATUSES: EnrollmentStatus[] = [EnrollmentStatus.PENDING_PAYMENT, EnrollmentStatus.ACTIVE];
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class TrackAService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly certificates: CertificatesService,
  ) {}

  pricing() {
    return getPricingInfo();
  }

  // ---------------- Student ----------------

  async enroll(userId: string, dto: EnrollTrackADto) {
    const existing = await this.prisma.trackAEnrollment.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException('You already have an in-progress Track A enrollment');
    }
    return this.prisma.trackAEnrollment.create({
      data: {
        userId,
        subtype: dto.subtype,
        projectDescription: dto.projectDescription,
        feeAmount: getTrackAFee(dto.subtype),
        status: EnrollmentStatus.PENDING_PAYMENT,
      },
    });
  }

  async myEnrollment(userId: string) {
    return this.prisma.trackAEnrollment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });
  }

  private async findOwned(userId: string, role: string, id: string) {
    const enrollment = await this.prisma.trackAEnrollment.findUnique({
      where: { id },
      include: { tasks: { orderBy: { order: 'asc' } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
    if (enrollment.userId !== userId && !isAdmin) throw new ForbiddenException('Not your enrollment');
    return enrollment;
  }

  async getEnrollment(userId: string, role: string, id: string) {
    return this.findOwned(userId, role, id);
  }

  async submitPaymentReference(userId: string, id: string, dto: SubmitPaymentReferenceDto) {
    const enrollment = await this.prisma.trackAEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Payment reference can only be updated before it is confirmed');
    }
    return this.prisma.trackAEnrollment.update({
      where: { id },
      data: { paymentReferenceNote: dto.paymentReferenceNote },
    });
  }

  async submitTaskWork(userId: string, taskId: string, dto: SubmitTaskWorkDto) {
    const task = await this.prisma.enrollmentTask.findUnique({
      where: { id: taskId },
      include: { enrollment: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.enrollment.userId !== userId) throw new ForbiddenException('Not your task');
    if (task.enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Enrollment is not active');
    }
    if (task.status !== EnrollmentTaskStatus.ASSIGNED && task.status !== EnrollmentTaskStatus.REJECTED) {
      throw new BadRequestException('Task is not awaiting submission');
    }
    return this.prisma.enrollmentTask.update({
      where: { id: taskId },
      data: {
        status: EnrollmentTaskStatus.SUBMITTED,
        submissionUrl: dto.submissionUrl,
        submittedAt: new Date(),
      },
    });
  }

  // ---------------- Admin ----------------

  async listEnrollments(query: TrackAQueryDto) {
    const items = await this.prisma.trackAEnrollment.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        tasks: { orderBy: { order: 'asc' } },
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async confirmPayment(adminId: string, id: string, dto: ConfirmPaymentDto) {
    const enrollment = await this.prisma.trackAEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Payment already confirmed for this enrollment');
    }

    await this.prisma.$transaction([
      this.prisma.trackAEnrollment.update({
        where: { id },
        data: {
          status: EnrollmentStatus.ACTIVE,
          paidAt: new Date(),
          paymentConfirmedById: adminId,
          ...(dto.mentorNote ? { mentorNote: dto.mentorNote } : {}),
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'internship.track_a.confirm_payment',
          entity: 'track_a_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_PAYMENT_CONFIRMED',
      title: 'Payment confirmed — your internship is active! 🎉',
      body: 'Your mentor will assign your first task shortly.',
    });

    return { id, status: EnrollmentStatus.ACTIVE };
  }

  async assignTask(adminId: string, id: string, dto: AssignTaskDto) {
    const enrollment = await this.prisma.trackAEnrollment.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Confirm payment before assigning tasks');
    }

    const [task] = await this.prisma.$transaction([
      this.prisma.enrollmentTask.create({
        data: {
          enrollmentId: id,
          title: dto.title,
          description: dto.description,
          order: dto.order ?? enrollment.tasks.length,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'internship.track_a.assign_task',
          entity: 'track_a_enrollment',
          entityId: id,
          metadata: { title: dto.title },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_TASK_ASSIGNED',
      title: 'New task assigned',
      body: dto.title,
      data: { enrollmentId: id, taskId: task.id },
    });

    return task;
  }

  async reviewTaskSubmission(adminId: string, taskId: string, dto: ReviewTaskDto) {
    const task = await this.prisma.enrollmentTask.findUnique({
      where: { id: taskId },
      include: { enrollment: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== EnrollmentTaskStatus.SUBMITTED) {
      throw new BadRequestException('Task is not awaiting review');
    }

    const status = dto.approve ? EnrollmentTaskStatus.APPROVED : EnrollmentTaskStatus.REJECTED;
    const [updated] = await this.prisma.$transaction([
      this.prisma.enrollmentTask.update({
        where: { id: taskId },
        data: { status, reviewNote: dto.reviewNote, reviewedById: adminId, reviewedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: dto.approve ? 'internship.track_a.approve_task' : 'internship.track_a.reject_task',
          entity: 'enrollment_task',
          entityId: taskId,
          metadata: { note: dto.reviewNote },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: task.enrollment.userId,
      type: 'INTERNSHIP_TASK_REVIEWED',
      title: dto.approve ? `Task approved: ${task.title}` : `Task needs changes: ${task.title}`,
      body: dto.reviewNote,
      data: { enrollmentId: task.enrollmentId, taskId },
    });

    return updated;
  }

  async complete(adminId: string, id: string) {
    const enrollment = await this.prisma.trackAEnrollment.findUnique({
      where: { id },
      include: { tasks: true, user: { select: { profile: { select: { fullName: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Enrollment must be active to complete');
    }
    if (enrollment.tasks.length === 0 || enrollment.tasks.some((t) => t.status !== EnrollmentTaskStatus.APPROVED)) {
      throw new BadRequestException('All tasks must be approved before completing this enrollment');
    }

    const completedAt = new Date();
    const maintenanceUntil =
      enrollment.subtype === EnrollmentSubtype.OWN_PROJECT
        ? new Date(completedAt.getTime() + ONE_YEAR_MS)
        : null;

    await this.prisma.$transaction([
      this.prisma.trackAEnrollment.update({
        where: { id },
        data: {
          status: EnrollmentStatus.COMPLETED,
          completedAt,
          completedById: adminId,
          maintenanceUntil,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'internship.track_a.complete',
          entity: 'track_a_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId },
        },
      }),
    ]);

    const cert = await this.certificates.issue({
      sourceType: CertificateSourceType.TRACK_A_ENROLLMENT,
      sourceId: enrollment.id,
      recipientId: enrollment.userId,
      recipientName: enrollment.user.profile?.fullName ?? 'EduBridge Student',
      subtype: enrollment.subtype,
      metadata: maintenanceUntil ? { maintenanceUntil: maintenanceUntil.toISOString() } : undefined,
    });

    return { id, status: EnrollmentStatus.COMPLETED, maintenanceUntil, certificateId: cert.id };
  }
}
