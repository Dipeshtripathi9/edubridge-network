import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { API, auth, createTestApp, listen, registerVerifiedUser, TestUser } from './helpers';

/** Resolve on the next matching event, or null after `ms`. */
function waitFor<T = unknown>(
  socket: Socket,
  event: string,
  predicate: (p: T) => boolean = () => true,
  ms = 5000,
): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      resolve(null);
    }, ms);
    const handler = (payload: T) => {
      if (predicate(payload)) {
        clearTimeout(timer);
        socket.off(event, handler);
        resolve(payload);
      }
    };
    socket.on(event, handler);
  });
}

describe('Messaging / Socket.IO (e2e)', () => {
  let app: INestApplication;
  let port: number;
  let alice: TestUser;
  let bob: TestUser;
  let chatId: string;
  let sa: Socket; // alice
  let sb: Socket; // bob

  const connect = (token: string) =>
    io(`http://127.0.0.1:${port}/ws`, { auth: { token }, transports: ['websocket'], forceNew: true });

  beforeAll(async () => {
    app = await createTestApp();
    port = await listen(app);
    alice = await registerVerifiedUser(app, { fullName: 'Alice' });
    bob = await registerVerifiedUser(app, { fullName: 'Bob' });

    const res = await request(app.getHttpServer())
      .post(`${API}/chats/direct`)
      .set(auth(alice.token))
      .send({ userId: bob.userId })
      .expect(201);
    chatId = res.body.data.id;

    // Connect alice first so she can observe bob's presence.
    sa = connect(alice.token);
    await waitFor(sa, 'connect');
    await sa.emitWithAck('chat:join', { chatId });
  }, 30000);

  afterAll(async () => {
    sa?.disconnect();
    sb?.disconnect();
    await app?.close();
  });

  it('authenticates the socket handshake (valid JWT connects)', () => {
    expect(sa.connected).toBe(true);
  });

  it('emits presence when bob comes online', async () => {
    const presenceP = waitFor<{ userId: string; online: boolean }>(
      sa,
      'presence:update',
      (p) => p.userId === bob.userId && p.online === true,
    );
    sb = connect(bob.token);
    await waitFor(sb, 'connect');
    await sb.emitWithAck('chat:join', { chatId });

    const presence = await presenceP;
    expect(presence).not.toBeNull();
    expect(presence?.online).toBe(true);
  });

  it('delivers a sent message to the other participant in real time', async () => {
    const body = `hello-${Date.now()}`;
    const msgP = waitFor<{ chatId: string; body: string }>(
      sb,
      'message:new',
      (m) => m.chatId === chatId,
    );
    sa.emit('message:send', { chatId, body });
    const msg = await msgP;
    expect(msg).not.toBeNull();
    expect(msg?.body).toBe(body);
  });

  it('pushes a transient MESSAGE notification to the recipient', async () => {
    const notifP = waitFor<{ type: string }>(sb, 'notification:new', (n) => n.type === 'MESSAGE');
    sa.emit('message:send', { chatId, body: 'notify me' });
    const notif = await notifP;
    expect(notif).not.toBeNull();
  });

  it('relays typing indicators', async () => {
    const typingP = waitFor<{ chatId: string; userId: string; isTyping: boolean }>(
      sa,
      'typing',
      (t) => t.userId === bob.userId && t.isTyping === true,
    );
    sb.emit('typing', { chatId, isTyping: true });
    const typing = await typingP;
    expect(typing).not.toBeNull();
  });

  it('exposes the chat with unread count over REST before it is read', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/chats`)
      .set(auth(bob.token))
      .expect(200);
    const chat = res.body.data.find((c: { id: string }) => c.id === chatId);
    expect(chat).toBeDefined();
    expect(chat.unread).toBeGreaterThanOrEqual(1);
    expect(chat.lastMessage).toBeTruthy();
  });

  it('relays read receipts', async () => {
    const readP = waitFor<{ chatId: string; userId: string }>(
      sa,
      'message:read',
      (r) => r.chatId === chatId && r.userId === bob.userId,
    );
    sb.emit('message:read', { chatId });
    const read = await readP;
    expect(read).not.toBeNull();
  });

  it('rejects a socket with an invalid token', async () => {
    // The gateway authenticates in handleConnection and disconnects bad tokens,
    // so the client observes a server-initiated disconnect (or connect_error).
    const bad = connect('not-a-real-token');
    const kicked = await Promise.race([
      waitFor(bad, 'disconnect', () => true, 6000),
      waitFor(bad, 'connect_error', () => true, 6000),
    ]);
    expect(kicked).not.toBeNull();
    expect(bad.connected).toBe(false);
    bad.disconnect();
  });

  it('emits offline presence when bob disconnects', async () => {
    const offlineP = waitFor<{ userId: string; online: boolean }>(
      sa,
      'presence:update',
      (p) => p.userId === bob.userId && p.online === false,
    );
    sb.disconnect();
    const offline = await offlineP;
    expect(offline).not.toBeNull();
  });
});
