import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end auth flow. Requires a running Postgres + Redis (see infra/docker-compose.yml)
 * and a valid DATABASE_URL/REDIS_URL. Run with: npm run test:e2e -w @edubridge/backend
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const email = `e2e_${Date.now()}@example.com`;
  const password = 'Str0ngPass';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects weak passwords on signup', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({ email, password: 'weak', fullName: 'Test User' })
      .expect(400);
  });

  it('signs up a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({ email, password, fullName: 'Test User' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
  });

  it('blocks login before email verification', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(403);
  });
});
