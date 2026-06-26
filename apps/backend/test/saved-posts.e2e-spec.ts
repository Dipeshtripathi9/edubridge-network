import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Saved (bookmarked) posts (e2e)', () => {
  let app: INestApplication;
  let user: TestUser;
  let slug: string;
  let postId: string;

  beforeAll(async () => {
    app = await createTestApp();
    user = await registerVerifiedUser(app, { fullName: 'Saver' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(user.token))
      .send({ name: `Saved ${Date.now()}`, type: 'TOPIC', topic: 'Saved' })
      .expect(201);
    slug = c.body.data.slug;
    const p = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(user.token))
      .send({ body: 'bookmark me' })
      .expect(201);
    postId = p.body.data.id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lists a post after bookmarking and drops it after un-bookmarking', async () => {
    await request(app.getHttpServer()).post(`${API}/posts/${postId}/bookmark`).set(auth(user.token)).expect(201);

    const saved = await request(app.getHttpServer())
      .get(`${API}/posts/bookmarks/me`)
      .set(auth(user.token))
      .expect(200);
    const row = saved.body.data.find((p: { id: string }) => p.id === postId);
    expect(row).toBeTruthy();
    expect(row.community.slug).toBe(slug);

    // un-bookmark
    await request(app.getHttpServer()).post(`${API}/posts/${postId}/bookmark`).set(auth(user.token)).expect(201);
    const after = await request(app.getHttpServer())
      .get(`${API}/posts/bookmarks/me`)
      .set(auth(user.token));
    expect(after.body.data.some((p: { id: string }) => p.id === postId)).toBe(false);
  });
});
