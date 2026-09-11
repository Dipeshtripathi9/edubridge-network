import { Injectable } from '@nestjs/common';
import { Prisma, ReferralCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatReferralCode } from './referral-code.util';

// Assigns a permanent "EBN0"-style code to every unique student going
// forward — however their account was created (email/password, Google,
// phone OTP, magic link). Deliberately NOT backfilled onto users who
// registered before this existed — those accounts stay without a code.
// Not exposed via any controller/route; invoked directly by other services
// until this is wired into a real feature.
@Injectable()
export class ReferralCodeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotent: returns the existing code for this user, or assigns the next one. */
  async assignForUser(userId: string): Promise<ReferralCode> {
    const existing = await this.prisma.referralCode.findUnique({ where: { userId } });
    if (existing) return existing;

    try {
      const created = await this.prisma.referralCode.create({ data: { userId } });
      return this.prisma.referralCode.update({
        where: { id: created.id },
        data: { code: formatReferralCode(created.sequence) },
      });
    } catch (err) {
      // Two concurrent first-time signups/logins for the same user can both
      // miss the initial findUnique and race to create — the loser hits a
      // unique violation on userId; fall back to the winner's row.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const winner = await this.prisma.referralCode.findUnique({ where: { userId } });
        if (winner) return winner;
      }
      throw err;
    }
  }

  async getForUser(userId: string): Promise<ReferralCode | null> {
    return this.prisma.referralCode.findUnique({ where: { userId } });
  }

  /** The full list of assigned codes, oldest first. */
  async list(): Promise<ReferralCode[]> {
    return this.prisma.referralCode.findMany({ orderBy: { sequence: 'asc' } });
  }
}
