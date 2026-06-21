# API

Base URL: `http://localhost:4000/api/v1` · Interactive docs (Swagger): `/api/v1/docs`

## Conventions

- **Response envelope**: `{ "success": true, "data": ... }`. Paginated: `{ "success": true, "data": [...], "meta": { total?, page, limit, hasMore, nextCursor } }`.
- **Errors**: `{ "success": false, "statusCode", "error", "message", "path", "timestamp" }`.
- **Auth**: `Authorization: Bearer <accessToken>`. Public routes are marked `@Public()`.
- **Pagination**: `?page=&limit=` (offset) or `?cursor=<lastId>&limit=` (infinite scroll). `limit` max 100.
- **Rate limiting**: global throttle + stricter per-route limits on auth endpoints.

## Auth flow

1. `POST /auth/signup` → creates user (PENDING_VERIFICATION), sends verification email.
2. `POST /auth/verify-email` `{ token }` → activates account.
3. `POST /auth/login` `{ email, password, rememberMe? }` → `{ tokens, user }`. Argon2 verify; 5 failed attempts → 15-min lock.
4. Use `accessToken` (15 min). When it expires, `POST /auth/refresh` `{ refreshToken }` → rotates and returns a new pair (old refresh token revoked; reuse is detected).
5. `POST /auth/logout` (current session) / `POST /auth/logout-all` (all devices).

Alternatives: `POST /auth/google` `{ idToken }` · `POST /auth/otp/request` `{ phone }` then `POST /auth/otp/verify` `{ phone, code }`. Recovery: `POST /auth/forgot-password` / `POST /auth/reset-password`.

## Endpoints by module

### Users
- `GET /users/me` · `PATCH /users/me` · `PUT /users/me/onboarding` · `GET /users/me/sessions` · `GET /users/:username`

### Communities
- `GET /communities` (filters: `type`, `topic`, `collegeId`, `q`) · `POST /communities`
- `GET /communities/:slug` · `POST /communities/:slug/join` · `DELETE /communities/:slug/leave` · `GET /communities/:slug/members`

### Posts
- `GET /communities/:slug/posts` (feed, cursor) · `POST /communities/:slug/posts`
- `GET /posts/:id` · `DELETE /posts/:id`
- `POST /posts/:id/like` · `POST /posts/:id/bookmark` · `POST /posts/:id/share` · `POST /posts/:id/poll/vote` `{ optionIds }`

### Comments
- `GET /posts/:postId/comments` · `POST /posts/:postId/comments` `{ body, parentId? }`
- `DELETE /comments/:id` · `POST /comments/:id/like` · `POST /comments/:id/helpful`

### Transfer Hub
- `POST /transfer/eligibility` `{ cgpa, currentYear, branch, currentCollegeId?, creditTransferOnly? }` → ranked eligible colleges with requirements, deadlines, fees, credit-transfer compatibility (public)
- `GET /transfer/colleges/:collegeId/requirements` (public)
- `GET /transfer/me` · `POST /transfer` · `PATCH /transfer/:id` · `DELETE /transfer/:id` (journey tracking)
- `POST /transfer/:id/story` (share a story) · `GET /transfer/stories` · `GET /transfer/stories/:id` (public)
- `POST /transfer/requirements` (admin — ingest transfer data)

### Opportunity Hub
- `GET /opportunities` (filters: `type`, `q`, `tag`, `isRemote`, `sort=deadline|recent`) (public)
- `GET /opportunities/recommended` → interest-based recommendations
- `GET /opportunities/:id` (public) · `POST /opportunities` · `PATCH /opportunities/:id` · `DELETE /opportunities/:id` (owner/admin)
- `POST /opportunities/:id/application` `{ status, notes? }` (save/apply/track) · `GET /opportunities/applications/me` · `DELETE /opportunities/applications/:applicationId`

### Colleges & Community Hub
- `GET /colleges` (filters: `q`, `state`, `sort=rank|rating|name`) (public)
- `GET /colleges/:slug` (public)
- `GET /colleges/:slug/hub` → **College Community Hub** overview: college + linked community + counts (members, verified students/admins, posts, reviews, resources, opportunities, faqs) (public)
- **FAQs**: `GET /colleges/:collegeId/faqs` (public) · `POST /colleges/:collegeId/faqs` · `PATCH /faqs/:id` · `DELETE /faqs/:id` (admin)
- College-scoping: `GET /opportunities?collegeId=` and `GET /resources?collegeId=` return that college's items; `GET /transfer/stories?toCollegeId=` for transfer stories.
- Moderation: `POST /posts/:id/pin` (community mod/admin — pinned posts surface first) · `POST /resources/:id/feature` (mod/admin — featured first).
- Posts accept a `kind` (DISCUSSION/QUESTION/PLACEMENT_EXPERIENCE/INTERNSHIP_EXPERIENCE/RESOURCE_SHARE/POLL).

