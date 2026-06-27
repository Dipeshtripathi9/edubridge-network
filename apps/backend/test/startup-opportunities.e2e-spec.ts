import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Startup community opportunities — managers/admin only (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let manager: TestUser;
  let member: TestUser;
  let startupSlug: string;
  let startupId: string;
  let topicId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    manager = await registerVerifiedUser(app, { fullName: 'Manager' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });

    const s = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Startup ${Date.now()}`, type: 'STARTUP' })
      .expect(201);
    startupSlug = s.body.data.slug;
    startupId = s.body.data.id;

    const t = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Topic ${Date.now()}`, type: 'TOPIC', topic: 'T' })
      .expect(201);
    topicId = t.body.data.id;

    for (const u of [manager, member]) {
      await request(app.getHttpServer()).post(`${API}/communities/${startupSlug}/join`).set(auth(u.token));
    }
    await request(app.getHttpServer())
      .post(`${API}/communities/${startupSlug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: manager.email, role: 'OPPORTUNITY_HEAD' })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('blocks a plain member from posting an opportunity in a startup community', async () => {
    await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(member.token))
      .send({ type: 'INTERNSHIP', title: 'Member Intern', description: 'x', communityId: startupId })
      .expect(403);
  });

  it('lets a startup manager post and publishes it immediately (approved)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(manager.token))
      .send({ type: 'INTERNSHIP', title: 'Manager Intern', description: 'x', communityId: startupId })
      .expect(201);
    expect(res.body.data.approvalStatus).toBe('APPROVED');

    const list = await request(app.getHttpServer())
      .get(`${API}/opportunities?communityId=${startupId}&limit=50`)
      .expect(200);
    expect(list.body.data.some((o: { id: string }) => o.id === res.body.data.id)).toBe(true);
  });

  it('lets an admin post in a startup community', async () => {
    await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(admin.token))
      .send({ type: 'SCHOLARSHIP', title: 'Admin Schol', description: 'x', communityId: startupId })
      .expect(201);
  });

  it('still lets a plain member submit to a topic community (pending approval)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(member.token))
      .send({ type: 'INTERNSHIP', title: 'Topic Intern', description: 'x', communityId: topicId })
      .expect(201);
    expect(res.body.data.approvalStatus).toBe('PENDING');
  });
});
