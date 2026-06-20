import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, uniqueEmail } from './helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });
  afterAll(async () => {
    await app?.close();
  });

  it('rejects a weak password on signup (400)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/auth/signup`)
      .send({ email: uniqueEmail(), password: 'weak', fullName: 'X' })
      .expect(400);
  });

  it('rejects unknown extra fields (whitelist, 400)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/auth/signup`)
      .send({ email: uniqueEmail(), password: 'Str0ngPass', fullName: 'X', isAdmin: true })
      .expect(400);
  });

  it('signs up, blocks login until verified, then logs in', async () => {
    const email = uniqueEmail();
    const password = 'Str0ngPass';

    const signup = await request(app.getHttpServer())
      .post(`${API}/auth/signup`)
      .send({ email, password, fullName: 'Pending User' })
      .expect(201);
    expect(signup.body.success).toBe(true);
    expect(signup.body.data.user.email).toBe(email);
    expect(signup.body.data.user.passwordHash).toBeUndefined(); // never leak the hash

    // Not verified yet → 403
    await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({ email, password })
      .expect(403);

    await prisma.user.update({
      where: { email },
      data: { status: 'ACTIVE', emailVerifiedAt: new Date() },
    });

    const login = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({ email, password })
      .expect(201);
    expect(login.body.data.tokens.accessToken).toBeDefined();
    expect(login.body.data.tokens.refreshToken).toBeDefined();
  });

  it('rejects bad credentials (401)', async () => {
    const user = await registerVerifiedUser(app);
    await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({ email: user.email, password: 'WrongPass1' })
      .expect(401);
  });

  it('rotates the refresh token and revokes the old one', async () => {
    const user = await registerVerifiedUser(app);
    const login = await request(app.getHttpServer())
      .post(`${API}/auth/login`)
      .send({ email: user.email, password: 'Str0ngPass' })
      .expect(201);
    const oldRefresh = login.body.data.tokens.refreshToken;

    const refreshed = await request(app.getHttpServer())
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: oldRefresh })
      .expect(201);
    expect(refreshed.body.data.accessToken).toBeDefined();

    // Reusing the rotated (revoked) token must fail.
    await request(app.getHttpServer())
      .post(`${API}/auth/refresh`)
      .send({ refreshToken: oldRefresh })
      .expect(401);
  });

  it('GET /auth/me requires a valid token', async () => {
    const user = await registerVerifiedUser(app);
    await request(app.getHttpServer()).get(`${API}/auth/me`).expect(401);
    const me = await request(app.getHttpServer())
      .get(`${API}/auth/me`)
      .set(auth(user.token))
      .expect(200);
    expect(me.body.data.sub).toBe(user.userId);
  });

  it('forgot-password never reveals whether an email exists', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/auth/forgot-password`)
      .send({ email: 'definitely-not-real@example.com' })
      .expect(201);
    expect(res.body.success).toBe(true);
  });
});
