import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CertificateSourceType,
  EnrollmentStatus,
  TaskSubmissionStatus,
  UserRole,
  VirtualInternshipEvaluationStatus,
  VirtualInternshipTrack,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CertificatesService } from '../internships/certificates/certificates.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import {
  getVirtualInternshipFee,
  getVirtualInternshipGstAmount,
  VIRTUAL_INTERNSHIP_GST_PERCENT,
} from './pricing.constants';
import {
  ConfirmPaymentDto,
  EnrollVirtualInternshipDto,
  EvaluateEnrollmentDto,
  RejectPaymentDto,
  ReviewSubmissionDto,
  SubmissionQueryDto,
  SubmitFeedbackDto,
  SubmitPaymentReferenceDto,
  SubmitTaskDto,
  UpdateTrackConfigDto,
  UpsertTaskDto,
  VirtualInternshipQueryDto,
} from './dto/virtual-internship.dto';
import { buildPaginatedResult } from '../common/dto/pagination.dto';

const ACTIVE_STATUSES: EnrollmentStatus[] = [EnrollmentStatus.PENDING_PAYMENT, EnrollmentStatus.ACTIVE];

const TRACK_LABELS: Record<VirtualInternshipTrack, string> = {
  FOUR_WEEK: '4-Week Track',
  FOUR_MONTH: '4-Month Track',
};

