# EduBridge Network — Production Backend Architecture

This is the master architecture document for EduBridge Network at ~20k users, built
to scale to 50k+ registered users without a database redesign. It is grounded in the
**system that already exists in this repository** — it is not a greenfield proposal.

> **Key architectural decision — read first.** The backend is a **NestJS 10** service
> (`apps/backend`), not Next.js API routes + NextAuth. This is deliberate and correct
> for a REST API of this size: NestJS gives modular DI, guards, interceptors, DTO
> validation, and a testable structure that Next.js route handlers do not. **Rewriting
> to NextAuth would be a large, risky regression that throws away 169 passing e2e tests
> for no functional gain.** Your auth *requirements* (Google OAuth + email magic link,
> 15-minute single-use tokens, no password/OTP) are already satisfied by the NestJS auth
> module. Recommendation: **keep NestJS**; use Next.js only for the frontend (`apps/web`).

Companion docs: [`apps/backend/SCALING.md`](apps/backend/SCALING.md),
[`apps/backend/EMAIL-SETUP.md`](apps/backend/EMAIL-SETUP.md).

---

## 1. What already exists (spec → reality)

| Your requirement | Status in repo |
|---|---|
| Prisma + PostgreSQL | ✅ `apps/backend/prisma/schema.prisma` — **59 models, 26 enums** |
| Google OAuth | ✅ `auth/services/google.service.ts` (`OAuthAccount` model) |
| Email magic link, 15-min, single-use | ✅ `auth.service.ts` `requestMagicLink`/`verifyMagicLink` (`EmailVerification`) |
| Amazon SES / email | ✅ SMTP `MailService` (SES is just SMTP creds — see EMAIL-SETUP.md) |
| Redis cache + rate limiting | ✅ `redis/`, `@nestjs/throttler` (Redis store in prod) |
| Cloudflare R2 media storage | ✅ S3-compatible `StorageService` + presigned URLs; `S3_ENDPOINT` → R2 |
| Never store images in Postgres | ✅ Only object keys/URLs stored; bytes live in R2/S3 |
| Search (colleges/posts/users/…) | ✅ `search/` module (Postgres ILIKE; Meilisearch-ready) |
| Admin panel models | ✅ `admin/`, `Report`, `AuditLog`, `Role`/`Permission`/`RolePermission`, `Setting` |
| Notifications | ✅ `Notification` + `NotificationType` enum + SSE stream |
| RBAC, audit logs, reputation, badges | ✅ present |
| Cursor pagination | ✅ `common/dto/pagination.dto.ts` (`buildPaginatedResult`) |
| Rate limiting, helmet, Zod-style validation | ✅ throttler + `helmet()` + `class-validator` DTOs |

The models cover your entire table list. Mapping of your names → existing models:

- Accounts → `OAuthAccount`; Verification Tokens → `EmailVerification`
- Likes → `Reaction`; Bookmarks/Saved posts → `Bookmark`
- Scholarships/Internships/Events → `Opportunity` + `OpportunityType` enum
- Achievements → `Badge`/`UserBadge`; Reputation Points → `ReputationEvent`
- Feature Flags/Settings → `Setting`; Roles/Permissions → `Role`/`Permission`/`RolePermission`
- Support Tickets → `Complaint`/`HelpRequest`/`ManagerSupportRequest`
- Media Files → object keys via `StorageService`; Email Logs → app logs (see gaps)

### Gap status
1. **Soft delete** — ✅ already implemented on `Post` (`deletedAt` + `status=REMOVED`), `Comment`, `Review`, `Application`, `Resource`, `ManagerSupportRequest`, `User`; read queries filter `deletedAt: null`.
2. **Email Logs** — ✅ `EmailLog` model added; every send records `SENT | FAILED | SKIPPED` (+ error, kind) via `MailService`; admin view at `GET /api/v1/admin/email-logs`.
3. **Search** is Postgres ILIKE — fine to 50k; swap to Meilisearch when result quality/latency demands (interface already isolated in `search.service.ts`). *Deliberately deferred — not needed at current scale.*
4. **CSP** header — deliberately deferred until third-party origins are finalized, because a strict Content-Security-Policy must allow-list Google OAuth (`accounts.google.com` script/frame/connect) and Next's inline bootstrap, and a wrong policy silently breaks login. The high-value headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`) are already enforced.

---

## 2. ER diagram (text, by domain)

