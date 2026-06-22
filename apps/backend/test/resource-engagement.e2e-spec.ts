import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Resource engagement — like / comment / share (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let other: TestUser;
  let resourceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    owner = await registerVerifiedUser(app, { fullName: 'Owner' });
    other = await registerVerifiedUser(app, { fullName: 'Other' });
    const res = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(owner.token))
      .send({ type: 'NOTES', title: `Engage Notes ${Date.now()}`, fileKey: 'resources/k.pdf' })
      .expect(201);
    resourceId = res.body.data.id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('toggles a like and reflects likedByMe + count', async () => {
    const liked = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/like`)
      .set(auth(other.token))
      .expect(201);
    expect(liked.body.data.liked).toBe(true);

    const one = await request(app.getHttpServer())
      .get(`${API}/resources/${resourceId}`)
      .set(auth(other.token))
      .expect(200);
    expect(one.body.data.likeCount).toBe(1);
    expect(one.body.data.likedByMe).toBe(true);

    // and in the list
    const list = await request(app.getHttpServer())
      .get(`${API}/resources?limit=50`)
      .set(auth(other.token))
      .expect(200);
    const inList = list.body.data.find((r: { id: string }) => r.id === resourceId);
    expect(inList.likedByMe).toBe(true);

    // un-like
    const unliked = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/like`)
      .set(auth(other.token))
      .expect(201);
    expect(unliked.body.data.liked).toBe(false);
  });

  it('adds and lists comments', async () => {
    await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/comments`)
      .set(auth(other.token))
      .send({ body: 'Super useful, thanks!' })
      .expect(201);

    const comments = await request(app.getHttpServer())
      .get(`${API}/resources/${resourceId}/comments`)
      .expect(200);
    expect(comments.body.data.length).toBe(1);
    expect(comments.body.data[0].body).toBe('Super useful, thanks!');

    const one = await request(app.getHttpServer())
      .get(`${API}/resources/${resourceId}`)
      .expect(200);
    expect(one.body.data.commentCount).toBe(1);
  });

  it('increments the share counter (public)', async () => {
    const shared = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/share`)
      .expect(201);
    expect(shared.body.data.shareCount).toBe(1);
  });
});
