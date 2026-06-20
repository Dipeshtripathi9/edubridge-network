import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Communities (e2e)', () => {
  let app: INestApplication;
  let alice: TestUser;
  let bob: TestUser;
  let slug: string;
  let postId: string;

  beforeAll(async () => {
    app = await createTestApp();
    alice = await registerVerifiedUser(app, { fullName: 'Alice' });
    bob = await registerVerifiedUser(app, { fullName: 'Bob' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('creates a topic community (creator auto-joins as admin)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(alice.token))
      .send({ name: `Test Topic ${Date.now()}`, type: 'TOPIC', topic: 'Testing' })
      .expect(201);
    slug = res.body.data.slug;
    expect(res.body.data.memberCount).toBe(1);
  });

  it('rejects an invalid community type (validation 400)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(alice.token))
      .send({ name: 'Bad', type: 'NOPE' })
      .expect(400);
  });

  it('lists communities publicly and fetches by slug', async () => {
    await request(app.getHttpServer()).get(`${API}/communities?limit=5`).expect(200);
    const res = await request(app.getHttpServer()).get(`${API}/communities/${slug}`).expect(200);
    expect(res.body.data.slug).toBe(slug);
  });

  it('lets another user join (memberCount increments)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/join`)
      .set(auth(bob.token))
      .expect(201);
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}`)
      .set(auth(bob.token))
      .expect(200);
    expect(res.body.data.memberCount).toBe(2);
    expect(res.body.data.isMember).toBe(true);
  });

  it('creates a post and returns it in the feed', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(alice.token))
      .send({ body: 'Hello #world from the e2e suite', hashtags: ['world'] })
      .expect(201);
    postId = res.body.data.id;

    const feed = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/posts`)
      .expect(200);
    expect(feed.body.data.some((p: { id: string }) => p.id === postId)).toBe(true);
  });

  it('likes a post (count increments, idempotent toggle)', async () => {
    const like = await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/like`)
      .set(auth(bob.token))
      .expect(201);
    expect(like.body.data.liked).toBe(true);

    const post = await request(app.getHttpServer())
      .get(`${API}/posts/${postId}`)
      .set(auth(bob.token))
      .expect(200);
    expect(post.body.data.likeCount).toBe(1);
    expect(post.body.data.likedByMe).toBe(true);

    // Toggle off
    const unlike = await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/like`)
      .set(auth(bob.token))
      .expect(201);
    expect(unlike.body.data.liked).toBe(false);
  });

  it('adds a comment (commentCount increments)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/posts/${postId}/comments`)
      .set(auth(bob.token))
      .send({ body: 'Great post!' })
      .expect(201);
    const post = await request(app.getHttpServer()).get(`${API}/posts/${postId}`).expect(200);
    expect(post.body.data.commentCount).toBe(1);
  });

  it('awards reputation for creating content', async () => {
    // Alice created a community + a post (+5); reputation should be > 0.
    const rep = await request(app.getHttpServer())
      .get(`${API}/reputation/me`)
      .set(auth(alice.token))
      .expect(200);
    expect(rep.body.data.points).toBeGreaterThanOrEqual(5);
  });

  it('blocks deleting another user post (403)', async () => {
    await request(app.getHttpServer())
      .delete(`${API}/posts/${postId}`)
      .set(auth(bob.token))
      .expect(403);
  });
});
