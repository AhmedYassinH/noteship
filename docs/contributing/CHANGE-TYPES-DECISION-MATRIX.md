# Change Types Decision Matrix

This matrix makes required tests explicit and avoids bikeshedding.

| Change type                        | Required tests                          | Required gates                         |
| ---------------------------------- | --------------------------------------- | -------------------------------------- |
| Doc-only change                    | None                                    | `pnpm format`                          |
| New domain rule (packages/domain)  | Unit tests                              | `pnpm lint`, `pnpm test`, `pnpm build` |
| Data model change (DDB/S3 paths)   | Unit + integration tests                | `pnpm lint`, `pnpm test`, `pnpm build` |
| New API endpoint or handler        | Unit + integration tests                | `pnpm lint`, `pnpm test`, `pnpm build` |
| Worker job logic change            | Unit + integration tests                | `pnpm lint`, `pnpm test`, `pnpm build` |
| Connector change (LinkedIn/Medium) | Unit + integration tests                | `pnpm lint`, `pnpm test`, `pnpm build` |
| New UI flow (app/web)              | Playwright E2E                          | `pnpm lint`, `pnpm test`, `pnpm build` |
| UI copy/visual change only         | No tests required                       | `pnpm lint`, `pnpm build`              |
| Billing/entitlements change        | Unit + integration + E2E (if user flow) | `pnpm lint`, `pnpm test`, `pnpm build` |
| Refactor (no behavior change)      | Unit tests for impacted logic           | `pnpm lint`, `pnpm test`, `pnpm build` |
| Dependency update                  | Run existing tests; add smoke test      | `pnpm lint`, `pnpm test`, `pnpm build` |

Notes:

- If a required test does not exist yet, add it or mark as a recommended follow-up.
- E2E is required when a change affects a critical user path.