```
IDENTITY & AUTH
  User 1─1 Profile
  User 1─* OAuthAccount        (provider, providerUserId)   ← Google
  User 1─* Session / Device
  User 1─* EmailVerification   (purpose: EMAIL_VERIFY | MAGIC_LINK | PASSWORD_RESET)
  User *─* Role (via implicit)  Role *─* Permission (via RolePermission)

ACADEMIC
  University 1─* College
  College 1─* CollegeCutoff / CollegeFaq
  College 1─* Review *─1 User            Review 1─* ReviewVote
  College 1─* Community (type=COLLEGE)

COMMUNITY & CONTENT
  Community 1─* CommunityMember *─1 User      (role: CAMPUS_LEAD, MODERATOR, …)
  Community 1─* Post *─1 User (author)
  Post 1─* Comment (self-ref parentId → replies)
  Post/Comment 1─* Reaction (LIKE…) *─1 User
  Post 1─* Bookmark *─1 User
  Post 1─1 Poll 1─* PollOption 1─* PollVote

OPPORTUNITIES & TRANSFER
  Opportunity *─1 College/Community    Opportunity 1─* Application *─1 User
  Transfer *─1 User, *─1 College(to)   College 1─* TransferRequirement

RESOURCES / NETWORK / MESSAGING
  Resource 1─* ResourceLike/Comment/Rating/Bookmark/Download
  Community 1─* Pool 1─* PoolMember/PoolLike
  Chat 1─* ChatParticipant, 1─* Message *─1 User(sender)

ENGAGEMENT & GOVERNANCE
  User 1─* Notification / ReputationEvent / UserBadge
  User 1─* Report / AuditLog / Complaint / VerificationRequest
  Community-manager → admin: ManagerSupportRequest
  Leads: MentorRequest, AgencyLead, RentalLead, Referral, DiscountClaim, AdCard
```

Every relation uses explicit foreign keys with `onDelete` rules; see `schema.prisma`.

---

## 3. Authentication (as implemented)

Two methods, per your spec:

- **Continue with Google** — OAuth; auto-creates `User` + `Profile` on first login, stores
  verified email, avatar, full name; links an `OAuthAccount`.
- **Continue with Email (magic link)** — `POST /auth/magic-link` issues an `EmailVerification`
  (`purpose=MAGIC_LINK`, 15-min expiry, single-use, token stored **hashed**); the emailed link
  hits `/auth/callback?token=…` → `verifyMagicLink` → session issued. No OTP, no password, no phone.

Sessions: short-lived JWT **access token** + rotating **refresh token**; refresh rotation on use;
tokens are opaque + hashed at rest. (A legacy password login also exists; disable it in the UI if
you truly want only the two methods — no schema change needed.)

**Security controls in place:** `helmet()` secure headers, CORS allow-list, `ValidationPipe`
(`whitelist + forbidNonWhitelisted`) → strips unknown fields (mass-assignment / injection defense),
Prisma parameterized queries (**no SQL injection**), rate limiting (`@nestjs/throttler`, Redis-backed
in prod), email-enumeration protection (generic responses on forgot-password/magic-link), single-use +
short-expiry tokens (**replay protection**), and the web app sets `X-Frame-Options`, `nosniff`,
`Referrer-Policy`, `Permissions-Policy`, `HSTS`. Add **CSP** when third-party origins are finalized.

---

## 4. API architecture (REST surface)

Base: `/api/v1`. One controller per domain, DTO-validated, guard-protected:

```
auth · users · colleges · colleges/faqs · communities · communities/posts ·
communities/comments · communities/head-applications · reviews · opportunities ·
resources · transfer · notifications · search · pools · messaging · reputation ·
referrals · mentors · leadership · complaints · ads · agency · rentals ·
admin · admin/reports · health · verification
```

Conventions: cursor pagination on all list endpoints; `@Public()` for open reads;
`@Roles(ADMIN, SUPER_ADMIN)` for admin; optional-auth pattern (guard runs even on public
routes so `@CurrentUser('sub')` personalizes when a token is present). Responses use a uniform
envelope via `ResponseInterceptor`; errors via `HttpExceptionFilter`. OpenAPI/Swagger at
`/api/v1/docs`.

---

## 5. Folder structure

```
apps/
  backend/                 NestJS API (source of truth for all data)
    src/
      <domain>/            module = controller + service + dto (auth, communities, …)
      common/              guards, decorators, interceptors, filters, pagination
      config/              configuration.ts (all env → typed config)
      prisma/ redis/ mail/ storage/   infrastructure modules
    prisma/schema.prisma   59 models
    test/                  169 e2e specs
  web/                     Next.js 15 App Router frontend (UI only; calls the API)
```

---

## 6. Deployment guide

| Component | Recommended | Notes |
|---|---|---|
| **Frontend** (`apps/web`) | **Vercel** | Auto CDN, edge caching of `/_next/static` (immutable). Set `NEXT_PUBLIC_API_URL`. |
| **Backend** (`apps/backend`) | **Railway / Render / Fly.io** container | Builds `output: standalone`. Run ≥2 replicas. Set all env. |
| **Database** | **Neon** (or Supabase/RDS) Postgres | Use the **pooled** connection string; `prisma migrate deploy` on release. |
| **Redis** | **Upstash** | Cache + rate-limit + Socket.IO adapter. `allkeys-lru` eviction. |
| **Media** | **Cloudflare R2** | Set `S3_ENDPOINT=https://<acct>.r2.cloudflarestorage.com`, `AWS_REGION=auto`, bucket + keys. **Zero egress fees.** |
| **CDN** | **Cloudflare** | In front of R2 public bucket + the web app. |
| **Email** | **Amazon SES** | SMTP creds → `SMTP_*`; verify domain (SPF/DKIM/DMARC). See EMAIL-SETUP.md. |