### College Reviews
- `POST /colleges/:collegeId/reviews` `{ category, rating, title?, body }` — **verified students only**
- `GET /colleges/:collegeId/reviews` (filter `category`, `sort=top|recent`) (public)
- `GET /colleges/:collegeId/reviews/summary` → overall + per-category ratings (public)
- `POST /reviews/:id/vote` `{ value: 1 | -1 }` · `DELETE /reviews/:id` (author/moderator)

### Resource Hub
- `POST /resources/upload-url` `{ fileName, contentType }` → presigned S3 PUT (or dev stub)
- `POST /resources` `{ type, title, description?, fileKey, tags? }` (after upload)
- `GET /resources` (filters: `type`, `q`, `tag`, `sort=recent|top|downloads`) (public) · `GET /resources/:id` (public)
- `GET /resources/:id/download` → records download + returns signed URL
- `POST /resources/:id/rate` `{ value: 1-5 }` · `POST /resources/:id/bookmark` · `GET /resources/bookmarks/me` · `DELETE /resources/:id`

### Messaging (REST)
- `GET /chats` → my chats with last message, unread counts, online status
- `POST /chats/direct` `{ userId }` → get/create a 1:1 chat · `POST /chats/community/:communityId` (members only)
- `GET /chats/:chatId/messages` (cursor paginated) · `POST /chats/:chatId/messages` `{ body }` (REST fallback; also broadcasts) · `POST /chats/:chatId/read`

### Messaging (WebSocket — Socket.IO, namespace `/ws`)
Connect with `auth: { token: <accessToken> }`. JWT-authenticated; presence is Redis ref-counted.
- **Emit**: `chat:join` `{chatId}`, `chat:leave` `{chatId}`, `message:send` `{chatId, body}`, `typing` `{chatId, isTyping}`, `message:read` `{chatId}`
- **Receive**: `message:new` (message), `chat:updated` `{chatId, message}`, `typing` `{chatId, userId, isTyping}`, `message:read` `{chatId, userId}`, `presence:update` `{userId, online}`

### Notifications
- `GET /notifications` (`?unread=true`) · `GET /notifications/unread-count`
- `POST /notifications/:id/read` · `POST /notifications/read-all` · `DELETE /notifications/:id`
- `POST /notifications/broadcast` `{ type, title, body?, link? }` (admin)
- **Real-time** (over the `/ws` socket): `notification:new` (full row) on likes/comments/mentions/messages; `notifications:refresh` after broadcasts. Triggered automatically by post likes, comments, mentions (Communities) and new messages (Messaging).

### Reputation & Badges
- `GET /reputation/leaderboard` (`?collegeId=`) → ranked top contributors (public)
- `GET /reputation/badges` → all badges (public) · `GET /reputation/users/:userId` (public)
- `GET /reputation/me` → my points, badges, recent events
- **Awards** (automatic): post +5, comment +2, helpful answer +10 (to the answerer), received like +1, review +20, resource upload +8. Badges auto-granted at thresholds (Contributor 50 · Campus Expert 200 · Community Leader 1000) and by activity (Placement Expert: a placement review · Transfer Expert: a public transfer story); earning a badge fires a `BADGE_EARNED` notification.

### Reports (user-facing)
- `POST /reports` `{ targetType, targetId, reportedUserId?, reason, details? }`

### Admin (role-gated: ADMIN / SUPER_ADMIN)
- `GET /admin/analytics` → DAU/MAU, stickiness, content counts, top communities/colleges/contributors, open reports
- `GET /admin/users` (`?q=&status=&role=`) · `PATCH /admin/users/:id/status` · `PATCH /admin/users/:id/role` · `PATCH /admin/users/:id/verify-college`
- `GET /admin/reports` (`?status=`) · `POST /admin/reports/:id/resolve` `{ status, note? }`
- `DELETE /admin/content` `{ type: post|comment|review|resource, id }` (soft-delete)
- `GET /admin/audit-logs`
- Every admin action writes an `AuditLog`; banning/suspending revokes the user's sessions. The notification **broadcast** tool is `POST /notifications/broadcast` (admin).

### Global Search
- `GET /search?q=` → grouped results across colleges, communities, people, opportunities, resources, reviews (with per-type counts) (public)
- `GET /search?q=&type=<entity>&page=&limit=` → paginated single-type results (infinite scroll) (public)
- `POST /search/reindex` (admin) → rebuild the Elasticsearch index from Postgres
- Uses Elasticsearch (fuzzy multi-field) when reachable; **falls back to Postgres** automatically when ES is unavailable, so search always works.

### Health
- `GET /health` → DB + Redis status (public)

> All modules from the product spec are implemented. File storage uses S3 when `AWS_*` env vars are set (else metadata-only dev mode); search uses Elasticsearch when reachable (else Postgres fallback). Email/push delivery and write-through search indexing would attach as BullMQ queue consumers for production scale.
