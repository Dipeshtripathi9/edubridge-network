import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = this.config.get<string>('smtp.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('smtp.port'),
        secure: this.config.get<number>('smtp.port') === 465,
        auth: {
          user: this.config.get<string>('smtp.user'),
          pass: this.config.get<string>('smtp.pass'),
        },
        // Pooled connections so bursts of signups don't open a socket each.
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });
    }
  }

  /** Public URL of the web app for building the links inside emails. */
  private get appUrl(): string {
    return this.config.get<string>('appUrl') ?? 'http://localhost:3000';
  }

  /** Persist a delivery-audit row (best-effort — never blocks or breaks a send). */
  private record(to: string, subject: string, kind: string, status: string, error?: string) {
    void this.prisma.emailLog
      .create({ data: { to, subject, kind, status, error: error?.slice(0, 500) } })
      .catch(() => undefined);
  }

  private async send(to: string, subject: string, html: string, kind = 'OTHER'): Promise<void> {
    if (!this.transporter) {
      // Dev fallback: log instead of failing when SMTP is not configured.
      this.logger.warn(`[DEV MAIL] to=${to} subject="${subject}"\n${html}`);
      this.record(to, subject, kind, 'SKIPPED', 'SMTP not configured');
      return;
    }
    // Delivery is best-effort: a transient SMTP failure must not break the calling
    // flow (signup, reset, verify). Errors are logged; a queue/worker retries in prod.
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('smtp.from'),
        to,
        subject,
        html,
      });
      this.record(to, subject, kind, 'SENT');
    } catch (err) {
      this.logger.error(`Failed to send "${subject}" to ${to}: ${(err as Error).message}`);
      this.record(to, subject, kind, 'FAILED', (err as Error).message);
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verify your EduBridge account',
      `<h2>Welcome to EduBridge Network</h2>
       <p>Confirm your email to activate your account.</p>
       <p><a href="${url}">Verify Email</a></p>
       <p>This link expires in 24 hours.</p>`,
      'VERIFY',
    );
  }

  async sendMagicLink(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/auth/callback?token=${token}`;
    await this.send(
      to,
      'Your EduBridge sign-in link',
      `<h2>Sign in to EduBridge Network</h2>
       <p>Click the button below to sign in — no password needed.</p>
       <p><a href="${url}">Sign in to EduBridge</a></p>
       <p>This link expires in 15 minutes. If you didn't request it, you can ignore this email.</p>`,
      'MAGIC_LINK',
    );
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    await this.send(
      to,
      'Reset your EduBridge password',
      `<h2>Password reset requested</h2>
       <p><a href="${url}">Reset Password</a></p>
       <p>If you didn't request this, you can ignore this email. Link expires in 1 hour.</p>`,
      'RESET',
    );
  }

  /** College-email authentication: the student clicks this to prove their .edu address. */
  async sendCollegeEmailVerification(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/verify/college-email?token=${token}`;
    await this.send(
      to,
      'Verify your college email — EduBridge',
      `<h2>Confirm your college email</h2>
       <p>Click below to verify this is your official college/university email and
          get your verified-student badge on EduBridge Network.</p>
       <p><a href="${url}">Verify College Email</a></p>
       <p>This link expires in 15 minutes. If you didn't request it, you can ignore this email.</p>`,
      'COLLEGE_VERIFY',
    );
  }
}
