# Kill Switch Strategy (Budgets + Policies + Alarms)

Goal: stop Noteship spend quickly if costs spike. This is designed for a personal AWS account (no SCPs).

## Prereqs

- Ensure resources are tagged (CDK already tags `app=noteship`, `env=...`).
- Activate the `app` tag in Billing → Cost Allocation Tags so Budgets can filter by tag.
- Identify the IAM roles used by Noteship (Lambda execution roles, CI/CD role).

## Part A — Budget + IAM policy action (slow but automatic)

1. **Create a monthly cost budget** scoped to tag `app=noteship`.
2. **Add thresholds** (example):
   - 80%: notify only
   - 100%: take action
3. **Create a deny policy** (managed policy), then attach it via a Budget Action.
   - Personal accounts must use **IAM policy actions** (no SCP support).
   - Apply to the Noteship roles only.

Example deny policy (scope and actions can be narrowed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyS3Noteship",
      "Effect": "Deny",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::noteship-content-*", "arn:aws:s3:::noteship-content-*/*"]
    },
    {
      "Sid": "DenyLambdaInvoke",
      "Effect": "Deny",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "*"
    }
  ]
}
```

**Important:** Budget updates can lag (not real-time), so the action may trigger hours after the spike.

## Part B — CloudWatch alarms (faster signal)

Add alarms that fire faster than Budgets:

- **AWS/Billing EstimatedCharges** (account-wide, `us-east-1` only)
- **DynamoDB throttles** (per table) to detect cap pressure
- **S3 BucketSizeBytes** (daily) for storage spikes
- **Lambda ConcurrentExecutions / Invocations** for request surges

These alarms should publish to SNS so they can trigger a faster kill switch.

## Part C — SNS + Lambda kill switch (faster enforcement)

1. Create an SNS topic (e.g., `noteship-cost-kill-switch`).
2. Subscribe:
   - Budget notifications
   - CloudWatch alarms
3. Create a small Lambda handler that:
   - Sets **reserved concurrency = 0** for Noteship Lambdas
   - Updates the S3 bucket policy to **deny all access** to Noteship roles
   - (Optional) disables API Gateway stage or adds a WAF block rule

This gives you a near-immediate shutdown once an alarm fires.

## Recovery steps

- Remove the deny policy from the roles.
- Restore Lambda reserved concurrency.
- Re-enable API Gateway/WAF rules if disabled.

## Optional: Infrastructure as code

This can be codified later with:

- `AWS::Budgets::Budget` + `AWS::Budgets::BudgetsAction`
- IAM managed policies for the deny rules
- SNS topic + Lambda function for the kill switch

For MVP, manual setup is acceptable, but keep the steps above documented.
