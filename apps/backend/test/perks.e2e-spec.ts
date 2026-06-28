import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Leader perks: discount & referrals (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser;
  let head: TestUser;
  let member: TestUser;
  let outsider: TestUser;
  let slug: string;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Perks ${Date.now()}`, type: 'TOPIC', topic: 'Perks' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;
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

  // ---- Perk 2: discount ----
  it('blocks the discount claim below 600 members', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/discount/claim`)
      .set(auth(head.token))
      .expect(400);
  });

  it('lets the head claim once the community reaches 600 members; a member cannot', async () => {
    await prisma.community.update({ where: { id: communityId }, data: { memberCount: 600 } });

    const status = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/discount`)
      .set(auth(head.token))
      .expect(200);
    expect(status.body.data.eligible).toBe(true);

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/discount/claim`)
      .set(auth(member.token))
      .expect(403); // plain member is not the head

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/discount/claim`)
      .set(auth(head.token))
      .expect(201);

    const after = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/discount`)
      .set(auth(head.token))
      .expect(200);
    expect(after.body.data.claim).toBeTruthy();
  });

  // ---- Perk 3: referrals ----
  it('admin posts a referral; leaders see it; non-leaders are blocked', async () => {
    await request(app.getHttpServer())
      .post(`${API}/referrals`)
      .set(auth(admin.token))
      .send({ role: 'SDE Intern', company: 'Razorpay', link: 'https://x.example/apply' })
      .expect(201);

    // the head (a leader) can list referrals
    const asLeader = await request(app.getHttpServer())
      .get(`${API}/referrals`)
      .set(auth(head.token))
      .expect(200);
    expect(asLeader.body.data.some((r: { company: string }) => r.company === 'Razorpay')).toBe(true);

    // an outsider with no leadership post cannot
    await request(app.getHttpServer()).get(`${API}/referrals`).set(auth(outsider.token)).expect(403);
  });

  it('forbids a non-admin from posting a referral', async () => {
    await request(app.getHttpServer())
      .post(`${API}/referrals`)
      .set(auth(head.token))
      .send({ role: 'x', company: 'y' })
      .expect(403);
  });
});
