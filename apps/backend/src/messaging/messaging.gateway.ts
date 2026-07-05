import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';

/** A validated chat-id from an untrusted socket payload, or null if malformed. */
function chatIdOf(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const id = (data as { chatId?: unknown }).chatId;
  return typeof id === 'string' && id.length > 0 && id.length <= 64 ? id : null;
}

interface AuthedSocket extends Socket {
  data: { userId?: string };
}

@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','), credentials: true },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly messaging: MessagingService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
  private chatRoom(chatId: string) {
    return `chat:${chatId}`;
  }

  async handleConnection(client: AuthedSocket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string) ||
        '';
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
      const userId = payload.sub as string;
      // Set identity synchronously (before any await) so message handlers that
      // race the rest of connection setup always see a userId.
      client.data.userId = userId;
      client.join(this.userRoom(userId));
      // Mirror the HTTP JwtStrategy: a banned/suspended/deleted account with a
      // still-valid token must not get a live socket.
      if (!(await this.messaging.isActiveUser(userId))) {
        this.logger.warn('Rejected socket for inactive account');
        client.disconnect(true);
        return;
      }

      const count = await this.messaging.addPresence(userId);
      if (count === 1) {
        // First connection — announce online only to this user's contacts, not
        // to every connected client.
        await this.emitPresence(userId, true);
      }
    } catch {
      this.logger.warn('Rejected unauthenticated socket connection');
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthedSocket) {
    const userId = client.data.userId;
    if (!userId) return;
    const remaining = await this.messaging.removePresence(userId);
    if (remaining === 0) {
      await this.emitPresence(userId, false);
    }
  }

  /** Presence is only visible to users who share a chat with this user. */
  private async emitPresence(userId: string, online: boolean) {
    const contacts = await this.messaging.contactIds(userId);
    for (const contactId of contacts) {
      this.server.to(this.userRoom(contactId)).emit('presence:update', { userId, online });
    }
  }

  @SubscribeMessage('chat:join')
  async onJoin(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: unknown) {
    const chatId = chatIdOf(data);
    if (!chatId) return { ok: false, error: 'Invalid payload' };
    const userId = client.data.userId!;
    try {
      await this.messaging.assertParticipant(chatId, userId);
      client.join(this.chatRoom(chatId));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Cannot join this chat' };
    }
  }

  @SubscribeMessage('chat:leave')
  onLeave(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: unknown) {
    const chatId = chatIdOf(data);
    if (!chatId) return { ok: false, error: 'Invalid payload' };
    client.leave(this.chatRoom(chatId));
    return { ok: true };
  }

  @SubscribeMessage('message:send')
  async onMessage(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: unknown) {
    const chatId = chatIdOf(data);
    const body = (data as { body?: unknown })?.body;
    const attachments = (data as { attachments?: unknown })?.attachments;
    // Validate the untrusted payload before doing any work.
    if (!chatId || typeof body !== 'string' || !body.trim() || body.length > 5000) {
      return { ok: false, error: 'Invalid message' };
    }
    const userId = client.data.userId!;
    try {
      const message = await this.messaging.sendMessage(chatId, userId, {
        body,
        attachments: Array.isArray(attachments) ? (attachments as string[]) : undefined,
      });
      this.broadcastMessage(chatId, message, userId);
      return message;
    } catch {
      return { ok: false, error: 'Message could not be sent' };
    }
  }

  @SubscribeMessage('typing')
  async onTyping(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: unknown) {
    const chatId = chatIdOf(data);
    if (!chatId) return;
    const isTyping = !!(data as { isTyping?: unknown }).isTyping;
    const userId = client.data.userId!;
    // Only relay typing to a chat the user actually belongs to.
    try {
      await this.messaging.assertParticipant(chatId, userId);
    } catch {
      return;
    }
    client.to(this.chatRoom(chatId)).emit('typing', { chatId, userId, isTyping });
  }

  @SubscribeMessage('message:read')
  async onRead(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: unknown) {
    const chatId = chatIdOf(data);
    if (!chatId) return { ok: false, error: 'Invalid payload' };
    const userId = client.data.userId!;
    try {
      await this.messaging.markRead(chatId, userId);
      client.to(this.chatRoom(chatId)).emit('message:read', { chatId, userId });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Cannot mark read' };
    }
  }

  /** Emit an event to a single user's personal room (used by Notifications too). */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(this.userRoom(userId)).emit(event, payload);
  }

  /**
   * Broadcast a new message to the chat room and notify recipients in their
   * personal rooms (drives chat-list updates + transient message notifications).
   */
  async broadcastMessage(
    chatId: string,
    message: { body: string; sender?: { profile?: { fullName?: string } | null } },
    senderId: string,
  ) {
    this.server.to(this.chatRoom(chatId)).emit('message:new', message);
    const recipients = await this.messaging.recipientIds(chatId, senderId);
    const senderName = message.sender?.profile?.fullName ?? 'Someone';
    for (const userId of recipients) {
      this.emitToUser(userId, 'chat:updated', { chatId, message });
      // Transient (non-persisted) message notification — chat unread counts are
      // the source of truth, so we only nudge the bell in real time.
      this.emitToUser(userId, 'notification:new', {
        id: `msg-${chatId}-${Date.now()}`,
        type: 'MESSAGE',
        title: `New message from ${senderName}`,
        body: message.body.slice(0, 120),
        isRead: false,
        transient: true,
        data: { chatId },
        createdAt: new Date().toISOString(),
      });
    }
  }
}
