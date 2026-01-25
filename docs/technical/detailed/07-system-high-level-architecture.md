# Noteship — System High-Level Architecture (HLD)

## Purpose

Describe major components, boundaries, and data flows.

## Components

- Next.js web app (landing + dashboard)
- API Gateway (HTTP API) + Lambda
- Auth0 JWT authorizer (hosted login, Google SSO, passwordless email)
- DynamoDB (metadata, posts, integration accounts, usage)
- S3 (Markdown notes + artifacts)
- SQS + Lambda workers (publishing, embedding)
- Vector DB (Qdrant Cloud)
- Stripe (billing)
- OAuth providers (LinkedIn, Medium)

## High-level diagram

```mermaid
flowchart LR
  U[User] --> W[Next.js Web App]
  W -->|JWT| APIGW[API Gateway]
  APIGW --> L1[Lambda API]

  L1 --> DDB[(DynamoDB)]
  L1 --> S3[(S3: notes + artifacts)]
  L1 --> Q1[SQS: jobs]

  Q1 --> W1[Lambda Worker: embed/publish]
  W1 --> DDB
  W1 --> S3
  W1 --> VDB[(Vector DB)]
  W1 --> LI[LinkedIn API]
  W1 --> MED[Medium API]

  W --> STR[Stripe Checkout]
  STR --> WH[Stripe Webhook Lambda]
  WH --> DDB
```

## Key flows

### Note save

1. Web app sends note content
2. API stores Markdown to S3 + metadata to DynamoDB
3. API emits embed job to SQS

### Search

1. Web app calls search endpoint with query
2. API queries vector DB
3. API returns ranked note references + previews

### Publish/schedule

1. User creates post from note
2. API enqueues publish job
3. Worker calls LinkedIn/Medium, updates status, retries failures
