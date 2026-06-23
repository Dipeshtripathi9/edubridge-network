import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Pools — private capped group chats (e2e)', () => {
  let app: INestApplication;
  let creator: TestUser;
  let member2: TestUser;
  let member3: TestUser;
  let slug: string;
  let poolId: string;
  let chatId: string;

  beforeAll(async () => {
    app = await createTestApp();
    creator = await registerVerifiedUser(app, { fullName: 'Creator' });
    member2 = await registerVerifiedUser(app, { fullName: 'Member Two' });
    member3 = await registerVerifiedUser(app, { fullName: 'Member Three' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(creator.token))
      .send({ name: `Pools Topic ${Date.now()}`, type: 'TOPIC', topic: 'Pools' })
      .expect(201);
    slug = c.body.data.slug;
    for (const u of [member2, member3]) {
      await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(u.token));
    }
  });
  afterAll(async () => {
    await app?.close();
  });

  it('creates a capped pool with a backing private chat', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Project Squad', maxMembers: 2 })
      .expect(201);
    poolId = res.body.data.id;
    chatId = res.body.data.chatId;
    expect(res.body.data.isMember).toBe(true);
    expect(chatId).toBeTruthy();
  });

  it('keeps the pool chat private to pool members', async () => {
    // creator is a participant
    await request(app.getHttpServer())
      .get(`${API}/chats/${chatId}/messages`)
      .set(auth(creator.token))
      .expect(200);
    // member2 is in the community but NOT the pool → no chat access
    await request(app.getHttpServer())
      .get(`${API}/chats/${chatId}/messages`)
      .set(auth(member2.token))
      .expect(403);
  });

  it('lets a second member join and chat', async () => {
    await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/join`)
      .set(auth(member2.token))
      .expect(201);
    await request(app.getHttpServer())
      .get(`${API}/chats/${chatId}/messages`)
      .set(auth(member2.token))
      .expect(200);
    await request(app.getHttpServer())
      .post(`${API}/chats/${chatId}/messages`)
      .set(auth(member2.token))
      .send({ body: 'hey team' })
      .expect(201);
  });

  it('enforces the member cap', async () => {
    await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/join`)
      .set(auth(member3.token))
      .expect(400);
    // and member3 still cannot read the private chat
    await request(app.getHttpServer())
      .get(`${API}/chats/${chatId}/messages`)
      .set(auth(member3.token))
      .expect(403);
  });

  it('surfaces my pools in my network with community info', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/pools/me`)
      .set(auth(creator.token))
      .expect(200);
    const mine = res.body.data.find((p: { id: string }) => p.id === poolId);
    expect(mine).toBeTruthy();
    expect(mine.community.slug).toBe(slug);
    expect(mine.isMember).toBe(true);
  });

  it('lists pools with capacity + membership flags', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .expect(200);
    const pool = res.body.data.find((p: { id: string }) => p.id === poolId);
    expect(pool.memberCount).toBe(2);
    expect(pool.isFull).toBe(true);
    expect(pool.isMember).toBe(true);
  });

  it('lets a member like and share a pool', async () => {
    const liked = await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/like`)
      .set(auth(creator.token))
      .expect(201);
    expect(liked.body.data.liked).toBe(true);

    const shared = await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/share`)
      .set(auth(creator.token))
      .expect(201);
    expect(shared.body.data.shareCount).toBeGreaterThanOrEqual(1);

    const detail = await request(app.getHttpServer())
      .get(`${API}/pools/${poolId}`)
      .set(auth(creator.token))
      .expect(200);
    expect(detail.body.data.likeCount).toBe(1);
    expect(detail.body.data.likedByMe).toBe(true);

    // un-like
    const unliked = await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/like`)
      .set(auth(creator.token))
      .expect(201);
    expect(unliked.body.data.liked).toBe(false);
  });

  it('lets a member leave, freeing a slot', async () => {
    await request(app.getHttpServer())
      .delete(`${API}/pools/${poolId}/leave`)
      .set(auth(member2.token))
      .expect(200);
    // now there is room for member3
    await request(app.getHttpServer())
      .post(`${API}/pools/${poolId}/join`)
      .set(auth(member3.token))
      .expect(201);
  });
});
