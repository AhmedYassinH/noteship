# Noteship Infra (Status + TODO)

This package currently defines the **core** and **API** stacks.
See `docs/technical/deployment.md` and `docs/technical/detailed/15-deployment-and-infrastructure.md` for the target layout.

## Current

- Core stack: S3 content bucket, DynamoDB tables, SQS + DLQ.
- API stack: HTTP API + Lambda handlers + Auth0 JWT authorizer.

### Required env for API stack

- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_AUDIENCE`

## TODO (wiring plan)

1. **workers-stack**
   - Worker Lambdas for embedding + publish.
   - Scheduled dispatcher Lambda (EventBridge rule, every minute).
   - Permissions: S3/DDB/SQS/Secrets/Vector DB.

2. **web-stack** (if AWS hosting)
   - CloudFront + S3 for landing.
   - Next.js SPA hosting strategy if AWS-only.

3. **Observability**
   - CloudWatch alarms for DLQ and job failure spikes.

## Non-goals (MVP)

- No Kubernetes or long-running servers.
- No multi-account staging until needed.
