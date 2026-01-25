# Production Deployment Checklist

- [ ] Set CDK context `env=prod` and the target AWS region.
- [ ] Enable DynamoDB PITR for all tables (disabled in MVP for cost control).
- [ ] Update docs after enabling PITR:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/detailed/10-data-architecture.md`
  - `docs/technical/deployment.md`
- [ ] Review DynamoDB provisioned auto scaling caps (MVP caps keep Always Free limits); raise for production traffic.
- [ ] Update docs after changing caps:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/detailed/10-data-architecture.md`
  - `docs/technical/deployment.md`
- [ ] Review S3 lifecycle/retention and versioning costs.
- [ ] Configure AWS Budgets + alerts; confirm kill switch procedure (see `KILL-SWITCH.md`).
- [ ] Validate Secrets Manager/SSM values for prod.
- [ ] Verify CloudWatch alarms (DLQ, DynamoDB throttles, cost/budget alerts).

## Auth0 setup (MVP auth: hosted UI + Google SSO + passwordless email)

- [ ] Create Auth0 tenant for `prod` (separate from dev).
- [ ] Create **Regular Web App** (Noteship Web) and record:
  - [ ] Auth0 Domain
  - [ ] Client ID
  - [ ] Client Secret (store in AWS Secrets Manager; do not ship to browser)
- [ ] Configure app URLs:
  - [ ] Allowed Callback URLs (e.g., `https://app.noteship.com/api/auth/callback`)
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
  - [ ] Web: Auth0 domain, client ID, audience, redirect URLs
  - [ ] API/Infra: Auth0 issuer + audience for JWT authorizer
