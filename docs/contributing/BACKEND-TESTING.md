# Backend Testing

Applies to `apps/api`, `apps/workers`, `packages/connectors`, `packages/domain`, and `packages/utils`.

Backend tests use Vitest (`vitest run --passWithNoTests` via package scripts).

## Unit tests

Use unit tests for:

- Domain rules and feature gating logic.
- Use-case flows (note save, search, publish scheduling).
- Adapter helpers that are deterministic.

Avoid over-mocking. If the behavior is a contract with another module, prefer integration tests.

## Integration tests

Use integration tests for I/O boundaries:

- DynamoDB adapter behavior.
- S3 put/get flows.
- Stripe webhook signature validation.
- Vector DB client wrapper (mock or sandbox).
- OAuth token refresh logic (mock provider responses).

Prefer local or sandboxed services. If you must mock, keep mocks shallow and validate request/response shape.

## Anti-patterns

- Mocking the system under test instead of its dependencies.
- Asserting implementation details (private method calls).
- Overspecifying AWS SDK mocks.

## Done means

- Unit/integration tests added for the change type.
- Tests run locally (or noted if not available yet).
- No change contradicts HLD/LLD or data boundaries.

## Suggested commands (recommended when tests exist)

- `pnpm test`
- `pnpm --filter @noteship/api test`
- `pnpm --filter @noteship/workers test`
- `pnpm --filter @noteship/connectors test`
- `pnpm --filter @noteship/domain test`
- `pnpm --filter @noteship/utils test`
