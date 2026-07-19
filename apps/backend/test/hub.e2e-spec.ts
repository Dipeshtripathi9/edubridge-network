import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('College Hub (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser;
  let student: TestUser;
  let collegeId: string;
  let collegeSlug: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Hub Admin' });
    student = await registerVerifiedUser(app, { fullName: 'Hub Student' });

    const stamp = Date.now();
    collegeSlug = `hub-college-${stamp}`;
    const college = await prisma.college.create({
      data: { name: `Hub College ${stamp}`, slug: collegeSlug, city: 'Pune', state: 'Maharashtra' },
    });
    collegeId = college.id;
    // Make the student a verified student of this college (counts toward the header).
    await prisma.profile.update({
      where: { userId: student.userId },
      data: { collegeId, collegeVerification: 'VERIFIED' },
    });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('returns the hub overview with header counts', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/colleges/${collegeSlug}/hub`)
      .expect(200);
    expect(res.body.data.college.slug).toBe(collegeSlug);
    expect(res.body.data).not.toHaveProperty('community');
    expect(res.body.data.counts.verifiedStudents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.counts).not.toHaveProperty('members');
    expect(res.body.data.counts).toHaveProperty('faqs');
  });

  it('manages FAQs (admin create → public list → delete)', async () => {
    const created = await request(app.getHttpServer())
      .post(`${API}/colleges/${collegeId}/faqs`)
      .set(auth(admin.token))
      .send({ question: 'Is attendance mandatory?', answer: '75% minimum.', order: 1 })
      .expect(201);
    const faqId = created.body.data.id;

    const list = await request(app.getHttpServer())
      .get(`${API}/colleges/${collegeId}/faqs`)
      .expect(200);
    expect(list.body.data.some((f: { id: string }) => f.id === faqId)).toBe(true);

    // A student cannot create FAQs.
    await request(app.getHttpServer())
      .post(`${API}/colleges/${collegeId}/faqs`)
      .set(auth(student.token))
      .send({ question: 'x', answer: 'y' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`${API}/faqs/${faqId}`)
      .set(auth(admin.token))
      .expect(200);
  });

  it('scopes opportunities to the college', async () => {
    await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(admin.token))
      .send({
        type: 'INTERNSHIP',
        title: `College Intern ${Date.now()}`,
        description: 'Scoped to this college',
        collegeId,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`${API}/opportunities?collegeId=${collegeId}`)
      .expect(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.every((o: { id: string }) => !!o.id)).toBe(true);
  });

  it('scopes resources to the college and supports featuring', async () => {
    const created = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(student.token))
      .send({ type: 'NOTES', title: `College Notes ${Date.now()}`, fileKey: 'resources/k.pdf', collegeId })
      .expect(201);
    const resourceId = created.body.data.id;

    const scoped = await request(app.getHttpServer())
      .get(`${API}/resources?collegeId=${collegeId}`)
      .expect(200);
    expect(scoped.body.data.some((r: { id: string }) => r.id === resourceId)).toBe(true);

    // Student cannot feature; admin can.
    await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/feature`)
      .set(auth(student.token))
      .expect(403);
    const featured = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/feature`)
      .set(auth(admin.token))
      .expect(201);
    expect(featured.body.data.isFeatured).toBe(true);
  });
});
