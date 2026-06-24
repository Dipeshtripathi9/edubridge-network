import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

/**
 * Each manager role is locked to its own job:
 *  - Opportunity Head: approve opportunities (not moderation/announcements)
 *  - Student Relations Head: resolve help (not moderation)
 *  - Moderator: moderation (not opportunity approval)
 *  - Campus Lead: everything
 */
describe('Per-role action locks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser; // platform admin (creator)
  let oppHead: TestUser;
  let srHead: TestUser;
  let moderator: TestUser;
  let member: TestUser;
  let slug: string;
  let communityId: string;

  const appoint = (email: string, role: string) =>
    request(app.getHttpServer())
      .post(`${API}/communities/${slug}/appoint-head`)
      .set(auth(admin.token))
      .send({ email, role })
      .expect(201);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    oppHead = await registerVerifiedUser(app, { fullName: 'Opp Head' });
    srHead = await registerVerifiedUser(app, { fullName: 'SR Head' });
    moderator = await registerVerifiedUser(app, { fullName: 'Mod' });
    member = await registerVerifiedUser(app, { fullName: 'Member' });

    const c = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Locks ${Date.now()}`, type: 'STARTUP' })
      .expect(201);
    slug = c.body.data.slug;
    communityId = c.body.data.id;

    await appoint(oppHead.email, 'OPPORTUNITY_HEAD');
    await appoint(srHead.email, 'STUDENT_RELATIONS_HEAD');
    await appoint(moderator.email, 'MODERATOR');
    await request(app.getHttpServer()).post(`${API}/communities/${slug}/join`).set(auth(member.token));
  });
  afterAll(async () => {
    await app?.close();
  });

  it('Opportunity Head approves opportunities but cannot moderate or announce', async () => {
    const opp = await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(member.token))
      .send({ type: 'INTERNSHIP', title: 'Intern', description: 'x', communityId })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API}/opportunities/${opp.body.data.id}/approve`)
      .set(auth(oppHead.token))
      .expect(201);

    // cannot ban a member (moderation)
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${member.userId}/moderate`)
      .set(auth(oppHead.token))
      .send({ action: 'ban' })
      .expect(403);

    // cannot post an announcement
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(oppHead.token))
      .send({ body: 'nope', kind: 'ANNOUNCEMENT' })
      .expect(403);
  });

  it('Moderator moderates but cannot approve opportunities', async () => {
    const opp = await request(app.getHttpServer())
      .post(`${API}/opportunities`)
      .set(auth(member.token))
      .send({ type: 'INTERNSHIP', title: 'Intern 2', description: 'x', communityId })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/opportunities/${opp.body.data.id}/approve`)
      .set(auth(moderator.token))
      .expect(403);

    // can mute a member
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${member.userId}/moderate`)
      .set(auth(moderator.token))
      .send({ action: 'mute', minutes: 30 })
      .expect(201);
  });

  it('Student Relations Head resolves help but cannot moderate', async () => {
    const help = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help`)
      .set(auth(member.token))
      .send({ body: 'help me' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help/${help.body.data.id}/resolve`)
      .set(auth(srHead.token))
      .expect(201);

    // a Moderator cannot resolve help
    const help2 = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help`)
      .set(auth(member.token))
      .send({ body: 'again' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/help/${help2.body.data.id}/resolve`)
      .set(auth(moderator.token))
      .expect(403);
  });

  it('Campus Lead can do everything', async () => {
    await prisma.communityMember.updateMany({
      where: { communityId, userId: oppHead.userId },
      data: { role: 'CAMPUS_LEAD' },
    });
    // now the same user can moderate + announce
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/members/${member.userId}/moderate`)
      .set(auth(oppHead.token))
      .send({ action: 'unmute' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(oppHead.token))
      .send({ body: 'Lead announcement', kind: 'ANNOUNCEMENT' })
      .expect(201);
  });
});
