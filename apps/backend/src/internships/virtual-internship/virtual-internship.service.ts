import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, VirtualInternshipEnrollment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PaymentsService } from '../../payments/payments.service';
import { computeVirtualInternshipFee, getVirtualInternshipPricingInfo } from './pricing.constants';
import { EnrollVirtualInternshipDto, VerifyVirtualInternshipPaymentDto } from './dto/virtual-internship.dto';

const ACTIVE_STATUSES: EnrollmentStatus[] = [EnrollmentStatus.PENDING_PAYMENT, EnrollmentStatus.ACTIVE];

@Injectable()
export class VirtualInternshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly payments: PaymentsService,
  ) {}

  pricing() {
    return getVirtualInternshipPricingInfo();
  }

  async enroll(userId: string, dto: EnrollVirtualInternshipDto) {
    const existing = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException('You already have an in-progress virtual internship enrollment');
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

  async myEnrollment(userId: string) {
    const enrollment = await this.prisma.virtualInternshipEnrollment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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

    await this.notifications.create({
      recipientId: enrollment.userId,
      type: 'INTERNSHIP_PAYMENT_CONFIRMED',
      title: 'Payment confirmed — your virtual internship is active! 🎉',
      body: "You'll get access within a few hours.",
    });

    return { id: updated.id, status: updated.status, track: updated.track, paidAt: updated.paidAt };
  }
}
