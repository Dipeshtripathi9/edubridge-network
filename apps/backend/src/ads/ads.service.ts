import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPlatformAdmin, roleHasCapability } from '../communities/community-permissions';
import { CreateAdCardDto } from './dto/ad-card.dto';

const RUN_DAYS = 1; // one ad card runs for exactly its scheduled day
const WEEK_DAYS = 7;
const LEADER_WEEKLY_LIMIT = 5; // 5 ad cards / week for a community head
const ADMIN_LIMIT = 2; // admin's 2 ad cards / week per community

const AD_SELECT = {
  id: true,
  title: true,
  body: true,
  imageUrl: true,
  linkUrl: true,
  scheduledFor: true,
  expiresAt: true,
  createdById: true,
  createdBy: { select: { profile: { select: { fullName: true } } } },
};

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  /** Start of the day 7 days from today — the end of the rolling weekly window. */
  private weekEnd(): Date {
    const x = this.startOfDay(new Date());
    x.setDate(x.getDate() + WEEK_DAYS);
    return x;
  }

  /** Resolve the community by slug + the actor's ad limit (admins use the admin pool). */
  private async resolve(slug: string, actor: { sub: string; role: string }) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const admin = isPlatformAdmin(actor.role);
    if (!admin) {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: community.id, userId: actor.sub } },
      });
      if (!roleHasCapability(member?.role, 'ANNOUNCE')) {
        throw new ForbiddenException('Only this community’s head can book ad cards');
      }
    }
    return { community, admin, limit: admin ? ADMIN_LIMIT : LEADER_WEEKLY_LIMIT };
  }

  async create(slug: string, actor: { sub: string; role: string }, dto: CreateAdCardDto) {
    const { community, admin, limit } = await this.resolve(slug, actor);

    const scheduledFor = this.startOfDay(new Date(dto.scheduledFor));
    // Leaders must book before 12am of the run day (a future day). Admins may book
    // same-day (today) — they can fill a day after midnight if the leader didn't.
    const earliest = this.startOfDay(new Date());
    if (!admin) earliest.setDate(earliest.getDate() + 1);
    if (scheduledFor < earliest) {
      throw new BadRequestException(
        admin
          ? 'Choose today or a future day'
          : 'Book an ad before midnight of the run day — choose a future date',
      );
    }

    // One card per day per community — whoever books first (leader has priority by
    // booking earlier) takes the day; the other is then restricted from that day.
    const taken = await this.prisma.adCard.findFirst({
      where: { communityId: community.id, scheduledFor },
    });
    if (taken) {
      throw new BadRequestException('An ad card is already booked for that day');
    }

    // Weekly quota: this booker's cards scheduled within the next 7 days.
    const used = await this.prisma.adCard.count({
      where: {
        communityId: community.id,
        createdById: actor.sub,
        scheduledFor: { gte: this.startOfDay(new Date()), lt: this.weekEnd() },
      },
    });
    if (used >= limit) {
      throw new BadRequestException(`Weekly ad limit reached (${limit}).`);
    }

    const expiresAt = new Date(scheduledFor);
    expiresAt.setDate(expiresAt.getDate() + RUN_DAYS);

    return this.prisma.adCard.create({
      data: {
        communityId: community.id,
        createdById: actor.sub,
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        scheduledFor,
        expiresAt,
      },
      select: AD_SELECT,
    });
  }

  /** Ads currently running (scheduled day reached, not yet expired). */
  async listActive(slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    const now = new Date();
    return this.prisma.adCard.findMany({
      where: { communityId: community.id, scheduledFor: { lte: now }, expiresAt: { gte: now } },
      orderBy: { scheduledFor: 'desc' },
      select: AD_SELECT,
    });
  }

  /** The actor's ad-card quota for this community. */
  async myQuota(slug: string, actor: { sub: string; role: string }) {
    const { community, limit } = await this.resolve(slug, actor);
    const used = await this.prisma.adCard.count({
      where: {
        communityId: community.id,
        createdById: actor.sub,
        scheduledFor: { gte: this.startOfDay(new Date()), lt: this.weekEnd() },
      },
    });
    return { used, limit, remaining: Math.max(0, limit - used) };
  }

  async remove(id: string, actor: { sub: string; role: string }) {
    const ad = await this.prisma.adCard.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Ad not found');
    if (ad.createdById !== actor.sub && !isPlatformAdmin(actor.role)) {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: ad.communityId, userId: actor.sub } },
      });
      if (!roleHasCapability(member?.role, 'MODERATE')) {
        throw new ForbiddenException('Cannot remove this ad');
      }
    }
    await this.prisma.adCard.delete({ where: { id } });
    return { deleted: true };
  }
}
