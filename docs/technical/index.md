# Technical Docs Index

This index explains how technical docs are organized and where new docs should go.

## Structure

- `/docs/technical`
  - Entry points and summaries (HLD, LLD, deployment, CI/IAM, dev environment).
- `/docs/technical/detailed`
  - Numbered deep dives (architecture, data, API, infra, testing).
- `/docs/technical/ops`
  - Operational runbooks and checklists (deployment, CI/CD, dev environment, prod readiness).

## Numbering convention

Deep-dive docs in `/docs/technical/detailed` use numeric prefixes (`01-`, `02-`, ...).
Keep the numbering and update this index if you add a new numbered doc.

## Placement rules (quick)

- Architecture decisions: HLD/LLD and `/docs/technical/detailed`.
- Deployment or CI changes: `/docs/technical/ops`.
- Runbooks/checklists: `/docs/technical/ops`.

If multiple locations seem plausible, document the choice in the change and update
the doc map (`.agents/skills/noteship-contrib/references/doc-map.md`).
