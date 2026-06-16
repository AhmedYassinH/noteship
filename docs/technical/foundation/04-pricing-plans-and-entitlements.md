# Noteship — Pricing, Plans & Entitlements

## Purpose

Define plan model, feature gates, and quota handling.

## Principles

- Stripe handles **billing**; Noteship handles **entitlements**
- Backend is the source of truth for access control
- Frontend uses entitlements to show/hide/disable UI but does not enforce security

## Plan model

Internal plan IDs (stable):

- `free`
- `pro` (or `solo`, `pro` later)

Default:

- New users persist `planId=free`.
- Existing users missing `planId` are lazily backfilled to `free` on `/me`.
- Effective Pro access requires a Stripe subscription status of `active` or `trialing`; all other statuses resolve to Free.

Stripe mapping:

- Stripe `priceId` → internal `planId` (stored in config + DB mapping)

## Feature keys (examples)

Boolean features:

- `semantic_search`
- `scheduled_publish`
- Future connector publish entitlements are deferred
- `linkedin_publish`

Quota/capacity:

- `ai_generations_per_month`
- `max_notes`
- `max_scheduled_posts`
- `max_storage_mb`

Rate-limit features:

- `api_requests_per_minute`
- `api_requests_per_day`
- `search_queries_per_hour`
- `ai_generations_per_hour`
- `upload_sessions_per_day`
- `publish_requests_per_day`

## Entitlement source (MVP)

Config-driven entitlements (versioned file), e.g.

```json
{
  "free": { "semantic_search": true, "scheduled_publish": false, "ai_generations_per_month": 30 },
  "pro": { "semantic_search": true, "scheduled_publish": true, "ai_generations_per_month": 500 }
}
```

## Usage tracking

Store per-user per-period counters (DynamoDB):

- Partition: `userId`
- Sort: `periodStart` (ISO date; use Stripe `current_period_start`)
- Counters: `ai_generations_used`, `scheduled_posts_used`, etc.
  Use atomic increments.

Store plan-aware API rate limits in a dedicated `RateLimits` table:

- Partition: `userId`
- Sort: `{featureKey}#{window}#{windowStartEpoch}`
- Use atomic conditional increments and TTL.

Store non-monthly capacity counters on the user record:

- `notesUsed`
- `activeScheduledPosts`
- `storageUsedMb`, `storageReservedMb`, `storageAccountedMb`

Free launch defaults:

- global API: 60/minute and 1000/day
- search: 30/hour
- AI generation: 3/hour and 20/month
- upload sessions: 20/day
- publish requests: 10/day

## Upgrade / downgrade behavior

- Never delete data on downgrade
- Block new actions beyond limits (e.g., cannot schedule new posts)
- Grace period optional (later)

## Stripe webhooks (required)

Process and persist:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
  Persist: `stripeCustomerId`, `subscriptionId`, `priceId`, `planId`, `status`, `currentPeriodEnd`
