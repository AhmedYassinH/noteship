---
name: noteship-api
description: Build and maintain the Noteship REST API lambdas in apps/api, including handlers, use-cases, validation, S3/DynamoDB boundaries, billing endpoints, and entitlements enforcement; use for backend API work.
---

# Noteship API

## Overview
- Build and maintain the API Gateway + Lambda handlers in `apps/api`.
- Keep handlers thin and push logic into use-cases and adapters.

## Guardrails
- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Enforce entitlements server-side; UI only adapts.
- Store canonical content in S3 and metadata in DynamoDB.
- Enqueue async work (embedding/publish) to SQS; do not call vendor APIs directly in handlers.
- Use zod validation and consistent `{ code, message }` errors.
- Run `pnpm prettier --write .` after changes.

## Typical workflow
1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Update handler -> use-case -> adapter layers; keep interfaces clean.
4. Add/adjust zod schemas and shared types.
5. Add tests per strategy; format.

## Key areas to watch
- Auth: derive `userId` from JWT authorizer.
- Idempotency keys on publish/schedule endpoints.
- Stripe webhook verification and idempotent processing.
- Presigned uploads for attachments.

## References
See `references/doc-map.md` for which docs to open and when.
