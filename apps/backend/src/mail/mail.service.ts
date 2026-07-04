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

  /**
   * Shared, production-grade responsive email shell — inline styles only (email
   * clients strip <style>), safe fallbacks, dark background, branded gradient
   * header and a single prominent call-to-action button.
   */
  private branded(opts: {
    heading: string;
    greeting?: string;
    intro: string;
    ctaLabel: string;
    ctaUrl: string;
    note: string;
  }): string {
    const { heading, greeting, intro, ctaLabel, ctaUrl, note } = opts;
    return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f7;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${heading} — EduBridge Network</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eaeaef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr><td style="background:linear-gradient(120deg,#4f46e5,#7c3aed);padding:26px 32px;text-align:center;">
            <span style="color:#ffffff;font-size:19px;font-weight:700;letter-spacing:-0.3px;">🎓 EduBridge Network</span>
          </td></tr>
          <tr><td style="padding:34px 32px;">
            <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#18181b;">${heading}</h1>
            <p style="margin:0 0 10px;font-size:15px;color:#3f3f46;line-height:1.6;">${greeting ?? 'Hello,'}</p>
            <p style="margin:0 0 26px;font-size:15px;color:#3f3f46;line-height:1.6;">${intro}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 26px;"><tr><td style="border-radius:10px;background:#4f46e5;">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${ctaLabel}</a>
            </td></tr></table>
            <p style="margin:0 0 4px;font-size:13px;color:#71717a;">Or paste this link into your browser:</p>
            <p style="margin:0 0 26px;font-size:13px;word-break:break-all;"><a href="${ctaUrl}" style="color:#4f46e5;">${ctaUrl}</a></p>
            <hr style="border:none;border-top:1px solid #eaeaef;margin:0 0 20px;" />
            <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">${note}</p>
          </td></tr>
          <tr><td style="padding:16px 32px;background:#fafafa;text-align:center;border-top:1px solid #eaeaef;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">EduBridge Network — connecting students, colleges &amp; opportunities.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  }

  async sendVerificationEmail(to: string, token: string, name?: string): Promise<void> {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verify your EduBridge Network account',
      this.branded({
        heading: 'Verify your email',
        greeting: `Hello ${name?.trim() || 'there'},`,
        intro:
          'Welcome to EduBridge Network! Confirm your email address to activate your account and get started.',
        ctaLabel: 'Verify Email',
        ctaUrl: url,
        note: 'This link expires in 15 minutes. If you didn’t create this account, you can safely ignore this email.',
      }),
      'VERIFY',
    );
  }

  async sendMagicLink(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/auth/callback?token=${token}`;
    await this.send(
      to,
      'Your EduBridge Network sign-in link',
      this.branded({
        heading: 'Sign in to EduBridge Network',
        intro: 'Click the button below to sign in securely — no password needed.',
        ctaLabel: 'Sign in to EduBridge',
        ctaUrl: url,
        note: 'This link expires in 15 minutes and can be used once. If you didn’t request it, you can ignore this email.',
      }),
      'MAGIC_LINK',
    );
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    await this.send(
      to,
      'Reset your EduBridge Network password',
      this.branded({
        heading: 'Reset your password',
        intro:
          'We received a request to reset your password. Click the button below to choose a new one.',
        ctaLabel: 'Reset Password',
        ctaUrl: url,
        note: 'This link expires in 10 minutes. If you didn’t request a reset, you can safely ignore this email — your password won’t change.',
      }),
      'RESET',
    );
  }

  /** College-email authentication: the student clicks this to prove their .edu address. */
  async sendCollegeEmailVerification(to: string, token: string): Promise<void> {
    const url = `${this.appUrl}/verify/college-email?token=${token}`;
    await this.send(
      to,
      'Verify your college email — EduBridge Network',
      this.branded({
        heading: 'Confirm your college email',
        intro:
          'Verify this is your official college / university email to earn your Verified Student badge on EduBridge Network.',
        ctaLabel: 'Verify College Email',
        ctaUrl: url,
        note: 'This link expires in 15 minutes. If you didn’t request it, you can ignore this email.',
      }),
      'COLLEGE_VERIFY',
    );
  }
}
