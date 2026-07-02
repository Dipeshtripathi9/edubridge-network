# Scaling EduBridge to 700k students / 50k concurrent

This documents how the platform is built to scale and the infrastructure needed
to run it at that size. The application code is horizontally scalable; the rest is
deployment configuration.

## What's already in the code

- **Comprehensive DB indexing.** Every hot query path (foreign keys, filter+sort
  combinations, cursor-pagination orderings) has a covering `@@index` in
  `prisma/schema.prisma`. This is the single biggest factor in DB performance at
  scale — sequential scans are what melt Postgres, and we avoid them.
- **Cursor-based pagination** everywhere (not `OFFSET`), so page N is as cheap as
  page 1 even on huge tables.
- **Redis cache-aside** on hot read paths (`RedisService.remember`), e.g. community
  listings, with short TTLs and pattern-based invalidation.
- **Rate limiting** (`@nestjs/throttler`) with a Redis-backed store in production,
  so limits are global across replicas (not per-instance).
- **Socket.IO Redis adapter** so real-time events (messages, notifications) are
  broadcast across all replicas — the API can run as N instances behind a load
  balancer.
- **Stateless app instances** — JWT auth, no in-process session state; any request
  can hit any replica.
- **Graceful shutdown** (`enableShutdownHooks`) so rolling deploys drain cleanly.

## Infrastructure to provision

### Postgres (the main constraint)
- **PgBouncer** in transaction-pooling mode in front of Postgres. Point
  `DATABASE_URL` at PgBouncer and add `?pgbouncer=true&connection_limit=<n>`.
  700k rows is small for Postgres; the risk is connection exhaustion from many
  app replicas, which PgBouncer solves.
- Size Prisma's pool per instance: `connection_limit` ≈ (PgBouncer pool / replicas).
- **Read replicas** for read-heavy endpoints (feeds, listings, college data). Route
  reads to replicas, writes to primary.
- Managed Postgres (RDS/Cloud SQL/Neon) with autoscaling storage + PITR backups.

### Redis
- Managed Redis (ElastiCache/Upstash) with enough memory for cache + rate-limit +
  socket pub/sub. Enable a maxmemory eviction policy (`allkeys-lru`) for the cache.

### App tier
- Run the API as a **stateless container** (the repo already builds a `standalone`
  output) with **≥ 3 replicas**, autoscaled on CPU / p95 latency behind a load
  balancer. 50k concurrent ≈ a handful of well-sized replicas.
- WebSocket connections: enable sticky sessions at the LB (or rely on the Redis
  adapter + polling upgrade); the Redis adapter handles cross-instance broadcast.

### Frontend
- Deploy Next.js on a CDN-backed host (Vercel / CloudFront). Static assets under
  `/_next/static` are content-hashed and served immutably — near-zero origin load.
- Set `NEXT_PUBLIC_API_URL` to the API domain; the app preconnects to it.

## Load-test before launch
Run k6/Artillery against the read-hot endpoints (feeds, communities, opportunities,
college pages) at target concurrency, watch Postgres `pg_stat_statements` for slow
queries, and add indexes / cache where the p95 shows up. Everything else is
provisioning headroom.
