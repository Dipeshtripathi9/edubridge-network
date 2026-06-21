import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community admin tools (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let owner: TestUser; // community ADMIN (creator)
  let target: TestUser; // member to moderate
  let other: TestUser; // plain member
  let gAdmin: TestUser; // global admin (for verify-review)
  let slug: string;

  const post = (token: string) =>
    request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(token))
      .send({ body: `msg ${Date.now()}` });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    owner = await registerVerifiedUser(app, { fullName: 'Owner' });
    target = await registerVerifiedUser(app, { fullName: 'Target' });
    other = await registerVerifiedUser(app, { fullName: 'Other' });
    gAdmin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Global Admin' });

    const res = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(owner.token))
      .send({ name: `Mod Topic ${Date.now()}`, type: 'TOPIC', topic: 'Mod' })
      .expect(201);
    slug = res.body.data.slug;

    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(target.token));
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(other.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('exposes myRole=ADMIN to the creator', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/communities/${slug}`)
      .set(auth(owner.token))
      .expect(200);
    expect(res.body.data.myRole).toBe('ADMIN');
  });

  it('blocks a plain member from moderating', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${target.userId}/moderate`)
      .set(auth(other.token))
      .send({ action: 'mute' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`${API}/communities/${slug}/members/${target.userId}/role`)
      .set(auth(other.token))
      .send({ role: 'ADMIN' })
      .expect(403);
  });

  it('mutes a member (cannot post) then unmutes', async () => {
    await post(target.token).expect(201); // can post before
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${target.userId}/moderate`)
      .set(auth(owner.token))
      .send({ action: 'mute', minutes: 60 })
      .expect(201);
    await post(target.token).expect(403); // muted
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${target.userId}/moderate`)
      .set(auth(owner.token))
      .send({ action: 'unmute' })
      .expect(201);
    await post(target.token).expect(201); // unmuted
  });

  it('bans a member (cannot post) then unbans', async () => {
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${target.userId}/moderate`)
      .set(auth(owner.token))
      .send({ action: 'ban' })
      .expect(201);
    await post(target.token).expect(403);
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${target.userId}/moderate`)
      .set(auth(owner.token))
      .send({ action: 'unban' })
      .expect(201);
    await post(target.token).expect(201);
  });

  it('promotes a member role', async () => {
    const res = await request(app.getHttpServer())
      .patch(`${API}/communities/${slug}/members/${target.userId}/role`)
      .set(auth(owner.token))
      .send({ role: 'MODERATOR' })
      .expect(200);
    expect(res.body.data.role).toBe('MODERATOR');
  });

  it('toggles review verification (moderator/admin)', async () => {
    // A verified student posts an (auto-verified) review.
    const college = await prisma.college.create({
      data: { name: `Mod College ${Date.now()}`, slug: `mod-college-${Date.now()}` },
    });
    await prisma.profile.update({
      where: { userId: target.userId },
      data: { collegeId: college.id, collegeVerification: 'VERIFIED' },
    });
    const review = await request(app.getHttpServer())
      .post(`${API}/colleges/${college.id}/reviews`)
      .set(auth(target.token))
      .send({ category: 'HOSTEL', rating: 4, body: 'Decent' })
      .expect(201);
    expect(review.body.data.isVerified).toBe(true);

    // A normal student cannot verify; a global admin can.
    await request(app.getHttpServer())
      .post(`${API}/reviews/${review.body.data.id}/verify`)
      .set(auth(other.token))
      .expect(403);
    const toggled = await request(app.getHttpServer())
      .post(`${API}/reviews/${review.body.data.id}/verify`)
      .set(auth(gAdmin.token))
      .expect(201);
    expect(toggled.body.data.isVerified).toBe(false);
  });
});
