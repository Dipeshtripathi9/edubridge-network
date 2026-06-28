import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

const dayStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe('Ad cards (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let head: TestUser;
  let member: TestUser;
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Ads ${Date.now()}`, type: 'TOPIC', topic: 'Ads' })
      .expect(201);
    slug = c.body.data.slug;
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(head.token));
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: head.email, role: 'CAMPUS_LEAD' })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a head book an ad for a future day', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(head.token))
      .send({ title: 'Hackathon!', scheduledFor: dayStr(1) })
      .expect(201);
  });

  it('rejects booking for today / a past day (must book before the run day)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(head.token))
      .send({ title: 'Too late', scheduledFor: dayStr(0) })
      .expect(400);
  });

  it('forbids a plain member from booking ads', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(member.token))
      .send({ title: 'nope', scheduledFor: dayStr(1) })
      .expect(403);
  });

  it('enforces the head weekly quota of 5', async () => {
    // already booked 1 above; book 4 more to reach 5, the 6th fails
    for (let i = 0; i < 4; i++) {
      await request(app.getHttpServer())
        .post(`${API}/communities/${slug}/ads`)
        .set(auth(head.token))
        .send({ title: `Ad ${i}`, scheduledFor: dayStr(2 + i) })
        .expect(201);
    }
    const quota = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/ads/quota`)
      .set(auth(head.token))
      .expect(200);
    expect(quota.body.data.remaining).toBe(0);

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(head.token))
      .send({ title: 'Over limit', scheduledFor: dayStr(7) })
      .expect(400);
  });

  it('admin can book in any community (own 2-ad allowance), including same-day', async () => {
    // admin may book TODAY (leaders cannot — see the "today" test above)
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(admin.token))
      .send({ title: 'Admin same-day ad', scheduledFor: dayStr(0) })
      .expect(201);
    const quota = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/ads/quota`)
      .set(auth(admin.token))
      .expect(200);
    expect(quota.body.data.limit).toBe(2);
  });
});
