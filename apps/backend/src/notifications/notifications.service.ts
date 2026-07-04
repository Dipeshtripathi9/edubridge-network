import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingGateway } from '../messaging/messaging.gateway';
import { buildPaginatedResult } from '../common/dto/pagination.dto';
import { isPlatformAdmin, roleHasCapability } from '../communities/community-permissions';
import { BroadcastDto, CommunityBroadcastDto, NotificationQueryDto } from './dto/notification.dto';

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagingGateway,
  ) {}

  /** Persist a notification and push it in real time. No-op for self-actions. */
  async create(input: CreateNotificationInput) {
    if (input.actorId && input.actorId === input.recipientId) return null;

    const notification = await this.prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
    });

    this.gateway.emitToUser(input.recipientId, 'notification:new', notification);
    return notification;
  }

  /** Fan out the same notification to many recipients (excludes the actor). */
  async createMany(recipientIds: string[], input: Omit<CreateNotificationInput, 'recipientId'>) {
    const targets = input.actorId ? recipientIds.filter((id) => id !== input.actorId) : recipientIds;
    if (targets.length === 0) return;

    await this.prisma.notification.createMany({
      data: targets.map((recipientId) => ({
        recipientId,
        actorId: input.actorId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data as Prisma.InputJsonValue,
      })),
    });
    // Nudge each recipient's bell to refetch (cheaper than emitting full rows).
    for (const recipientId of targets) {
      this.gateway.emitToUser(recipientId, 'notifications:refresh', {});
    }
  }

  async list(userId: string, query: NotificationQueryDto) {
    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
      ...(query.unread ? { isRead: false } : {}),
    };
    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
    });
    return buildPaginatedResult(items, query);
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, recipientId: userId },
      data: { isRead: true },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return { ok: true };
  }

  async remove(id: string, userId: string) {
    await this.prisma.notification.deleteMany({ where: { id, recipientId: userId } });
    return { deleted: true };
  }

  /**
   * Admin broadcast (e.g. a new scholarship). Batched; at large scale this
   * would run as a BullMQ job rather than inline.
   */
  /**
   * The Campus Lead (or platform admin) broadcasts to their own community's
   * members. Pushing a notification to every member is an announcement, so it
   * requires ANNOUNCE — not the dashboard-VIEW capability that Opportunity /
   * Student-Relations heads and moderators also hold.
   */
  async broadcastToCommunity(
    communityId: string,
    actor: { sub: string; role: string },
    dto: CommunityBroadcastDto,
  ) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');
    if (!isPlatformAdmin(actor.role)) {
      const member = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId: actor.sub } },
      });
      if (!roleHasCapability(member?.role, 'ANNOUNCE')) {
        throw new ForbiddenException('Only this community’s Campus Lead can broadcast to it');
      }
    }
    return this.broadcast({
      type: 'SYSTEM',
      title: `${community.name}: ${dto.title}`,
      body: dto.body,
      link: dto.link ?? `/communities/${community.slug}`,
      communityId,
    });
  }

  async broadcast(dto: BroadcastDto) {
    let ids: string[];
    if (dto.communityId) {
      // Members of a single community.
      const members = await this.prisma.communityMember.findMany({
        where: { communityId: dto.communityId, user: { status: 'ACTIVE' } },
        select: { userId: true },
      });
      ids = members.map((m) => m.userId);
    } else {
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      ids = users.map((u) => u.id);
    }
    const BATCH = 1000;
    for (let i = 0; i < ids.length; i += BATCH) {
      const slice = ids.slice(i, i + BATCH);
      await this.prisma.notification.createMany({
        data: slice.map((recipientId) => ({
          recipientId,
          type: dto.type,
          title: dto.title,
          body: dto.body,
          data: dto.link ? { link: dto.link } : undefined,
        })),
      });
    }
    // Global nudge — clients refetch unread count.
    this.gateway.server?.emit('notifications:refresh', {});
    this.logger.log(`Broadcast "${dto.title}" to ${ids.length} users`);
    return { sent: ids.length };
  }
}
