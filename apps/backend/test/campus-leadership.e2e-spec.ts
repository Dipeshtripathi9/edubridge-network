import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Campus-scoped leadership (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser;
  let studentA: TestUser; // verified at College A
  let studentB: TestUser; // verified at College B
  let collegeASlug: string;
  let topicSlug: string;

  const stamp = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    studentA = await registerVerifiedUser(app, { fullName: 'Student A' });
    studentB = await registerVerifiedUser(app, { fullName: 'Student B' });

    const collegeA = await prisma.college.create({
      data: { name: `College A ${stamp}`, slug: `college-a-${stamp}` },
    });
    const collegeB = await prisma.college.create({
      data: { name: `College B ${stamp}`, slug: `college-b-${stamp}` },
    });
    await prisma.profile.update({
      where: { userId: studentA.userId },
      data: { collegeId: collegeA.id, collegeVerification: 'VERIFIED' },
    });
    await prisma.profile.update({
      where: { userId: studentB.userId },
      data: { collegeId: collegeB.id, collegeVerification: 'VERIFIED' },
    });

    // College A's community (campus-bound) + a topic community (open to any verified student).
    collegeASlug = `college-a-community-${stamp}`;
    await prisma.community.create({
      data: { name: `College A`, slug: collegeASlug, type: 'COLLEGE', collegeId: collegeA.id, hiringOpen: true },
    });
    const topic = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `DSA ${stamp}`, type: 'TOPIC', topic: 'DSA' })
      .expect(201);
    topicSlug = topic.body.data.slug;
    await request(app.getHttpServer())
      .patch(`${API}/communities/${topicSlug}/hiring`)
      .set(auth(admin.token))
      .send({ open: true })
      .expect(200);

    // You must join a community before applying to lead it.
    await request(app.getHttpServer())
      .post(`${API}/communities/${collegeASlug}/join`)
      .set(auth(studentA.token))
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/communities/${topicSlug}/join`)
      .set(auth(studentB.token))
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it("lets a college's own verified student apply to lead it", async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${collegeASlug}/head-applications`)
      .set(auth(studentA.token))
      .send({ requestedRole: 'CAMPUS_LEAD' })
      .expect(201);
  });

  it('blocks a verified student from another college leading this campus', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${collegeASlug}/head-applications`)
      .set(auth(studentB.token))
      .send({ requestedRole: 'CAMPUS_LEAD' })
      .expect(403);
  });

  it('lets any verified student apply to lead a topic community', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${topicSlug}/head-applications`)
      .set(auth(studentB.token))
      .send({ requestedRole: 'OPPORTUNITY_HEAD' })
      .expect(201);
  });

  it('blocks an unverified student from applying anywhere', async () => {
    const unverified = await registerVerifiedUser(app, { fullName: 'Unverified' });
    await prisma.profile.update({
      where: { userId: unverified.userId },
      data: { collegeVerification: 'UNVERIFIED' },
    });
    await request(app.getHttpServer())
      .post(`${API}/communities/${topicSlug}/head-applications`)
      .set(auth(unverified.token))
      .send({ requestedRole: 'OPPORTUNITY_HEAD' })
      .expect(403);
  });
});
