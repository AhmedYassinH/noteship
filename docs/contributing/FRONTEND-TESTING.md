# Frontend Testing

Applies to `apps/web` (Next.js).

## Playwright E2E (only)

Use Playwright for critical user flows only (see `docs/contributing/PLAYWRIGHT-E2E.md`).

## Done means

- Required E2E tests updated (critical paths only).
- UI changes validated in both LTR and RTL.
- No hardcoded copy in components; copy lives in `apps/web/data/*`.

## Suggested commands (recommended when tests exist)

- `pnpm test`
- `pnpm --filter @noteship/web test:e2e`

Local E2E settings:

- `E2E_BASE_URL` sets the target base URL (defaults to `http://localhost:3000`).
- `RUN_E2E=1 pnpm --filter @noteship/web test` runs E2E via the `test` script.
