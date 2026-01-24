# Testing Strategy (Source of Truth)

This doc operationalizes `docs/technical/detailed/16-testing-and-quality-strategy.md` for day-to-day contributions.
When in doubt, that document and the HLD/LLD win.

## Goals

- Prevent regressions in core flows (notes, search, publish, billing).
- Keep tests fast and reliable for MVP velocity.
- Make changes safe for both humans and AI agents.

## Test pyramid

1. Unit tests: fast, deterministic, majority of coverage (backend only).
2. Integration tests: validate I/O boundaries (DDB, S3, SQS, Stripe, Vector DB).
3. E2E tests: minimal set of critical user flows (Playwright).

## Red-Green-Refactor (TDD)

Apply TDD where logic is pure or boundary-limited:

- Domain rules and use-cases.
- Data transforms and validation logic.
- Adapter wrappers with deterministic outcomes.

Skip strict TDD only when UI or async behavior makes it impractical; still add coverage after the change.

## Backend vs frontend split

- Backend (apps/api, apps/workers, packages/\*):
  - Unit tests for domain/use-case logic.
  - Integration tests for adapters (DDB, S3, Stripe, Vector DB, OAuth).
- Frontend (apps/web):
  - No unit or component tests.
  - Playwright E2E only for critical flows.

## When Playwright is required

Add or update E2E tests when a change impacts:

- Auth/login flow or session handling.
- Note create/edit or search results.
- Publish/schedule flows or post status updates.
- Billing upgrade or entitlement enforcement.

## Current scripts (repo truth)

- `pnpm lint` (turbo lint)
- `pnpm test` (turbo test)
- `pnpm build` (turbo build)
- `pnpm format` (pnpm prettier --write .)

Playwright note: `pnpm test` skips E2E unless `RUN_E2E=1`. Use `pnpm --filter @noteship/web test:e2e` for explicit runs.
Backend test scripts use Vitest (`vitest run --passWithNoTests`).

## Env for tests

Use `.env.example` as the local template and follow `docs/contributing/ENV-AND-SECRETS.md`.

These are recommended additions, not required today.
