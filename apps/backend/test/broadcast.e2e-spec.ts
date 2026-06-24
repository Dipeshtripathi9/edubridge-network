import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Targeted broadcast (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let member: TestUser;
  let outsider: TestUser;
  let slug: string;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Cast ${Date.now()}`, type: 'TOPIC', topic: 'Cast' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('broadcasts only to the chosen community members', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/notifications/broadcast`)
      .set(auth(admin.token))
      .send({ type: 'SYSTEM', title: 'Community-only notice', communityId })
      .expect(201);
    expect(res.body.data.sent).toBeGreaterThanOrEqual(1);

    const memberNotifs = await request(app.getHttpServer())
      .get(`${API}/notifications`)
      .set(auth(member.token))
      .expect(200);
    expect(memberNotifs.body.data.some((n: { title: string }) => n.title === 'Community-only notice')).toBe(true);

    const outsiderNotifs = await request(app.getHttpServer())
      .get(`${API}/notifications`)
      .set(auth(outsider.token))
      .expect(200);
    expect(outsiderNotifs.body.data.some((n: { title: string }) => n.title === 'Community-only notice')).toBe(false);
  });

  it('a non-admin cannot broadcast', async () => {
    await request(app.getHttpServer())
      .post(`${API}/notifications/broadcast`)
      .set(auth(member.token))
      .send({ type: 'SYSTEM', title: 'nope' })
      .expect(403);
  });
});
