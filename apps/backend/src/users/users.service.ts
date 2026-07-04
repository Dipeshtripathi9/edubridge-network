import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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
        user: { select: { id: true, reputationPoints: true, createdAt: true } },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
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
      data: { ...dto, ...(resetVerification ? { collegeVerification: 'UNVERIFIED' as const } : {}) },
      include: { college: true, university: true },
    });
    await this.redis.del(this.profileCacheKey(userId));
    return profile;
  }

  /** Mark onboarding interests + profile complete. */
  async completeOnboarding(userId: string, dto: UpdateProfileDto) {
    return this.updateProfile(userId, dto);
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
