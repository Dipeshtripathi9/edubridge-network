# EduBridge Network — Deployment Guide (Railway + Vercel)

Follow this top-to-bottom to go live. **Backend + Postgres + Redis → Railway**
(one project), **frontend → Vercel**, **media → Cloudflare R2**, **email → Amazon SES**.

> Why this split: the NestJS backend holds **persistent connections** (Socket.IO chat,
> SSE notifications), which Vercel's serverless functions can't do — so it runs as a
> container on Railway. Vercel hosts only the Next.js frontend (its sweet spot).

Estimated time: ~45–60 min. Companion refs: `ARCHITECTURE.md`, `EMAIL-SETUP.md`, `SCALING.md`.

---

## 0. Prerequisites
- GitHub repo pushed (already done).
- Accounts: **Railway**, **Vercel**, **Cloudflare** (R2), **AWS** (SES), **Google Cloud** (OAuth).
- Locally: a fresh DB backup — run `./scripts/backup-db.sh` (creates `backups/edubridge_*.dump`).

---

## 1. Railway — Postgres + Redis (5 min)
1. Create a new Railway **project**.
2. **+ New → Database → PostgreSQL**. Railway provisions it and exposes `DATABASE_URL`.
3. **+ New → Database → Redis**. Exposes `REDIS_URL`.
4. Leave them; you'll reference their variables from the backend service next.

## 2. Railway — Backend service (10 min)
1. **+ New → GitHub Repo →** select this repo.
2. Settings → **Root Directory**: leave as repo root (the Dockerfile handles the monorepo).
   Settings → **Build**: "Dockerfile" → path `apps/backend/Dockerfile`.
   *(The Dockerfile already runs `prisma migrate deploy` then `node dist/main` on start —
   migrations apply automatically on every deploy.)*
3. Add the backend **environment variables** (see table in §7). Use Railway's variable
   references for the DB/Redis: `DATABASE_URL=${{Postgres.DATABASE_URL}}`,
   `REDIS_URL=${{Redis.REDIS_URL}}`. **Do not set `PORT`** — Railway injects it; the app reads it.
4. Deploy. When it's green, note the public URL, e.g. `https://edubridge-api.up.railway.app`.
5. Health check: open `https://<railway-url>/api/v1/health` → should return ok.

## 3. Migrate your existing data (5 min)
The Dockerfile already ran the schema migrations. Now load your rows:
```bash
# Get the DATABASE_URL from Railway (Postgres service → Variables → DATABASE_URL)
CLEAN_URL="<paste Railway DATABASE_URL, strip any ?schema=… >"
pg_restore --no-owner --no-acl -d "$CLEAN_URL" backups/edubridge_<timestamp>.dump
```
Verify: `psql "$CLEAN_URL" -c 'select count(*) from users;'` → ~1,825 (your current count).

## 4. Cloudflare R2 — media (5 min)
1. Cloudflare dashboard → **R2 → Create bucket** (e.g. `edubridge-media`).
2. **R2 → Manage API Tokens → Create** → note **Access Key ID** + **Secret**.
3. Your S3 endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. Add to the Railway backend vars: `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
   `AWS_REGION=auto`, `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
5. (For public images) enable the bucket's public URL or put Cloudflare CDN in front.

## 5. Amazon SES — email (10 min)
1. AWS Console → **SES** → **Verify your domain** (add the SPF/DKIM/DMARC DNS records SES gives you).
   Move out of the SES sandbox (request production access) so you can email any address.
2. **SES → SMTP settings → Create SMTP credentials** → gives `SMTP_USER` + `SMTP_PASS`.
3. Add to Railway backend vars: `SMTP_HOST=email-smtp.<region>.amazonaws.com`, `SMTP_PORT=587`,
   `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM=EduBridge Network <no-reply@yourdomain>`.
   (See `EMAIL-SETUP.md`. Skip this step to launch with the dev-link flow; add later to send real email.)

