# Production Deployment Checklist

Use `docs/technical/ops/deployment.md` as the source of truth. This checklist mirrors the critical production steps.

## 1) Pre-flight

- [ ] Confirm `docs/technical/ops/deployment.md` reflects the latest deployment steps.
- [ ] Review `docs/technical/ops/ci-iam-policy.md` and update CI/CD web deploy settings for prod (bucket, distribution ID, role/credentials).
- [ ] Confirm AWS SSO profile for prod access is configured.
- [ ] Confirm tagging strategy (same AWS account, env tags for prod).

## 2) Core infrastructure (CDK)

- [ ] Set CDK context `env=prod` and target AWS region.
- [ ] Bootstrap the account/region if not already done.
- [ ] Deploy core stack: `NoteshipCore-prod`.
- [ ] Update `noteship/prod/runtime` secret values (Auth0 + integrations + LLM + Stripe).
- [ ] Deploy API stack: `NoteshipApi-prod`.
- [ ] Deploy Workers stack: `NoteshipWorkers-prod`.
- [ ] Deploy Web stack: `NoteshipWeb-prod`.
- [ ] Validate stack outputs (API URL, bucket/table names).
- [ ] Confirm Auth0/Stripe/Qdrant/etc env vars are set in the shell before `cdk deploy` (see `docs/technical/ops/deployment.md`).
- [ ] Confirm custom domains/certs env vars are set before deploy:
  - [ ] `NOTESHIP_API_CUSTOM_DOMAIN`, `NOTESHIP_API_CERTIFICATE_ARN`
  - [ ] `NOTESHIP_CONTENT_CUSTOM_DOMAIN`, `NOTESHIP_CONTENT_CERTIFICATE_ARN`

## 3) DynamoDB production controls

- [ ] Enable PITR for all tables (disabled in MVP for cost control).
- [ ] Update docs after enabling PITR:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/index.md` (Backend -> Data architecture)
  - `docs/technical/ops/deployment.md`
- [ ] Review provisioned auto scaling caps; raise for expected production traffic.
- [ ] Update docs after changing caps:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/index.md` (Backend -> Data architecture)
  - `docs/technical/ops/deployment.md`

## 4) Web hosting (AWS S3 + CloudFront)

- [ ] Create/verify web hosting S3 bucket (public access blocked).
- [ ] Create/verify CloudFront distribution with OAC/OAI.
- [ ] Configure SPA routing (403/404 to `/index.html`).
- [ ] Set DNS + ACM certificate for the web domain.
- [ ] Set DNS + ACM certificate for API/content domains (Cloudflare CNAMEs to stack outputs).
- [ ] Upload `apps/web/out` to the web bucket and invalidate CloudFront.

## 5) Auth0 setup (SPA auth: hosted UI + Google SSO + passwordless email)

- [ ] Use a single Auth0 tenant with separate dev/prod apps and APIs.
- [ ] Create **SPA application** (Noteship Web, prod) and record:
  - [ ] Auth0 Domain
  - [ ] Client ID
- [ ] Configure app URLs:
  - [ ] Allowed Callback URLs (e.g., `https://app.noteship.com/callback`)
  - [ ] Allowed Logout URLs (e.g., `https://app.noteship.com`)
  - [ ] Allowed Web Origins (e.g., `https://app.noteship.com`)
- [ ] Enable **Google** social connection:
  - [ ] Create Google OAuth client (Google Cloud Console)
  - [ ] Add Google Client ID/Secret to Auth0 connection
  - [ ] Enable the connection for the Noteship Web app
- [ ] Enable **Passwordless Email** connection:
  - [ ] Configure email provider (recommend SES or SendGrid)
  - [ ] Customize email templates (brand + link expiration)
  - [ ] Enable connection for the Noteship Web app
- [ ] Create Auth0 **API (Resource Server)** for Noteship:
  - [ ] Identifier (audience) set to API URL (e.g., `https://api.noteship.com`)
  - [ ] Token signing algorithm = RS256
- [ ] Wire prod environment variables:
  - [ ] Web: `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, `NEXT_PUBLIC_AUTH0_AUDIENCE`, `NEXT_PUBLIC_AUTH0_REDIRECT_URI`, `NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ENV`
  - [ ] API/Infra: `AUTH0_ISSUER_BASE_URL`, `AUTH0_AUDIENCE`

## 6) Secrets and integrations

- [ ] Validate prod environment variables (Stripe, OAuth, Qdrant, LLM).
- [ ] Create Stripe webhook for prod events.
- [ ] Create LinkedIn/Medium OAuth apps with prod redirect URIs.

## 7) Observability + cost guardrails

- [ ] Verify CloudWatch alarms (DLQ, DynamoDB throttles, API errors).
- [ ] Configure AWS Budgets + alerts; confirm guardrails procedure (see `docs/technical/index.md` (Ops)).
- [ ] Review S3 lifecycle/retention and versioning costs.

## 8) Smoke checks

- [ ] Web login/logout works in production.
- [ ] `/me` returns expected data when called with a prod token.
