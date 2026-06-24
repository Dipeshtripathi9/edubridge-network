import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Complaints to admin (e2e)', () => {
  let app: INestApplication;
  let manager: TestUser;
  let admin: TestUser;
  let complaintId: string;

  beforeAll(async () => {
    app = await createTestApp();
    manager = await registerVerifiedUser(app, { fullName: 'Manager' });
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets any user raise a complaint to admins', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/complaints`)
      .set(auth(manager.token))
      .send({ body: 'A member keeps spamming and I cannot reach anyone' })
      .expect(201);
    complaintId = res.body.data.id;
    expect(res.body.data.status).toBe('OPEN');
  });

  it('only admins can view the complaint queue', async () => {
    await request(app.getHttpServer()).get(`${API}/complaints`).set(auth(manager.token)).expect(403);
    const res = await request(app.getHttpServer())
      .get(`${API}/complaints`)
      .set(auth(admin.token))
      .expect(200);
    expect(res.body.data.some((c: { id: string }) => c.id === complaintId)).toBe(true);
  });

  it('admin resolves a complaint', async () => {
    await request(app.getHttpServer())
      .post(`${API}/complaints/${complaintId}/resolve`)
      .set(auth(admin.token))
      .expect(201);
    const res = await request(app.getHttpServer())
      .get(`${API}/complaints`)
      .set(auth(admin.token));
    expect(res.body.data.find((c: { id: string }) => c.id === complaintId).status).toBe('RESOLVED');

    // a non-admin cannot resolve
    await request(app.getHttpServer())
      .post(`${API}/complaints/${complaintId}/resolve`)
      .set(auth(manager.token))
      .expect(403);
  });
});
