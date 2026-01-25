# Deployment Guide (Noteship)

Use this as the source of truth for deploying infrastructure and apps. Update it when deployment steps or configuration change. Dev and production runbooks should mirror this doc.

Related: `docs/technical/dev-environment.md`.

## Environments & naming

- Envs: `dev`, `prod` (add staging later if needed).
- CDK context keys: `env` (required), `region` (optional, default `us-east-1`).
- Stack naming: `NoteshipCore-{env}`; resources are suffixed with `{env}`.

## Prerequisites

- AWS CLI configured with an account that can create S3, DynamoDB, SQS, KMS/Secrets Manager.
- Node 18+, pnpm installed.
- HLD/LLD followed: vector DB is external (e.g., Qdrant Cloud) and not provisioned here.

## AWS authentication (SSO + profiles)

- Configure a named profile via AWS SSO (recommended for personal accounts).
- Example:

```sh
aws configure sso
aws sso login --profile noteship-dev
setx AWS_PROFILE "noteship-dev"
```

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
cdk deploy NoteshipCore-dev -c env=dev -c region=us-east-1
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
- Auth0 (JWT authorizer): `AUTH0_ISSUER_BASE_URL`, `AUTH0_AUDIENCE`
- Vector DB: `VECTOR_DB_PROVIDER` (default `qdrant`), `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_COLLECTION`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
- OAuth: `LINKEDIN_CLIENT_ID/SECRET`, `MEDIUM_CLIENT_ID/SECRET`
- AI: `LLM_PROVIDER` (default `openai`), `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_DRAFT_MODEL`
- KMS key/secret names if using envelope encryption for tokens

## Frontend deployment (Next.js SSG + SPA, no SSR)

- Intent: SPA dashboard + SSG landing, hosted on AWS only.
- Build/export:

```sh
pnpm --filter @noteship/web build
pnpm --filter @noteship/web export
```

- Upload `apps/web/out` to S3 and serve via CloudFront.
- Configure CloudFront to route 403/404 to `/index.html` for SPA routes.
- No Next.js API routes, server actions, or middleware in this setup.
- Static assets are fine on CloudFront/S3; SSR is not required for MVP.
- Fonts/brand: serve IBM Plex Sans/Arabic (app) and Lora/Noto Naskh (marketing headlines) per `docs/brand/noteship-typography.md`; ensure Arabic locale builds set `dir="rtl"` on rendered pages.

### Frontend env vars (SPA Auth0)

- `NEXT_PUBLIC_AUTH0_DOMAIN`
- `NEXT_PUBLIC_AUTH0_CLIENT_ID`
- `NEXT_PUBLIC_AUTH0_AUDIENCE`
- `NEXT_PUBLIC_AUTH0_REDIRECT_URI` (e.g., `https://app.noteship.com/callback`)
- `NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI` (e.g., `https://app.noteship.com`)
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ENV`

Note: `NEXT_PUBLIC_AUTH0_DOMAIN` should be the Auth0 tenant domain without the `https://` prefix.

## API deployment (Auth0 required)

Set Auth0 config in your shell before deploying:

```sh
setx AUTH0_ISSUER_BASE_URL "https://your-tenant.us.auth0.com"
setx AUTH0_AUDIENCE "https://api.noteship.com"
```

Then deploy the API stack:

```sh
cd packages/infra
cdk deploy NoteshipApi-dev -c env=dev -c region=us-east-1
```

Ensure:

- API uses Auth0 JWT authorizer (issuer + audience) and writes to provisioned tables/bucket.
- Stripe webhook endpoint is deployed and wired with secrets.

## Auth0 (SPA flow)

- Use Auth0 SPA SDK (PKCE) with hosted Universal Login.
- Token storage: browser localStorage (simple, higher XSS risk). Keep strict CSP and avoid inline scripts.
- Silent auth requires Allowed Web Origins to include the app URL(s).
- Create separate Auth0 apps and APIs per env (dev/prod) inside one tenant:
  - SPA application (client ID per env)
  - API (audience per env)
- Configure Allowed Callback URLs (e.g., `https://app.noteship.com/callback`) and Allowed Logout URLs (e.g., `https://app.noteship.com`).

## Workers deployment (not yet wired)

- Worker stack is still TODO (see `packages/infra/README.md`).

## Post-deploy steps

- Create Stripe webhook (events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`) pointing to API.
- Create LinkedIn/Medium OAuth apps; set redirect URIs; store secrets.
- Seed plan entitlements consistent with `packages/domain/src/plans.ts`.
- Set CloudWatch alarms for DLQ message count.

## Rollback & cleanup

- CDK stacks use `RemovalPolicy.RETAIN` for data buckets/tables. Manual cleanup is required if tearing down.
- To roll back a bad deploy: prefer CDK stack update to previous template or disable new Lambda versions/aliases once they exist.
