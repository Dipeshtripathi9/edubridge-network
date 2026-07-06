# EduBridge Network — Production Runbook

Live, card-free, **$0/month** deployment. This documents exactly how production is
wired, how to operate it, and how to recover it.

> Companion docs: `DEPLOYMENT.md` (managed-services walkthrough), `infra/DEPLOY.md`
> (alternative single-VPS/Docker path), `ARCHITECTURE.md`.

---

## 1. What runs where

| Layer | Provider (free tier) | URL / identifier |
|---|---|---|
| Frontend (Next.js) | **Vercel** | https://edubridgenetwork.in (+ `www`) |
| Backend API + WebSockets (NestJS) | **Render** (Docker web service `edubridge-api`) | https://api.edubridgenetwork.in — internal: `https://edubridge-api-v5i9.onrender.com` |
| PostgreSQL | **Neon** (region: `ap-southeast-1`) | host `ep-raspy-scene-aofn4gw8.c-2.ap-southeast-1.aws.neon.tech`, db `neondb` |
| Redis (cache, throttler, Socket.IO, BullMQ) | **Upstash** | `stable-mite-100884.upstash.io:6379` (TLS) |
| DNS + domain | **GoDaddy** | `edubridgenetwork.in` |
| Media uploads (S3) | *not configured* | StorageService runs in metadata-only mode |
| Email (SMTP) | *not configured* | signups auto-activate via `AUTO_VERIFY_EMAIL=true` |

All four hosting accounts sign in with GitHub — **no credit card** anywhere.

Deploy config lives in the repo: **`render.yaml`** (Render Blueprint). The backend
Docker image runs `prisma migrate deploy` then `node dist/src/main` on start.

---

## 2. DNS records (at GoDaddy)

| Type | Name | Value | Points to |
|---|---|---|---|
| A | `@` | `216.198.79.1` | Vercel (frontend) |
| CNAME | `www` | `cname.vercel-dns.com` | Vercel (frontend) |
| CNAME | `api` | `edubridge-api-v5i9.onrender.com` | Render (backend) |

TLS certificates are issued automatically by Vercel and Render.

---

## 3. Environment variables

### Backend — Render (`edubridge-api` → Environment)
Defined in `render.yaml`; secrets are set in the dashboard (`sync: false`).

| Key | Notes |
|---|---|
| `NODE_ENV` | `production` (in blueprint) |
| `AUTO_VERIFY_EMAIL` | `true` (in blueprint) — activates email/password signups instantly since there is no SMTP |
| `DATABASE_URL` | Neon **direct** URL (no `-pooler`), `?sslmode=require` |
| `REDIS_URL` | Upstash URL, must start with **`rediss://`** (TLS) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | long random hex, distinct |
| `CORS_ORIGINS` | `https://edubridgenetwork.in,https://www.edubridgenetwork.in` |
| `APP_URL` | `https://edubridgenetwork.in` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client id |

### Frontend — Vercel (Project → Settings → Environment Variables)
These are **build-time** (baked into the browser bundle) — changing one requires a redeploy.

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.edubridgenetwork.in/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `https://api.edubridgenetwork.in` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web client id |

> **Never commit real secret values.** Store the actual `DATABASE_URL`, `REDIS_URL`,
> and JWT secrets in the Render dashboard only.

---

## 4. Deploying changes

Both services **auto-deploy from `main`** (Render via `render.yaml` `autoDeploy`,
Vercel via its GitHub integration).

```bash
# make changes on a branch, open a PR, let CI pass, merge to main
git checkout -b my-change
# ... edit ...
git commit -am "feat: my change"
git push -u origin my-change
gh pr create --fill
# merge → Render + Vercel redeploy automatically
```

- Backend DB migrations apply automatically on each deploy (`prisma migrate deploy`).
- Changed a `NEXT_PUBLIC_*` value? Redeploy the frontend so it re-bakes.

Manual redeploy: Render → `edubridge-api` → **Manual Deploy → Deploy latest commit**;
Vercel → Deployments → **Redeploy**.

---

## 5. Data: local ↔ production

