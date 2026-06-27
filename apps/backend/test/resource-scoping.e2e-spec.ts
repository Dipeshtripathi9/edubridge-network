import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Resource scoping by community type (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: TestUser;
  let user: TestUser;
  let collegeCommunityId: string;
  let topicCommunityId: string;
  let collegeResId: string;
  let topicResId: string;

  const stamp = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    admin = await registerVerifiedUser(app, { role: 'ADMIN', fullName: 'Admin' });
    user = await registerVerifiedUser(app, { fullName: 'Uploader' });

    const college = await prisma.college.create({
      data: { name: `Scope College ${stamp}`, slug: `scope-college-${stamp}` },
    });
    const collegeCommunity = await prisma.community.create({
      data: {
        name: `Scope College ${stamp}`,
        slug: `scope-college-community-${stamp}`,
        type: 'COLLEGE',
        collegeId: college.id,
      },
    });
    collegeCommunityId = collegeCommunity.id;

    const topic = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(admin.token))
      .send({ name: `Scope Topic ${stamp}`, type: 'TOPIC', topic: 'Scope' })
      .expect(201);
    topicCommunityId = topic.body.data.id;

    const r1 = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(user.token))
      .send({ type: 'NOTES', title: `College Note ${stamp}`, externalUrl: 'https://drive.google.com/c', communityId: collegeCommunityId })
      .expect(201);
    collegeResId = r1.body.data.id;

    const r2 = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(user.token))
      .send({ type: 'NOTES', title: `Topic Note ${stamp}`, externalUrl: 'https://drive.google.com/t', communityId: topicCommunityId })
      .expect(201);
    topicResId = r2.body.data.id;
  });
  afterAll(async () => {
    await app?.close();
  });

  const has = (body: { data: { id: string }[] }, id: string) => body.data.some((r) => r.id === id);

  it('shows a college resource only inside its own community', async () => {
    const inCommunity = await request(app.getHttpServer())
      .get(`${API}/resources?communityId=${collegeCommunityId}&limit=100`)
      .expect(200);
    expect(has(inCommunity.body, collegeResId)).toBe(true);
  });

  it('hides college resources from the global feed but keeps topic ones', async () => {
    const global = await request(app.getHttpServer()).get(`${API}/resources?limit=100`).expect(200);
    expect(has(global.body, topicResId)).toBe(true); // topic → global
    expect(has(global.body, collegeResId)).toBe(false); // college → community-only
  });

  it('still shows the topic resource inside its community too', async () => {
    const inTopic = await request(app.getHttpServer())
      .get(`${API}/resources?communityId=${topicCommunityId}&limit=100`)
      .expect(200);
    expect(has(inTopic.body, topicResId)).toBe(true);
  });
});
