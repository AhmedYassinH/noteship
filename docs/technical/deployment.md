# Deployment Guide (Noteship)

Use this as the source of truth for deploying infrastructure and apps. Update it when deployment steps or configuration change.

## Environments & naming

- Envs: `dev`, `prod` (add staging later if needed).
- CDK context keys: `env` (required), `region` (optional, default `us-east-1`).
- Stack naming: `NoteshipCore-{env}`; resources are suffixed with `{env}`.

## Prerequisites

- AWS CLI configured with an account that can create S3, DynamoDB, SQS, KMS/Secrets Manager.
- Node 18+, pnpm installed.
- HLD/LLD followed: vector DB is external (e.g., Qdrant Cloud) and not provisioned here.

## CI status

- GitHub Actions runs `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm format` on PRs/merges.
- Playwright E2E runs only when `RUN_E2E=1` is set (or via `pnpm --filter @noteship/web test:e2e`).

## CDK bootstrap (per account/region)

```sh
cd packages/infra
pnpm --filter @noteship/infra bootstrap -- -c env=dev -c region=us-east-1
```

## Deploy core infra

```sh
cd packages/infra
# synth
pnpm --filter @noteship/infra synth -- -c env=dev -c region=us-east-1
# deploy
cdk deploy -c env=dev -c region=us-east-1
```

Provisioned (aligns to HLD/LLD):

- S3 content bucket (versioned, private).
- DynamoDB tables: users, notes (GSI1), posts (status GSI + schedule GSI), integrations, usage, jobs.
- SQS jobs queue + DLQ.

## DynamoDB defaults (MVP)

- **Capacity mode:** Provisioned with auto scaling caps to stay within Always Free limits. Adjust caps for production traffic.
- **PITR:** Disabled for cost control; enable for production (see `PRODUCTION-CHECKLIST.md`).

## Config & secrets (store in Secrets Manager / SSM)

Backend/API & workers expect (examples):

- `CONTENT_BUCKET_NAME`, `USERS_TABLE_NAME`, `NOTES_TABLE_NAME`, `POSTS_TABLE_NAME`, `INTEGRATIONS_TABLE_NAME`, `USAGE_TABLE_NAME`, `JOBS_TABLE_NAME`, `JOBS_QUEUE_URL`
- Vector DB: `VECTOR_DB_PROVIDER` (default `qdrant`), `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
- OAuth: `LINKEDIN_CLIENT_ID/SECRET`, `MEDIUM_CLIENT_ID/SECRET`
- AI: `LLM_PROVIDER` (default `openai`), `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_DRAFT_MODEL`
- KMS key/secret names if using envelope encryption for tokens

## Frontend deployment (Next.js)

- Intent: SPA dashboard + SSG landing.
- Preferred: Vercel (fastest) — set env vars: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ENV=dev|prod`.
- AWS option: `next build && next export` for landing pages to S3+CloudFront; dashboard as SPA served from same distribution pointing to built `.next` output via Next-on-AWS pattern (not yet scaffolded).
- Static assets are fine on CloudFront/S3; SSR is not required for MVP.
- Fonts/brand: serve IBM Plex Sans/Arabic (app) and Lora/Noto Naskh (marketing headlines) per `docs/brand/noteship-typography.md`; ensure Arabic locale builds set `dir="rtl"` on rendered pages.

## API & workers deployment (not yet wired)

- CDK currently provisions data/queue only. Add Lambda/API Gateway and worker stacks before shipping.
- When added, ensure:
  - API uses authorizer (Cognito/Auth0) and writes to provisioned tables/bucket.
  - Workers consume SQS jobs and have permissions to S3/DDB/Secrets/Vector DB.
  - Stripe webhook endpoint is deployed and wired with secrets.

## Post-deploy steps

- Create Stripe webhook (events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`) pointing to API.
- Create LinkedIn/Medium OAuth apps; set redirect URIs; store secrets.
- Seed plan entitlements consistent with `packages/domain/src/plans.ts`.
- Set CloudWatch alarms for DLQ message count.

## Rollback & cleanup

- CDK stacks use `RemovalPolicy.RETAIN` for data buckets/tables. Manual cleanup is required if tearing down.
- To roll back a bad deploy: prefer CDK stack update to previous template or disable new Lambda versions/aliases once they exist.
