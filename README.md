# Noteship

Read `AGENTS.md` and the docs in `docs/` before making changes.

## Repository layout
- `apps/web`: Next.js app (landing + dashboard)
- `apps/api`: API Gateway + Lambda handlers
- `apps/workers`: SQS workers and scheduled jobs
- `packages/domain`: shared types, schemas, plan entitlements
- `packages/connectors`: vendor connectors (LinkedIn, Medium, etc.)
- `packages/utils`: shared utilities
- `packages/infra`: infrastructure as code
- `archive/legacy-ui`: legacy Vite UI reference (not in the workspace)

## Dev scripts
- `pnpm dev` (all apps)
- `pnpm build`
- `pnpm lint`
- `pnpm test`
