import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Startup community help requests (e2e)', () => {
  let app: INestApplication;
  let head: TestUser; // creator (community ADMIN)
  let member: TestUser;
  let outsider: TestUser;
  let slug: string;
  let helpId: string;

  beforeAll(async () => {
    app = await createTestApp();
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(head.token))
      .send({ name: `Startup ${Date.now()}`, type: 'STARTUP' })
      .expect(201);
    slug = c.body.data.slug;
    expect(c.body.data.type).toBe('STARTUP');
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a member raise a help request; blocks non-members', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help`)
      .set(auth(member.token))
      .send({ body: 'My pitch deck got rejected, need feedback' })
      .expect(201);
    helpId = res.body.data.id;
    expect(res.body.data.status).toBe('OPEN');

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help`)
      .set(auth(outsider.token))
      .send({ body: 'I am not a member' })
      .expect(403);
  });

  it('lists help requests for the community', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/help`)
      .set(auth(head.token))
      .expect(200);
    expect(res.body.data.some((h: { id: string }) => h.id === helpId)).toBe(true);
  });

  it('only managers can resolve', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help/${helpId}/resolve`)
      .set(auth(member.token))
      .expect(403);

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help/${helpId}/resolve`)
      .set(auth(head.token))
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/help`)
      .set(auth(head.token));
    expect(after.body.data.find((h: { id: string }) => h.id === helpId).status).toBe('RESOLVED');
  });
});
