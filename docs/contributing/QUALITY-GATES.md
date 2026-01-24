# Quality Gates

These are the minimum checks before merging.

## Required gates (MVP)

- Lint: `pnpm lint`
- Build: `pnpm build`
- Tests: `pnpm test` (backend-focused; frontend relies on Playwright only)
- Format: `pnpm format`

## Optional gates (when ready)

- Playwright E2E on merge to main
- Security scans (dependency audit)

## Stop-ship rules

- Failures in core flows (notes, search, publish, billing).
- Regressions in data boundaries (S3/DDB/Vector DB).
- Broken auth or entitlement enforcement.
- E2E failures for critical paths.
