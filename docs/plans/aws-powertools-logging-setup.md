# AWS Lambda Powertools Logging — Implementation Plan

_Created: 2026-01-28_
_Updated: 2026-01-28_

## Implementation Status: IN PROGRESS

## 1) Goal

Ship consistent, structured logging for API and worker Lambdas using AWS Lambda Powertools Logger, aligned with MVP architecture and existing runtime conventions.

---

## 2) Scope

### In scope

- Add Powertools Logger to apps/api and apps/workers
- Centralize request/job context (requestId, userId, jobId, etc.)
- Standardize error logging with stack traces
- Add env vars for log level + service name via infra stacks
- Ensure logs do not leak context across requests/messages

### Out of scope

- Changing log retention/CloudWatch setup
- Adding metrics/tracing (can be added later)
- Adding 3rd-party observability vendors

---

## 3) References (must align)

- [noteship-system-architecture.md](../technical/noteship-system-architecture.md)
- [noteship-low-level-design.md](../technical/noteship-low-level-design.md)
- [noteship-api SKILL.md](../../.github/skills/noteship-api/SKILL.md)

---

## 3.1) Docs update agenda (mandatory)

Use this checklist during implementation so updates aren’t missed.

### Architecture/LLD alignment

- [x] **Doc A1** — Confirm no changes are required to HLD/LLD.
- [x] **Doc A2** — If logging changes affect runtime behavior/boundaries, update:
  - [noteship-system-architecture.md](../technical/noteship-system-architecture.md)
  - [noteship-low-level-design.md](../technical/noteship-low-level-design.md)

### Environment and ops docs

- [x] **Doc B1** — If new env vars are added, update:
  - docs/contributing/ENV-AND-SECRETS.md (add `POWERTOOLS_SERVICE_NAME`, `POWERTOOLS_LOG_LEVEL`, optional `POWERTOOLS_LOGGER_SAMPLE_RATE`)
  - docs/technical/ops/dev-environment.md (note required env vars for local API/workers)

### API/Workers runbooks

- [x] **Doc C1** — Update docs for log validation:
  - docs/contributing/BACKEND-TESTING.md
  - docs/contributing/QUALITY-GATES.md (optional)

### Plan tracking

- [x] **Doc D1** — Update this plan’s status and checklists when work is complete.

---

## 4) Technical decisions

- Logging library: `@aws-lambda-powertools/logger`
- Log format: JSON structured logs
- Log level: `POWERTOOLS_LOG_LEVEL` (fallback `LOG_LEVEL`)
- Service name: `POWERTOOLS_SERVICE_NAME` (fallback to default)
- Consistent metadata keys: `service`, `environment`, `requestId`, `userId`, `jobId`, `jobType`, `messageId`
- **No DI container for logger**: keep a module-level singleton to avoid changing use-case signatures.

---

## 5) Files to change (overview)

### apps/api

- apps/api/package.json (dependency)
- apps/api/src/runtime/logger.ts (new)
- apps/api/src/runtime/handler.ts (request context, start/end/error logs)
- apps/api/src/handlers/\*\* (targeted logs)

### apps/workers

- apps/workers/package.json (dependency)
- apps/workers/src/runtime/logger.ts (new)
- apps/workers/src/handlers/jobs.ts (per-record logging)
- apps/workers/src/handlers/scheduler.ts (tick logging)

### infra

- packages/infra/src/stacks/api.ts (env vars)
- packages/infra/src/stacks/workers.ts (env vars)

---

## 6) Implementation plan (step-by-step)

### Phase A — Dependencies (runtime)

- [x] **A1** — Add `@aws-lambda-powertools/logger` to apps/api `dependencies` (not devDependencies).
- [x] **A2** — Add `@aws-lambda-powertools/logger` to apps/workers `dependencies` (not devDependencies).
- [x] **A3** - Update pnpm-lock.yaml.

### Phase B — API logger module

- [x] **B1** — Create apps/api/src/runtime/logger.ts:
  - Read `POWERTOOLS_LOG_LEVEL` (fallback `LOG_LEVEL`)
  - Read `POWERTOOLS_SERVICE_NAME` (fallback "noteship-api")
  - Export `logger` and helper `appendRequestContext()`.
