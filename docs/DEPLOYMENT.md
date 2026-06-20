# Deployment

## Local (Docker Compose)

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d   # postgres, redis, elasticsearch (+ backend, web)
```

The backend container runs `prisma migrate deploy` on start, then boots the API. Seed once with `npm run db:seed` (against the running DB).

## Environment variables

See [`.env.example`](../.env.example). Must be set for production:

| Group | Vars |
|-------|------|
| Core | `DATABASE_URL`, `REDIS_URL`, `ELASTICSEARCH_NODE`, `CORS_ORIGINS` |
| JWT | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (≥32 chars), TTLs |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| Email | `SMTP_HOST/PORT/USER/PASS/FROM` |
| OTP | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| Storage | `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Frontend | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |

## AWS (reference architecture)

- **Compute**: ECS Fargate (or EKS) running the backend + web images, behind an Application Load Balancer.
- **Database**: RDS for PostgreSQL (Multi-AZ) + read replicas; PgBouncer for pooling.
- **Cache/Queue**: ElastiCache for Redis.
- **Search**: Amazon OpenSearch (Elasticsearch-compatible).
- **Storage/CDN**: S3 + CloudFront.
- **Secrets**: AWS Secrets Manager / SSM Parameter Store.
- **Images**: ECR (built/pushed by `.github/workflows/deploy.yml`).

## CI/CD

- `ci.yml` — installs deps, spins up Postgres/Redis, generates Prisma client, runs migrations, lint, build, tests on every push/PR.
- `deploy.yml` — on `main`, builds and pushes Docker images to ECR (requires `ECR_REGISTRY` + AWS secrets), with a commented ECS deploy step.

## Migrations & zero-downtime

- Use **expand/contract**: deploy additive schema changes first, migrate data, then remove old columns in a later release.
- `prisma migrate deploy` is idempotent and safe to run on every container start.
- Roll backend instances gradually behind the load balancer; the API is stateless so old/new can coexist during a rollout.

## Load testing

```bash
k6 run infra/load-test/k6-script.js          # ramps to 5,000 VUs, asserts p95 < 300ms
BASE_URL=https://api.edubridge.network k6 run infra/load-test/k6-script.js
```
