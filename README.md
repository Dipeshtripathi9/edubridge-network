# EduBridge Network

[![CI](https://github.com/Dipeshtripathi9/edubridge-network/actions/workflows/ci.yml/badge.svg)](https://github.com/Dipeshtripathi9/edubridge-network/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Dipeshtripathi9/edubridge-network/graph/badge.svg)](https://codecov.io/gh/Dipeshtripathi9/edubridge-network)

> **Your Future, Our Network** — a platform for students who are **already in college**: connect with communities, transfer to better colleges, find scholarships & internships, read genuine reviews, share resources, and build reputation.

Built as a production-grade, horizontally scalable SaaS designed for **200,000+ users** and **5,000 concurrent** with a **sub-300ms** API target.

---

## Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | Next.js 15 (App Router), TypeScript, Tailwind, shadcn-style UI, React Query, Zustand, Framer Motion |
| Backend      | NestJS, TypeScript, Prisma ORM, Swagger |
| Database     | PostgreSQL 16 |
| Cache/Queue  | Redis 7 (cache-aside + BullMQ ready) |
| Search       | Elasticsearch 8 |
| Realtime     | Socket.IO (messaging, notifications) |
| Auth         | JWT (access + rotating refresh), Argon2, Google OAuth, Phone OTP |
| Storage      | AWS S3 (signed URLs) |
| Infra        | Docker Compose, Nginx, GitHub Actions, Prometheus/Grafana-ready, Sentry-ready |

## Monorepo Layout

```
edubridge-network/
├── apps/
│   ├── backend/        # NestJS API (Prisma, auth, communities, …)
│   │   ├── prisma/     # schema.prisma + seed.ts
│   │   └── src/        # modules: auth, users, communities, health, common, …
│   └── web/            # Next.js 15 frontend
├── packages/
│   └── shared/         # shared TS enums, DTO types, constants
├── infra/              # docker-compose, nginx, prometheus, k6 load test
├── docs/               # ARCHITECTURE, DATABASE, API, DEPLOYMENT
└── .github/workflows/  # CI + deploy
```

## Quickstart

```bash
# 1. Install deps (npm workspaces)
npm install

# 2. Configure environment
cp .env.example .env        # then fill secrets (or use defaults for local dev)

# 3. Start infrastructure (Postgres, Redis, Elasticsearch)
npm run docker:up           # requires Docker Desktop

# 4. Generate Prisma client, run migrations, seed data
npm run db:generate
npm run db:migrate          # creates the schema
npm run db:seed             # demo colleges, communities, users

# 5. Run everything in dev
npm run dev                 # turbo runs backend (:4000) + web (:3000)
```

- API: http://localhost:4000/api/v1
- **Swagger docs**: http://localhost:4000/api/v1/docs
- Web: http://localhost:3000

**Seeded logins** — Admin: `admin@edubridge.network` / `Admin@12345` · Student: `aarav@example.com` / `Student@123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend + web (turbo) |
| `npm run build` | Build all apps |
| `npm run test` | Run unit tests |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` / `docker:down` | Start/stop infra |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — scaling, caching, event flow
- [Database](docs/DATABASE.md) — schema, indexing, College Data Ingestion layer
- [API](docs/API.md) — REST conventions, auth flow, endpoints
- [Deployment](docs/DEPLOYMENT.md) — Docker/AWS, migrations, zero-downtime

## Status

All product modules are implemented end-to-end (API + UI), on a shared production foundation (Prisma schema, Redis caching, Socket.IO gateway, RBAC, audit, Docker, CI, docs):

- **Auth** — email / Google / phone-OTP, Argon2, JWT + rotating refresh, brute-force lockout, sessions/devices
- **Communities** — posts, comments (threaded), likes, bookmarks, polls
- **Transfer Hub** — eligibility engine, journeys, transfer stories (College Data layer)
- **Opportunity Hub** — internships/scholarships/etc., applications, interest-based recommendations
- **College Reviews** — verified-student-only, categories, voting, rating aggregates
- **Resource Hub** — uploads (S3 presigned), downloads, ratings, bookmarks
- **Messaging** — real-time Socket.IO chat, presence, typing, read receipts
- **Notifications** — real-time + persisted, wired into likes/comments/mentions/messages
- **Reputation & Badges** — points from actions, threshold/activity badges, leaderboard
- **Admin** — moderation (ban/suspend/verify), report queue, broadcast, analytics, audit log
- **Global Search** — Elasticsearch across all entities, with Postgres fallback

Graceful dev fallbacks mean it runs without external creds: SMTP/Twilio/S3/Elasticsearch are optional locally.
