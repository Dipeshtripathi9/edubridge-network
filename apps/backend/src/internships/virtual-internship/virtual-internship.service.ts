import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CertificateSourceType,
  EnrollmentStatus,
  EnrollmentTaskStatus,
  VirtualInternshipEnrollment,
  VirtualInternshipTrack,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PaymentsService } from '../../payments/payments.service';
import { CertificatesService } from '../certificates/certificates.service';
import { buildPaginatedResult } from '../../common/dto/pagination.dto';
import { computeVirtualInternshipFee, getVirtualInternshipPricingInfo } from './pricing.constants';
import { getVirtualInternshipTaskTemplate } from './tasks.constants';
import {
  EnrollVirtualInternshipDto,
  ReviewVirtualInternshipTaskDto,
  SubmitVirtualInternshipTaskDto,
  VerifyVirtualInternshipPaymentDto,
  VirtualInternshipAdminQueryDto,
} from './dto/virtual-internship.dto';

const ACTIVE_STATUSES: EnrollmentStatus[] = [EnrollmentStatus.PENDING_PAYMENT, EnrollmentStatus.ACTIVE];
const TOTAL_TASKS = 4;

@Injectable()
export class VirtualInternshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly payments: PaymentsService,
    private readonly certificates: CertificatesService,
  ) {}

  pricing() {
    return getVirtualInternshipPricingInfo();
  }

  async enroll(userId: string, dto: EnrollVirtualInternshipDto) {
    const existing = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, track: dto.track, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      return this.serialize(existing);
    }
    const donateApplied = dto.donateApplied ?? false;
    const enrollment = await this.prisma.virtualInternshipEnrollment.create({
      data: {
        userId,
        track: dto.track,
        referralApplied: dto.referralApplied ?? false,
        donateApplied,
        feeAmount: computeVirtualInternshipFee(dto.track, donateApplied),
        status: EnrollmentStatus.PENDING_PAYMENT,
      },
    });
    return this.serialize(enrollment);
  }

  /**
   * A student can hold two concurrent enrollments (one per track — see the
   * cross-track fix). Prefer an ACTIVE one over "most recently created": a
   * student who has already paid for WEEK and is just browsing the MONTH
   * checkout (creating a fresh PENDING_PAYMENT row) must still see their
   * paid enrollment, not have it hidden behind the newer pending one.
   */
  async myEnrollment(userId: string) {
    const active = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    const enrollment =
      active ??
      (await this.prisma.virtualInternshipEnrollment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }));
    return enrollment ? this.serialize(enrollment) : null;
  }

  /** Prisma serializes Decimal fields as strings over JSON — normalize back to a plain number for the API contract. */
  private serialize(enrollment: VirtualInternshipEnrollment) {
    return { ...enrollment, feeAmount: Number(enrollment.feeAmount) };
  }

  async checkout(userId: string, id: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new BadRequestException('This enrollment is not awaiting payment');
    }

    // Math.round guards against float noise from the Decimal->Number->paise
    // conversion (e.g. 3184.82 -> 318481.99999999994) — not a rupee rounding
    // compromise, since feeAmount already carries exact paisa precision.
    const amountInPaise = Math.round(Number(enrollment.feeAmount) * 100);
    const order = await this.payments.createOrder(amountInPaise, 'INR', `virtual-internship-${enrollment.id}`);

    await this.prisma.virtualInternshipEnrollment.update({
      where: { id },
      data: { razorpayOrderId: order.orderId },
    });

    return order;
  }

  async verifyPayment(userId: string, id: string, dto: VerifyVirtualInternshipPaymentDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Payment already confirmed for this enrollment');
    }
    if (enrollment.razorpayOrderId !== dto.razorpay_order_id) {
      throw new BadRequestException('This order does not belong to the enrollment');
    }

    const verified = this.payments.verifySignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    if (!verified) {
      throw new BadRequestException('Payment signature verification failed');
    }

    return this.activatePaidEnrollment(enrollment, dto.razorpay_payment_id);
  }

  /** Razorpay server-to-server webhook — see TrackAService.handleRazorpayWebhook for the shared rationale. */
  async handleRazorpayWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    if (!rawBody || !signature || !this.payments.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Malformed webhook payload');
    }

    if (event.event !== 'payment.captured') {
      return { received: true };
    }

    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;
    if (!orderId || !paymentId) {
      return { received: true };
    }

    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      return { received: true };
    }

    await this.activatePaidEnrollment(enrollment, paymentId);
    return { received: true };
  }

  private async activatePaidEnrollment(enrollment: { id: string; userId: string }, paymentId: string) {
    const updated = await this.prisma.virtualInternshipEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.ACTIVE,
        paidAt: new Date(),
        razorpayPaymentId: paymentId,
      },
    });

    await this.prisma.virtualInternshipTask.createMany({
      data: Array.from({ length: TOTAL_TASKS }, (_, i) => ({ enrollmentId: enrollment.id, taskIndex: i + 1 })),
      skipDuplicates: true,
    });

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_PAYMENT_CONFIRMED',
      title: 'Payment confirmed — your virtual internship is active! 🎉',
      body: "You'll get access within a few hours.",
    });

    return { id: updated.id, status: updated.status, track: updated.track, paidAt: updated.paidAt };
  }

  // ---------------- Tasks (student) ----------------

  private async myActiveEnrollment(userId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    if (!enrollment) throw new NotFoundException('No active virtual internship enrollment');
    return enrollment;
  }

  async myTasks(userId: string) {
    const enrollment = await this.myActiveEnrollment(userId);
    const tasks = await this.prisma.virtualInternshipTask.findMany({
      where: { enrollmentId: enrollment.id },
      orderBy: { taskIndex: 'asc' },
    });

    const approvedCount = tasks.filter((t) => t.status === EnrollmentTaskStatus.APPROVED).length;
    const merged = tasks.map((task, i) => ({
      ...getVirtualInternshipTaskTemplate(enrollment.track, task.taskIndex),
      id: task.id,
      taskIndex: task.taskIndex,
      status: task.status,
      submissionUrl: task.submissionUrl,
      submissionNote: task.submissionNote,
      submittedAt: task.submittedAt,
      reviewNote: task.reviewNote,
      reviewedAt: task.reviewedAt,
      unlocked: task.taskIndex === 1 || tasks[i - 1]?.status === EnrollmentTaskStatus.APPROVED,
    }));

    return {
      enrollment: { id: enrollment.id, track: enrollment.track, status: enrollment.status },
      progress: tasks.length ? approvedCount / tasks.length : 0,
      tasks: merged,
    };
  }

  async submitTask(userId: string, taskIndex: number, dto: SubmitVirtualInternshipTaskDto) {
    const enrollment = await this.myActiveEnrollment(userId);
    const tasks = await this.prisma.virtualInternshipTask.findMany({
      where: { enrollmentId: enrollment.id },
      orderBy: { taskIndex: 'asc' },
    });

    const task = tasks.find((t) => t.taskIndex === taskIndex);
    if (!task) throw new NotFoundException('Task not found');
    const previous = tasks.find((t) => t.taskIndex === taskIndex - 1);
    const unlocked = taskIndex === 1 || previous?.status === EnrollmentTaskStatus.APPROVED;
    if (!unlocked) throw new ForbiddenException('Complete the previous task first');
    if (task.status === EnrollmentTaskStatus.APPROVED) {
      throw new BadRequestException('This task is already approved');
    }

    return this.prisma.virtualInternshipTask.update({
      where: { id: task.id },
      data: {
        status: EnrollmentTaskStatus.SUBMITTED,
        submissionUrl: dto.submissionUrl,
        submissionNote: dto.note,
        submittedAt: new Date(),
      },
    });
  }

  // ---------------- Documents (student) ----------------

  /** Gated on ACTIVE (paid) — used by the invoice PDF route. */
  async getForInvoice(userId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, profile: { select: { fullName: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('No paid virtual internship enrollment found');
    return enrollment;
  }

  /** Gated on 100% task approval — used by the recommendation-letter / report-card PDF routes. */
  async getForRewardDocument(userId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, profile: { select: { fullName: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('No active virtual internship enrollment');

    const tasks = await this.prisma.virtualInternshipTask.findMany({
      where: { enrollmentId: enrollment.id },
      orderBy: { taskIndex: 'asc' },
    });
    const approvedCount = tasks.filter((t) => t.status === EnrollmentTaskStatus.APPROVED).length;
    if (tasks.length < TOTAL_TASKS || approvedCount < tasks.length) {
      throw new ForbiddenException('Finish and get all tasks approved before downloading this document');
    }

    return { enrollment, tasks };
  }

  // ---------------- Admin ----------------

  async adminListEnrollments(query: VirtualInternshipAdminQueryDto) {
    const items = await this.prisma.virtualInternshipEnrollment.findMany({
      where: {
        ...(query.track ? { track: query.track } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        tasks: { orderBy: { taskIndex: 'asc' } },
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(
      items.map((e) => this.serialize(e)),
      query,
    );
  }

  async adminStats() {
    const [active, pendingPayment, week, month, submissionsPendingReview] = await Promise.all([
      this.prisma.virtualInternshipEnrollment.count({ where: { status: EnrollmentStatus.ACTIVE } }),
      this.prisma.virtualInternshipEnrollment.count({ where: { status: EnrollmentStatus.PENDING_PAYMENT } }),
      this.prisma.virtualInternshipEnrollment.count({
        where: { status: EnrollmentStatus.ACTIVE, track: VirtualInternshipTrack.WEEK },
      }),
      this.prisma.virtualInternshipEnrollment.count({
        where: { status: EnrollmentStatus.ACTIVE, track: VirtualInternshipTrack.MONTH },
      }),
      this.prisma.virtualInternshipTask.count({ where: { status: EnrollmentTaskStatus.SUBMITTED } }),
    ]);
    return { active, pendingPayment, byTrack: { WEEK: week, MONTH: month }, submissionsPendingReview };
  }

  /**
   * Idempotent, safe to re-run: creates the 4 task rows for any ACTIVE
   * enrollment that has none. Covers enrollments activated before task
   * auto-creation existed (activatePaidEnrollment only creates tasks at the
   * moment of activation — it can't retroactively backfill enrollments that
   * were already ACTIVE when that code shipped).
   */
  async adminBackfillMissingTasks() {
    const enrollments = await this.prisma.virtualInternshipEnrollment.findMany({
      where: { status: EnrollmentStatus.ACTIVE, tasks: { none: {} } },
    });
    for (const enrollment of enrollments) {
      await this.prisma.virtualInternshipTask.createMany({
        data: Array.from({ length: TOTAL_TASKS }, (_, i) => ({ enrollmentId: enrollment.id, taskIndex: i + 1 })),
        skipDuplicates: true,
      });
    }
    return { backfilledEnrollmentIds: enrollments.map((e) => e.id) };
  }

  async adminListSubmissions(status?: EnrollmentTaskStatus) {
    const tasks = await this.prisma.virtualInternshipTask.findMany({
      where: { status: status ?? EnrollmentTaskStatus.SUBMITTED },
      orderBy: { submittedAt: 'asc' },
      include: {
        enrollment: {
          include: { user: { select: { id: true, email: true, profile: { select: { fullName: true } } } } },
        },
      },
    });
    return tasks.map((task) => ({
      ...getVirtualInternshipTaskTemplate(task.enrollment.track, task.taskIndex),
      ...task,
    }));
  }

  async adminReviewTask(adminId: string, taskId: string, dto: ReviewVirtualInternshipTaskDto) {
    const task = await this.prisma.virtualInternshipTask.findUnique({
      where: { id: taskId },
      include: { enrollment: { include: { user: { select: { profile: { select: { fullName: true } } } } } } },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== EnrollmentTaskStatus.SUBMITTED) {
      throw new BadRequestException('Task is not awaiting review');
    }

    const status = dto.approve ? EnrollmentTaskStatus.APPROVED : EnrollmentTaskStatus.REJECTED;
    const [updated] = await this.prisma.$transaction([
      this.prisma.virtualInternshipTask.update({
        where: { id: taskId },
        data: { status, reviewNote: dto.reviewNote, reviewedById: adminId, reviewedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: dto.approve ? 'internship.virtual.approve_task' : 'internship.virtual.reject_task',
          entity: 'virtual_internship_task',
          entityId: taskId,
          metadata: { note: dto.reviewNote },
        },
      }),
    ]);

    const template = getVirtualInternshipTaskTemplate(task.enrollment.track, task.taskIndex);
    await this.notifications.create({
      recipientId: task.enrollment.userId,
      type: 'INTERNSHIP_TASK_REVIEWED',
      title: dto.approve ? `Task approved: ${template?.title ?? 'Task'}` : `Task needs changes: ${template?.title ?? 'Task'}`,
      body: dto.reviewNote,
      data: { enrollmentId: task.enrollmentId, taskId },
    });

    if (dto.approve && task.taskIndex === TOTAL_TASKS) {
      await this.certificates.issue({
        sourceType: CertificateSourceType.VIRTUAL_INTERNSHIP,
        sourceId: task.enrollmentId,
        recipientId: task.enrollment.userId,
        recipientName: task.enrollment.user.profile?.fullName ?? 'EduBridge Student',
        track: task.enrollment.track,
      });
    }

    return updated;
  }
}
