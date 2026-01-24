---
name: noteship-domain
description: Maintain shared domain types, feature keys, plans, and entitlements in packages/domain; use for changes that affect plan gating, shared schemas, or cross-app types.
---

# Noteship Domain

## Overview

- Maintain shared domain types and feature/plan definitions in `packages/domain`.
- Keep entitlements and feature keys aligned with billing and API behavior.

## Guardrails

- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Keep plan IDs stable; map Stripe price IDs to internal plan IDs.
- Backend is source of truth for entitlements; UI mirrors.
- Update feature keys and quotas in one place; avoid drift.
- Run `pnpm prettier --write .` after changes.

## Typical workflow

1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Update plan/entitlement definitions and shared types.
4. Align API contracts and billing expectations.
5. Add tests per strategy; format.

## Key areas to watch

- Feature keys and quota limits.
- Usage counters and period logic.

## References

See `references/doc-map.md` for which docs to open and when.
