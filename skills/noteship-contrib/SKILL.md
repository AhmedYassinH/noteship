---
name: noteship-contrib
description: Cross-cutting Noteship contribution workflow for PR/test/change hygiene, minimal diffs, and quality gates; use when preparing PRs, planning tests, or making changes that span multiple apps/packages.
---

# Noteship Contrib

## Overview

- Apply a safe, minimal-diff workflow across the repo.
- Treat contributing docs as policy; stop if a change conflicts with HLD/LLD.

## Core rules

- Keep diffs minimal; preserve public APIs unless asked.
- No broad refactors while fixing a bug.
- Avoid over-mocking; prefer real integration boundaries when feasible.
- If behavior is unclear, stop and ask for spec.

## Workflow (enforced)

Plan → Tests → Code → Run → Fix → Refactor → Run again

## Test selection (quick rules)

- Pure business rule → unit test (backend only).
- DB/S3/SQS/Stripe/Vector DB boundary → integration test.
- UI critical path → Playwright E2E only (no frontend unit/component tests).
- Bug fix → regression test at the lowest sensible level.

## Quality gates

- `pnpm lint`
- `pnpm build`
- `pnpm test` (when test scripts exist)
- `pnpm format`

Do not claim done without green gates.

## Required outputs

- Test plan (see `assets/templates/test_plan.md`).
- Commands run + results.
- Risks + mitigations.
- Acceptance criteria.

## References

See `references/doc-map.md` for policy docs.
