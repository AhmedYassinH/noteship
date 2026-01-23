# Noteship — Non-Functional Requirements (NFR)

## Availability & reliability
- NFR-1: Core API should be resilient to transient third-party failures (retry + DLQ)
- NFR-2: Asynchronous jobs must be idempotent (safe to retry)

## Performance
- NFR-3: Note listing < 300ms p95 (excluding client network)
- NFR-4: Semantic search response < 1s p95 at MVP scale (vector DB dependent)

## Security
- NFR-5: Per-user isolation enforced server-side
- NFR-6: OAuth tokens stored encrypted (KMS/Secrets Manager or encrypted DB fields)
- NFR-7: S3 objects are private; access via signed URLs if needed

## Cost
- NFR-8: Serverless-first; avoid fixed-cost clusters in MVP
- NFR-9: Embedding cost minimized via chunking and versioned re-embedding

## Observability
- NFR-10: Structured logs with request IDs
- NFR-11: Basic metrics for job success/failure and publish outcomes
