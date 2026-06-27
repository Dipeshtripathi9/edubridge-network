import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community-manager broadcast (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let manager: TestUser;
  let member: TestUser;
  let outsider: TestUser;
  let slug: string;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    manager = await registerVerifiedUser(app, { fullName: 'Manager' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Bcast ${Date.now()}`, type: 'TOPIC', topic: 'Bcast' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;

    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(manager.token));
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: manager.email, role: 'CAMPUS_LEAD' })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a community manager broadcast to that community’s members', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/notifications/community/${communityId}/broadcast`)
      .set(auth(manager.token))
      .send({ title: 'Meetup Friday' })
      .expect(201);
    expect(res.body.data.sent).toBeGreaterThanOrEqual(2);

    const memberNotifs = await request(app.getHttpServer())
      .get(`${API}/notifications`)
      .set(auth(member.token))
      .expect(200);
    expect(memberNotifs.body.data.some((n: { title: string }) => n.title.includes('Meetup Friday'))).toBe(true);

    // an outsider (not a member) gets nothing
    const outNotifs = await request(app.getHttpServer())
      .get(`${API}/notifications`)
      .set(auth(outsider.token))
      .expect(200);
    expect(outNotifs.body.data.some((n: { title: string }) => n.title.includes('Meetup Friday'))).toBe(false);
  });

  it('forbids a plain member from broadcasting', async () => {
    await request(app.getHttpServer())
      .post(`${API}/notifications/community/${communityId}/broadcast`)
      .set(auth(member.token))
      .send({ title: 'spam' })
      .expect(403);
  });

  it('forbids a manager of one community from broadcasting to another', async () => {
    const other = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Other Bcast ${Date.now()}`, type: 'TOPIC', topic: 'OB' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/notifications/community/${other.body.data.id}/broadcast`)
      .set(auth(manager.token))
      .send({ title: 'cross' })
      .expect(403);
  });

  it('lets a platform admin broadcast to any community', async () => {
    await request(app.getHttpServer())
      .post(`${API}/notifications/community/${communityId}/broadcast`)
      .set(auth(admin.token))
      .send({ title: 'Admin notice' })
      .expect(201);
  });
});
