# Env and Secrets Hygiene

This repo uses environment variables for local dev and deploys.
Never commit secrets.

## Local development

- Use `.env` for local values (not tracked).
- Copy `.env.example` and fill in values as needed.
- Avoid real production credentials in local files.

## Deployments

- Provide runtime secrets via environment variables in the deployment environment.
- Do not hardcode secrets in code or config files.
- Rotate credentials if a secret is exposed.

## Source of truth

- Deployment env keys and expected values: `docs/technical/deployment.md`.

## Logging (Lambda Powertools)

- `POWERTOOLS_SERVICE_NAME` (set by infra; default per service)
- `POWERTOOLS_LOG_LEVEL` (set by infra; `DEBUG` in dev, `INFO` in prod)
- Accepted values: `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `SILENT`, `CRITICAL`
- `POWERTOOLS_LOGGER_SAMPLE_RATE` (optional; set in deploy env to enable sampling)
- `NOTESHIP_ENV_NAME` (set by infra; used for log context)
