import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPlatformAdmin } from '../communities/community-permissions';
import { CreateReferralDto } from './dto/referral.dto';

const SELECT = {
  id: true,
  role: true,
  company: true,
  description: true,
  link: true,
  createdAt: true,
  postedBy: { select: { profile: { select: { fullName: true } } } },
};

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Referrals are a leader perk: only community leaders (or admins) may view them. */
  private async assertLeader(actor: { sub: string; role: string }) {
    if (isPlatformAdmin(actor.role)) return;
    const managed = await this.prisma.communityMember.count({
      where: { userId: actor.sub, role: { not: 'MEMBER' } },
    });
    if (managed === 0) {
      throw new ForbiddenException('Referrals are available to community leaders');
    }
  }

  async list(actor: { sub: string; role: string }) {
    await this.assertLeader(actor);
    return this.prisma.referral.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: SELECT });
  }

  async create(actor: { sub: string; role: string }, dto: CreateReferralDto) {
    if (!isPlatformAdmin(actor.role)) {
      throw new ForbiddenException('Only an admin can post referrals');
    }
    return this.prisma.referral.create({ data: { ...dto, postedById: actor.sub }, select: SELECT });
  }

  async remove(id: string, actor: { sub: string; role: string }) {
    if (!isPlatformAdmin(actor.role)) throw new ForbiddenException('Only an admin can remove referrals');
    const ref = await this.prisma.referral.findUnique({ where: { id } });
    if (!ref) throw new NotFoundException('Referral not found');
    await this.prisma.referral.delete({ where: { id } });
    return { deleted: true };
  }
}
