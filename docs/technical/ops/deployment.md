# Deployment Guide (Noteship)

Use this as the source of truth for deploying infrastructure and apps. Update it when deployment steps or configuration change. Dev and production runbooks should mirror this doc.

Related: `docs/technical/ops/dev-environment.md`.

## Environments & naming

- Envs: `dev`, `prod` (add staging later if needed).
- CDK context keys: `env` (required), `region` (optional, default `us-east-1`).
- Stack naming: `NoteshipCore-{env}`; resources are suffixed with `{env}`.

## Prerequisites

- AWS CLI configured with an account that can create S3, DynamoDB, SQS.
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

For the current shell session, you can also set:

```sh
$env:AWS_PROFILE="noteship-dev"
```

## CI status

- GitHub Actions runs `pnpm lint`, `pnpm build`, and `pnpm test` on PRs/merges.
- A main-branch deploy job ships the dev environment after CI succeeds.
- Playwright E2E runs only when `RUN_E2E=1` is set (or via `pnpm --filter @noteship/web test:e2e`).

## CDK bootstrap (per account/region)

```sh
cd packages/infra
pnpm --filter @noteship/infra bootstrap -- -c env=dev -c region=us-east-1
```

## Runtime configuration (env vars)

All runtime configuration and credentials are provided via environment variables.
See `.env.example` for the full list and defaults.

Ensure the required env vars are set in your shell **before** running `cdk deploy` so Lambda
environment variables are populated.

## Deploy core infra

```sh
cd packages/infra
# synth
pnpm --filter @noteship/infra synth -- -c env=dev -c region=us-east-1
# deploy
cdk deploy NoteshipCore-dev -c env=dev -c region=us-east-1
```

## GitHub Actions (dev deploy)

- Trigger: push to `main`.
- Gate: lint, build, and test must succeed.
- Deploys stacks in order: Core → API → Workers → Web → Ops Guardrails.
- Builds/exports web app, syncs to S3, and invalidates CloudFront.
- Requires secrets from the env var list above plus:
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
  - `NOTESHIP_WEB_BUCKET_NAME`, `NOTESHIP_WEB_DISTRIBUTION_ID`

Provisioned (aligns to HLD/LLD):

- S3 content bucket (versioned, private).
- DynamoDB tables: users, notes (GSI1), posts (status GSI + schedule GSI), integrations, usage, jobs.
- SQS jobs queue + DLQ.

## DynamoDB defaults (MVP)

- **Capacity mode:** Provisioned with auto scaling caps to stay within Always Free limits. Adjust caps for production traffic.
- **PITR:** Disabled for cost control; enable for production (see `docs/technical/ops/production-checklist.md`).

## Config & secrets (env vars)

API + workers read runtime config from env vars. Required keys:

- Infra: `NOTESHIP_CONTENT_BUCKET_NAME`, `NOTESHIP_USERS_TABLE_NAME`, `NOTESHIP_NOTES_TABLE_NAME`, `NOTESHIP_POSTS_TABLE_NAME`, `NOTESHIP_INTEGRATIONS_TABLE_NAME`, `NOTESHIP_USAGE_TABLE_NAME`, `NOTESHIP_JOBS_TABLE_NAME`, `NOTESHIP_JOBS_QUEUE_URL`
- Guardrails: `NOTESHIP_GUARDRAILS_BUDGET_LIMIT_USD`, `NOTESHIP_GUARDRAILS_BILLING_ALARM_USD`, optional `NOTESHIP_GUARDRAILS_EMAILS`, optional `NOTESHIP_HTTP_API_ID`
- Auth0 (JWT authorizer): `AUTH0_ISSUER_BASE_URL`, `AUTH0_AUDIENCE`
- Vector DB: `QDRANT_URL`, `QDRANT_COLLECTION`, optional `QDRANT_API_KEY`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, optional `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`
- OAuth: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `MEDIUM_CLIENT_ID`, `MEDIUM_CLIENT_SECRET`
- LinkedIn publish constraints: optional `LINKEDIN_API_VERSION`, `LINKEDIN_TEXT_MAX_CHARS`, `LINKEDIN_COMMENT_MAX_CHARS`, `LINKEDIN_MAX_IMAGES_PER_POST` (capped at 20 by API/runtime validation)
- AI: `OPENAI_API_KEY`, `OPENAI_EMBED_MODEL`, `OPENAI_DRAFT_MODEL`, optional `NOTESHIP_LLM_PROVIDER`, `NOTESHIP_VECTOR_DB_PROVIDER`
- API custom domain: `NOTESHIP_API_CUSTOM_DOMAIN`, `NOTESHIP_API_CERTIFICATE_ARN`
- Content delivery/custom domain: `NOTESHIP_CONTENT_CUSTOM_DOMAIN`, `NOTESHIP_CONTENT_CERTIFICATE_ARN`, `NOTESHIP_CLOUDFRONT_KEY_PAIR_ID`, `NOTESHIP_CLOUDFRONT_PRIVATE_KEY`, optional `NOTESHIP_CONTENT_COOKIE_DOMAIN`, optional `NOTESHIP_CONTENT_SESSION_TTL_SECONDS`, `NOTESHIP_WEB_ORIGIN`, `NOTESHIP_CONTENT_UPLOAD_ORIGIN`
- Logging: `POWERTOOLS_SERVICE_NAME`, `POWERTOOLS_LOG_LEVEL`, optional `POWERTOOLS_LOGGER_SAMPLE_RATE`, `NOTESHIP_ENV_NAME`
  - Accepted values for `POWERTOOLS_LOG_LEVEL`: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `SILENT`, `CRITICAL`

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

