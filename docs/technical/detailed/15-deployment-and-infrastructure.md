# Noteship � Deployment & Infrastructure (CDK)

## Purpose

Define deployable stacks and environment layout.

## Environments

- dev
- prod

## Stacks (recommended)

1. `core-stack`
   - S3 content bucket (versioned)
   - DynamoDB tables (users, notes, posts, integrations, usage, jobs)
   - SQS jobs + DLQ
2. `api-stack`
   - API Gateway (HTTP API) + Lambdas
   - Auth0 JWT authorizer (issuer + audience)
   - Stripe webhook handler
3. `workers-stack` (to be added)
   - Worker Lambdas for embeddings/publish
   - Scheduled dispatcher Lambda (EventBridge rule, every minute) to enqueue due posts
   - Permissions to S3/DDB/SQS/Secrets/Vector DB
4. `web-stack` (AWS hosting)
   - Next.js landing SSG + dashboard SPA on S3 + CloudFront (no SSR)

## Notes on Next.js hosting

- Landing pages: SSG
- Dashboard: SPA strategy
- AWS only: S3 + CloudFront with SPA fallback to `/index.html`

## Observability

- CloudWatch logs
- Basic metrics (job success/fail, DLQ count alarms)
