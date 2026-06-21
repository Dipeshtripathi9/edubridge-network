import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Admin community management (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let lead: TestUser;
  let monitor: TestUser;
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Platform Admin' });
    lead = await registerVerifiedUser(app, { fullName: 'Lead' });
    monitor = await registerVerifiedUser(app, { fullName: 'Monitor' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('admin creates a community', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Admin Topic ${Date.now()}`, type: 'TOPIC', topic: 'AdminMade' })
      .expect(201);
    slug = res.body.data.slug;
    expect(slug).toBeTruthy();
  });

  it('admin appoints a head by email', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: lead.email, role: 'CAMPUS_LEAD' })
      .expect(201);
    expect(res.body.data.role).toBe('CAMPUS_LEAD');
  });

  it('admin appoints a moderator (monitor) by email', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: monitor.email, role: 'MODERATOR' })
      .expect(201);
    expect(res.body.data.role).toBe('MODERATOR');
  });

  it('reflects the assigned roles in the member list', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/members?limit=50`)
      .expect(200);
    const byUser = Object.fromEntries(
      res.body.data.map((m: { user: { id: string }; role: string }) => [m.user.id, m.role]),
    );
    expect(byUser[lead.userId]).toBe('CAMPUS_LEAD');
    expect(byUser[monitor.userId]).toBe('MODERATOR');
  });

  it('keeps memberCount in sync after appointments', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}`)
      .expect(200);
    // admin (creator) + lead + monitor = 3
    expect(res.body.data.memberCount).toBe(3);
  });

  it('blocks a non-admin from appointing', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(lead.token))
      .send({ email: monitor.email, role: 'MODERATOR' })
      .expect(403);
  });
});
