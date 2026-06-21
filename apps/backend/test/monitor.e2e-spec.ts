import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community head monitoring (e2e)', () => {
  let app: INestApplication;
  let head: TestUser; // community ADMIN (creator)
  let member: TestUser;
  let reporter: TestUser;
  let outsider: TestUser;
  let slug: string;
  let postId: string;

  beforeAll(async () => {
    app = await createTestApp();
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    reporter = await registerVerifiedUser(app, { fullName: 'Reporter' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(head.token))
      .send({ name: `Monitor Topic ${Date.now()}`, type: 'TOPIC', topic: 'Monitor' })
      .expect(201);
    slug = c.body.data.slug;

    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
    const p = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(member.token))
      .send({ body: 'monitor me' })
      .expect(201);
    postId = p.body.data.id;

    // Reporter flags the post → report should be scoped to this community.
    await request(app.getHttpServer())
      .post(`${API}/reports`)
      .set(auth(reporter.token))
      .send({ targetType: 'POST', targetId: postId, reason: 'Spam' })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('shows community activity to the head', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/activity`)
      .set(auth(head.token))
      .expect(200);
    expect(res.body.data.some((p: { id: string }) => p.id === postId)).toBe(true);
  });

  it('shows the scoped report to the head, hides it from non-mods', async () => {
    await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reports`)
      .set(auth(outsider.token))
      .expect(403);

    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reports`)
      .set(auth(head.token))
      .expect(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].reason).toBe('Spam');
  });

  it('lets the head resolve a report', async () => {
    const list = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reports`)
      .set(auth(head.token));
    const reportId = list.body.data[0].id;

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/reports/${reportId}/resolve`)
      .set(auth(head.token))
      .send({ status: 'RESOLVED' })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reports`)
      .set(auth(head.token));
    expect(after.body.data.some((r: { id: string }) => r.id === reportId)).toBe(false);
  });

  it('returns per-community analytics', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/analytics`)
      .set(auth(head.token))
      .expect(200);
    expect(res.body.data.members).toBeGreaterThanOrEqual(2);
    expect(res.body.data.posts).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.topContributors)).toBe(true);
  });
});
