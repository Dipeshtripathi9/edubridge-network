import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Mentor (expert guidance) requests (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let member: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('accepts a public guidance request (no auth)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/mentors/requests`)
      .send({ name: 'Aarav', phone: '9999999999', course: 'B.Tech CSE', budget: '200000', contactMethod: 'CALL' })
      .expect(201);
    expect(res.body.data.name).toBe('Aarav');
  });

  it('rejects an invalid contact method', async () => {
    await request(app.getHttpServer())
      .post(`${API}/mentors/requests`)
      .send({ name: 'x', phone: '1', contactMethod: 'PIGEON' })
      .expect(400);
  });

  it('lets an admin list requests; a non-admin cannot', async () => {
    const list = await request(app.getHttpServer())
      .get(`${API}/mentors/requests`)
      .set(auth(admin.token))
      .expect(200);
    expect(list.body.data.some((m: { name: string }) => m.name === 'Aarav')).toBe(true);
    await request(app.getHttpServer()).get(`${API}/mentors/requests`).set(auth(member.token)).expect(403);
  });
});
