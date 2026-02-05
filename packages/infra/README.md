# Noteship Infra (Status + TODO)

This package currently defines the **core** and **API** stacks.
See `docs/technical/ops/deployment.md` and `docs/technical/detailed/15-deployment-and-infrastructure.md` for the target layout.

## Current

- Core stack: S3 content bucket, DynamoDB tables, SQS + DLQ.
- API stack: HTTP API + Lambda handlers + Auth0 JWT authorizer (values from env vars).
- Workers stack: SQS workers + scheduled dispatcher.
- Web stack: CloudFront + S3 for SPA/SSG hosting.

### Runtime config

- Lambdas read runtime configuration from environment variables.
- See `docs/contributing/ENV-AND-SECRETS.md` for the full list.

## Non-goals (MVP)

- No Kubernetes or long-running servers.
- No multi-account staging until needed.
