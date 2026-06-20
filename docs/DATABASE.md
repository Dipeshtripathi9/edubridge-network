# Database

PostgreSQL 16 via Prisma ORM. Full schema: [`apps/backend/prisma/schema.prisma`](../apps/backend/prisma/schema.prisma).

## Domains

| Domain | Tables |
|--------|--------|
| Identity & Auth | `users`, `profiles`, `oauth_accounts`, `sessions`, `devices`, `email_verifications`, `otp_verifications` |
| College Data (moat) | `universities`, `colleges`, `college_cutoffs`, `transfer_requirements` |
| Communities | `communities`, `community_members`, `posts`, `comments`, `reactions`, `bookmarks`, `polls`, `poll_options`, `poll_votes` |
| Transfer Hub | `transfers`, `transfer_requirements` |
| Opportunities | `opportunities`, `applications` |
| Reviews | `reviews`, `review_votes` |
| Resources | `resources`, `resource_downloads`, `resource_ratings` |
| Messaging | `chats`, `chat_participants`, `messages` |
| Reputation | `reputation_events`, `badges`, `user_badges` |
| Notifications | `notifications` |
| Admin/RBAC | `reports`, `audit_logs`, `roles`, `permissions`, `role_permissions` |

## Key relationships

- `User` 1—1 `Profile`; `Profile` →? `College`, `University`.
- `Community` 1—N `CommunityMember` (composite unique `[communityId, userId]`), 1—N `Post`.
- `Post` 1—N `Comment` (self-referential `parentId` for threads), 1—N `Reaction`/`Bookmark`, 1—1 `Poll`.
- `Reaction` is polymorphic over post/comment with unique `[userId, postId]` and `[userId, commentId]` to prevent double-likes.

## Indexing strategy

- **Feed**: `posts(communityId, createdAt desc)` — community feeds are the hottest read path.
- **Leaderboard**: `users(reputationPoints desc)`.
- **Listings/filters**: `communities(type)`, `communities(memberCount desc)`, `colleges(state, city)`, `colleges(nirfRank)`, `colleges(avgRating desc)`.
- **Lookups**: hashed token indexes on `email_verifications(tokenHash)`, `sessions(userId)`, `otp_verifications(phone)`.
- **Tag search**: GIN-friendly array columns (`posts.hashtags`, `opportunities.tags`).
- **Ingestion**: `colleges(sourceSystem, externalId)`, `college_cutoffs(collegeId, year)`.

## College Data Ingestion layer (the moat)

`colleges`, `college_cutoffs`, and `transfer_requirements` carry `sourceSystem` (`JoSAA`, `CSAB`, `UPTAC`, `manual`) and `externalId` provenance so external datasets can be ingested idempotently and reconciled. `colleges` also stores denormalized aggregates (`avgPlacementPackage`, `reviewCount`, `avgRating`) for fast browse/compare. This data layer powers Transfer Hub eligibility, cutoff lookups, reviews, and recommendations — and becomes the platform's defensible asset.

## Migrations & seed

```bash
npm run db:migrate     # prisma migrate dev (creates SQL migrations)
npm run db:seed        # idempotent upsert-based seed
```
