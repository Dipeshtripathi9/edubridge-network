import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('99x Developers agency leads (e2e)', () => {
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

  it('accepts a public proposal lead (no auth)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/agency/leads`)
      .send({
        kind: 'PROPOSAL',
        name: 'Founder Jane',
        email: 'jane@startup.example',
        services: ['Website Design', 'SEO'],
        message: 'Need a conversion-focused site',
      })
      .expect(201);
    expect(res.body.data.kind).toBe('PROPOSAL');
  });

  it('validates the lead kind', async () => {
    await request(app.getHttpServer())
      .post(`${API}/agency/leads`)
      .send({ kind: 'BOGUS', name: 'x', email: 'x@y.com' })
      .expect(400);
  });

  it('lets an admin list leads; a non-admin cannot', async () => {
    const list = await request(app.getHttpServer())
      .get(`${API}/agency/leads`)
      .set(auth(admin.token))
      .expect(200);
    expect(list.body.data.some((l: { name: string }) => l.name === 'Founder Jane')).toBe(true);

    await request(app.getHttpServer()).get(`${API}/agency/leads`).set(auth(member.token)).expect(403);
  });
});