- [x] **B2** — Update apps/api/src/runtime/handler.ts:
  - Append request context at start.
  - Log `request_start` and `request_end` with duration.
  - On error, log `request_error` with stack.
- [x] **B3** — Clear or reset appended keys between invocations to avoid context bleed.

### Phase C — Worker logger module

- [x] **C1** — Create apps/workers/src/runtime/logger.ts:
  - Read `POWERTOOLS_LOG_LEVEL` + `POWERTOOLS_SERVICE_NAME` (fallback "noteship-workers").
  - Export `logger` and helper `appendJobContext()`.
- [x] **C2** — Update apps/workers/src/handlers/jobs.ts:
  - For each SQS record, append context and log `job_start`/`job_end`.
  - On error, log `job_error` with stack.
  - Clear context before processing next record.
- [x] **C3** — Update apps/workers/src/handlers/scheduler.ts:
  - Log `scheduler_tick`, `scheduler_tick_complete`, and `scheduler_tick_error`.

### Phase D — Infra env vars

- [x] **D1** — Set env vars in packages/infra/src/stacks/api.ts:
  - `POWERTOOLS_SERVICE_NAME=noteship-api`
  - `POWERTOOLS_LOG_LEVEL=INFO` in prod, `DEBUG` in non-prod
- [x] **D2** — Set env vars in packages/infra/src/stacks/workers.ts:
  - `POWERTOOLS_SERVICE_NAME=noteship-workers`
  - `POWERTOOLS_LOG_LEVEL=INFO` in prod, `DEBUG` in non-prod

### Phase E — Targeted logs

- [x] **E1** — Add minimal targeted `logger.info()`:
  - `billing/webhook`: event type (safe, not PII)
  - `notes/create`, `notes/update`: `noteId`, `userId`
  - `posts/publish`: `postId`, `provider`, `userId`

### Phase F — Validation & QA

- [ ] **F1** - Run `pnpm lint` and `pnpm build`.
- [ ] **F2** — Verify CloudWatch logs in dev:
  - Structured JSON logs
  - Request/job metadata present
  - No cross-request context leakage

---

## 6.1) Plan tracking (agent updates)

### Progress

- **Status:** IN PROGRESS
- **Last updated:** 2026-01-29
- **Owner:** @codex

### Actions token

- **Token format:** `A{step}-B{step}-C{step}`
- **Example:** `A1-A2-B1` (means A1, A2, B1 done)
- **Current:** `A1-A2-A3-B1-B2-B3-C1-C2-C3-D1-D2-E1`

### Notes

- Completed: phases A-E (deps, logger modules, handlers, infra envs, targeted logs) + docs updates.
- Blocked: F1 (build failed in @noteship/web: spawn EPERM), F2 pending CloudWatch validation.
- Next: re-run `pnpm build` after fixing EPERM, then verify logs in dev.

---

## 7) Logging conventions

### API logs

- `request_start`: `requestId`, `path`, `routeKey`, `method`, `userId?`
- `request_end`: `requestId`, `statusCode`, `durationMs`
- `request_error`: `requestId`, `statusCode`, `durationMs`, `error`, `stack`

### Worker logs

- `job_start`: `jobId`, `jobType`, `messageId`, `userId`
- `job_end`: `jobId`, `jobType`, `durationMs`, `status`
- `job_error`: `messageId`, `durationMs`, `error`, `stack`

---

## 8) Risks & mitigations

| Risk                           | Mitigation                                |
| ------------------------------ | ----------------------------------------- |
| Over-logging increases cost    | Log only boundaries and errors            |
| Context bleed between requests | Clear appended keys after each invocation |
| Env mismatch across stacks     | Set env vars in infra only                |

---

## 9) Success criteria

- Structured logs emitted in API and worker Lambdas
- Each request/job log includes correlation keys
- Unexpected errors include stack traces
- No API response shape changes

---

## 10) Estimated effort

| Phase | Estimate |
| ----- | -------- |
| A     | 10 min   |
| B     | 30 min   |
| C     | 30 min   |
| D     | 15 min   |
| E     | 20 min   |
| F     | 30 min   |
| Total | ~2 hrs   |
