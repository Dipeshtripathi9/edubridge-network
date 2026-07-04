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

  it('ranks open pools above completely-full ones', async () => {
    // A brand-new open pool (1/5) and a full pool (2/2).
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Open Study Group', maxMembers: 5 })
      .expect(201);
    const fullPool = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Full Capped Pool', maxMembers: 2 })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/pools/${fullPool.body.data.id}/join`)
      .set(auth(member2.token))
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .expect(200);
    const pools: { title: string; isFull: boolean }[] = list.body.data;
    const lastFullIdx = pools.map((p) => p.isFull).lastIndexOf(true);
    const firstOpenAfterFull = pools.findIndex((p, i) => i > lastFullIdx && !p.isFull);
    // every full pool sits at the tail — no open pool appears after a full one
    expect(firstOpenAfterFull).toBe(-1);
    expect(pools.some((p) => p.title === 'Full Capped Pool' && p.isFull)).toBe(true);
  });

  it('ranks a more popular open pool above a low-interest one', async () => {
    const low = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Quiet Pool', maxMembers: 10 })
      .expect(201);
    const popular = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Popular Pool', maxMembers: 10 })
      .expect(201);
    // give the popular pool real interest: more members + a like
    await request(app.getHttpServer())
      .post(`${API}/pools/${popular.body.data.id}/join`)
      .set(auth(member2.token))
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/pools/${popular.body.data.id}/join`)
      .set(auth(member3.token))
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/pools/${popular.body.data.id}/like`)
      .set(auth(member2.token))
      .expect(201);

    const list = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .expect(200);
    const ids: string[] = list.body.data.map((p: { id: string }) => p.id);
    expect(ids.indexOf(popular.body.data.id)).toBeLessThan(ids.indexOf(low.body.data.id));
  });

  it('suggests similar existing pools by title/topic', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'DSA Interview Prep', maxMembers: 6 })
      .expect(201);

    const hit = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/pools/similar?q=${encodeURIComponent('dsa prep')}`)
      .set(auth(member2.token))
      .expect(200);
    expect(hit.body.data.some((p: { title: string }) => p.title === 'DSA Interview Prep')).toBe(true);

    const miss = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/pools/similar?q=${encodeURIComponent('zzqq')}`)
      .set(auth(member2.token))
      .expect(200);
    expect(miss.body.data.length).toBe(0);
  });

  it('lets a platform admin delete any pool; blocks a non-creator non-admin', async () => {
    const admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Platform Admin' });
    const created = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/pools`)
      .set(auth(creator.token))
      .send({ title: 'Deletable Pool', maxMembers: 5 })
      .expect(201);
    const id = created.body.data.id;

    // a non-creator, non-admin member cannot delete
    await request(app.getHttpServer())
      .delete(`${API}/pools/${id}`)
      .set(auth(member2.token))
      .expect(403);

    // the platform admin can delete any pool
    await request(app.getHttpServer())
      .delete(`${API}/pools/${id}`)
      .set(auth(admin.token))
      .expect(200);

    // it's gone
    await request(app.getHttpServer())
      .get(`${API}/pools/${id}`)
      .set(auth(creator.token))
      .expect(404);
  });
});
