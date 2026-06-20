# Architecture

## High-level

```
                    ┌──────────────┐
                    │    Nginx     │  TLS, gzip, rate-limit, WS upgrade
                    └──────┬───────┘
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐         ┌───────────────┐
      │  Next.js 15   │  REST   │  NestJS API   │
      │   (web)       │────────▶│  (backend)    │
      └───────────────┘  WS     └──────┬────────┘
                                       │
        ┌──────────────┬──────────────┼──────────────┬───────────────┐
        ▼              ▼              ▼              ▼               ▼
  ┌──────────┐  ┌──────────┐  ┌──────────────┐ ┌──────────┐  ┌──────────┐
  │PostgreSQL│  │  Redis   │  │Elasticsearch │ │ BullMQ   │  │  AWS S3  │
  │ (primary │  │ cache +  │  │  search      │ │ queues   │  │ uploads  │
  │ +replicas│  │ sessions │  │              │ │(workers) │  │          │
  └──────────┘  └──────────┘  └──────────────┘ └──────────┘  └──────────┘
```

## Request flow

1. Client sends a request with a Bearer access JWT.
2. Nginx terminates TLS, applies rate limiting, forwards to the API.
3. A **global `JwtAuthGuard`** validates the token (skipped for `@Public()` routes); `RolesGuard` enforces RBAC; `ThrottlerGuard` enforces per-route limits.
4. Controllers delegate to services. Read-heavy endpoints use **cache-aside** via `RedisService.remember()`.
5. A global `ResponseInterceptor` wraps payloads as `{ success, data, meta? }`; a global `HttpExceptionFilter` normalizes errors.

## Caching strategy

- **Cache-aside** for hot reads (community lists, community-by-slug, user profile) with short TTLs (30–60s).
- **Write-through invalidation**: writes call `redis.del()` / `redis.delPattern()` for affected keys.
- **Denormalized counters** (memberCount, likeCount, commentCount…) kept consistent inside Prisma `$transaction` to avoid expensive `COUNT(*)` on reads.
- Sessions/refresh-token lookups hit Postgres (hashed); Redis is used for ephemeral data and OTP throttling.

## Scaling to 200k users / 5k concurrent

- **Stateless API**: JWT auth + Redis for shared state → scale the API horizontally behind a load balancer (N replicas).
- **Postgres read replicas**: route read-heavy queries (feeds, listings, search-adjacent) to replicas; primary handles writes.
- **Connection pooling**: PgBouncer in front of Postgres.
- **Redis**: caching layer + BullMQ broker; cluster mode for larger scale.
- **Elasticsearch**: offloads global search (colleges, communities, users, opportunities, resources) from Postgres.
- **BullMQ queues**: async work (emails, push, notification fan-out, search indexing, recommendation recompute) runs in worker processes, keeping request latency low.
- **CDN**: static assets + S3 media served via CloudFront; Next.js standalone output is CDN-friendly.
- **Indexing**: composite indexes on hot query paths (e.g. `posts(communityId, createdAt desc)`), descending indexes for leaderboards.

## Event-driven notifications

Domain events (new like/comment/mention, scholarship match, internship deadline, transfer update) are enqueued to BullMQ. Workers persist `Notification` rows and push realtime events over Socket.IO; email/push are separate queue consumers. This decouples user-facing latency from delivery.

## Observability

- **Pino** structured logging (redacts auth headers + passwords).
- **/health** endpoint checks Postgres + Redis.
- Prometheus scrape config provided; wire a `/metrics` endpoint for production.
- Sentry DSN env var reserved for error tracking.
