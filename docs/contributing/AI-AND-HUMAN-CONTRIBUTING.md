# AI and Human Contributing

This doc defines how work should be done so changes are safe, reviewable, and aligned with the HLD/LLD.

## Definition of done

A change is "done" when it:

- Fits MVP scope and does not conflict with HLD/LLD.
- Has appropriate tests per `docs/contributing/CHANGE-TYPES-DECISION-MATRIX.md`.
- Updates docs when new decisions are introduced.
- Runs required quality gates (see `docs/contributing/QUALITY-GATES.md`).
- Is formatted with `pnpm prettier --write .`.

## Workflow (humans + agents)

1. Confirm scope and relevant docs.
2. Identify impacted areas (web, api, workers, connectors, domain, infra).
3. Implement in small, reviewable increments.
4. Add or update tests based on change type.
5. Run gates, format, and summarize changes clearly.

## Safe agentic changes

For AI-assisted changes, keep the blast radius small:

- Prefer incremental PRs over large refactors.
- Avoid introducing new dependencies unless required by MVP behavior.
- Use existing patterns (thin handlers, use-cases, adapters, simple DI).
- Stop and ask if the change conflicts with HLD/LLD.
