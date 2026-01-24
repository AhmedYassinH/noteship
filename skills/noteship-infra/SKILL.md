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

## References
See `references/doc-map.md` for which docs to open and when.
