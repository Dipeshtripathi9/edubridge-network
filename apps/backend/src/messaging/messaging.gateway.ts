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
      client.data.userId = userId;
      client.join(this.userRoom(userId));

      const count = await this.messaging.addPresence(userId);
      if (count === 1) {
        // First connection — announce online.
        this.server.emit('presence:update', { userId, online: true });
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
      this.server.emit('presence:update', { userId, online: false });
    }
  }

  @SubscribeMessage('chat:join')
  async onJoin(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    const userId = client.data.userId!;
    await this.messaging.assertParticipant(data.chatId, userId);
    client.join(this.chatRoom(data.chatId));
    return { ok: true };
  }

  @SubscribeMessage('chat:leave')
  onLeave(@ConnectedSocket() client: AuthedSocket, @MessageBody() data: { chatId: string }) {
    client.leave(this.chatRoom(data.chatId));
    return { ok: true };
  }

  @SubscribeMessage('message:send')
  async onMessage(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { chatId: string; body: string; attachments?: string[] },
  ) {
    const userId = client.data.userId!;
    const message = await this.messaging.sendMessage(data.chatId, userId, {
      body: data.body,
      attachments: data.attachments,
    });
    this.broadcastMessage(data.chatId, message, userId);
    return message;
  }

  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId!;
    client.to(this.chatRoom(data.chatId)).emit('typing', {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    const userId = client.data.userId!;
    await this.messaging.markRead(data.chatId, userId);
    client.to(this.chatRoom(data.chatId)).emit('message:read', { chatId: data.chatId, userId });
    return { ok: true };
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
