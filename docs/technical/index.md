# Technical Docs Index

This index is the canonical navigation for technical docs. Link here when
referencing other technical docs so future moves only require updating this file.

## Structure

- `/docs/technical`
  - Entry points and summaries (HLD, LLD, this index).
- `/docs/technical/foundation`
  - Product/requirements + system-level deep dives (numbered).
- `/docs/technical/frontend`
  - Frontend architecture (numbered).
- `/docs/technical/backend`
  - Backend, API, data, integrations, embeddings, billing (numbered).
- `/docs/technical/testing`
  - Testing strategy (numbered).
- `/docs/technical/ops`
  - Operations, deployment, CI, infra, runbooks.

## Numbering convention

Deep-dive docs keep numeric prefixes (`01-`, `02-`, ...). Keep the numbering and
update this index when adding or moving numbered docs.

## Entry points

- `docs/technical/noteship-system-architecture.md`
- `docs/technical/noteship-low-level-design.md`

## Deep-dive index (numbered)

### Foundation

- `docs/technical/foundation/01-product-vision-and-positioning.md`
- `docs/technical/foundation/02-user-personas-and-jtbd.md`
- `docs/technical/foundation/03-mvp-scope-and-feature-definition.md`
- `docs/technical/foundation/04-pricing-plans-and-entitlements.md`
- `docs/technical/foundation/05-functional-requirements.md`
- `docs/technical/foundation/06-non-functional-requirements.md`
- `docs/technical/foundation/07-system-high-level-architecture.md`

### Frontend

- `docs/technical/frontend/08-frontend-architecture.md`

### Backend (includes API + data)

- `docs/technical/backend/09-backend-architecture.md`
- `docs/technical/backend/10-data-architecture.md`
- `docs/technical/backend/11-api-design-and-contracts.md`
- `docs/technical/backend/12-connector-and-integration-architecture.md`
- `docs/technical/backend/13-embedding-and-semantic-search-design.md`
- `docs/technical/backend/14-billing-and-stripe-integration.md`

### Ops (includes infra)

- `docs/technical/ops/15-deployment-and-infrastructure.md`
- `docs/technical/ops/17-operational-observability-and-cost-guardrails.md`

### Testing

- `docs/technical/testing/16-testing-and-quality-strategy.md`

## Ops runbooks

- `docs/technical/ops/deployment.md`
- `docs/technical/ops/ci-iam-policy.md`
- `docs/technical/ops/dev-environment.md`
- `docs/technical/ops/production-checklist.md`

## Placement rules (quick)

- Product/requirements and system-level docs: `docs/technical/foundation`.
- Backend, API, data, integrations, embeddings: `docs/technical/backend`.
- Frontend: `docs/technical/frontend`.
- Testing: `docs/technical/testing`.
- Ops, deployment, CI, infra: `docs/technical/ops`.

If multiple locations seem plausible, document the choice in the change and update
the doc map (`.agents/skills/noteship-contrib/references/doc-map.md`).
