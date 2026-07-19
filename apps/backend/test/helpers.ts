import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

export const API = '/api/v1';

/** Boots the Nest app configured exactly like production (main.ts) for e2e. */
export async function createTestApp(): Promise<INestApplication> {
  // Throttling is bypassed under NODE_ENV=test via AppThrottlerGuard, so e2e
  // flows that hammer auth endpoints aren't rate-limited.
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();
  return app;
}

let counter = 0;
export function uniqueEmail(prefix = 'e2e'): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}@example.com`;
}

export interface TestUser {
  email: string;
  userId: string;
  token: string;
}

/**
 * Register a user, mark them verified directly in the DB (the verification token
 * is emailed, which we can't read in tests), then log in and return the token.
 */
export async function registerVerifiedUser(
  app: INestApplication,
  opts: { role?: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN'; fullName?: string; unverified?: boolean } = {},
): Promise<TestUser> {
  const prisma = app.get(PrismaService);
  const email = uniqueEmail();
  const password = 'Str0ngPass';

  await request(app.getHttpServer())
    .post(`${API}/auth/signup`)
    .send({ email, password, fullName: opts.fullName ?? 'E2E User' })
    .expect(201);

  await prisma.user.update({
    where: { email },
    data: { status: 'ACTIVE', emailVerifiedAt: new Date(), role: opts.role ?? 'STUDENT' },
  });

  const res = await request(app.getHttpServer())
    .post(`${API}/auth/login`)
    .send({ email, password })
    .expect(201);

  const userId = res.body.data.user.id;
  // College-verify by default (matches the helper name). Pass { unverified: true }
  // to opt out.
  if (!opts.unverified) {
    await prisma.profile.update({ where: { userId }, data: { collegeVerification: 'VERIFIED' } });
  }

  return { email, userId, token: res.body.data.tokens.accessToken };
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** Bind the app to a random free port (required for Socket.IO tests) and return it. */
export async function listen(app: INestApplication): Promise<number> {
  await app.listen(0);
  const address = app.getHttpServer().address();
  if (address && typeof address === 'object') return address.port;
  throw new Error('Could not determine listening port');
}
