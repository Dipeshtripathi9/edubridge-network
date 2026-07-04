import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessTokenPayload } from '../strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /** SHA-256 a token for storage/lookup (refresh tokens, verification tokens). */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generateOpaqueToken(bytes = 48): string {
    return randomBytes(bytes).toString('hex');
  }

  /**
   * Issue an access JWT + opaque refresh token, persisting a Session row.
   */
  async issueTokens(
    user: User,
    opts: { rememberMe?: boolean; userAgent?: string; ip?: string; deviceId?: string } = {},
  ): Promise<TokenPair> {
    const accessTtl = this.config.get<number>('jwt.accessTtl')!;
    const refreshTtl = this.config.get<number>('jwt.refreshTtl')!;

    // Pre-create session id so we can embed it in the access token.
    const refreshToken = this.generateOpaqueToken();
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.hashToken(refreshToken),
        rememberMe: opts.rememberMe ?? false,
        userAgent: opts.userAgent,
        ipAddress: opts.ip,
        deviceId: opts.deviceId,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    return { accessToken, refreshToken, expiresIn: accessTtl };
  }

  /**
   * Rotate refresh token: validate the presented token against the session,
   * revoke it, and issue a fresh pair. Detects reuse of revoked tokens.
   */
  async rotate(refreshToken: string, userAgent?: string, ip?: string): Promise<TokenPair> {
    const hash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash: hash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Atomically claim the rotation: only one caller can flip revokedAt from
    // null → now. If we didn't flip it, another request already rotated this
    // token (or this is a replay of a revoked token), so reject instead of
    // minting a second valid pair from the same token.
    const claimed = await this.prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claimed.count === 0) throw new Error('INVALID_REFRESH_TOKEN');

    return this.issueTokens(session.user, {
      rememberMe: session.rememberMe,
      userAgent,
      ip,
      deviceId: session.deviceId ?? undefined,
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
