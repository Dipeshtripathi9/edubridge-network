import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community heads & governance (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let applicant: TestUser; // verified student
  let plain: TestUser; // unverified
  let admin: TestUser; // platform admin
  let slug: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    applicant = await registerVerifiedUser(app, { fullName: 'Lead Hopeful' });
    plain = await registerVerifiedUser(app, { fullName: 'Plain' });
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Platform Admin' });

    await prisma.profile.update({
      where: { userId: applicant.userId },
      data: { collegeVerification: 'VERIFIED' },
    });

    const stamp = Date.now();
    slug = `heads-topic-${stamp}`;
    await prisma.community.create({
      data: { name: `Heads Topic ${stamp}`, slug, type: 'TOPIC', topic: 'Heads', memberCount: 0 },
    });

    // Hiring is closed by default — admin opens it so students can apply.
    await request(app.getHttpServer())
      .post(`${API}/communities/hiring`)
      .set(auth(admin.token))
      .send({ open: true })
      .expect(201);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a verified student apply; blocks unverified', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/head-applications`)
      .set(auth(applicant.token))
      .send({ requestedRole: 'CAMPUS_LEAD', pitch: 'I run the coding club' })
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get(`${API}/head-applications/me`)
      .set(auth(applicant.token))
      .expect(200);
    expect(mine.body.data.some((a: { status: string }) => a.status === 'PENDING')).toBe(true);

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/head-applications`)
      .set(auth(plain.token))
      .send({ requestedRole: 'CAMPUS_LEAD' })
      .expect(403);
  });

  it('enforces RBAC on the application queue', async () => {
    await request(app.getHttpServer())
      .get(`${API}/head-applications`)
      .set(auth(applicant.token))
      .expect(403);
    const queue = await request(app.getHttpServer())
      .get(`${API}/head-applications`)
      .set(auth(admin.token))
      .expect(200);
    expect(queue.body.data.some((a: { user: { id: string } }) => a.user.id === applicant.userId)).toBe(true);
  });

  it('approves → assigns the role; the new head gets community privileges', async () => {
    const queue = await request(app.getHttpServer())
      .get(`${API}/head-applications`)
      .set(auth(admin.token));
    const appId = queue.body.data.find((a: { user: { id: string } }) => a.user.id === applicant.userId).id;

    await request(app.getHttpServer())
      .post(`${API}/head-applications/${appId}/approve`)
      .set(auth(admin.token))
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}`)
      .set(auth(applicant.token))
      .expect(200);
    expect(detail.body.data.myRole).toBe('CAMPUS_LEAD');

    // As a head, can pin a post.
    const p = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(applicant.token))
      .send({ body: 'lead post' })
      .expect(201);
    const pinned = await request(app.getHttpServer())
      .post(`${API}/posts/${p.body.data.id}/pin`)
      .set(auth(applicant.token))
      .expect(201);
    expect(pinned.body.data.isPinned).toBe(true);
  });

  it('admin appoints a head by email', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email: plain.email, role: 'OPPORTUNITY_HEAD' })
      .expect(201);
    expect(res.body.data.role).toBe('OPPORTUNITY_HEAD');
  });

  it('keeps trust centralized: a head cannot verify reviews', async () => {
    const college = await prisma.college.create({
      data: { name: `Trust College ${Date.now()}`, slug: `trust-college-${Date.now()}` },
    });
    await prisma.profile.update({
      where: { userId: applicant.userId },
      data: { collegeId: college.id, collegeVerification: 'VERIFIED' },
    });
    const review = await request(app.getHttpServer())
      .post(`${API}/colleges/${college.id}/reviews`)
      .set(auth(applicant.token))
      .send({ category: 'FACULTY', rating: 5, body: 'Great' })
      .expect(201);

    // applicant is a CAMPUS_LEAD (community head) but only a STUDENT platform-wide → 403
    await request(app.getHttpServer())
      .post(`${API}/reviews/${review.body.data.id}/verify`)
      .set(auth(applicant.token))
      .expect(403);
    // platform admin can.
    await request(app.getHttpServer())
      .post(`${API}/reviews/${review.body.data.id}/verify`)
      .set(auth(admin.token))
      .expect(201);
  });

  it('admin can close hiring, which blocks new applications', async () => {
    const fresh = await registerVerifiedUser(app, { fullName: 'Late Applicant' });
    await prisma.profile.update({
      where: { userId: fresh.userId },
      data: { collegeVerification: 'VERIFIED' },
    });

    // close hiring (admin only)
    await request(app.getHttpServer())
      .post(`${API}/communities/hiring`)
      .set(auth(admin.token))
      .send({ open: false })
      .expect(201);
    // a non-admin cannot toggle hiring
    await request(app.getHttpServer())
      .post(`${API}/communities/hiring`)
      .set(auth(fresh.token))
      .send({ open: true })
      .expect(403);
    // applications are now blocked
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/head-applications`)
      .set(auth(fresh.token))
      .send({ requestedRole: 'MODERATOR' })
      .expect(403);

    // reopen for other suites
    await request(app.getHttpServer())
      .post(`${API}/communities/hiring`)
      .set(auth(admin.token))
      .send({ open: true })
      .expect(201);
  });
});
