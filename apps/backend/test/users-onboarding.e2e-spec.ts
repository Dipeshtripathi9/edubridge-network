import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser } from './helpers';

describe('Onboarding backfills signupIntent (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('sets signupIntent to COLLEGE_ADMISSIONS on first onboarding completion', async () => {
    const user = await registerVerifiedUser(app);

    const res = await request(app.getHttpServer())
      .put(`${API}/users/me/onboarding`)
      .set(auth(user.token))
      .send({ course: 'B.Tech' })
      .expect(200);
    expect(res.body.data.signupIntent).toBe('COLLEGE_ADMISSIONS');

    const stored = await prisma.profile.findUnique({ where: { userId: user.userId } });
    expect(stored?.signupIntent).toBe('COLLEGE_ADMISSIONS');
  });

  it('never overwrites a signupIntent already on file', async () => {
    const user = await registerVerifiedUser(app);
    await prisma.profile.update({
      where: { userId: user.userId },
      data: { signupIntent: 'INTERNSHIPS_JOBS' },
    });

    const res = await request(app.getHttpServer())
      .put(`${API}/users/me/onboarding`)
      .set(auth(user.token))
      .send({ course: 'B.Tech' })
      .expect(200);
    expect(res.body.data.signupIntent).toBe('INTERNSHIPS_JOBS');
  });
});
