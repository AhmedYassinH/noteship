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
2. `api-stack` (to be added)
   - API Gateway + Lambdas
   - JWT authorizer integration
   - Stripe webhook handler
3. `workers-stack` (to be added)
   - Worker Lambdas for embeddings/publish/scheduling
   - Permissions to S3/DDB/SQS/Secrets/Vector DB
4. `web-stack` (if hosting on AWS)
   - Next.js landing SSG + dashboard SPA (Vercel preferred otherwise)

## Notes on Next.js hosting

- Landing pages: SSG
- Dashboard: SPA strategy
- Preferred: Vercel. If AWS-only, use S3/CloudFront for SSG and a proven Next-on-AWS pattern for the SPA.

## Observability

- CloudWatch logs
- Basic metrics (job success/fail, DLQ count alarms)