Manual steps to deploy assets (use `NoteshipWeb` stack outputs for bucket/distribution):

```sh
aws s3 sync apps/web/out s3://YOUR_BUCKET_NAME --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Then invalidate CloudFront to pick up new assets.

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

Ensure `AUTH0_ISSUER_BASE_URL` and `AUTH0_AUDIENCE` are set before deploying.
If you rotate Auth0 settings later, redeploy the API stack so the authorizer picks up the change.

Deploy the API stack:

```sh
cd packages/infra
cdk deploy NoteshipApi-dev -c env=dev -c region=us-east-1
```

Ensure:

- API uses Auth0 JWT authorizer (issuer + audience) and writes to provisioned tables/bucket.
- Stripe webhook endpoint is deployed and wired with secrets.
- API custom domain and certificate are configured through `NOTESHIP_API_CUSTOM_DOMAIN` and `NOTESHIP_API_CERTIFICATE_ARN`.

## Cloudflare DNS (manual)

Noteship deploys custom domains using ACM certificate ARNs and stack config, but DNS is managed in Cloudflare.
Route53 is not required for this flow.

After deploying:

1. Use `NoteshipApi` outputs:
   - `ApiCustomDomainName`
   - `ApiCloudflareCnameTarget`
2. Create/verify Cloudflare DNS for API:
   - Type `CNAME`
   - Name `<api-subdomain>` (for example `api`)
   - Target `ApiCloudflareCnameTarget`
3. Use `NoteshipCore` outputs:
   - `ContentCustomDomain`
   - `ContentCloudflareCnameTarget`
4. Create/verify Cloudflare DNS for content:
   - Type `CNAME`
   - Name `<content-subdomain>` (for example `content`)
   - Target `ContentCloudflareCnameTarget`
5. Ensure ACM certificates are validated via DNS before deploy (validation CNAMEs are added in Cloudflare).

## Auth0 (SPA flow)

- Use Auth0 SPA SDK (PKCE) with hosted Universal Login.
- Token storage: browser localStorage (simple, higher XSS risk). Keep strict CSP and avoid inline scripts.
- Silent auth requires Allowed Web Origins to include the app URL(s).
- Create separate Auth0 apps and APIs per env (dev/prod) inside one tenant:
  - SPA application (client ID per env)
  - API (audience per env)
- Configure Allowed Callback URLs (e.g., `https://app.noteship.com/callback`) and Allowed Logout URLs (e.g., `https://app.noteship.com`).

Concrete setup steps:

1. Create a **Single Page Application** in Auth0 for Noteship Web (per env).
2. Add allowed callback/logout/web origin URLs for the env domain.
3. Enable Google social connection for the SPA app.
4. Enable Passwordless Email and configure an email provider.
5. Create an **API** (Resource Server) per env; set Identifier to API URL.
6. Copy Domain + Client ID into web env vars; copy Issuer/Audience into API env vars.

## Workers deployment

```sh
cd packages/infra
cdk deploy NoteshipWorkers-dev -c env=dev -c region=us-east-1
```

## Web stack deployment (AWS hosting)

```sh
cd packages/infra
cdk deploy NoteshipWeb-dev -c env=dev -c region=us-east-1
```

The stack outputs the web bucket name and CloudFront distribution ID used in the asset deploy steps above.

## Ops guardrails stack deployment

```sh
cd packages/infra
cdk deploy NoteshipOpsGuardrails-dev -c env=dev -c region=us-east-1
```

## Post-deploy steps

- Create Stripe webhook (events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`) pointing to API.
- Create LinkedIn/Medium OAuth apps; set redirect URIs; store secrets.
- Seed plan entitlements consistent with `packages/domain/src/plans.ts`.
- Set CloudWatch alarms for DLQ message count.

## Local API/workers

There is no local Lambda runtime harness yet. For now:

- Build and typecheck with `pnpm --filter @noteship/api build` and `pnpm --filter @noteship/workers build`.
- Validate behavior by deploying to the dev stack and calling the API.

## Rollback & cleanup

- CDK stacks use `RemovalPolicy.RETAIN` for data buckets/tables. Manual cleanup is required if tearing down.
- To roll back a bad deploy: prefer CDK stack update to previous template or disable new Lambda versions/aliases once they exist.
