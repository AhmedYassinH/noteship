# Noteship — Testing & Quality Strategy

## Purpose
Define what tests exist and what they cover for an MVP.

## Backend testing
### Unit tests (fast)
- Entitlements checks
- Chunking logic
- Mapping/transform functions
- Idempotency helpers

### Integration tests
- DynamoDB adapter behavior (localstack or test table)
- S3 put/get flows
- Stripe webhook signature verification logic (mock)
- Vector DB client wrapper (mock or sandbox)

## Frontend testing
- Minimal unit tests for critical utilities
- Component tests optional

## End-to-end tests (small set)
Use Playwright (not Selenium).
Cover only critical flows:
1) login/signup
2) create note
3) semantic search returns note
4) connect provider (mock/sandbox)
5) schedule publish and see status

## CI pipeline (minimum)
- typecheck
- lint
- unit tests
- build
- e2e on stage (optional early)
