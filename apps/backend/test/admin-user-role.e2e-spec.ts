import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Admin setUserRole guards (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser;
  let superAdmin: TestUser;
  let student: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    superAdmin = await registerVerifiedUser(app, { role: 'SUPER_ADMIN', fullName: 'Super' });
    student = await registerVerifiedUser(app, { fullName: 'Student' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('an admin cannot change their own role (no self-escalation)', async () => {
    await request(app.getHttpServer())
      .patch(`${API}/admin/users/${admin.userId}/role`)
      .set(auth(admin.token))
      .send({ role: 'SUPER_ADMIN' })
      .expect(403);
    const row = await prisma.user.findUnique({ where: { id: admin.userId } });
    expect(row?.role).toBe('ADMIN');
  });

  it('an admin cannot change a super admin’s role', async () => {
    await request(app.getHttpServer())
      .patch(`${API}/admin/users/${superAdmin.userId}/role`)
      .set(auth(admin.token))
      .send({ role: 'STUDENT' })
      .expect(403);
    const row = await prisma.user.findUnique({ where: { id: superAdmin.userId } });
    expect(row?.role).toBe('SUPER_ADMIN');
  });

  it('an admin can still change a regular user’s role', async () => {
    await request(app.getHttpServer())
      .patch(`${API}/admin/users/${student.userId}/role`)
      .set(auth(admin.token))
      .send({ role: 'MODERATOR' })
      .expect(200);
    const row = await prisma.user.findUnique({ where: { id: student.userId } });
    expect(row?.role).toBe('MODERATOR');
  });
});
