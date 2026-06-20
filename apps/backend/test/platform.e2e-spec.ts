import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser } from './helpers';

describe('Platform (e2e): transfer, search, admin RBAC, health', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let collegeName: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Seed a college + transfer requirement for the eligibility engine.
    collegeName = `Test College ${Date.now()}`;
    const college = await prisma.college.create({
      data: {
        name: collegeName,
        slug: `test-college-${Date.now()}`,
        state: 'Test State',
        city: 'Test City',
        nirfRank: 42,
      },
    });
    await prisma.transferRequirement.create({
      data: {
        collegeId: college.id,
        branch: 'Computer Science and Engineering',
        minCgpa: 7,
        minYear: 1,
        maxYear: 3,
        creditTransfer: true,
        feeAmount: 100000,
      },
    });
  });
  afterAll(async () => {
    await app?.close();
  });

  describe('Health', () => {
    it('reports db + redis up', async () => {
      const res = await request(app.getHttpServer()).get(`${API}/health`).expect(200);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.data.checks.database).toBe('up');
      expect(res.body.data.checks.redis).toBe('up');
    });
  });

  describe('Transfer eligibility engine', () => {
    it('returns colleges the student qualifies for', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/transfer/eligibility`)
        .send({ cgpa: 8.5, currentYear: 2, branch: 'Computer Science and Engineering' })
        .expect(201);
      expect(res.body.data.eligibleCount).toBeGreaterThanOrEqual(1);
      const names = res.body.data.matches.map((m: { college: { name: string } }) => m.college.name);
      expect(names).toContain(collegeName);
    });

    it('excludes colleges when CGPA is below the cutoff', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/transfer/eligibility`)
        .send({ cgpa: 5, currentYear: 2, branch: 'Computer Science and Engineering' })
        .expect(201);
      const names = res.body.data.matches.map((m: { college: { name: string } }) => m.college.name);
      expect(names).not.toContain(collegeName);
    });

    it('validates input (cgpa out of range → 400)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/transfer/eligibility`)
        .send({ cgpa: 99, currentYear: 2, branch: 'CSE' })
        .expect(400);
    });
  });

  describe('Global search', () => {
    it('returns grouped results with per-type counts', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/search?q=test`)
        .expect(200);
      expect(res.body.data.groups).toBeDefined();
      expect(res.body.data.counts).toHaveProperty('college');
    });
  });

  describe('Admin RBAC', () => {
    it('forbids a student (403) and allows an admin (200)', async () => {
      const student = await registerVerifiedUser(app);
      const admin = await registerVerifiedUser(app, { role: 'ADMIN' });

      await request(app.getHttpServer())
        .get(`${API}/admin/analytics`)
        .set(auth(student.token))
        .expect(403);

      const res = await request(app.getHttpServer())
        .get(`${API}/admin/analytics`)
        .set(auth(admin.token))
        .expect(200);
      expect(res.body.data.users.total).toBeGreaterThan(0);
    });

    it('lets a user file a report that lands in the admin queue', async () => {
      const reporter = await registerVerifiedUser(app);
      const admin = await registerVerifiedUser(app, { role: 'ADMIN' });

      await request(app.getHttpServer())
        .post(`${API}/reports`)
        .set(auth(reporter.token))
        .send({ targetType: 'POST', targetId: 'some-post-id', reason: 'Spam' })
        .expect(201);

      const queue = await request(app.getHttpServer())
        .get(`${API}/admin/reports?status=OPEN`)
        .set(auth(admin.token))
        .expect(200);
      expect(queue.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
