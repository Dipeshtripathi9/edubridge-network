import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Private community read gate (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let outsider: TestUser;
  let slug: string;
  let postId: string;

  beforeAll(async () => {
    app = await createTestApp();
    owner = await registerVerifiedUser(app, { fullName: 'Owner' });
    outsider = await registerVerifiedUser(app, { fullName: 'Outsider' });

    const community = await request(app.getHttpServer())
      .post(`${API}/communities`)
      .set(auth(owner.token))
      .send({ name: `Private ${Date.now()}`, type: 'TOPIC', topic: 'Secret', visibility: 'PRIVATE' })
      .expect(201);
    slug = community.body.data.slug;

    const post = await request(app.getHttpServer())
      .post(`${API}/communities/${slug}/posts`)
      .set(auth(owner.token))
      .send({ body: 'Members only' })
      .expect(201);
    postId = post.body.data.id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('blocks a non-member from reading a private community feed', async () => {
    await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/posts`)
      .set(auth(outsider.token))
      .expect(403);
  });

  it('blocks anonymous access to a private post and its comments', async () => {
    await request(app.getHttpServer()).get(`${API}/posts/${postId}`).expect(403);
    await request(app.getHttpServer()).get(`${API}/posts/${postId}/comments`).expect(403);
  });

  it('allows a member (the owner) to read the private feed', async () => {
    await request(app.getHttpServer())
      .get(`${API}/communities/${slug}/posts`)
      .set(auth(owner.token))
      .expect(200);
  });
});
