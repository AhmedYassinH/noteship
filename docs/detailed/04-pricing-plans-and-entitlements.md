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

Stripe mapping:

- Stripe `priceId` → internal `planId` (stored in config + DB mapping)

## Feature keys (examples)

Boolean features:

- `semantic_search`
- `scheduled_publish`
- `medium_publish`
- `linkedin_publish`

Quota/capacity:

- `ai_generations_per_month`
- `max_notes`
- `max_scheduled_posts`

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
- Sort: `YYYY-MM`
- Counters: `ai_generations_used`, `scheduled_posts_used`, etc.
  Use atomic increments.

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
