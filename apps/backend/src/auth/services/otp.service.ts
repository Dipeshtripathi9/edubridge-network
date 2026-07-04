import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomInt } from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly config: ConfigService) {}

  generateCode(): string {
    // 6-digit numeric OTP from a cryptographically-secure source (not Math.random).
    return randomInt(100000, 1000000).toString();
  }

  hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  async sendSms(phone: string, code: string): Promise<void> {
    const sid = this.config.get<string>('twilio.accountSid');
    if (!sid) {
      // Dev fallback when Twilio is not configured.
      this.logger.warn(`[DEV OTP] phone=${phone} code=${code}`);
      return;
    }
    // Lazy-load twilio only when configured, so it stays an optional dependency.
    const { default: Twilio } = await import('twilio' as string).catch(() => ({ default: null }));
    if (!Twilio) {
      this.logger.warn('twilio package not installed; skipping SMS send.');
      return;
    }
    const twilio = Twilio(sid, this.config.get('twilio.authToken'));
    await twilio.messages.create({
      body: `Your EduBridge verification code is ${code}. It expires in 5 minutes.`,
      from: this.config.get('twilio.phoneNumber'),
      to: phone,
    });
  }
}