Production data lives in **Neon**. Your Mac's local Postgres is **dev-only** and does
**not** sync automatically. To copy local → production (as done at launch):

```bash
LOCAL="postgresql://edubridge:edubridge@localhost:5432/edubridge"
NEON="postgresql://neondb_owner:<PASSWORD>@ep-raspy-scene-aofn4gw8.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 1. dump local (custom format)
pg_dump "$LOCAL" -Fc -f local.dump

# 2. WARNING: this REPLACES everything in Neon
psql "$NEON" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pg_restore --no-owner --no-acl --no-comments -d "$NEON" local.dump

# 3. verify
psql "$NEON" -tA -c "select 'users='||count(*) from users; select 'communities='||count(*) from communities;"
```

Only safe to `DROP SCHEMA` when production has no data you need to keep. Prefer
restoring into an empty DB; the local and repo schemas must be at the same latest
migration (`apps/backend/prisma/migrations` newest folder).

### Seeds (base data instead of a restore)
```bash
# base data: colleges, FAQs, interest communities, opportunity catalog
DATABASE_URL="$NEON" npm run db:seed -w @edubridge/backend
# supplementary .mjs seeders live in apps/backend/prisma/seed-*.mjs
```

---

## 6. Backups

```bash
# on-demand production backup → timestamped custom-format dump
NEON="postgresql://neondb_owner:<PASSWORD>@ep-raspy-scene-aofn4gw8.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
pg_dump "$NEON" -Fc -f backups/edubridge_prod_$(date +%Y%m%d_%H%M%S).dump
```

Neon also keeps automatic point-in-time history on its dashboard (restore/branch a
database from a past timestamp). Keep at least one dump stored off-platform.

---

## 7. Rollback / recovery

- **Bad code deploy:** Render → Events → **Rollback** to a previous deploy; Vercel →
  Deployments → **Instant Rollback**. (Or `git revert` on `main`.)
- **Bad data change:** restore the newest dump (see §5 restore), or use Neon's PITR
  to branch/restore to a point before the change.
- **HTTPS / domain issues:** confirm the DNS records in §2; Render/Vercel re-issue
  certs once DNS resolves.

---

## 8. Health & monitoring

```bash
curl https://api.edubridgenetwork.in/api/v1/health
# → {"status":"ok","checks":{"database":"up","redis":"up"},...}
```

Watch three free-tier dials; upgrade only the one that turns red first:
- **Render** — CPU/RAM on the instance (first to matter, ~10–20k active users).
- **Neon** — storage & compute.
- **Upstash** — daily command count.

> **Free-tier note:** the Render free instance **spins down after ~15 min idle**;
> the next request cold-starts (~50s). With steady traffic it rarely sleeps. To
> remove cold starts, upgrade Render to a paid instance (needs a card) or keep it
> warm with an uptime pinger.

---

## 9. Known launch fixes (already applied on `main`)

These were required to make the free-tier deploy work end-to-end:

| Fix | PR | Why |
|---|---|---|
| Pass `AUTO_VERIFY_EMAIL` to backend | #243 | no SMTP → signups must auto-activate |
| Add `render.yaml` blueprint | #244 | card-free backend hosting on Render |
| Prisma `binaryTargets` + `openssl` in Docker | #245 | Prisma engine wouldn't load on Alpine (OpenSSL 3) |
| Start path `dist/src/main` | #246 | tsconfig includes `prisma/` → entry emits to `dist/src/` |
| `REDIS_URL` must be `rediss://` | (env) | Upstash requires TLS; `ioredis` reads TLS from the scheme |
| Neon `DATABASE_URL` must be **direct** (no `-pooler`) | (env) | `prisma migrate deploy` needs a direct connection |

---

## 10. Outstanding / optional

- **Publish the Google OAuth consent screen** (Cloud Console → OAuth consent screen →
  Publish App) so all users — not just test users — can sign in. Basic scopes need no review.
- **Media uploads:** add Cloudflare R2 (free, $0 egress) and set `AWS_*` / `S3_ENDPOINT`
  to enable real file storage (currently metadata-only).
- **Email:** add SMTP (Resend/SES) and set `AUTO_VERIFY_EMAIL=false` for real verification.
