import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Reputation & Badges (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let user: TestUser;
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    user = await registerVerifiedUser(app, { fullName: 'Climber' });

    // Badge definitions live in the seed; the test DB isn't seeded, so ensure them.
    await prisma.badge.upsert({
      where: { key: 'contributor' },
      update: {},
      create: { key: 'contributor', name: 'Contributor', tier: 'BRONZE', threshold: 50 },
    });
    await prisma.badge.upsert({
      where: { key: 'placement_expert' },
      update: {},
      create: { key: 'placement_expert', name: 'Placement Expert', tier: 'GOLD', threshold: 500 },
    });

    const community = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(user.token))
      .send({ name: `Rep Topic ${Date.now()}`, type: 'TOPIC', topic: 'Rep' })
      .expect(201);
    slug = community.body.data.slug;
  });
  afterAll(async () => {
    await app?.close();
  });

  const myRep = () =>
    request(app.getHttpServer()).get(`${API}/reputation/me`).set(auth(user.token)).expect(200);

  it('awards points for creating a post (+5) and a comment (+2)', async () => {
    const before = (await myRep()).body.data.points;
    const post = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(user.token))
      .send({ body: 'rep post' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/posts/${post.body.data.id}/comments`)
      .set(auth(user.token))
      .send({ body: 'self comment' })
      .expect(201);

    const after = (await myRep()).body.data.points;
    expect(after).toBe(before + 7);
  });

  it('grants the Contributor badge when crossing the 50-point threshold', async () => {
    // Nudge just below the threshold, then a post (+5) crosses it.
    await prisma.user.update({ where: { id: user.userId }, data: { reputationPoints: 48 } });
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(user.token))
      .send({ body: 'crossing 50' })
      .expect(201);

    const rep = await myRep();
    expect(rep.body.data.points).toBeGreaterThanOrEqual(50);
    expect(rep.body.data.badges.some((b: { key: string }) => b.key === 'contributor')).toBe(true);
  });

  it('grants the Placement Expert badge for a verified placement review', async () => {
    // Make the user a verified student of a college, then post a placement review.
    const college = await prisma.college.create({
      data: { name: `Rep College ${Date.now()}`, slug: `rep-college-${Date.now()}` },
    });
    await prisma.profile.update({
      where: { userId: user.userId },
      data: { collegeId: college.id, collegeVerification: 'VERIFIED' },
    });

    await request(app.getHttpServer())
      .post(`${API}/colleges/${college.id}/reviews`)
      .set(auth(user.token))
      .send({ category: 'PLACEMENT', rating: 5, title: 'Great', body: 'Strong placements.' })
      .expect(201);

    const rep = await myRep();
    expect(rep.body.data.badges.some((b: { key: string }) => b.key === 'placement_expert')).toBe(true);
  });

  it('lists the user on the leaderboard', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/reputation/leaderboard?limit=100`)
      .expect(200);
    const entry = res.body.data.find((e: { id: string }) => e.id === user.userId);
    expect(entry).toBeDefined();
    expect(entry.reputationPoints).toBeGreaterThanOrEqual(50);
  });
});