Release steps: (1) provision the six services; (2) set env on backend host & Vercel;
(3) `prisma migrate deploy`; (4) load data (`pg_restore` from a `scripts/backup-db.sh` dump);
(5) deploy backend, then frontend; (6) smoke-test `/api/v1/health`.

Required env (backend): `DATABASE_URL`, `REDIS_URL`, `APP_URL`, `CORS_ORIGINS`,
`JWT_*` secrets, `GOOGLE_CLIENT_ID/SECRET`, `SMTP_*`, `AWS_*`/`S3_ENDPOINT`, `NODE_ENV=production`.

---

## 7. Performance optimization (in place + guidance)

- **Indexes**: every hot query path (FKs, filter+sort combos, cursor orderings) has a covering
  `@@index`; composite indexes e.g. `Post(communityId, createdAt desc)`, `Notification(recipientId, isRead, createdAt desc)`.
- **Cursor pagination** everywhere (no `OFFSET` scans).
- **No N+1**: Prisma `include`/`select` fetch relations in one round-trip; list endpoints select only needed fields.
- **Redis cache-aside** on hot reads (`RedisService.remember`) with short TTL + pattern invalidation.
- **Connection pooling** via PgBouncer/Neon pooler; size Prisma `connection_limit` per replica.
- **Transactions** (`prisma.$transaction`) for multi-write consistency (e.g. reset-password, votes).
- **Frontend**: persisted React Query cache, `keepPreviousData`, `content-visibility`, small bundles, service worker.

---

## 8. Cost optimization (and *why* each choice saves money)

| Choice | Why it's cheap |
|---|---|
| **Cloudflare R2** for media | **$0 egress** — the usual bandwidth bill (S3 charges ~$0.09/GB out) disappears; you pay only ~$0.015/GB stored. |
| **Never store bytes in Postgres** | DB stays small (fast backups, cheap tier); media scales independently on object storage. |
| **Neon serverless Postgres** | Scales to zero / autoscales; 50k users' relational data is a few GB → low tier. |
| **Upstash Redis** (pay-per-request) | No idle server cost; caching cuts DB reads → smaller DB tier needed. |
| **Amazon SES** | ~$0.10 per 1,000 emails vs. bundled ESP pricing; verified domain avoids deliverability spend. |
| **Vercel + Cloudflare CDN** | Immutable hashed static assets cached at edge → near-zero origin egress. |
| **Cache-aside + cursor paging** | Fewer/cheaper DB queries → you stay on a smaller Postgres tier longer. |
| **Stateless replicas + autoscale** | Scale on demand; pay for actual load, not peak provisioning. |

Rough monthly at 50k users / few-thousand DAU: Postgres (Neon) low tier, Redis (Upstash)
usage tier, R2 pennies/GB with no egress, SES cents per thousand, Vercel hobby/pro,
backend container(s) — comfortably low three figures or less.

---

## 9. Backup strategy

- **Automated daily** managed backups + **Point-in-Time Recovery** (Neon/RDS/Supabase give this out of the box) — retain 7–30 days.
- **On-demand logical dumps**: `./scripts/backup-db.sh` (`pg_dump -Fc`), stored off-host (R2/Drive). Keep the last 14.
- **Media** (R2): enable bucket versioning; optionally replicate to a second bucket/region.
- **Test restores quarterly** — a backup you haven't restored is a hope, not a backup.

## 10. Disaster recovery

- **RPO ≤ 5 min** (PITR), **RTO ≤ 1 hr**. Runbook:
  1. Provision a new Postgres from PITR/latest snapshot.
  2. Point `DATABASE_URL` at it; `prisma migrate deploy` (no-op if current).
  3. Redeploy stateless backend replicas (they hold no state).
  4. Redis is a cache — cold start rebuilds it; no recovery needed.
  5. Media persists in R2 (versioned); no action.
- Keep secrets in the host's secret manager (not just `.env`) so a fresh environment can be rebuilt fast.

## 11. Scaling plan: 50k → 500k users

The schema and app **do not need a redesign** to reach 500k. Scale operationally, in order of need:

1. **DB**: add **read replicas**; route reads (feeds, listings, college pages) to replicas, writes to primary. Ensure **PgBouncer** in transaction mode.
2. **App tier**: more stateless replicas behind the LB (already Socket.IO-Redis-adapter + Redis-throttler ready for multi-instance).
3. **Search**: move from Postgres ILIKE to **Meilisearch/OpenSearch** (interface isolated).
4. **Cache**: raise Redis tier; add cache to more read paths; consider edge caching public pages.
5. **Media**: R2 + Cloudflare CDN already scale effectively infinitely.
6. **Async work**: introduce a **BullMQ (Redis) queue** for email, notifications, feed fan-out, reputation — moves latency off the request path.
7. **Observability**: add metrics/tracing (OpenTelemetry) + `pg_stat_statements` review to find the next bottleneck before it bites.

At 500k the shape is: primary + N read replicas, PgBouncer, 3–10 API replicas autoscaled,
managed Redis, dedicated search cluster, R2+CDN for media, SES for email, a worker tier for queues.
