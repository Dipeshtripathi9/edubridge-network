import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, createTestApp } from './helpers';

describe('Magic email link auth (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app?.close();
  });

  it('requests a link, then signs in (creating the account)', async () => {
    const req = await request(app.getHttpServer())
      .post(`${API}/auth/magic/request`)
      .send({ email: 'magic.e2e@example.com', fullName: 'Magic E2E' })
      .expect(201);
    // Non-production returns the link directly so it's testable without SMTP.
    const devLink: string = req.body.data.devLink;
    expect(devLink).toContain('/auth/callback?token=');
    const token = devLink.split('token=')[1];

    const verify = await request(app.getHttpServer())
      .post(`${API}/auth/magic/verify`)
      .send({ token })
      .expect(201);
    expect(verify.body.data.user.email).toBe('magic.e2e@example.com');
    expect(verify.body.data.tokens.accessToken).toBeTruthy();
  });

  it('rejects an invalid token', async () => {
    await request(app.getHttpServer())
      .post(`${API}/auth/magic/verify`)
      .send({ token: 'not-a-real-token' })
      .expect(400);
  });

  it('does not reuse a consumed token', async () => {
    const req = await request(app.getHttpServer())
      .post(`${API}/auth/magic/request`)
      .send({ email: 'magic.reuse@example.com' })
      .expect(201);
    const token = req.body.data.devLink.split('token=')[1];
    await request(app.getHttpServer()).post(`${API}/auth/magic/verify`).send({ token }).expect(201);
    await request(app.getHttpServer()).post(`${API}/auth/magic/verify`).send({ token }).expect(400);
  });
});
