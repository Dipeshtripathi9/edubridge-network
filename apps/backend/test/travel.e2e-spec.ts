import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('GoTogether travel pools (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let creator: TestUser;
  let joiner: TestUser;
  let unverified: TestUser;
  let poolId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    creator = await registerVerifiedUser(app, { fullName: 'Creator' });
    joiner = await registerVerifiedUser(app, { fullName: 'Joiner' });
    unverified = await registerVerifiedUser(app, { fullName: 'Unverified' });
    for (const u of [creator, joiner]) {
      await prisma.profile.update({ where: { userId: u.userId }, data: { collegeVerification: 'VERIFIED' } });
    }
    await prisma.profile.update({ where: { userId: unverified.userId }, data: { collegeVerification: 'UNVERIFIED' } });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a verified student create a trip pool (creator auto-joins)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/travel-pools`)
      .set(auth(creator.token))
      .send({ kind: 'TRIP', title: 'Manali Trip', seats: 3, budget: '4500' })
      .expect(201);
    poolId = res.body.data.id;
    expect(res.body.data.joined).toBe(1);
    expect(res.body.data.status).toBe('OPEN');
  });

  it('blocks an unverified student from creating', async () => {
    await request(app.getHttpServer())
      .post(`${API}/travel-pools`)
      .set(auth(unverified.token))
      .send({ kind: 'RIDE', title: 'x', seats: 4 })
      .expect(403);
  });

  it('lets a verified student join, and reflects fill/status', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/travel-pools/${poolId}/join`)
      .set(auth(joiner.token))
      .expect(201);
    expect(res.body.data.joined).toBe(2); // 2/3 → still OPEN
    expect(res.body.data.status).toBe('OPEN');
    expect(res.body.data.isMember).toBe(true);

    // a 3rd verified student fills it → CONFIRMED; a 4th is rejected (full)
    const third = await registerVerifiedUser(app, { fullName: 'Third' });
    await prisma.profile.update({ where: { userId: third.userId }, data: { collegeVerification: 'VERIFIED' } });
    const fill = await request(app.getHttpServer())
      .post(`${API}/travel-pools/${poolId}/join`)
      .set(auth(third.token))
      .expect(201);
    expect(fill.body.data.status).toBe('CONFIRMED');

    const fourth = await registerVerifiedUser(app, { fullName: 'Fourth' });
    await prisma.profile.update({ where: { userId: fourth.userId }, data: { collegeVerification: 'VERIFIED' } });
    await request(app.getHttpServer())
      .post(`${API}/travel-pools/${poolId}/join`)
      .set(auth(fourth.token))
      .expect(400);
  });

  it('lists active pools publicly', async () => {
    const list = await request(app.getHttpServer()).get(`${API}/travel-pools?kind=TRIP`).expect(200);
    expect(list.body.data.some((p: { id: string }) => p.id === poolId)).toBe(true);
  });
});
