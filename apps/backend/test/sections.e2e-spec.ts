import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Community sections + opportunity approval (e2e)', () => {
  let app: INestApplication;
  let head: TestUser; // community ADMIN (creator)
  let member: TestUser;
  let slug: string;
  let communityId: string;

  beforeAll(async () => {
    app = await createTestApp();
    head = await registerVerifiedUser(app, { fullName: 'Head' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });
    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(head.token))
      .send({ name: `Sections Topic ${Date.now()}`, type: 'TOPIC', topic: 'Sections' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  describe('Announcements (restricted)', () => {
    it('blocks a member from posting an announcement', async () => {
      await request(app.getHttpServer())
        .post(`${API}/communities/${slug}/posts`)
        .set(auth(member.token))
        .send({ body: 'I am not allowed', kind: 'ANNOUNCEMENT' })
        .expect(403);
    });

    it('lets a head post an announcement; it shows only in the Announcements section', async () => {
      await request(app.getHttpServer())
        .post(`${API}/communities/${slug}/posts`)
        .set(auth(head.token))
        .send({ body: 'Welcome everyone!', kind: 'ANNOUNCEMENT' })
        .expect(201);

      const ann = await request(app.getHttpServer())
        .get(`${API}/communities/${slug}/posts?section=ANNOUNCEMENTS`)
        .expect(200);
      expect(ann.body.data.length).toBe(1);
      expect(ann.body.data[0].kind).toBe('ANNOUNCEMENT');

      const disc = await request(app.getHttpServer())
        .get(`${API}/communities/${slug}/posts?section=DISCUSSION`)
        .expect(200);
      expect(disc.body.data.some((p: { kind: string }) => p.kind === 'ANNOUNCEMENT')).toBe(false);
    });

    it('a member discussion lands in Discussion, not Announcements', async () => {
      await request(app.getHttpServer())
        .post(`${API}/communities/${slug}/posts`)
        .set(auth(member.token))
        .send({ body: 'Anyone up for practice?' })
        .expect(201);
      const disc = await request(app.getHttpServer())
        .get(`${API}/communities/${slug}/posts?section=DISCUSSION`)
        .expect(200);
      expect(disc.body.data.length).toBe(1);
    });
  });

  describe('Opportunity submit → approval → publish', () => {
    let oppId: string;

    it('member submission is pending and not public', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/opportunities`)
        .set(auth(member.token))
        .send({ type: 'INTERNSHIP', title: 'Member Intern', description: 'pls approve', communityId })
        .expect(201);
      oppId = res.body.data.id;
      expect(res.body.data.approvalStatus).toBe('PENDING');

      const pub = await request(app.getHttpServer())
        .get(`${API}/opportunities?communityId=${communityId}`)
        .expect(200);
      expect(pub.body.data.some((o: { id: string }) => o.id === oppId)).toBe(false);
    });

    it('non-manager cannot view the pending queue', async () => {
      await request(app.getHttpServer())
        .get(`${API}/opportunities/pending?communityId=${communityId}`)
        .set(auth(member.token))
        .expect(403);
    });

    it('head sees pending, approves, and it becomes public', async () => {
      const pending = await request(app.getHttpServer())
        .get(`${API}/opportunities/pending?communityId=${communityId}`)
        .set(auth(head.token))
        .expect(200);
      expect(pending.body.data.some((o: { id: string }) => o.id === oppId)).toBe(true);

      await request(app.getHttpServer())
        .post(`${API}/opportunities/${oppId}/approve`)
        .set(auth(head.token))
        .expect(201);

      const pub = await request(app.getHttpServer())
        .get(`${API}/opportunities?communityId=${communityId}`)
        .expect(200);
      expect(pub.body.data.some((o: { id: string }) => o.id === oppId)).toBe(true);
    });
  });
});
