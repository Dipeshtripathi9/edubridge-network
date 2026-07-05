import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService, TokenPair } from './services/token.service';
import { OtpService } from './services/otp.service';
import { GoogleService } from './services/google.service';
import {
  ForgotPasswordDto,
  GoogleAuthDto,
  LoginDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
  RequestOtpDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
  VerifyOtpDto,
} from './dto/auth.dto';

interface RequestMeta {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly otp: OtpService,
    private readonly google: GoogleService,
    private readonly config: ConfigService,
  ) {}

  private sanitize(user: User) {
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return safe;
  }

  // ---------------- EMAIL SIGNUP ----------------
  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    // When email delivery isn't available (local/dev), activate immediately so
    // the signup→login flow works without an unreachable verification link.
    const autoVerify = this.config.get<boolean>('auth.autoVerifyEmail') === true;

    const passwordHash = await this.tokens.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        authProvider: AuthProvider.EMAIL,
        status: autoVerify ? 'ACTIVE' : 'PENDING_VERIFICATION',
        emailVerifiedAt: autoVerify ? new Date() : null,
        profile: { create: { fullName: dto.fullName, gender: dto.gender?.trim() || null } },
      },
    });

    if (autoVerify) {
      return { user: this.sanitize(user), autoVerified: true, message: 'Account ready' };
    }
    const token = await this.issueEmailVerification(user.id);
    return {
      user: this.sanitize(user),
      autoVerified: false,
      message: 'Verification email sent',
      ...this.devVerifyLink(token),
    };
  }

  /** Re-send the verification link for a still-pending account. */
  async resendVerification(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (user && user.status === 'PENDING_VERIFICATION' && user.email) {
      const token = await this.issueEmailVerification(user.id);
      return { message: 'Verification email resent.', ...this.devVerifyLink(token) };
    }
    return { message: 'If that account needs verification, a link has been sent.' };
  }

  // In non-production (no SMTP) return the link so the flow stays testable.
  private devVerifyLink(token: string): { devLink?: string } {
    if (process.env.NODE_ENV === 'production') return {};
    const webUrl = this.config.get<string>('appUrl') ?? 'http://localhost:3000';
    return { devLink: `${webUrl}/verify-email?token=${token}` };
  }

  private async issueEmailVerification(userId: string): Promise<string> {
    const token = this.tokens.generateOpaqueToken(32);
    await this.prisma.emailVerification.create({
      data: {
        userId,
        tokenHash: this.tokens.hashToken(token),
        purpose: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    return token;
  }

  async verifyEmail(dto: VerifyEmailDto, meta: RequestMeta) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { tokenHash: this.tokens.hashToken(dto.token), purpose: 'EMAIL_VERIFY' },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Verification link invalid or expired');
    }
    // Activate the account and consume the single-use token in one transaction.
    const [, user] = await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
      }),
    ]);
    // Auto-login: issue a session immediately so the user never logs in manually.
    const tokens = await this.tokens.issueTokens(user, { userAgent: meta.userAgent, ip: meta.ip });
    return { tokens, user: this.sanitize(user) };
  }

  // ---------------- EMAIL LOGIN (brute-force protected) ----------------
  async login(dto: LoginDto, meta: RequestMeta): Promise<{ tokens: TokenPair; user: unknown }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const genericError = new UnauthorizedException('Invalid credentials');

    if (!user || !user.passwordHash) throw genericError;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account temporarily locked. Try again later.');
    }
    if (user.status === 'BANNED') throw new ForbiddenException('Account banned');

    const valid = await this.tokens.verifyPassword(user.passwordHash, dto.password);
    if (!valid) {
      await this.registerFailedLogin(user);
      throw genericError;
    }

    if (user.status === 'PENDING_VERIFICATION') {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    // Reset failed counters on success.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const tokens = await this.tokens.issueTokens(user, {
      rememberMe: dto.rememberMe,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });
    return { tokens, user: this.sanitize(user) };
  }

  private async registerFailedLogin(user: User) {
    const max = this.config.get<number>('security.maxFailedLogins')!;
    const lockMs = this.config.get<number>('security.lockDurationMs')!;
    const count = user.failedLoginCount + 1;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: count,
        lockedUntil: count >= max ? new Date(Date.now() + lockMs) : null,
      },
    });
  }

  // ---------------- REFRESH / LOGOUT ----------------
  async refresh(refreshToken: string, meta: RequestMeta): Promise<TokenPair> {
    try {
      return await this.tokens.rotate(refreshToken, meta.userAgent, meta.ip);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(sessionId: string) {
    await this.tokens.revokeSession(sessionId);
    return { message: 'Logged out' };
  }

  async logoutAll(userId: string) {
    await this.tokens.revokeAllForUser(userId);
    return { message: 'Logged out from all devices' };
  }

  // ---------------- PASSWORD RESET ----------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always return success to avoid user enumeration.
    if (user) {
      const token = this.tokens.generateOpaqueToken(32);
      await this.prisma.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash: this.tokens.hashToken(token),
          purpose: 'PASSWORD_RESET',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });
    }
    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { tokenHash: this.tokens.hashToken(dto.token), purpose: 'PASSWORD_RESET' },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const passwordHash = await this.tokens.hashPassword(dto.password);
    await this.prisma.$transaction([
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    ]);
    // Revoke all sessions after a password change.
    await this.tokens.revokeAllForUser(record.userId);
    return { message: 'Password reset successful' };
  }

  // ---------------- GOOGLE OAUTH ----------------
  async googleAuth(dto: GoogleAuthDto, meta: RequestMeta) {
    const profile = await this.google.verifyIdToken(dto.idToken);

    const account = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider: 'GOOGLE', providerUserId: profile.providerUserId } },
      include: { user: true },
    });

    let user = account?.user;
    if (!user) {
      // Link to an existing email account or create a new one. Two concurrent
      // first-time logins can both see "no user" and race to create — the loser
      // gets a P2002 unique violation, so fall back to re-fetching by email.
      user = (await this.prisma.user.findUnique({ where: { email: profile.email } })) ?? undefined;
      if (!user) {
        try {
          user = await this.prisma.user.create({
            data: {
              email: profile.email,
              authProvider: AuthProvider.GOOGLE,
              status: 'ACTIVE',
              emailVerifiedAt: profile.emailVerified ? new Date() : null,
              profile: { create: { fullName: profile.name ?? 'Student', avatarUrl: profile.picture } },
            },
          });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            user = (await this.prisma.user.findUnique({ where: { email: profile.email } })) ?? undefined;
          } else throw err;
        }
      }
      if (!user) throw new BadRequestException('Could not sign in with Google');
      // upsert so a concurrent link of the same Google account can't 500.
      await this.prisma.oAuthAccount.upsert({
        where: {
          provider_providerUserId: { provider: 'GOOGLE', providerUserId: profile.providerUserId },
        },
        update: {},
        create: { userId: user.id, provider: 'GOOGLE', providerUserId: profile.providerUserId },
      });
    }

    const tokens = await this.tokens.issueTokens(user, { userAgent: meta.userAgent, ip: meta.ip });
    return { tokens, user: this.sanitize(user) };
  }

  // ---------------- PHONE OTP ----------------
  async requestOtp(dto: RequestOtpDto) {
    const code = this.otp.generateCode();
    const ttl = this.config.get<number>('twilio.otpTtl')!;
    await this.prisma.otpVerification.create({
      data: {
        phone: dto.phone,
        codeHash: this.otp.hashCode(code),
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });
    await this.otp.sendSms(dto.phone, code);
    return { message: 'OTP sent' };
  }

  async verifyOtp(dto: VerifyOtpDto, meta: RequestMeta) {
    const record = await this.prisma.otpVerification.findFirst({
      where: { phone: dto.phone, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired or not found');
    }
    if (record.attempts >= 5) throw new ForbiddenException('Too many attempts');

    if (record.codeHash !== this.otp.hashCode(dto.code)) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Find or create user by phone. Guard the create against a concurrent
    // first-login race (P2002) by re-fetching on conflict.
    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            phone: dto.phone,
            authProvider: AuthProvider.PHONE,
            status: 'ACTIVE',
            phoneVerifiedAt: new Date(),
            profile: { create: { fullName: 'Student' } },
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
        } else throw err;
      }
      if (!user) throw new BadRequestException('Could not sign in');
    } else if (!user.phoneVerifiedAt) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    const tokens = await this.tokens.issueTokens(user, { userAgent: meta.userAgent, ip: meta.ip });
    return { tokens, user: this.sanitize(user) };
  }

  // ---------------- MAGIC EMAIL LINK (passwordless) ----------------
  async requestMagicLink(dto: MagicLinkRequestDto) {
    const email = dto.email.toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            email,
            authProvider: AuthProvider.EMAIL,
            status: 'ACTIVE',
            profile: { create: { fullName: dto.fullName?.trim() || 'Student' } },
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          user = await this.prisma.user.findUnique({ where: { email } });
        } else throw err;
      }
      if (!user) throw new BadRequestException('Could not send a sign-in link');
    }
    const token = this.tokens.generateOpaqueToken(32);
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: this.tokens.hashToken(token),
        purpose: 'MAGIC_LINK',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // Email isn't sent by the server, so return the link directly so it remains
    // usable in non-production. Never leak it in production.
    const isProd = process.env.NODE_ENV === 'production';
    const webUrl = this.config.get<string>('appUrl') ?? 'http://localhost:3000';
    return {
      message: 'If that email is valid, a sign-in link has been sent.',
      ...(isProd ? {} : { devLink: `${webUrl}/auth/callback?token=${token}` }),
    };
  }

  async verifyMagicLink(dto: MagicLinkVerifyDto, meta: RequestMeta) {
    const record = await this.prisma.emailVerification.findFirst({
      where: { tokenHash: this.tokens.hashToken(dto.token), purpose: 'MAGIC_LINK' },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This sign-in link is invalid or has expired.');
    }
    const [, user] = await this.prisma.$transaction([
      this.prisma.emailVerification.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
      }),
    ]);
    const tokens = await this.tokens.issueTokens(user, { userAgent: meta.userAgent, ip: meta.ip });
    return { tokens, user: this.sanitize(user) };
  }
}
