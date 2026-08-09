import { INestApplication } from '@nestjs/common';
import request, { Response as SupertestResponse } from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
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
  let prisma: PrismaService;
  let admin: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
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

  describe('Virtual Internship — exact GST pricing', () => {
    it('computes the exact GST-inclusive fee for both tracks, no whole-rupee rounding', async () => {
      const res = await request(app.getHttpServer()).get(`${API}/internships/virtual/pricing`).expect(200);
      expect(res.body.data.week.gst).toBe(485.82);
      expect(res.body.data.month.gst).toBe(1374.12);
    });

    it('a fresh WEEK enrollment locks in the exact ₹3,184.82 fee', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Fresh Week Student' });
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);
      expect(res.body.data.track).toBe('WEEK');
      expect(res.body.data.feeAmount).toBe(3184.82);
    });

    it('a fresh MONTH enrollment locks in the exact ₹9,008.12 fee', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Fresh Month Student' });
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'MONTH' })
        .expect(201);
      expect(res.body.data.track).toBe('MONTH');
      expect(res.body.data.feeAmount).toBe(9008.12);
    });
  });

  describe('Virtual Internship — same-track re-enrollment', () => {
    it('re-enrolling in the SAME track reuses the existing pending enrollment with its fee unchanged', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Same Track Student' });
      const first = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);

      const second = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);

      expect(second.body.data.id).toBe(first.body.data.id);
      expect(second.body.data.feeAmount).toBe(3184.82);
    });

    it('enrollments/me prefers an ACTIVE enrollment over a newer PENDING_PAYMENT one for a different track', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Active Over Pending Student' });

      const week = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);

      // Simulate a completed payment for WEEK, exactly like activatePaidEnrollment does.
      await prisma.virtualInternshipEnrollment.update({
        where: { id: week.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${week.body.data.id}` },
      });

      // Student then starts (but doesn't pay for) the other track — a newer,
      // still-pending row now exists with a later createdAt than the paid one.
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'MONTH' })
        .expect(201);

      const mine = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/me`)
        .set(auth(student.token))
        .expect(200);
      expect(mine.body.data.id).toBe(week.body.data.id);
      expect(mine.body.data.track).toBe('WEEK');
      expect(mine.body.data.status).toBe('ACTIVE');
    });

    it('enrollments/me/active returns both tracks when a student holds two concurrent ACTIVE enrollments', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Both Tracks Student' });

      const week = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);
      const month = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'MONTH' })
        .expect(201);
      await prisma.virtualInternshipEnrollment.update({
        where: { id: week.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${week.body.data.id}` },
      });
      await prisma.virtualInternshipEnrollment.update({
        where: { id: month.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${month.body.data.id}` },
      });

      const active = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/me/active`)
        .set(auth(student.token))
        .expect(200);
      const ids = active.body.data.map((e: { id: string }) => e.id);
      expect(ids).toContain(week.body.data.id);
      expect(ids).toContain(month.body.data.id);
      expect(active.body.data.every((e: { status: string }) => e.status === 'ACTIVE')).toBe(true);
    });

    it("403s a student fetching another student's enrollment tasks", async () => {
      const owner = await registerVerifiedUser(app, { fullName: 'VI Owner Student' });
      const intruder = await registerVerifiedUser(app, { fullName: 'VI Intruder Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(owner.token))
        .send({ track: 'WEEK' })
        .expect(201);
      await prisma.virtualInternshipEnrollment.update({
        where: { id: enroll.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${enroll.body.data.id}` },
      });

      await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enroll.body.data.id}/tasks`)
        .set(auth(intruder.token))
        .expect(403);
      await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enroll.body.data.id}/invoice`)
        .set(auth(intruder.token))
        .expect(403);
    });

    it('admin backfill creates tasks for an ACTIVE enrollment with none, and is idempotent', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Backfill Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);

      // Simulate an enrollment that was activated before task auto-creation
      // existed: ACTIVE, but zero task rows.
      await prisma.virtualInternshipEnrollment.update({
        where: { id: enroll.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date() },
      });

      const enrollmentId = enroll.body.data.id;
      const before = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(before.body.data.tasks).toHaveLength(0);

      const backfill = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/backfill-missing-tasks`)
        .set(auth(admin.token))
        .send({})
        .expect(201);
      expect(backfill.body.data.backfilledEnrollmentIds).toContain(enrollmentId);

      const after = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(after.body.data.tasks).toHaveLength(4);

      // Re-running must not duplicate tasks or error.
      const again = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/backfill-missing-tasks`)
        .set(auth(admin.token))
        .send({})
        .expect(201);
      expect(again.body.data.backfilledEnrollmentIds).not.toContain(enrollmentId);

      const stillFour = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(stillFour.body.data.tasks).toHaveLength(4);
    });

    it('403s a non-admin hitting the backfill endpoint', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Backfill RBAC Student' });
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/backfill-missing-tasks`)
        .set(auth(student.token))
        .send({})
        .expect(403);
    });
  });

  describe('Virtual Internship — tasks, review, certificate, invoice (admin RBAC)', () => {
    let student: TestUser;
    let enrollmentId: string;
    let taskIds: string[] = [];

    beforeAll(async () => {
      student = await registerVerifiedUser(app, { fullName: 'VI Task Flow Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);
      enrollmentId = enroll.body.data.id;

      // Bypass the real Razorpay checkout/verify flow — not exercised anywhere in this
      // suite (it would require a live network call to Razorpay's order API) — by
      // reproducing exactly what VirtualInternshipService.activatePaidEnrollment does.
      await prisma.virtualInternshipEnrollment.update({
        where: { id: enrollmentId },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${enrollmentId}` },
      });
      await prisma.virtualInternshipTask.createMany({
        data: [1, 2, 3, 4].map((taskIndex) => ({ enrollmentId, taskIndex })),
      });
    });

    it('lists 4 tasks, only the first unlocked', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(res.body.data.progress).toBe(0);
      expect(res.body.data.tasks).toHaveLength(4);
      expect(res.body.data.tasks[0].unlocked).toBe(true);
      expect(res.body.data.tasks[1].unlocked).toBe(false);
      taskIds = res.body.data.tasks.map((t: { id: string }) => t.id);
    });

    it('rejects submitting a still-locked task', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks/2/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/too-early' })
        .expect(403);
    });

    it('403s a non-admin hitting the admin submission queue', async () => {
      await request(app.getHttpServer())
        .get(`${API}/internships/virtual/admin/submissions`)
        .set(auth(student.token))
        .expect(403);
    });

    it('student submits task 1, it appears in the admin review queue, admin approves it', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks/1/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/week1' })
        .expect(201);

      const queue = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/admin/submissions`)
        .set(auth(admin.token))
        .expect(200);
      const submitted = queue.body.data.find((t: { id: string }) => t.id === taskIds[0]);
      expect(submitted).toBeTruthy();
      expect(submitted.enrollment.userId).toBe(student.userId);

      const reviewed = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/submissions/${taskIds[0]}/review`)
        .set(auth(admin.token))
        .send({ approve: true, reviewNote: 'Nice work' })
        .expect(201);
      expect(reviewed.body.data.status).toBe('APPROVED');
    });

    it('task 2 unlocks after task 1 is approved; progress reflects one of four', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(res.body.data.progress).toBe(0.25);
      expect(res.body.data.tasks[1].unlocked).toBe(true);
    });

    it('reward documents are forbidden before all tasks are approved', async () => {
      await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/documents/letter/download`)
        .set(auth(student.token))
        .expect(403);
    });

    it('submits and approves tasks 2-4, issuing a certificate on the 4th approval', async () => {
      for (let i = 1; i < taskIds.length; i += 1) {
        await request(app.getHttpServer())
          .post(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks/${i + 1}/submit`)
          .set(auth(student.token))
          .send({ submissionUrl: `https://example.com/week${i + 1}` })
          .expect(201);
        await request(app.getHttpServer())
          .post(`${API}/internships/virtual/admin/submissions/${taskIds[i]}/review`)
          .set(auth(admin.token))
          .send({ approve: true })
          .expect(201);
      }

      const certs = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token))
        .expect(200);
      const cert = certs.body.data.find((c: { title: string }) => c.title.includes('Virtual Internship'));
      expect(cert).toBeTruthy();
    });

    it('progress is 100% and the invoice + reward documents download as real PDFs', async () => {
      const tasksRes = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(tasksRes.body.data.progress).toBe(1);

      const invoice = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/invoice`)
        .set(auth(student.token))
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(invoice.headers['content-type']).toContain('application/pdf');
      expect(invoice.body.slice(0, 4).toString('utf8')).toBe('%PDF');

      const letter = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/documents/letter/download`)
        .set(auth(student.token))
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(letter.body.slice(0, 4).toString('utf8')).toBe('%PDF');

      const report = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/documents/report/download`)
        .set(auth(student.token))
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(report.body.slice(0, 4).toString('utf8')).toBe('%PDF');
    });

    it('admin enrollment list + stats reflect this student', async () => {
      const list = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/admin/enrollments?track=WEEK`)
        .set(auth(admin.token))
        .expect(200);
      expect(list.body.data.some((e: { id: string }) => e.id === enrollmentId)).toBe(true);

      const stats = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/admin/stats`)
        .set(auth(admin.token))
        .expect(200);
      expect(stats.body.data.active).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Virtual Internship — per-track curriculum size', () => {
    it('backfill creates 4 tasks for an ACTIVE WEEK enrollment with none', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Week Curriculum Size Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);
      await prisma.virtualInternshipEnrollment.update({
        where: { id: enroll.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date() },
      });

      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/backfill-missing-tasks`)
        .set(auth(admin.token))
        .send({})
        .expect(201);

      const tasksRes = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enroll.body.data.id}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(tasksRes.body.data.tasks).toHaveLength(4);
      expect(tasksRes.body.data.tasks[0].title).toBe('Week 1 — Setup, page shell and Home');
      expect(tasksRes.body.data.trackNote).toContain('Personal portfolio website');
    });

    it('backfill creates 16 tasks (4 months of 4) for an ACTIVE MONTH enrollment with none', async () => {
      const student = await registerVerifiedUser(app, { fullName: 'VI Month Curriculum Size Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'MONTH' })
        .expect(201);
      await prisma.virtualInternshipEnrollment.update({
        where: { id: enroll.body.data.id },
        data: { status: 'ACTIVE', paidAt: new Date() },
      });

      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/backfill-missing-tasks`)
        .set(auth(admin.token))
        .send({})
        .expect(201);

      const tasksRes = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enroll.body.data.id}/tasks`)
        .set(auth(student.token))
        .expect(200);
      expect(tasksRes.body.data.tasks).toHaveLength(16);
      expect(tasksRes.body.data.tasks[0].title).toBe('Week 1 — Project setup and layout shell');
      expect(tasksRes.body.data.tasks[0].monthNumber).toBe(1);
      expect(tasksRes.body.data.tasks[0].monthTitle).toBe('Frontend foundation');
      expect(tasksRes.body.data.tasks[15].title).toBe('Week 16 — Audit, walkthrough and certify');
      expect(tasksRes.body.data.tasks[15].monthNumber).toBe(4);
      expect(tasksRes.body.data.trackNote).toContain('Simple blog website');
    });
  });

  describe('Virtual Internship — admin-assigned custom task', () => {
    let student: TestUser;
    let enrollmentId: string;
    let taskIds: string[] = [];
    let task5Id: string;

    beforeAll(async () => {
      // WEEK track: still exactly 4 curriculum tasks, so taskIndex 5 is
      // unambiguously "beyond the curriculum" = a custom task. (MONTH now has
      // 16 real curriculum tasks, so index 5 there is a legitimate Week 5 task,
      // not an available custom slot — see "per-track curriculum size" above.)
      student = await registerVerifiedUser(app, { fullName: 'VI Custom Task Student' });
      const enroll = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(student.token))
        .send({ track: 'WEEK' })
        .expect(201);
      enrollmentId = enroll.body.data.id;

      await prisma.virtualInternshipEnrollment.update({
        where: { id: enrollmentId },
        data: { status: 'ACTIVE', paidAt: new Date(), razorpayPaymentId: `test_pay_${enrollmentId}` },
      });
      await prisma.virtualInternshipTask.createMany({
        data: [1, 2, 3, 4].map((taskIndex) => ({ enrollmentId, taskIndex })),
      });

      const tasksRes = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      taskIds = tasksRes.body.data.tasks.map((t: { id: string }) => t.id);
    });

    it('403s a non-admin assigning a task', async () => {
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .send({ title: 'Extra polish pass' })
        .expect(403);
    });

    it('rejects assigning a task to a PENDING_PAYMENT enrollment', async () => {
      const other = await registerVerifiedUser(app, { fullName: 'VI Unpaid Student' });
      const pending = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enroll`)
        .set(auth(other.token))
        .send({ track: 'WEEK' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/enrollments/${pending.body.data.id}/tasks`)
        .set(auth(admin.token))
        .send({ title: 'Too early' })
        .expect(403);
    });

    it('admin assigns a 5th task, appearing as taskIndex 5 with its own title/description', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/enrollments/${enrollmentId}/tasks`)
        .set(auth(admin.token))
        .send({ title: 'Extra polish pass', description: 'Add dark mode support to the dashboard.' })
        .expect(201);
      expect(res.body.data.taskIndex).toBe(5);
      expect(res.body.data.title).toBe('Extra polish pass');
      expect(res.body.data.description).toBe('Add dark mode support to the dashboard.');
      task5Id = res.body.data.id;
    });

    it('approving all 4 curriculum tasks does NOT yet issue a certificate — task 5 is still pending', async () => {
      for (let i = 0; i < taskIds.length; i += 1) {
        await request(app.getHttpServer())
          .post(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks/${i + 1}/submit`)
          .set(auth(student.token))
          .send({ submissionUrl: `https://example.com/month${i + 1}` })
          .expect(201);
        await request(app.getHttpServer())
          .post(`${API}/internships/virtual/admin/submissions/${taskIds[i]}/review`)
          .set(auth(admin.token))
          .send({ approve: true })
          .expect(201);
      }

      const certs = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token))
        .expect(200);
      const cert = certs.body.data.find((c: { sourceId: string }) => c.sourceId === enrollmentId);
      expect(cert).toBeFalsy();

      // Reward documents must also still be forbidden — 4/5 tasks approved, not all.
      await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/documents/letter/download`)
        .set(auth(student.token))
        .expect(403);
    });

    it('task 5 is now unlocked; approving it issues the certificate and unlocks reward documents', async () => {
      const tasksRes = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks`)
        .set(auth(student.token))
        .expect(200);
      const task5 = tasksRes.body.data.tasks.find((t: { taskIndex: number }) => t.taskIndex === 5);
      expect(task5.unlocked).toBe(true);
      expect(task5.description).toBe('Add dark mode support to the dashboard.');

      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/enrollments/${enrollmentId}/tasks/5/submit`)
        .set(auth(student.token))
        .send({ submissionUrl: 'https://example.com/dark-mode' })
        .expect(201);
      await request(app.getHttpServer())
        .post(`${API}/internships/virtual/admin/submissions/${task5Id}/review`)
        .set(auth(admin.token))
        .send({ approve: true })
        .expect(201);

      const certs = await request(app.getHttpServer())
        .get(`${API}/internships/certificates/me`)
        .set(auth(student.token))
        .expect(200);
      const cert = certs.body.data.find((c: { sourceId: string }) => c.sourceId === enrollmentId);
      expect(cert).toBeTruthy();

      const invoice = await request(app.getHttpServer())
        .get(`${API}/internships/virtual/enrollments/${enrollmentId}/documents/report/download`)
        .set(auth(student.token))
        .buffer(true)
        .parse(binaryParser)
        .expect(200);
      expect(invoice.body.slice(0, 4).toString('utf8')).toBe('%PDF');
    });
  });
});
