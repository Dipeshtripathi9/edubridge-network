import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('smtp.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('smtp.port'),
        auth: {
          user: this.config.get<string>('smtp.user'),
          pass: this.config.get<string>('smtp.pass'),
        },
      });
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      // Dev fallback: log instead of failing when SMTP is not configured.
      this.logger.warn(`[DEV MAIL] to=${to} subject="${subject}"\n${html}`);
      return;
    }
    // Email delivery is best-effort: a transient SMTP failure must not break the
    // calling flow (e.g. signup). In production a queue/worker would retry.
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('smtp.from'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send "${subject}" to ${to}: ${(err as Error).message}`);
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${this.config.get('corsOrigins')[0]}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verify your EduBridge account',
      `<h2>Welcome to EduBridge Network</h2>
       <p>Confirm your email to activate your account.</p>
       <p><a href="${url}">Verify Email</a></p>
       <p>This link expires in 24 hours.</p>`,
    );
  }

  async sendMagicLink(to: string, token: string): Promise<void> {
    const url = `${this.config.get('corsOrigins')[0]}/auth/callback?token=${token}`;
    await this.send(
      to,
      'Your EduBridge sign-in link',
      `<h2>Sign in to EduBridge Network</h2>
       <p>Click the button below to sign in — no password needed.</p>
       <p><a href="${url}">Sign in to EduBridge</a></p>
       <p>This link expires in 15 minutes. If you didn't request it, you can ignore this email.</p>`,
    );
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const url = `${this.config.get('corsOrigins')[0]}/reset-password?token=${token}`;
    await this.send(
      to,
      'Reset your EduBridge password',
      `<h2>Password reset requested</h2>
       <p><a href="${url}">Reset Password</a></p>
       <p>If you didn't request this, you can ignore this email. Link expires in 1 hour.</p>`,
    );
  }
}
