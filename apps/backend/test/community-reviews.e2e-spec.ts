import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community-manager reviews (e2e)', () => {
  let app: INestApplication;
  let head: TestUser; // creator (community ADMIN)
  let member: TestUser;
  let outsider: TestUser;
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(head.token))
      .send({ name: `Review Topic ${Date.now()}`, type: 'TOPIC', topic: 'Reviews' })
      .expect(201);
    slug = c.body.data.slug;
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a member review the community managers', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/reviews`)
      .set(auth(member.token))
      .send({ rating: 4, title: 'Active leadership', body: 'Heads respond quickly.' })
      .expect(201);
    expect(res.body.data.category).toBe('COMMUNITY_MANAGERS');
    expect(res.body.data.communityId).toBeTruthy();
  });

  it('blocks a non-member from reviewing', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/reviews`)
      .set(auth(outsider.token))
      .send({ rating: 1, body: 'I am not a member' })
      .expect(403);
  });

  it('lists community reviews and a summary', async () => {
    const list = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reviews`)
      .expect(200);
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].category).toBe('COMMUNITY_MANAGERS');

    const summary = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reviews/summary`)
      .expect(200);
    expect(summary.body.data.count).toBe(1);
    expect(summary.body.data.avgRating).toBe(4);
  });

  it('updates the existing review instead of duplicating (one per member)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/reviews`)
      .set(auth(member.token))
      .send({ rating: 5, body: 'Even better now' })
      .expect(201);
    const summary = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/reviews/summary`)
      .expect(200);
    expect(summary.body.data.count).toBe(1);
    expect(summary.body.data.avgRating).toBe(5);
  });

  it('still supports the new ROI category on college reviews', async () => {
    // college reviews require a verified student of that college
    const college = await (
      app.get(require('../src/prisma/prisma.service').PrismaService) as {
        college: { create: (a: unknown) => Promise<{ id: string }> };
      }
    ).college.create({ data: { name: `ROI College ${Date.now()}`, slug: `roi-college-${Date.now()}` } });
    const prisma = app.get(require('../src/prisma/prisma.service').PrismaService);
    await prisma.profile.update({
      where: { userId: member.userId },
      data: { collegeId: college.id, collegeVerification: 'VERIFIED' },
    });
    const res = await request(app.getHttpServer())
      .post(`${API}/colleges/${college.id}/reviews`)
      .set(auth(member.token))
      .send({ category: 'ROI', rating: 4, body: 'Worth the fees' })
      .expect(201);
    expect(res.body.data.category).toBe('ROI');
  });
});
