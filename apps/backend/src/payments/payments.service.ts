import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';

export interface CreatedOrder {
  orderId: string;
  amount: number; // paise
  currency: string;
  keyId: string;
}

const MIN_AMOUNT_PAISE = 100;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly client: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    this.keyId = this.config.get<string>('razorpay.keyId') ?? '';
    this.keySecret = this.config.get<string>('razorpay.keySecret') ?? '';
    this.webhookSecret = this.config.get<string>('razorpay.webhookSecret') ?? '';
    this.client = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret });
  }

  /** Creates a Razorpay order. `amountInPaise` must be >= 100 (Razorpay's ₹1 minimum). */
  async createOrder(amountInPaise: number, currency: string, receipt: string): Promise<CreatedOrder> {
    if (amountInPaise < MIN_AMOUNT_PAISE) {
      throw new BadRequestException(`Amount must be at least ${MIN_AMOUNT_PAISE} paise`);
    }
    try {
      const order = await this.client.orders.create({ amount: amountInPaise, currency, receipt });
      return { orderId: order.id, amount: Number(order.amount), currency: order.currency, keyId: this.keyId };
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 401) throw new UnauthorizedException('Razorpay authentication failed');
      this.logger.error('Razorpay order creation failed', err as Error);
      throw new InternalServerErrorException('Unable to create payment order');
    }
  }

  /**
   * Verifies the checkout callback signature: HMAC-SHA256(orderId + "|" + paymentId, KEY_SECRET),
   * compared with a timing-safe equality check to avoid leaking the expected value via timing.
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const expectedHex = createHmac('sha256', this.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = Buffer.from(signature, 'hex');
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  /**
   * Verifies a Razorpay webhook delivery: HMAC-SHA256(rawBody, webhook secret) compared
   * against the `X-Razorpay-Signature` header. Must run against the raw request bytes —
   * re-serializing the parsed JSON body would produce a different signature.
   */
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    const expectedHex = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = Buffer.from(signature, 'hex');
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }
}
