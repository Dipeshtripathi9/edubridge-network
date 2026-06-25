import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Admin edit/delete community (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let owner: TestUser; // community ADMIN (creator) — not a platform admin
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Platform Admin' });
    owner = await registerVerifiedUser(app, { fullName: 'Owner' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(owner.token))
      .send({ name: `CRUD ${Date.now()}`, type: 'TOPIC', topic: 'Crud' })
      .expect(201);
    slug = c.body.data.slug;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('admin edits a community; the community owner cannot', async () => {
    await request(app.getHttpServer())
      .patch(`${API}/communities/${slug}`)
      .set(auth(owner.token))
      .send({ name: 'Hacked name' })
      .expect(403);

    const res = await request(app.getHttpServer())
      .patch(`${API}/communities/${slug}`)
      .set(auth(admin.token))
      .send({ name: 'Renamed by admin', topic: 'NewTopic' })
      .expect(200);
    expect(res.body.data.name).toBe('Renamed by admin');
    expect(res.body.data.topic).toBe('NewTopic');
  });

  it('only admin can delete; deleting removes the community', async () => {
    await request(app.getHttpServer())
      .delete(`${API}/communities/${slug}`)
      .set(auth(owner.token))
      .expect(403);

    await request(app.getHttpServer())
      .delete(`${API}/communities/${slug}`)
      .set(auth(admin.token))
      .expect(200);

    await request(app.getHttpServer()).get(`${API}/communities/${slug}`).expect(404);
  });
});
