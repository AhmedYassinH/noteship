# Operational Observability & Cost Guardrails

Goal: detect cost or reliability risk early, notify immediately, and apply reversible mitigations per environment.

---

## 1) Principles

- **Per-environment scope**: everything is filtered by `env` (dev/prod) and `app=noteship`.
- **Fast signal**: CloudWatch alarms + SNS for immediate awareness.
- **Safe actions**: default to reversible mitigations first.
- **Minimal dependencies**: only core AWS services.

---

## 2) Signal sources (full coverage)

### Cost + billing

- `AWS/Billing EstimatedCharges` (account-wide; `us-east-1` only).
- AWS Budgets notifications filtered by `app=noteship` **and** `env={env}`.

### Platform health

- Lambda: `Errors`, `Throttles`, `Duration`, `ConcurrentExecutions`, `Invocations`.
- API Gateway: `5XX`, `4XX`, `Latency`.
- SQS: `ApproximateNumberOfMessagesVisible`, `ApproximateAgeOfOldestMessage`, DLQ depth.
- DynamoDB: `Read/WriteThrottleEvents`, `SystemErrors`, `ConsumedCapacity`.
- S3: `BucketSizeBytes`, `NumberOfObjects`, optional `4xx/5xx` if access logs are enabled.

### Business KPIs (future)

TODO: define and validate KPI semantics before wiring alerts.

- Publish failures per provider.
- Embedding failures / retries.
- Draft generation failures / latency.
- Search errors / latency.

---

## 3) Alert routing

All alarms and budget notifications publish to a per-env SNS topic:

- `noteship-ops-guardrails-{env}`

Subscriptions:

- Email (configurable list).
- Guardrails Lambda (auto-mitigation).

Severity model:

- **Warn**: notify only.
- **Critical**: notify + auto-mitigate.

---

## 4) Guardrails actions (per env)

### Primary (fast + safe)

- Set reserved concurrency = 0 for all Noteship Lambdas tagged `app=noteship`, `env={env}`.
- Apply an **env-scoped** S3 bucket policy deny for the Noteship roles on `noteship-content-{env}`.

### Secondary (optional)

- Disable API Gateway stage (or add a WAF block rule).
- Pause scheduler rule (if needed).

---

## 5) Observability workers (runtime)

No dedicated heartbeat worker in MVP. We rely on managed service metrics and alarms.

If we need app-level metrics later, add a small worker in `apps/workers` and provision schedules in infra.

---

## 6) Infrastructure as code (CDK)

Create a dedicated stack:

- `NoteshipOpsGuardrails-{env}`

Resources:

- SNS topic + subscriptions (email + Lambda).
- Budgets (notifications only, no actions).
- CloudWatch alarms (billing, Lambda, SQS, DynamoDB, S3).
- Guardrails Lambda with scoped permissions.

**Per-environment scoping must be enforced in all filters and policy resources.**

---

## 7) Recovery steps

1. Restore Lambda reserved concurrency.
2. Roll back bucket policy changes.
3. Re-enable API/WAF blocks if used.

---

## 8) Testing + drills

- Quarterly dev drill:
  - Lower thresholds.
  - Verify alarm → SNS → guardrails → recovery.
  - Record results in runbook.

---

## 9) Config (env vars)

Guardrails stack uses:

- `NOTESHIP_GUARDRAILS_BUDGET_LIMIT_USD`
- `NOTESHIP_GUARDRAILS_BILLING_ALARM_USD`
- `NOTESHIP_GUARDRAILS_EMAILS` (optional)
- `NOTESHIP_HTTP_API_ID` (optional, enables API Gateway alarms)

---

## 10) Notes on placement

- **File location:** keep this under `docs/technical/detailed/` as the operational plan and reference it from deployment/runbooks and production checklist.
