import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('EZ-Rentbuddy rental leads (e2e)', () => {
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

  it('accepts a public seeker lead and a property lead (no auth)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/rentals/leads`)
      .send({ kind: 'SEEKER', name: 'Riya', phone: '99999', propertyType: 'PG', location: 'Near VIT' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/rentals/leads`)
      .send({ kind: 'PROPERTY', name: 'Owner Raj', phone: '88888', driveUrl: 'https://drive.google.com/x', participant: 'Property Owner' })
      .expect(201);
  });

  it('validates the lead kind', async () => {
    await request(app.getHttpServer())
      .post(`${API}/rentals/leads`)
      .send({ kind: 'BOGUS', name: 'x' })
      .expect(400);
  });

  it('lets an admin list leads; a non-admin cannot', async () => {
    const list = await request(app.getHttpServer())
      .get(`${API}/rentals/leads`)
      .set(auth(admin.token))
      .expect(200);
    expect(list.body.data.some((l: { name: string }) => l.name === 'Riya')).toBe(true);
    await request(app.getHttpServer()).get(`${API}/rentals/leads`).set(auth(member.token)).expect(403);
  });
});
