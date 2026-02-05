---
name: noteship-infra
description: Build and maintain Noteship infrastructure in packages/infra (CDK stacks, env naming, permissions, observability); use for deployment or infrastructure changes.
---

# Noteship Infra

## Overview

- Build and maintain CDK stacks in `packages/infra`.
- Keep infrastructure aligned with HLD/LLD and MVP scope.

## Guardrails

- Follow HLD/LLD and deployment docs; update docs first if a change conflicts.
- Provision only MVP resources; avoid extra services.
- Keep data stores private and versioned where specified.
- Store secrets in Secrets Manager/SSM; do not hardcode.
- Run `pnpm prettier --write .` after changes.

## Safe workflow + tests

- Keep diffs minimal; preserve public APIs unless asked.
- Follow `docs/contributing/TESTING-STRATEGY.md` and `docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md`.
- Use `.env.example` and `docs/contributing/ENV-AND-SECRETS.md` for local setup.
- Run quality gates (`pnpm lint`, `pnpm build`, `pnpm test` when available, `pnpm format`).
- CI uses `.github/workflows/ci.yml`.
- If behavior is unclear or conflicts with HLD/LLD, stop and ask.

## Typical workflow

1. Verify the request fits MVP scope.
2. Read relevant docs (see `references/doc-map.md`).
3. Update CDK stacks and environment config.
4. Validate permissions, alarms, and naming conventions.
5. Add tests or synth checks; format.

## Key areas to watch

- Stack boundaries (core, api, workers, web).
- Queue + DLQ configuration and retention policies.
- Observability basics (logs, metrics, alarms).
- CloudFront signer and content cookie domain env wiring.

## References

See `references/doc-map.md` for which docs to open and when.
