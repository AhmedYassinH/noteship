# Doc Map - noteship-contrib

## Policy source of truth (process)

- docs/contributing/AI-AND-HUMAN-CONTRIBUTING.md
- docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md
- docs/contributing/QUALITY-GATES.md
- docs/contributing/TESTING-STRATEGY.md
- docs/contributing/ENV-AND-SECRETS.md

## Architecture source of truth

- docs/technical/noteship-system-architecture.md (HLD)
- docs/technical/noteship-low-level-design.md (LLD)

## Product and requirements

- docs/noteship-product-definition.md
- docs/technical/detailed/01-product-vision-and-positioning.md
- docs/technical/detailed/02-user-personas-and-jtbd.md
- docs/technical/detailed/03-mvp-scope-and-feature-definition.md
- docs/technical/detailed/04-pricing-plans-and-entitlements.md
- docs/technical/detailed/05-functional-requirements.md
- docs/technical/detailed/06-non-functional-requirements.md

## Architecture and design (deep dives)

- docs/technical/detailed/07-system-high-level-architecture.md
- docs/technical/detailed/08-frontend-architecture.md
- docs/technical/detailed/09-backend-architecture.md
- docs/technical/detailed/10-data-architecture.md
- docs/technical/detailed/11-api-design-and-contracts.md
- docs/technical/detailed/12-connector-and-integration-architecture.md
- docs/technical/detailed/13-embedding-and-semantic-search-design.md
- docs/technical/detailed/14-billing-and-stripe-integration.md
- docs/technical/detailed/15-deployment-and-infrastructure.md
- docs/technical/detailed/16-testing-and-quality-strategy.md
- docs/technical/detailed/17-operational-observability-and-cost-guardrails.md

## Technical entrypoints

- docs/technical/index.md
- docs/technical/ops/deployment.md
- docs/technical/ops/ci-iam-policy.md
- docs/technical/ops/dev-environment.md
- docs/technical/noteship-system-architecture.md
- docs/technical/noteship-low-level-design.md

## Operations and runbooks

- docs/technical/ops/deployment.md
- docs/technical/ops/ci-iam-policy.md
- docs/technical/ops/dev-environment.md
- docs/technical/ops/production-checklist.md

## Brand and marketing

- docs/brand/noteship-brand-foundation.md
- docs/brand/noteship-visual-identity.md
- docs/brand/noteship-typography.md
- docs/brand/noteship-language-guidelines.md
- docs/brand/noteship-layout-rtl-ltr.md
- docs/brand/noteship-ai-voice-spec.md
- docs/brand/noteship-messaging.md
- docs/brand/noteship-marketing-assets.md
- docs/brand/noteship-marketing-pages-design-spec.md

## Contributing

- docs/contributing/README.md
- docs/contributing/AI-AND-HUMAN-CONTRIBUTING.md
- docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md
- docs/contributing/QUALITY-GATES.md
- docs/contributing/TESTING-STRATEGY.md
- docs/contributing/ENV-AND-SECRETS.md
- docs/contributing/BACKEND-TESTING.md
- docs/contributing/FRONTEND-TESTING.md
- docs/contributing/PLAYWRIGHT-E2E.md

## Plans and templates

- docs/plans/plan-template.md
- docs/plans/2026-01-30-web-alignment-with-product-brand.md
- docs/plans/aws-powertools-logging-setup.md
- docs/plans/local-emulator-setup.md

## Triage by location (primary)

If multiple docs are plausible, ask the user to choose before updating.

### API

- Consult: HLD/LLD, backend architecture, API design, data architecture, billing/entitlements if touched.
- Update when: endpoint contracts, auth/entitlements, or API behavior changes.

### Web

- Consult: HLD/LLD, frontend architecture, brand docs (language, layout, typography).
- Update when: UX flows, i18n/RTL, or public-facing pages change.

### Workers

- Consult: backend architecture, embedding/search design, connectors, billing (if publish logic changes).
- Update when: job types, retries/DLQ, or publish/embedding behavior changes.

### Infra/Deployment

- Consult: deployment guide, CI/IAM policy, observability/guardrails, infra architecture.
- Update when: stack topology, permissions, CI deploy steps, or ops guardrails change.

### Product/Requirements

- Consult: product definition and requirements docs.
- Update when: MVP scope, pricing/entitlements, or user journeys change.

### Brand/Marketing

- Consult: brand foundation, language/RTL, typography, visual identity.
- Update when: copy, visual system, or marketing pages change.

### Contributing/Process

- Consult: contributing docs and quality gates.
- Update when: workflow, testing strategy, or review expectations change.

### Plans/Experiments

- Consult: plans folder for current initiatives.
- Update when: proposing or recording time-boxed experiments.

## Change-type overlays (secondary)

- Data model change: update LLD + data architecture + any migration notes.
- Auth/billing/entitlements: update billing + pricing/entitlements + API contracts as needed.
- Infra/CI/deploy: update deployment + CI/IAM policy + ops guardrails references.
- Observability/cost guardrails: update operational observability + guardrails checklists.
- Localization/brand: update language + RTL layout + typography as needed.

## Doc placement conventions

- Keep `/docs/technical` as the top-level technical entrypoint.
- Deep-dive architecture docs live under `/docs/technical/detailed` (numbered).
- Operational runbooks live under `/docs/technical/ops`.
- Keep numbered prefixes (`01-`, `02-`) and update `docs/technical/index.md` when adding new docs.
- Do not duplicate env var lists; use `.env.example` and `docs/technical/ops/deployment.md` as the source of truth.
