# Dev Environment Runbook

Use this document to set up a working dev environment. Deployment steps and env definitions are sourced from `docs/technical/deployment.md`.

## 1) Prerequisites

- Node 18+, pnpm installed
- AWS CLI installed
- Auth0 tenant (single tenant with dev/prod apps)
- Stripe/Qdrant/LinkedIn/Medium credentials for dev (use sandbox where possible)

## 2) AWS SSO profile (recommended)

```sh
aws configure sso
aws sso login --profile noteship-dev
setx AWS_PROFILE "noteship-dev"
```

For the current shell session:

```sh
$env:AWS_PROFILE="noteship-dev"
```

## 3) CDK bootstrap (per account/region)

```sh
cd packages/infra
pnpm --filter @noteship/infra bootstrap -- -c env=dev -c region=us-east-1
```

## 4) Deploy infra stacks (dev)

```sh
cd packages/infra
pnpm --filter @noteship/infra synth -- -c env=dev -c region=us-east-1
cdk deploy NoteshipCore-dev -c env=dev -c region=us-east-1
```

Make sure the runtime env vars from `.env` are exported in your shell before deploying API/workers
so the Lambda environment is populated.

```sh
cdk deploy NoteshipApi-dev -c env=dev -c region=us-east-1
cdk deploy NoteshipWorkers-dev -c env=dev -c region=us-east-1
cdk deploy NoteshipWeb-dev -c env=dev -c region=us-east-1
cdk deploy NoteshipOpsGuardrails-dev -c env=dev -c region=us-east-1
```

## 5) Local env vars

- Copy `.env.example` to `.env` and populate values.
- Use `docs/technical/deployment.md` as the authoritative list of required env vars and secret keys.
- For the web app, set `NEXT_PUBLIC_*` values for Auth0 SPA and `NEXT_PUBLIC_API_BASE_URL`.
- For API/workers, set the runtime env vars listed in `.env.example`.
- Optional logging env vars for API/workers (Powertools): `POWERTOOLS_LOG_LEVEL`, `POWERTOOLS_LOGGER_SAMPLE_RATE`, `POWERTOOLS_SERVICE_NAME` (override), and `NOTESHIP_ENV_NAME`.
  - Accepted values for `POWERTOOLS_LOG_LEVEL`: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `SILENT`, `CRITICAL`

## 6) Run web locally

```sh
pnpm --filter @noteship/web dev
```

Use the dev API URL from your deployed stack output as `NEXT_PUBLIC_API_BASE_URL`.

## 7) API/workers local notes

There is no local Lambda runtime harness yet. Use these for fast checks:

```sh
pnpm --filter @noteship/api build
pnpm --filter @noteship/workers build
pnpm --filter @noteship/api test
pnpm --filter @noteship/workers test
```

For end-to-end verification, deploy to the dev stack and call the API.

## 8) Optional emulators (fast loops)

Emulators can help local testing but do not replace CDK deploys to AWS.

- DynamoDB Local: good for unit tests and quick storage iteration.
- LocalStack: can emulate S3/SQS/Lambda/API Gateway with partial coverage.

Limitations:

- CloudFormation/CDK deploys target real AWS.
- CloudFront, ACM, and IAM fidelity are limited or not available locally.
- API Gateway + Lambda integrations may differ from AWS behavior.

If you use emulators, keep them for local tests only and verify flows against real AWS dev stacks.

## 9) Quick-start local emulators

Run the launcher script to start DynamoDB Local + LocalStack and initialize resources:

**Bash/macOS/WSL:**

```sh
./scripts/start-local.sh
```

**PowerShell (Windows):**

```powershell
.\scripts\start-local.ps1
```

This will:

1. Start Docker containers for DynamoDB Local and LocalStack.
2. Create tables, S3 bucket, and SQS queue.
3. Print next steps for running the app.

Use `.env.local` as a template for local endpoint overrides.