## 6. Google OAuth (5 min)
1. Google Cloud Console → **APIs & Services → Credentials → OAuth client ID (Web)**.
2. **Authorized JavaScript origins**: your Vercel URL, e.g. `https://edubridge.vercel.app`.
3. **Authorized redirect URIs**: `https://<railway-url>/api/v1/auth/google/callback`.
4. Note **Client ID** + **Client Secret** → into env (`GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`
   on Railway; `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel).

## 7. Vercel — frontend (5 min)
1. Vercel → **Add New → Project → import this repo**.
2. **Root Directory → `apps/web`**. Framework preset: **Next.js** (auto). Build: `next build` (default).
3. Add frontend **environment variables** (see §8 table).
4. Deploy → note the URL, e.g. `https://edubridge.vercel.app`.

## 8. Wire the two together (the cross-links — do this last)
Update and redeploy so origins match:
- On **Railway backend**: `APP_URL=https://edubridge.vercel.app`,
  `CORS_ORIGINS=https://edubridge.vercel.app`.
- On **Vercel frontend**: `NEXT_PUBLIC_API_URL=https://<railway-url>/api/v1`,
  `NEXT_PUBLIC_WS_URL=https://<railway-url>`.
- Redeploy both.

## 9. Smoke test
- `GET https://<railway-url>/api/v1/health` → ok.
- Open the Vercel URL → home loads, feeds/communities load (data from Railway Postgres).
- Sign up → verification email (or dev link) → account created.
- Continue with Google → logs in.
- Post / like / comment / notification → works (Socket.IO + SSE over the Railway backend).

---

## Environment variables

### Backend (Railway)
| Var | Value / notes | Required |
|---|---|---|
| `NODE_ENV` | `production` | ✅ |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | ✅ |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | ✅ |
| `APP_URL` | `https://<vercel-url>` (used in email links) | ✅ |
| `CORS_ORIGINS` | `https://<vercel-url>` (comma-sep for multiple) | ✅ |
| `JWT_ACCESS_SECRET` | long random string | ✅ |
| `JWT_REFRESH_SECRET` | different long random string | ✅ |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from Google console | ✅ (for Google login) |
| `GOOGLE_CALLBACK_URL` | `https://<railway-url>/api/v1/auth/google/callback` | ✅ (for Google login) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Amazon SES | for real email |
| `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | R2 credentials | for media uploads |
| `AWS_REGION` | `auto` (for R2) | for media |
| `S3_ENDPOINT` | `https://<acct>.r2.cloudflarestorage.com` | for media (R2) |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | e.g. `900s` / `30d` | optional |
| `RATE_LIMIT_TTL` / `RATE_LIMIT_MAX` | `60` / `120` | optional |
| `PORT` | **do not set** — injected by Railway | — |
| `TWILIO_*`, `ELASTICSEARCH_NODE` | unused (OTP/ES not enabled) | ❌ skip |

### Frontend (Vercel)
| Var | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<railway-url>/api/v1` |
| `NEXT_PUBLIC_WS_URL` | `https://<railway-url>` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

Generate secrets with: `openssl rand -base64 48`.

---

## Using your own domain (e.g. `edubridge.network`)

Point the **frontend at your root/www domain** and the **backend at an `api` subdomain**.

### A. Frontend on your domain (Vercel)
1. Vercel project → **Settings → Domains → Add** → enter `edubridge.network` (and `www.edubridge.network`).
2. Vercel shows the DNS records to add at your domain registrar:
   - Apex `edubridge.network` → an **A record** to Vercel's IP (Vercel gives it), **or** if your DNS supports it, an **ALIAS/ANAME** to `cname.vercel-dns.com`.
   - `www` → **CNAME** to `cname.vercel-dns.com`.
3. Add them at your registrar (or Cloudflare DNS). Vercel auto-issues an SSL cert. Wait for "Valid".

### B. Backend on `api.edubridge.network` (Railway)
1. Railway backend service → **Settings → Networking → Custom Domain** → `api.edubridge.network`.
2. Railway gives you a **CNAME target** → add a `CNAME` record `api` → that target at your registrar.
3. Railway issues SSL automatically.

### C. Repoint the env vars to the custom domain, then redeploy
- Railway backend: `APP_URL=https://edubridge.network`, `CORS_ORIGINS=https://edubridge.network,https://www.edubridge.network`.
- Vercel frontend: `NEXT_PUBLIC_API_URL=https://api.edubridge.network/api/v1`, `NEXT_PUBLIC_WS_URL=https://api.edubridge.network`.
- Google OAuth (console): add `https://edubridge.network` to **JavaScript origins** and
  `https://api.edubridge.network/api/v1/auth/google/callback` to **redirect URIs**.
- Redeploy both. Done — now everything runs on your domain over HTTPS.

> Tip: putting your DNS on **Cloudflare** also gives you the CDN in front of the frontend and
> R2 media for free. Set Cloudflare records to **DNS-only (grey cloud)** for the Vercel/Railway
> CNAMEs unless you know you want Cloudflare proxying (orange cloud) in front — proxying the
> Railway API is fine, but keep WebSockets enabled.

---

## Starting cheap: 200 → 5,000 users (~$0–5 / month)

At this stage, **use free tiers and run ONE of everything.** Do not provision replicas,
PgBouncer, or read replicas yet — that's 50k+ territory and would only add cost.

| Piece | Cheapest option | Free allowance (plenty at 5k users) |
|---|---|---|
| **Frontend** | **Vercel Hobby** | Free — CDN + SSL included |
| **Backend** | **Fly.io** (free small always-on VM) or **Railway Hobby** (~$5/mo) | Backend must stay **always-on** (Socket.IO/SSE), so avoid "sleep on idle" free tiers (Render free) — cold starts break realtime |
| **Postgres** | **Neon free** | 0.5 GB — your data is a few MB at 5k users; scales to zero when idle |
| **Redis** | **Upstash free** | 10k commands/day — caching keeps you well under it |
| **Media** | **Cloudflare R2 free** | 10 GB storage, 10M reads/mo, **$0 egress** |
| **Email** | **Resend free** (3k/mo) or **Amazon SES** ($0.10/1k) | 3k emails/mo covers signups/resets at this scale |

**Realistic bill:** Vercel $0 + Neon $0 + Upstash $0 + R2 $0 + Resend $0 + backend $0–5.
→ **~$0–5/month until you're well past 5k users.**

### Why it stays cheap (and what to NOT do yet)
- **One backend instance** handles thousands of concurrent users — the app is efficient (indexes, Redis cache, cursor pagination). No replicas needed.
- **Neon/Upstash scale to zero** when idle — you pay for use, not for a reserved server.
- **R2 zero-egress** means image bandwidth (usually the biggest surprise bill) is free.
- **Don't** enable read replicas, PgBouncer, multi-instance, or a search cluster yet — revisit only when you approach ~20–30k users (see `SCALING.md`).
- Keep the app on the **free Vercel/Neon/Upstash tiers**; upgrade a single service only when *that* service's dashboard shows you're near its limit.

**When to spend more:** watch three dials — Neon storage/compute, Upstash daily commands,
and backend CPU/RAM. Upgrade whichever one turns red first (usually the backend around 10–20k
active users). Everything else stays free far longer.

---

## Costs (rough, at 20–50k users, few-thousand DAU)
- Railway (backend + Postgres + Redis, small): ~$10–25/mo to start; scales with usage.
- Vercel: Hobby free / Pro $20 if you need team features.
- Cloudflare R2: pennies/GB, **$0 egress**.
- Amazon SES: ~$0.10 per 1,000 emails.
- Total: comfortably low. See `ARCHITECTURE.md` §8 for the cost rationale.

## Scaling later
Railway → add backend replicas; move Postgres to Neon + read replicas + PgBouncer when
needed. The app is already multi-instance-ready (Redis throttler + Socket.IO Redis adapter).
Full path in `apps/backend/SCALING.md` and `ARCHITECTURE.md` §11 (50k → 500k).

## Rollback / DR
- Railway keeps deploy history → one-click rollback.
- DB: Railway/managed PITR + your `./scripts/backup-db.sh` dumps (store one off-platform).
- Media persists in R2 (enable versioning). Full runbook in `ARCHITECTURE.md` §10.
