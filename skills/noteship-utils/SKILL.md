---
name: noteship-utils
description: Maintain shared utility helpers in packages/utils (logging, ids, time, small helpers) with minimal dependencies; use for cross-cutting utility changes.
---

# Noteship Utils

## Overview

- Maintain small, reusable utilities in `packages/utils`.
- Keep dependencies minimal and APIs stable for all apps.

## Guardrails

- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Prefer pure functions and avoid app-specific logic.
- Keep logging structured and consistent with NFRs.
- Avoid new dependencies unless required by MVP behavior.
- Run `pnpm prettier --write .` after changes.

## Safe workflow + tests

- Keep diffs minimal; preserve public APIs unless asked.
- Follow `docs/contributing/TESTING-STRATEGY.md` and `docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md`.
- Backend testing: unit tests for pure helpers, integration tests only when I/O boundaries are touched.
- Run quality gates (`pnpm lint`, `pnpm build`, `pnpm test` when available, `pnpm format`).
- If behavior is unclear or conflicts with HLD/LLD, stop and ask.

## Typical workflow

1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Implement utility changes with tests.
4. Validate usage across apps/packages.
5. Format.

## Key areas to watch

- ID generation and time helpers used by API/workers.
- Logging helpers for request/job correlation.

## References

See `references/doc-map.md` for which docs to open and when.
