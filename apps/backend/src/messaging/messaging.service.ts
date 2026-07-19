import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { buildPaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/messaging.dto';

const SENDER_SELECT = {
  select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } },
};

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ---------------- Presence (Redis ref-counted) ----------------
  async addPresence(userId: string): Promise<number> {
    return this.redis.client.incr(`presence:${userId}`);
  }

  async removePresence(userId: string): Promise<number> {
    const n = await this.redis.client.decr(`presence:${userId}`);
    if (n <= 0) await this.redis.client.del(`presence:${userId}`);
    return Math.max(0, n);
  }

  async isOnline(userId: string): Promise<boolean> {
    const v = await this.redis.client.get(`presence:${userId}`);
    return !!v && parseInt(v, 10) > 0;
  }

  /** Account still allowed to use realtime (mirrors the HTTP JwtStrategy check). */
  async isActiveUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, deletedAt: true },
    });
    return !!user && user.status !== 'BANNED' && user.status !== 'SUSPENDED' && !user.deletedAt;
  }

  /** Distinct users who share at least one chat with this user (their "contacts"). */
  async contactIds(userId: string): Promise<string[]> {
    const mine = await this.prisma.chatParticipant.findMany({
      where: { userId },
      select: { chatId: true },
    });
    const chatIds = mine.map((c) => c.chatId);
    if (!chatIds.length) return [];
    const others = await this.prisma.chatParticipant.findMany({
      where: { chatId: { in: chatIds }, userId: { not: userId } },
      select: { userId: true },
      distinct: ['userId'],
    });
    return others.map((o) => o.userId);
  }

  // ---------------- Chats ----------------
  async getOrCreateDirectChat(userId: string, otherUserId: string) {
    if (userId === otherUserId) throw new ForbiddenException('Cannot chat with yourself');
    const other = await this.prisma.user.findUnique({ where: { id: otherUserId } });
    if (!other) throw new NotFoundException('User not found');

    // Find an existing DIRECT chat containing exactly these two participants.
    const existing = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: { participants: true },
    });
    if (existing) return existing;

    return this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        participants: { create: [{ userId }, { userId: otherUserId }] },
      },
      include: { participants: true },
    });
  }

  async listMyChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participants: { include: { user: SENDER_SELECT } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return Promise.all(
      chats.map(async (chat) => {
        const me = chat.participants.find((p) => p.userId === userId);
        const unread = await this.prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            deletedAt: null,
            ...(me?.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
          },
        });
        // Legacy (pre-teardown) COMMUNITY-type chats may have >2 participants;
        // only resolve a 1:1 "other" for DIRECT chats.
        const other =
          chat.type === 'DIRECT'
            ? chat.participants.find((p) => p.userId !== userId)?.user ?? null
            : null;
        const otherOnline = other ? await this.isOnline(other.id) : false;

        return {
          id: chat.id,
          type: chat.type,
          title: chat.title ?? other?.profile?.fullName ?? 'Group chat',
          other,
          otherOnline,
          lastMessage: chat.messages[0] ?? null,
          lastMessageAt: chat.lastMessageAt,
          unread,
        };
      }),
    );
  }

  async assertParticipant(chatId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } },
    });
    if (!participant) throw new ForbiddenException('Not a participant of this chat');
    return participant;
  }

  async getMessages(chatId: string, userId: string, query: PaginationDto) {
    await this.assertParticipant(chatId, userId);
    const messages = await this.prisma.message.findMany({
      where: { chatId, deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : { skip: query.skip }),
      include: { sender: SENDER_SELECT },
    });
    return buildPaginatedResult(messages, query);
  }

  async sendMessage(chatId: string, senderId: string, dto: SendMessageDto) {
    await this.assertParticipant(chatId, senderId);
    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          chatId,
          senderId,
          body: dto.body,
          attachments: dto.attachments ?? [],
          status: 'SENT',
        },
        include: { sender: SENDER_SELECT },
      }),
      this.prisma.chat.update({ where: { id: chatId }, data: { lastMessageAt: new Date() } }),
    ]);
    return message;
  }

  async markRead(chatId: string, userId: string) {
    await this.assertParticipant(chatId, userId);
    await this.prisma.chatParticipant.update({
      where: { chatId_userId: { chatId, userId } },
      data: { lastReadAt: new Date() },
    });
    return { chatId, readAt: new Date() };
  }

  /** Recipient user ids for a chat (everyone except the sender). */
  async recipientIds(chatId: string, exceptUserId: string): Promise<string[]> {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { chatId, userId: { not: exceptUserId } },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }
}
