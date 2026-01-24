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

## Deployment docs

- See `docs/deployment.md` for CDK commands, env conventions, and app deployment notes.

## Infra (CDK)

- Synthesize: `pnpm --filter @noteship/infra synth` (uses `env` context, default `dev`)
- Context example: `cd packages/infra && cdk synth -c env=dev -c region=us-east-1`
- Stacks: content bucket, DynamoDB tables (users, notes, posts, integrations, usage, jobs), jobs queue + DLQ.
