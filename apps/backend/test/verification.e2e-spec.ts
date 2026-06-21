import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Student Verification (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let student: TestUser;
  let admin: TestUser;
  let collegeId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    student = await registerVerifiedUser(app, { fullName: 'Verify Me' });
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Verifier' });
    const college = await prisma.college.create({
      data: { name: `Verify College ${Date.now()}`, slug: `verify-college-${Date.now()}` },
    });
    collegeId = college.id;
    // Attach the student to the college (unverified).
    await prisma.profile.update({
      where: { userId: student.userId },
      data: { collegeId, collegeVerification: 'UNVERIFIED' },
    });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('returns a presigned upload URL for evidence', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/verification/upload-url`)
      .set(auth(student.token))
      .send({ fileName: 'id.jpg', contentType: 'image/jpeg' })
      .expect(201);
    expect(res.body.data.key).toContain('verification/');
  });

  it('validates method-specific fields', async () => {
    // ID_CARD without evidenceKey → 400
    await request(app.getHttpServer())
      .post(`${API}/verification/request`)
      .set(auth(student.token))
      .send({ method: 'ID_CARD', collegeId })
      .expect(400);
  });

  it('submits a request and reflects PENDING', async () => {
    await request(app.getHttpServer())
      .post(`${API}/verification/request`)
      .set(auth(student.token))
      .send({ method: 'COLLEGE_EMAIL', collegeId, collegeEmail: 'me@college.edu' })
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get(`${API}/verification/me`)
      .set(auth(student.token))
      .expect(200);
    expect(mine.body.data.status).toBe('PENDING');
  });

  it('blocks an unverified student from posting a review', async () => {
    await request(app.getHttpServer())
      .post(`${API}/colleges/${collegeId}/reviews`)
      .set(auth(student.token))
      .send({ category: 'FACULTY', rating: 4, body: 'Too early' })
      .expect(403);
  });

  it('enforces RBAC on the review queue', async () => {
    await request(app.getHttpServer())
      .get(`${API}/verification/requests`)
      .set(auth(student.token))
      .expect(403);
    const queue = await request(app.getHttpServer())
      .get(`${API}/verification/requests`)
      .set(auth(admin.token))
      .expect(200);
    expect(queue.body.data.some((r: { user: { id: string } }) => r.user.id === student.userId)).toBe(true);
  });

  it('approves → student becomes verified and can post a review', async () => {
    const queue = await request(app.getHttpServer())
      .get(`${API}/verification/requests`)
      .set(auth(admin.token));
    const reqId = queue.body.data.find((r: { user: { id: string } }) => r.user.id === student.userId).id;

    await request(app.getHttpServer())
      .post(`${API}/verification/requests/${reqId}/approve`)
      .set(auth(admin.token))
      .expect(201);

    const mine = await request(app.getHttpServer())
      .get(`${API}/verification/me`)
      .set(auth(student.token))
      .expect(200);
    expect(mine.body.data.status).toBe('APPROVED');

    // Now verified → review is allowed.
    await request(app.getHttpServer())
      .post(`${API}/colleges/${collegeId}/reviews`)
      .set(auth(student.token))
      .send({ category: 'FACULTY', rating: 5, body: 'Verified review!' })
      .expect(201);
  });
});
