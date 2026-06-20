import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Notification fan-out (e2e)', () => {
  let app: INestApplication;
  let alice: TestUser; // author
  let bob: TestUser; // actor
  let carol: TestUser; // mentioned
  let slug: string;
  let postId: string;

  const notifications = (u: TestUser) =>
    request(app.getHttpServer()).get(`${API}/notifications`).set(auth(u.token)).expect(200);
  const unread = async (u: TestUser) =>
    (await request(app.getHttpServer()).get(`${API}/notifications/unread-count`).set(auth(u.token)))
      .body.data.count as number;

  beforeAll(async () => {
    app = await createTestApp();
    alice = await registerVerifiedUser(app, { fullName: 'Alice' });
    bob = await registerVerifiedUser(app, { fullName: 'Bob' });
    carol = await registerVerifiedUser(app, { fullName: 'Carol' });

    const community = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(alice.token))
      .send({ name: `Notif Topic ${Date.now()}`, type: 'TOPIC', topic: 'Notif' })
      .expect(201);
    slug = community.body.data.slug;

    const post = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(alice.token))
      .send({ body: 'Notify test post' })
      .expect(201);
    postId = post.body.data.id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('creates a LIKE notification for the post author', async () => {
    const before = await unread(alice);
    await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/like`)
      .set(auth(bob.token))
      .expect(201);
    expect(await unread(alice)).toBe(before + 1);

    const list = await notifications(alice);
    const likeNotif = list.body.data.find((n: { type: string }) => n.type === 'LIKE');
    expect(likeNotif).toBeDefined();
    expect(likeNotif.title).toContain('Bob');
  });

  it('does NOT notify on a self-action', async () => {
    const before = await unread(alice);
    // Alice likes (then unlikes) her own post — no self-notification.
    await request(app.getHttpServer()).post(`${API}/posts/${postId}/like`).set(auth(alice.token));
    await request(app.getHttpServer()).post(`${API}/posts/${postId}/like`).set(auth(alice.token));
    expect(await unread(alice)).toBe(before);
  });

  it('creates a COMMENT notification for the post author', async () => {
    const before = await unread(alice);
    await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/comments`)
      .set(auth(bob.token))
      .send({ body: 'Nice one!' })
      .expect(201);
    expect(await unread(alice)).toBe(before + 1);
  });

  it('creates a MENTION notification for a mentioned user', async () => {
    const before = await unread(carol);
    await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/comments`)
      .set(auth(bob.token))
      .send({ body: 'cc you', mentions: [carol.userId] })
      .expect(201);
    expect(await unread(carol)).toBe(before + 1);
    const list = await notifications(carol);
    expect(list.body.data.some((n: { type: string }) => n.type === 'MENTION')).toBe(true);
  });

  it('marks a single notification read', async () => {
    const list = await notifications(alice);
    const target = list.body.data.find((n: { isRead: boolean }) => !n.isRead);
    const before = await unread(alice);
    await request(app.getHttpServer())
      .post(`${API}/notifications/${target.id}/read`)
      .set(auth(alice.token))
      .expect(201);
    expect(await unread(alice)).toBe(before - 1);
  });

  it('marks all notifications read', async () => {
    await request(app.getHttpServer())
      .post(`${API}/notifications/read-all`)
      .set(auth(alice.token))
      .expect(201);
    expect(await unread(alice)).toBe(0);
  });
});
