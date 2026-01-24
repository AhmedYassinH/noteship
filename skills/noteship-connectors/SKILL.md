---
name: noteship-connectors
description: Build and maintain Noteship connector modules in packages/connectors for publish/import vendors (LinkedIn, Medium), including OAuth handling, rate limits, and connector interfaces; use for integration work.
---

# Noteship Connectors

## Overview
- Build and maintain connector modules in `packages/connectors`.
- Keep vendor-specific logic isolated behind connector interfaces.

## Guardrails
- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Keep vendor fields inside connector modules, not domain entities.
- Handle rate limits, token refresh, and provider errors consistently.
- Use normalized internal models for notes/posts.
- Run `pnpm prettier --write .` after changes.

## Typical workflow
1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Implement or update connector interface methods.
4. Validate OAuth/token handling and error mapping.
5. Add tests per strategy; format.

## Key areas to watch
- Publish pipeline: status transitions and idempotency with workers.
- Integration accounts: per-user provider state and token storage.

## References
See `references/doc-map.md` for which docs to open and when.
