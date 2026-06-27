import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community managers can delete resources & opportunities (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let manager: TestUser; // appointed CAMPUS_LEAD of the community
  let member: TestUser; // plain member who uploads the content
  let slug: string;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    manager = await registerVerifiedUser(app, { fullName: 'Manager' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Mod Del ${Date.now()}`, type: 'TOPIC', topic: 'ModDel' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;

    for (const u of [manager, member]) {
      await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(u.token));
    }
    // admin appoints the manager as a community lead
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: manager.email, role: 'CAMPUS_LEAD' })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a community manager delete a resource uploaded by a member', async () => {
    const r = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(member.token))
      .send({ type: 'NOTES', title: `Notes ${Date.now()}`, externalUrl: 'https://drive.google.com/x', communityId })
      .expect(201);
    const id = r.body.data.id;

    // a plain member from outside cannot delete it
    const stranger = await registerVerifiedUser(app, { fullName: 'Stranger' });
    await request(app.getHttpServer())
      .delete(`${API}/resources/${id}`)
      .set(auth(stranger.token))
      .expect(403);
    // the community manager can
    await request(app.getHttpServer())
      .delete(`${API}/resources/${id}`)
      .set(auth(manager.token))
      .expect(200);
  });

  it('lets a community manager delete an opportunity posted by a member', async () => {
    const o = await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(member.token))
      .send({ type: 'INTERNSHIP', title: `Intern ${Date.now()}`, description: 'desc', communityId })
      .expect(201);
    const id = o.body.data.id;

    const stranger = await registerVerifiedUser(app, { fullName: 'Stranger2' });
    await request(app.getHttpServer())
      .delete(`${API}/opportunities/${id}`)
      .set(auth(stranger.token))
      .expect(403);
    await request(app.getHttpServer())
      .delete(`${API}/opportunities/${id}`)
      .set(auth(manager.token))
      .expect(200);
  });
});
