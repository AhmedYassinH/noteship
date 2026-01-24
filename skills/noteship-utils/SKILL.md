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
