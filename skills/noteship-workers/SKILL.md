---
name: noteship-workers
description: Build and maintain Noteship async worker lambdas in apps/workers for SQS jobs (embedding, publishing, scheduling), including idempotency, retries/DLQ, and connector usage; use for worker or background job changes.
---

# Noteship Workers

## Overview

- Build and maintain SQS worker lambdas in `apps/workers`.
- Execute embedding and publishing jobs reliably and idempotently.

## Guardrails

- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Use SQS with retries and DLQ; make every job idempotent.
- Read/write canonical content in S3 and metadata in DynamoDB.
- Use connectors for vendor APIs; do not bypass connector interfaces.
- Run `pnpm prettier --write .` after changes.

## Safe workflow + tests

- Keep diffs minimal; preserve public APIs unless asked.
- Follow `docs/contributing/TESTING-STRATEGY.md` and `docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md`.
- Use `.env.example` and `docs/contributing/ENV-AND-SECRETS.md` for local setup.
- Backend testing: unit tests for job logic, integration tests for I/O boundaries.
- Run quality gates (`pnpm lint`, `pnpm build`, `pnpm test` when available, `pnpm format`); CI uses `.github/workflows/ci.yml`.
- If behavior is unclear or conflicts with HLD/LLD, stop and ask.

## Typical workflow

1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Update job handlers and adapters; preserve idempotency keys.
4. Validate retry/DLQ behavior and logging.
5. Add unit/integration tests per strategy; format.

## Key areas to watch

- EMBED_NOTE: chunking, embedding versioning, vector upsert, status updates.
- PUBLISH_POST: connector calls, status transitions, error handling.
- Scheduling: dispatcher enqueues due posts; avoid duplicate publishes.

## References

See `references/doc-map.md` for which docs to open and when.
