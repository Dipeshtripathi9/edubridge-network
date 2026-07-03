import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Manager → Admin support requests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let manager: TestUser; // holds a non-MEMBER role in a community
  let plain: TestUser; // just a member
  let admin: TestUser;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    manager = await registerVerifiedUser(app, { fullName: 'Lead Manager' });
    plain = await registerVerifiedUser(app, { fullName: 'Plain Member' });
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Platform Admin' });

    const stamp = Date.now();
    const community = await prisma.community.create({
      data: { name: `Support Topic ${stamp}`, slug: `support-topic-${stamp}`, type: 'TOPIC', topic: 'S', memberCount: 0 },
    });
    communityId = community.id;
    // manager leads it; plain is a normal member
    await prisma.communityMember.create({
      data: { communityId, userId: manager.userId, role: 'CAMPUS_LEAD' },
    });
    await prisma.communityMember.create({
      data: { communityId, userId: plain.userId, role: 'MEMBER' },
    });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('lets a community manager contact the admin team; blocks a plain member', async () => {
    await request(app.getHttpServer())
      .post(`${API}/leadership/support`)
      .set(auth(manager.token))
      .send({ topic: 'REFERRAL', message: 'Could you refer me for a frontend role?' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API}/leadership/support`)
      .set(auth(plain.token))
      .send({ topic: 'GENERAL', message: 'hi' })
      .expect(403);
  });

  it('validates the topic', async () => {
    await request(app.getHttpServer())
      .post(`${API}/leadership/support`)
      .set(auth(manager.token))
      .send({ topic: 'NONSENSE', message: 'x' })
      .expect(400);
  });

  it('admin can list requests; non-admin cannot; admin can resolve', async () => {
    await request(app.getHttpServer())
      .get(`${API}/leadership/support`)
      .set(auth(manager.token))
      .expect(403);

    const list = await request(app.getHttpServer())
      .get(`${API}/leadership/support`)
      .set(auth(admin.token))
      .expect(200);
    const mine = list.body.data.find((r: { user: { id: string } }) => r.user.id === manager.userId);
    expect(mine).toBeTruthy();
    expect(mine.topic).toBe('REFERRAL');
    expect(mine.status).toBe('OPEN');

    const resolved = await request(app.getHttpServer())
      .patch(`${API}/leadership/support/${mine.id}/resolve`)
      .set(auth(admin.token))
      .expect(200);
    expect(resolved.body.data.status).toBe('RESOLVED');
  });
});