@Injectable()
export class VirtualInternshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly certificates: CertificatesService,
    private readonly quizzes: QuizzesService,
  ) {}

  // ---------------- Pricing / track config (admin-settable price + payment link) ----------------

  /** GST + total, computed from a base fee — never persisted. */
  private pricingFields(baseAmount: number) {
    const gstAmount = getVirtualInternshipGstAmount(baseAmount);
    return {
      gstPercent: VIRTUAL_INTERNSHIP_GST_PERCENT,
      gstAmount,
      totalAmount: baseAmount + gstAmount,
    };
  }

  private async getTrackConfigMap(): Promise<
    Record<VirtualInternshipTrack, { url: string | null; baseFeeAmount: number | null }>
  > {
    const rows = await this.prisma.virtualInternshipPaymentLink.findMany();
    const map: Record<VirtualInternshipTrack, { url: string | null; baseFeeAmount: number | null }> = {
      FOUR_WEEK: { url: null, baseFeeAmount: null },
      FOUR_MONTH: { url: null, baseFeeAmount: null },
    };
    for (const row of rows) map[row.track] = { url: row.url, baseFeeAmount: row.baseFeeAmount };
    return map;
  }

  /** Admin-set price if one exists for this track, else the hardcoded default. Used only for *new* enrollments. */
  private async effectiveBaseFee(track: VirtualInternshipTrack): Promise<number> {
    const config = await this.prisma.virtualInternshipPaymentLink.findUnique({ where: { track } });
    return config?.baseFeeAmount ?? getVirtualInternshipFee(track);
  }

  private async attachPricing<T extends { feeAmount: number; track: VirtualInternshipTrack }>(enrollment: T) {
    const map = await this.getTrackConfigMap();
    return { ...enrollment, ...this.pricingFields(enrollment.feeAmount), paymentLink: map[enrollment.track].url };
  }

  /** Public: current effective price per track (admin override, or default), for the landing/enroll pages. */
  async getPricing() {
    const map = await this.getTrackConfigMap();
    return (Object.keys(map) as VirtualInternshipTrack[]).map((track) => {
      const baseAmount = map[track].baseFeeAmount ?? getVirtualInternshipFee(track);
      return { track, baseAmount, ...this.pricingFields(baseAmount) };
    });
  }

  /** Admin: full track config (price override + payment link), with the effective breakdown for display. */
  async getTrackConfigs() {
    const map = await this.getTrackConfigMap();
    return (Object.keys(map) as VirtualInternshipTrack[]).map((track) => {
      const baseAmount = map[track].baseFeeAmount ?? getVirtualInternshipFee(track);
      return {
        track,
        url: map[track].url,
        baseFeeAmount: map[track].baseFeeAmount,
        defaultBaseFeeAmount: getVirtualInternshipFee(track),
        baseAmount,
        ...this.pricingFields(baseAmount),
      };
    });
  }

  async updateTrackConfig(adminId: string, track: string, dto: UpdateTrackConfigDto) {
    if (!Object.values(VirtualInternshipTrack).includes(track as VirtualInternshipTrack)) {
      throw new BadRequestException('Invalid track');
    }
    if (dto.url === undefined && dto.baseFeeAmount === undefined) {
      throw new BadRequestException('Provide at least a payment link or a price to update');
    }
    const data = {
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.baseFeeAmount !== undefined ? { baseFeeAmount: dto.baseFeeAmount } : {}),
      updatedById: adminId,
    };
    const config = await this.prisma.virtualInternshipPaymentLink.upsert({
      where: { track: track as VirtualInternshipTrack },
      create: { track: track as VirtualInternshipTrack, ...data },
      update: data,
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'virtual_internship.update_track_config',
        entity: 'virtual_internship_payment_link',
        entityId: config.id,
        metadata: { track, url: dto.url, baseFeeAmount: dto.baseFeeAmount },
      },
    });
    return config;
  }

  // ---------------- Student ----------------

  async enroll(userId: string, dto: EnrollVirtualInternshipDto) {
    const existing = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException('You already have an in-progress Virtual Internship enrollment');
    }
    const created = await this.prisma.virtualInternshipEnrollment.create({
      data: {
        userId,
        track: dto.track,
        feeAmount: await this.effectiveBaseFee(dto.track),
        status: EnrollmentStatus.PENDING_PAYMENT,
      },
    });
    return this.attachPricing(created);
  }

  async myEnrollment(userId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!enrollment) return null;
    return this.attachPricing(enrollment);
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

  /** Fired when the student clicks "Pay ₹X" — records the click and pings every admin. */
  async markPaymentLinkClicked(userId: string, id: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({
      where: { id },
      include: { user: { select: { phone: true, email: true, profile: { select: { fullName: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) return { ok: true };

    await this.prisma.virtualInternshipEnrollment.update({
      where: { id },
      data: { paymentLinkClickedAt: new Date() },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
      select: { id: true },
    });
    const name = enrollment.user.profile?.fullName ?? 'A student';
    const contact = enrollment.user.phone ?? enrollment.user.email ?? 'no contact on file';
    const { totalAmount } = this.pricingFields(enrollment.feeAmount);
    await Promise.all(
      admins.map((admin) =>
        this.notifications.create({
          recipientId: admin.id,
          type: 'VIRTUAL_INTERNSHIP_PAYMENT_CLICKED',
          title: `${name} is paying for the ${TRACK_LABELS[enrollment.track]}`,
          body: `₹${totalAmount.toLocaleString()} · ${contact} · watch for the UPI/bank transfer.`,
        }),
      ),
    );
    return { ok: true };
  }

  // ---------------- Admin ----------------

  async listEnrollments(query: VirtualInternshipQueryDto) {
    const items = await this.prisma.virtualInternshipEnrollment.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        user: { select: { id: true, email: true, phone: true, profile: { select: { fullName: true } } } },
      },
    });
    const map = await this.getTrackConfigMap();
    const withPricing = items.map((item) => ({
      ...item,
      ...this.pricingFields(item.feeAmount),
      paymentLink: map[item.track].url,
    }));
    return buildPaginatedResult(withPricing, query);
  }

  async metrics() {
    const [byStatus, byTrack, byEvaluation, certificatesIssued, feedbackAgg, averageQuizScorePercent] =
      await Promise.all([
        this.prisma.virtualInternshipEnrollment.groupBy({ by: ['status'], _count: true }),
        this.prisma.virtualInternshipEnrollment.groupBy({ by: ['track'], _count: true }),
        this.prisma.virtualInternshipEnrollment.groupBy({ by: ['evaluationStatus'], _count: true }),
        this.prisma.certificate.count({ where: { sourceType: CertificateSourceType.VIRTUAL_INTERNSHIP } }),
        this.prisma.virtualInternshipFeedback.aggregate({ _avg: { rating: true }, _count: true }),
        this.quizzes.averageScorePercent(),
      ]);

    const statusCounts = Object.fromEntries(byStatus.map((r) => [r.status, r._count])) as Record<
      EnrollmentStatus,
      number
    >;
    const trackCounts = Object.fromEntries(byTrack.map((r) => [r.track, r._count]));
    const evaluationCounts = Object.fromEntries(byEvaluation.map((r) => [r.evaluationStatus, r._count]));

    const total = byStatus.reduce((sum, r) => sum + r._count, 0);
    const paid = (statusCounts.ACTIVE ?? 0) + (statusCounts.COMPLETED ?? 0);
    const completed = statusCounts.COMPLETED ?? 0;

    return {
      totalEnrollments: total,
      byStatus: statusCounts,
      byTrack: trackCounts,
      byEvaluation: evaluationCounts,
      certificatesIssued,
      paymentConfirmedRate: total === 0 ? 0 : Math.round((paid / total) * 1000) / 10,
      completionRate: paid === 0 ? 0 : Math.round((completed / paid) * 1000) / 10,
      averageSatisfactionRating: feedbackAgg._avg.rating ? Math.round(feedbackAgg._avg.rating * 10) / 10 : null,
      feedbackCount: feedbackAgg._count,
      averageQuizScorePercent,
    };
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

  /** Rejects an unverifiable payment — cancels the enrollment so the student sees "Join track" again. */
  async rejectPayment(adminId: string, id: string, dto: RejectPaymentDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== EnrollmentStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('Only a pending-payment enrollment can be rejected');
    }

    await this.prisma.$transaction([
      this.prisma.virtualInternshipEnrollment.update({
        where: { id },
        data: { status: EnrollmentStatus.CANCELLED },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'virtual_internship.reject_payment',
          entity: 'virtual_internship_enrollment',
          entityId: id,
          metadata: { userId: enrollment.userId, note: dto.note },
        },
      }),
    ]);

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'VIRTUAL_INTERNSHIP_PAYMENT_REJECTED',
      title: "We couldn't verify your payment",
      body: dto.note ?? 'Please double-check your UTR number and join the track again, or contact support for help.',
    });

    return { id, status: EnrollmentStatus.CANCELLED };
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

  async submitFeedback(userId: string, enrollmentId: string, dto: SubmitFeedbackDto) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new ForbiddenException('You can only leave feedback after completing the track');
    }

    return this.prisma.virtualInternshipFeedback.upsert({
      where: { enrollmentId },
      create: { enrollmentId, userId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });
  }

  async myFeedback(userId: string, enrollmentId: string) {
    const feedback = await this.prisma.virtualInternshipFeedback.findUnique({ where: { enrollmentId } });
    if (feedback && feedback.userId !== userId) throw new ForbiddenException('Not your feedback');
    return feedback;
  }

  // ---------------- Curriculum tasks (admin-editable content) ----------------

  /** Public/authenticated: full curriculum for a track, ordered for display. */
  async listTasks(track: VirtualInternshipTrack) {
    return this.prisma.virtualInternshipTask.findMany({
      where: { track },
      orderBy: [{ monthNum: 'asc' }, { weekNum: 'asc' }],
    });
  }

  async upsertTask(adminId: string, dto: UpsertTaskDto) {
    const monthNum = dto.monthNum ?? null;
    const existing = await this.prisma.virtualInternshipTask.findFirst({
      where: { track: dto.track, monthNum, weekNum: dto.weekNum },
    });
    const data = {
      monthTitle: dto.monthTitle,
      monthDesc: dto.monthDesc,
      title: dto.title,
      objective: dto.objective,
      deliverable: dto.deliverable,
      steps: dto.steps,
      hours: dto.hours,
      updatedById: adminId,
    };
    const task = existing
      ? await this.prisma.virtualInternshipTask.update({ where: { id: existing.id }, data })
      : await this.prisma.virtualInternshipTask.create({
          data: { track: dto.track, monthNum, weekNum: dto.weekNum, ...data },
        });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'virtual_internship.upsert_task',
        entity: 'virtual_internship_task',
        entityId: task.id,
        metadata: { track: dto.track, monthNum, weekNum: dto.weekNum },
      },
    });
    return task;
  }

  async deleteTask(adminId: string, id: string) {
    const task = await this.prisma.virtualInternshipTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.virtualInternshipTask.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'virtual_internship.delete_task',
        entity: 'virtual_internship_task',
        entityId: id,
        metadata: { track: task.track, monthNum: task.monthNum, weekNum: task.weekNum },
      },
    });
    return { id };
  }

  // ---------------- Task submissions (student GitHub links, admin review) ----------------

  async submitTask(userId: string, taskId: string, dto: SubmitTaskDto) {
    const task = await this.prisma.virtualInternshipTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, track: task.track, status: EnrollmentStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    if (!enrollment) {
      throw new ForbiddenException('You need an active enrollment in this track to submit tasks');
    }

    return this.prisma.virtualInternshipTaskSubmission.upsert({
      where: { taskId_enrollmentId: { taskId, enrollmentId: enrollment.id } },
      create: { taskId, enrollmentId: enrollment.id, userId, githubUrl: dto.githubUrl },
      update: {
        githubUrl: dto.githubUrl,
        status: TaskSubmissionStatus.SUBMITTED,
        reviewNote: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });
  }

  async mySubmissions(userId: string, enrollmentId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('Not your enrollment');
    return this.prisma.virtualInternshipTaskSubmission.findMany({ where: { enrollmentId } });
  }

  async listSubmissions(query: SubmissionQueryDto) {
    const items = await this.prisma.virtualInternshipTaskSubmission.findMany({
      where: {
        status: query.status,
        task: query.track ? { track: query.track } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
      include: {
        task: { select: { id: true, track: true, monthNum: true, weekNum: true, title: true } },
        user: { select: { id: true, email: true, phone: true, profile: { select: { fullName: true } } } },
      },
    });
    return buildPaginatedResult(items, query);
  }

  async reviewSubmission(adminId: string, id: string, dto: ReviewSubmissionDto) {
    const submission = await this.prisma.virtualInternshipTaskSubmission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException('Submission not found');

    const updated = await this.prisma.virtualInternshipTaskSubmission.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    await this.notifications.create({
      recipientId: submission.userId,
      type: 'INTERNSHIP_TASK_REVIEWED',
      title:
        dto.status === TaskSubmissionStatus.APPROVED
          ? 'Your task submission was approved 🎉'
          : 'Your task submission needs changes',
      body:
        dto.reviewNote ??
        (dto.status === TaskSubmissionStatus.APPROVED
          ? 'Nice work — on to the next one.'
          : 'Check your mentor feedback and resubmit.'),
    });

    return updated;
  }
}
