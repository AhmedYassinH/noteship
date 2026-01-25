# Production Deployment Checklist

- [ ] Set CDK context `env=prod` and the target AWS region.
- [ ] Enable DynamoDB PITR for all tables (disabled in MVP for cost control).
- [ ] Update docs after enabling PITR:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/detailed/10-data-architecture.md`
  - `docs/technical/deployment.md`
- [ ] Review DynamoDB provisioned auto scaling caps (MVP caps keep Always Free limits); raise for production traffic.
- [ ] Update docs after changing caps:
  - `docs/technical/noteship-low-level-design.md`
  - `docs/technical/detailed/10-data-architecture.md`
  - `docs/technical/deployment.md`
- [ ] Review S3 lifecycle/retention and versioning costs.
- [ ] Configure AWS Budgets + alerts; confirm kill switch procedure (see `KILL-SWITCH.md`).
- [ ] Validate Secrets Manager/SSM values for prod.
- [ ] Verify CloudWatch alarms (DLQ, DynamoDB throttles, cost/budget alerts).
