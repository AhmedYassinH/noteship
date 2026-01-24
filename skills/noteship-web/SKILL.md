---
name: noteship-web
description: Build and maintain the Noteship Next.js app (landing + dashboard), including UI, TipTap editor, i18n/RTL, entitlements gating, and API integration; use for work in apps/web or frontend UX changes.
---

# Noteship Web

## Overview

- Build and maintain the Next.js app in `apps/web` (landing + dashboard).
- Keep UI aligned with MVP scope and HLD/LLD; UI never enforces security.

## Guardrails

- Follow HLD/LLD and detailed docs; update docs first if a change conflicts.
- Keep localized copy in `apps/web/data/*` as `{ en, ar }` objects.
- Use RTL/LTR rules: set `lang`/`dir`, use logical CSS props, mirror directional icons.
- Do not call vendor APIs from the browser; go through the API.
- Run `pnpm prettier --write .` after changes.

## Safe workflow + tests

- Keep diffs minimal; preserve public APIs unless asked.
- Follow `docs/contributing/TESTING-STRATEGY.md` and `docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md`.
- Use `.env.example` and `docs/contributing/ENV-AND-SECRETS.md` for local setup.
- Frontend testing: Playwright E2E only for critical paths (no unit/component tests).
- Run quality gates (`pnpm lint`, `pnpm build`, `pnpm test` when available, `pnpm format`); CI uses `.github/workflows/ci.yml`.
- If behavior is unclear or conflicts with HLD/LLD, stop and ask.

## Typical workflow

1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Implement UI + API calls; use shared types and zod schemas.
4. Validate entitlements UX and RTL/LTR behavior.
5. Run Playwright E2E for critical flows when needed; format.

## Key areas to watch

- TipTap serialization to Markdown for storage.
- Attachment uploads via presigned URLs.
- Entitlements: hide vs disable + upsell; backend is source of truth.
- Locale-specific assets and copy; avoid hardcoded strings in components.

## References

See `references/doc-map.md` for which docs to open and when.
