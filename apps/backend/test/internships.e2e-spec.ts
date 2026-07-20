import { INestApplication } from '@nestjs/common';
import request, { Response as SupertestResponse } from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

/** Buffers a raw (non-JSON) response body — needed to assert on PDF bytes. */
function binaryParser(res: SupertestResponse, callback: (err: Error | null, body: Buffer) => void) {
  res.setEncoding('binary');
  const chunks: Buffer[] = [];
  res.on('data', (chunk: string) => chunks.push(Buffer.from(chunk, 'binary')));
  res.on('end', () => callback(null, Buffer.concat(chunks)));
}

describe('Internship Program (e2e)', () => {
  let app: INestApplication;
  let admin: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Internship Admin' });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('exposes public pricing info', async () => {
    const res = await request(app.getHttpServer()).get(`${API}/internships/pricing`).expect(200);
    expect(res.body.data.trackA.GUIDED_LEARNING.feeAmount).toBe(2999);
    expect(res.body.data.trackA.OWN_PROJECT.feeAmount).toBe(24999);
  });

  describe('Track A — GUIDED_LEARNING full flow', () => {
    let student: TestUser;
    let enrollmentId: string;
    let taskId: string;
    let certificateId: string;

    beforeAll(async () => {
      student = await registerVerifiedUser(app, { fullName: 'Track A Student' });
    });

    it('enrolls, snapshotting the fee', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/enroll`)
        .set(auth(student.token))
        .send({ subtype: 'GUIDED_LEARNING', projectDescription: 'I want to learn full-stack web dev.' })
        .expect(201);
      enrollmentId = res.body.data.id;
      expect(res.body.data.status).toBe('PENDING_PAYMENT');
      expect(res.body.data.feeAmount).toBe(2999);
    });

    it('blocks a second concurrent enrollment', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/enroll`)
        .set(auth(student.token))
        .send({ subtype: 'GUIDED_LEARNING', projectDescription: 'Another one, too soon.' })
        .expect(400);
    });

    it('403s admin task-assignment before payment is confirmed', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/tasks`)
        .set(auth(admin.token))
        .send({ title: 'Too early' })
        .expect(403);
    });

    it('enforces RBAC on the admin enrollment queue', async () => {
      await request(app.getHttpServer())
        .get(`${API}/internships/enrollments`)
        .set(auth(student.token))
        .expect(403);
      await request(app.getHttpServer())
        .get(`${API}/internships/enrollments`)
        .set(auth(admin.token))
        .expect(200);
    });

    it('admin confirms the manually-verified payment', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/confirm-payment`)
        .set(auth(admin.token))
        .send({})
        .expect(201);

      const mine = await request(app.getHttpServer())
        .get(`${API}/internships/enrollments/me`)
        .set(auth(student.token))
        .expect(200);
      expect(mine.body.data.status).toBe('ACTIVE');
    });

    it('admin assigns a task, student submits, admin approves', async () => {
      const assigned = await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/tasks`)
        .set(auth(admin.token))
        .send({ title: 'Build a landing page' })
        .expect(201);
      taskId = assigned.body.data.id;
      expect(assigned.body.data.status).toBe('ASSIGNED');

      await request(app.getHttpServer())
        .post(`${API}/internships/tasks/${taskId}/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/my-landing-page' })
        .expect(201);

      const reviewed = await request(app.getHttpServer())
        .post(`${API}/internships/tasks/${taskId}/review`)
        .set(auth(admin.token))
        .send({ approve: true, reviewNote: 'Great work!' })
        .expect(201);
      expect(reviewed.body.data.status).toBe('APPROVED');
    });

    it('admin completes the enrollment, issuing a certificate', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/complete`)
        .set(auth(admin.token))
        .expect(201);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.maintenanceUntil).toBeNull(); // GUIDED_LEARNING has no maintenance window
      certificateId = res.body.data.certificateId;
      expect(certificateId).toBeTruthy();
    });

    it('certificate is fetchable via /certificates/me', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token))
        .expect(200);
      const cert = res.body.data.find((c: { id: string }) => c.id === certificateId);
      expect(cert).toBeTruthy();
      expect(cert.title).toBe('EduBridge Internship — Guided Learning Track');
    });

    it('certificate is publicly verifiable by code, and rejects an unknown code', async () => {
      const mine = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token));
      const cert = mine.body.data.find((c: { id: string }) => c.id === certificateId);

      const res = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/verify/${cert.code}`)
        .expect(200);
      expect(res.body.data.recipientName).toBeTruthy();
      expect(res.body.data.revoked).toBe(false);

      await request(app.getHttpServer())
        .get(`${API}/internships/certificates/verify/NOT-A-REAL-CODE`)
        .expect(404);
    });

    it('serves the public verify PDF and the authenticated download as real PDFs', async () => {
      const mine = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token));
      const cert = mine.body.data.find((c: { id: string }) => c.id === certificateId);

      const publicPdf = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/verify/${cert.code}/pdf`)
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(publicPdf.headers['content-type']).toContain('application/pdf');
      expect(publicPdf.body.slice(0, 4).toString('utf8')).toBe('%PDF');

      const download = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/${certificateId}/download`)
        .set(auth(student.token))
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(download.headers['content-type']).toContain('application/pdf');
      expect(download.headers['content-disposition']).toContain('attachment');
      expect(download.body.slice(0, 4).toString('utf8')).toBe('%PDF');
    });

    it('does not let another student download this certificate', async () => {
      const other = await registerVerifiedUser(app, { fullName: 'Nosy Student' });
      await request(app.getHttpServer())
        .get(`${API}/internships/certificates/${certificateId}/download`)
        .set(auth(other.token))
        .expect(403);
    });
  });

  describe('Track A — OWN_PROJECT sets a 1-year maintenance window', () => {
    let student: TestUser;
    let enrollmentId: string;

    beforeAll(async () => {
      student = await registerVerifiedUser(app, { fullName: 'Own Project Student' });
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/enroll`)
        .set(auth(student.token))
        .send({ subtype: 'OWN_PROJECT', projectDescription: 'Build me a portfolio site with a blog.' })
        .expect(201);
      enrollmentId = res.body.data.id;
      expect(res.body.data.feeAmount).toBe(24999);

      await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/confirm-payment`)
        .set(auth(admin.token))
        .send({})
        .expect(201);

      const assigned = await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/tasks`)
        .set(auth(admin.token))
        .send({ title: 'Ship v1' })
        .expect(201);
      const taskId = assigned.body.data.id;

      await request(app.getHttpServer())
        .post(`${API}/internships/tasks/${taskId}/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/portfolio' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`${API}/internships/tasks/${taskId}/review`)
        .set(auth(admin.token))
        .send({ approve: true })
        .expect(201);
    });

    it('sets maintenanceUntil to ~1 year after completion', async () => {
      const before = Date.now();
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/enrollments/${enrollmentId}/complete`)
        .set(auth(admin.token))
        .expect(201);
      expect(res.body.data.maintenanceUntil).toBeTruthy();

      const maintenanceMs = new Date(res.body.data.maintenanceUntil).getTime();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      // Within a couple of minutes of exactly +1 year from "now" — generous enough
      // to absorb test/db latency without being a meaningless tautology.
      expect(Math.abs(maintenanceMs - (before + oneYearMs))).toBeLessThan(5 * 60 * 1000);
    });
  });

  describe('Track B — PAID_CLIENT_WORK full flow', () => {
    let student: TestUser;
    let applicationId: string;

    beforeAll(async () => {
      student = await registerVerifiedUser(app, { fullName: 'Track B Paid Student' });
    });

    it('applies for free', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/apply`)
        .set(auth(student.token))
        .send({ skills: ['React', 'Node.js'], portfolioUrl: 'https://example.com/me', bio: 'CS student' })
        .expect(201);
      applicationId = res.body.data.id;
      expect(res.body.data.status).toBe('PENDING');
    });

    it('enforces RBAC on the admin application queue', async () => {
      await request(app.getHttpServer())
        .get(`${API}/internships/applications`)
        .set(auth(student.token))
        .expect(403);
    });

    it('admin allocates paid client work with a payout amount', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/allocate`)
        .set(auth(admin.token))
        .send({ allocationType: 'PAID_CLIENT_WORK', allocationNote: 'Client X landing page', payoutAmount: 5000 })
        .expect(201);
      expect(res.body.data.status).toBe('ALLOCATED');
    });

    it('student submits, admin approves and the certificate is issued', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/delivered' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/review`)
        .set(auth(admin.token))
        .send({ approve: true, reviewNote: 'Delivered well' })
        .expect(201);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.certificateId).toBeTruthy();
    });

    it('admin marks the payout as sent, and the application reflects it', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/payout-sent`)
        .set(auth(admin.token))
        .send({ payoutNote: 'Sent via UPI' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`${API}/internships/applications/${applicationId}`)
        .set(auth(student.token))
        .expect(200);
      expect(res.body.data.payoutAmount).toBe(5000);
      expect(res.body.data.payoutSentAt).toBeTruthy();
      expect(res.body.data.payoutNote).toBe('Sent via UPI');
    });
  });

  describe('Track B — SKILL_BUILDING_TASK rejects payout actions', () => {
    let student: TestUser;
    let applicationId: string;

    beforeAll(async () => {
      student = await registerVerifiedUser(app, { fullName: 'Track B Skill Student' });
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/apply`)
        .set(auth(student.token))
        .send({ skills: ['Figma'], bio: 'Design student' })
        .expect(201);
      applicationId = res.body.data.id;
    });

    it('rejects a payout amount on a skill-building allocation', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/allocate`)
        .set(auth(admin.token))
        .send({ allocationType: 'SKILL_BUILDING_TASK', payoutAmount: 1000 })
        .expect(400);
    });

    it('allocates the skill task (no payout) and rejects the payout-sent endpoint', async () => {
      const allocated = await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/allocate`)
        .set(auth(admin.token))
        .send({ allocationType: 'SKILL_BUILDING_TASK', allocationNote: 'Design a UI kit' })
        .expect(201);
      expect(allocated.body.data.status).toBe('ALLOCATED');

      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/ui-kit' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/review`)
        .set(auth(admin.token))
        .send({ approve: true })
        .expect(201);

      // SKILL_BUILDING_TASK has no payout — the payout-sent endpoint must reject it.
      await request(app.getHttpServer())
        .post(`${API}/internships/applications/${applicationId}/payout-sent`)
        .set(auth(admin.token))
        .send({})
        .expect(400);
    });
  });
});
