import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API, auth, createTestApp, registerVerifiedUser, TestUser } from './helpers';

describe('Resource Hub (e2e)', () => {
  let app: INestApplication;
  let owner: TestUser;
  let other: TestUser;
  let resourceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    owner = await registerVerifiedUser(app, { fullName: 'Uploader' });
    other = await registerVerifiedUser(app, { fullName: 'Other' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('returns a presigned upload target (dev fallback when S3 is unconfigured)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/resources/upload-url`)
      .set(auth(owner.token))
      .send({ fileName: 'dsa-notes.pdf', contentType: 'application/pdf' })
      .expect(201);
    expect(res.body.data.key).toContain('resources/');
    expect(typeof res.body.data.configured).toBe('boolean');
  });

  it('creates a resource and lists it', async () => {
    const res = await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(owner.token))
      .send({
        type: 'NOTES',
        title: `OS Notes ${Date.now()}`,
        fileKey: 'resources/test-key.pdf',
        tags: ['os', 'notes'],
      })
      .expect(201);
    resourceId = res.body.data.id;

    const list = await request(app.getHttpServer()).get(`${API}/resources?tag=os`).expect(200);
    expect(list.body.data.some((r: { id: string }) => r.id === resourceId)).toBe(true);
  });

  it('rejects an invalid resource type (400)', async () => {
    await request(app.getHttpServer())
      .post(`${API}/resources`)
      .set(auth(owner.token))
      .send({ type: 'BOGUS', title: 'x', fileKey: 'k' })
      .expect(400);
  });

  it('rates a resource and updates the average', async () => {
    await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/rate`)
      .set(auth(owner.token))
      .send({ value: 5 })
      .expect(201);
    await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/rate`)
      .set(auth(other.token))
      .send({ value: 3 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`${API}/resources/${resourceId}`)
      .set(auth(owner.token))
      .expect(200);
    expect(res.body.data.avgRating).toBe(4); // (5 + 3) / 2
    expect(res.body.data.ratingCount).toBe(2);
    expect(res.body.data.myRating).toBe(5);
  });

  it('toggles a bookmark and lists it', async () => {
    const on = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/bookmark`)
      .set(auth(other.token))
      .expect(201);
    expect(on.body.data.bookmarked).toBe(true);

    const mine = await request(app.getHttpServer())
      .get(`${API}/resources/bookmarks/me`)
      .set(auth(other.token))
      .expect(200);
    expect(mine.body.data.some((r: { id: string }) => r.id === resourceId)).toBe(true);

    const off = await request(app.getHttpServer())
      .post(`${API}/resources/${resourceId}/bookmark`)
      .set(auth(other.token))
      .expect(201);
    expect(off.body.data.bookmarked).toBe(false);
  });

  it('records a download and returns a URL', async () => {
    const res = await request(app.getHttpServer())
      .get(`${API}/resources/${resourceId}/download`)
      .set(auth(other.token))
      .expect(200);
    expect(res.body.data.url).toBeTruthy();

    const after = await request(app.getHttpServer()).get(`${API}/resources/${resourceId}`).expect(200);
    expect(after.body.data.downloadCount).toBe(1);
  });

  it('awards reputation to the uploader', async () => {
    const rep = await request(app.getHttpServer())
      .get(`${API}/reputation/me`)
      .set(auth(owner.token))
      .expect(200);
    expect(rep.body.data.points).toBeGreaterThanOrEqual(8); // RESOURCE_UPLOADED
  });

  it('forbids a non-owner from deleting, allows the owner', async () => {
    await request(app.getHttpServer())
      .delete(`${API}/resources/${resourceId}`)
      .set(auth(other.token))
      .expect(403);
    await request(app.getHttpServer())
      .delete(`${API}/resources/${resourceId}`)
      .set(auth(owner.token))
      .expect(200);
  });
});
