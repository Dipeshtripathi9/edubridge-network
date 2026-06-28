import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

const dayStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe('Ad cards — one per day, leader-first, admin fallback (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;
  let head: TestUser;
  let member: TestUser;
  let slug: string;

  const book = (tok: string, title: string, offset: number) =>
    request(app.getHttpServer())
      .post(`${API}/communities/${slug}/ads`)
      .set(auth(tok))
      .send({ title, scheduledFor: dayStr(offset) });

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

  it('lets a head book a future day; rejects today and rejects a plain member', async () => {
    await book(head.token, 'Day 1', 1).expect(201);
    await book(head.token, 'Today?', 0).expect(400); // leaders must book before the run day
    await book(member.token, 'Nope', 2).expect(403);
  });

  it('allows only one ad per day — leader has the day, admin is blocked from it', async () => {
    await book(admin.token, 'Admin wants day 1', 1).expect(400); // already taken by the head
    await book(admin.token, 'Admin day 2', 2).expect(201); // a free day is fine
  });

  it('lets admin fill the current day (same-day) when it is free', async () => {
    await book(admin.token, 'Admin today', 0).expect(201);
  });

  it('enforces the admin weekly cap of 2', async () => {
    const q = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/ads/quota`)
      .set(auth(admin.token))
      .expect(200);
    expect(q.body.data.limit).toBe(2);
    expect(q.body.data.remaining).toBe(0); // booked day 2 + today
    await book(admin.token, 'Admin third', 5).expect(400);
  });

  it('enforces the head weekly cap of 5', async () => {
    // head already has day 1; book 4 more free days → 5
    for (const d of [3, 4, 5, 6]) await book(head.token, `Head ${d}`, d).expect(201);
    const q = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/ads/quota`)
      .set(auth(head.token))
      .expect(200);
    expect(q.body.data.remaining).toBe(0);
    await book(head.token, 'Head sixth', 8).expect(400);
  });
});
