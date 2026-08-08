import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { stripLeadingHonorific } from '../common/utils/sanitize-name';
import { GoogleService } from '../auth/services/google.service';
import { UpdateProfileDto } from './dto/profile.dto';
import { CompleteJobsOnboardingDto, VerifyGoogleDto } from './dto/jobs-onboarding.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly google: GoogleService,
  ) {}

  private profileCacheKey(userId: string) {
    return `user:profile:${userId}`;
  }

  async getMe(userId: string) {
    return this.redis.remember(this.profileCacheKey(userId), 60, async () => {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: { include: { college: true, university: true } },
          userBadges: { include: { badge: true } },
        },
      });
      if (!user) throw new NotFoundException('User not found');
      const { passwordHash, twoFactorSecret, ...safe } = user;
      return safe;
    });
  }

  async getPublicProfile(username: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      include: {
        college: true,
        university: true,
        user: { select: { id: true, status: true, deletedAt: true, reputationPoints: true, createdAt: true } },
      },
    });
    // Don't expose the public page of a banned/suspended/deleted account.
    if (!profile || !profile.user || profile.user.deletedAt || profile.user.status !== 'ACTIVE') {
      throw new NotFoundException('Profile not found');
    }
    const { status, deletedAt, ...user } = profile.user;
    return { ...profile, user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // If the student changes which college they belong to, any prior college
    // verification no longer applies — reset it. Otherwise a VERIFIED student
    // could switch colleges and keep the badge (and post "verified" reviews)
    // for a college they never attended.
    let resetVerification = false;
    if (dto.collegeId !== undefined) {
      const current = await this.prisma.profile.findUnique({
        where: { userId },
        select: { collegeId: true },
      });
      if (current && current.collegeId !== dto.collegeId) resetVerification = true;
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...dto,
        ...(dto.fullName?.trim() ? { fullName: stripLeadingHonorific(dto.fullName.trim()) } : {}),
        ...(resetVerification ? { collegeVerification: 'UNVERIFIED' as const } : {}),
      },
      include: { college: true, university: true },
    });
    await this.redis.del(this.profileCacheKey(userId));
    return profile;
  }

  /** Mark onboarding interests + profile complete. */
  async completeOnboarding(userId: string, dto: UpdateProfileDto) {
    return this.updateProfile(userId, dto);
  }

  /**
   * Complete the simplified Internships & Jobs onboarding: save the plain-text
   * name/college/course/state and mark the student verified off the back of
   * any Google account (identity check only — no college-domain restriction,
   * unlike the stricter /verify flow).
   */
  async completeJobsOnboarding(userId: string, dto: CompleteJobsOnboardingDto) {
    await this.google.verifyIdToken(dto.idToken);

    const [, profile] = await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { phone: dto.phone } }),
      this.prisma.profile.update({
        where: { userId },
        data: {
          fullName: stripLeadingHonorific(dto.fullName.trim()),
          collegeNameText: dto.collegeName.trim(),
          course: dto.course.trim(),
          state: dto.state.trim(),
          collegeVerification: 'VERIFIED',
        },
      }),
    ]);

    await this.redis.del(this.profileCacheKey(userId));
    return profile;
  }

  /**
   * Bare Google identity check used to gate the "find my college" profile
   * (ProfileForm) before its final submit — no college-domain restriction,
   * since a prospective student may not have a college email yet.
   */
  async verifyWithGoogle(userId: string, dto: VerifyGoogleDto) {
    await this.google.verifyIdToken(dto.idToken);
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: { collegeVerification: 'VERIFIED' },
    });
    await this.redis.del(this.profileCacheKey(userId));
    return profile;
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        device: { select: { name: true, platform: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
