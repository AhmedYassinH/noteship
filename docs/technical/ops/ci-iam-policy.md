# CI/CD IAM Policy for API, Workers, and Web Deployments

## Overview

This policy enables CI/CD to deploy **API**, **Workers**, and **Web** stacks while explicitly blocking Core and OpsGuardrails. Web deployment includes S3 asset sync and CloudFront invalidation for the static Next.js export.

## Assumptions

- Stack names:
  - `NoteshipCore-{env}`
  - `NoteshipApi-{env}`
  - `NoteshipWorkers-{env}`
  - `NoteshipWeb-{env}`
  - `NoteshipOpsGuardrails-{env}`
- CDK bootstrap uses the default qualifier (`hnb659fds`) and assets bucket `cdk-hnb659fds-assets-*`.
- Web hosting follows the MVP architecture: Next.js static export served from S3 + CloudFront (no SSR).

## IAM policy (CI/CD deployer)

Create this policy in IAM (or via IaC). This policy **allows** API/Workers/Web deploys and **denies** Core/OpsGuardrails.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFormationOnDeployableStacks",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:CreateChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResources",
        "cloudformation:ListStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:GetTemplateSummary"
      ],
      "Resource": [
        "arn:aws:cloudformation:*:*:stack/NoteshipApi-*/*",
        "arn:aws:cloudformation:*:*:stack/NoteshipWorkers-*/*",
        "arn:aws:cloudformation:*:*:stack/NoteshipWeb-*/*"
      ]
    },
    {
      "Sid": "AllowCloudFormationChangeSetsForDeployableStacks",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DeleteChangeSet"
      ],
      "Resource": "arn:aws:cloudformation:*:*:changeSet/*"
    },
    {
      "Sid": "AllowCloudFormationList",
      "Effect": "Allow",
      "Action": ["cloudformation:ListStacks"],
      "Resource": "*"
    },
    {
      "Sid": "DenyNonDeployableStacks",
      "Effect": "Deny",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:CreateChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack"
      ],
      "Resource": [
        "arn:aws:cloudformation:*:*:stack/NoteshipCore-*/*",
        "arn:aws:cloudformation:*:*:stack/NoteshipOpsGuardrails-*/*"
      ]
    },
    {
      "Sid": "ReadOnlyCoreStack",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate"
      ],
      "Resource": "arn:aws:cloudformation:*:*:stack/NoteshipCore-*/*"
    },
    {
      "Sid": "AllowLambdaOperations",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:ListTags",
        "lambda:TagResource",
        "lambda:UntagResource",
        "lambda:PublishVersion",
        "lambda:CreateAlias",
        "lambda:UpdateAlias",
        "lambda:DeleteAlias",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:CreateEventSourceMapping",
        "lambda:UpdateEventSourceMapping",
        "lambda:DeleteEventSourceMapping",
        "lambda:GetEventSourceMapping",
        "lambda:ListEventSourceMappings"
      ],
      "Resource": "arn:aws:lambda:*:*:function:noteship-*"
    },
    {
      "Sid": "AllowLambdaExecutionRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:UpdateAssumeRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/noteship-api-*",
        "arn:aws:iam::*:role/noteship-workers-*",
        "arn:aws:iam::*:role/NoteshipApi-*",
        "arn:aws:iam::*:role/NoteshipWorkers-*"
      ]
    },
    {
      "Sid": "AllowCloudWatchLogsForLambda",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:PutRetentionPolicy",
        "logs:TagLogGroup",
        "logs:UntagLogGroup"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/lambda/noteship-*"
    },
    {
      "Sid": "AllowCDKBootstrapRoleAssume",
      "Effect": "Allow",
      "Action": ["sts:AssumeRole"],
      "Resource": "arn:aws:iam::*:role/cdk-hnb659fds-*"
    },
    {
      "Sid": "AllowCDKStagingBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": ["arn:aws:s3:::cdk-hnb659fds-assets-*", "arn:aws:s3:::cdk-hnb659fds-assets-*/*"]
    },
    {
      "Sid": "AllowCDKBootstrapParameterRead",
      "Effect": "Allow",
      "Action": ["ssm:GetParameter", "ssm:GetParameters"],
      "Resource": [
        "arn:aws:ssm:*:*:parameter/cdk-bootstrap/*",
        "arn:aws:ssm:*:*:parameter/cdk-bootstrap/hnb659fds/*"
      ]
    },
    {
      "Sid": "AllowSQSForWorkers",
      "Effect": "Allow",
      "Action": ["sqs:GetQueueAttributes", "sqs:GetQueueUrl"],
      "Resource": "arn:aws:sqs:*:*:noteship-*"
    },
    {
      "Sid": "AllowEventBridgeForWorkers",
      "Effect": "Allow",
      "Action": [
        "events:PutRule",
        "events:DeleteRule",
        "events:DescribeRule",
        "events:PutTargets",
        "events:RemoveTargets"
      ],
      "Resource": "arn:aws:events:*:*:rule/noteship-*"
    },
    {
      "Sid": "AllowWebBucketInfra",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:PutEncryptionConfiguration",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:PutBucketTagging"
      ],
      "Resource": "arn:aws:s3:::noteship-web-*"
    },
    {
      "Sid": "AllowWebBucketAssets",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::noteship-web-*/*"
    },
    {
      "Sid": "AllowCloudFrontForWeb",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:ListDistributions",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:TagResource",
        "cloudfront:UntagResource",
        "cloudfront:CreateCloudFrontOriginAccessIdentity",
        "cloudfront:GetCloudFrontOriginAccessIdentity",
        "cloudfront:GetCloudFrontOriginAccessIdentityConfig",
        "cloudfront:UpdateCloudFrontOriginAccessIdentity",
        "cloudfront:DeleteCloudFrontOriginAccessIdentity",
        "cloudfront:CreateFunction",
        "cloudfront:GetFunction",
        "cloudfront:DescribeFunction",
        "cloudfront:UpdateFunction",
        "cloudfront:DeleteFunction",
        "cloudfront:PublishFunction",
        "cloudfront:ListFunctions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ReadOnlyDynamoDB",
      "Effect": "Allow",
      "Action": ["dynamodb:DescribeTable"],
      "Resource": "arn:aws:dynamodb:*:*:table/noteship-*"
    },
    {
      "Sid": "ReadOnlyS3Buckets",
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": "arn:aws:s3:::noteship-*"
    }
  ]
}
```

## Setup instructions (high level)

### Option 1: GitHub Actions (OIDC - recommended)

1. Create the IAM OIDC provider (one-time):

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

2. Create the IAM role with a trust policy scoped to your repo and branch:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::8498754357:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:AhmedYassinH/noteship:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

3. Attach the policy to this role.

4. Use `.github/workflows/ci.yml` as the source of truth for the deploy pipeline. At minimum:
   - Configure AWS credentials with OIDC (`role-to-assume`)
   - Deploy API/Workers/Web stacks with `--require-approval never`
   - Build/export the web app and publish assets

Provide required runtime variables via GitHub Secrets or Environment variables. Refer to `.env.example` and `docs/technical/ops/deployment.md` for the current set of required keys.

### Option 2: IAM User (access keys)

If you cannot use OIDC, use an IAM user with access keys and configure `aws-actions/configure-aws-credentials@v4` to read them from GitHub Secrets.

## Web deployment flow (CI)

1. Build and export the web app:
   - `pnpm --filter @noteship/web build`
   - `pnpm --filter @noteship/web export`
2. Deploy the web stack:
   - `pnpm --filter @noteship/infra deploy:web:dev`
3. Sync assets and invalidate CloudFront:
   - `pnpm --filter @noteship/web deploy:assets:dev` (fetches `WebDistributionId` from `NoteshipWeb-dev` stack)

## Testing the policy

```bash
pnpm --filter @noteship/infra deploy:api:dev       # OK
pnpm --filter @noteship/infra deploy:workers:dev   # OK
pnpm --filter @noteship/infra deploy:web:dev       # OK
pnpm --filter @noteship/infra deploy:core:dev      # FAIL (explicit deny)
```

## Security considerations

1. Least privilege: only API/Workers/Web stacks
2. Explicit denies prevent Core/OpsGuardrails changes
3. CDK bootstrap roles are scoped to the default qualifier
4. Web bucket access is restricted to `noteship-web-*`

## Deployment flow

```
CI/CD pipeline
1) Code pushed to main (apps/api, apps/workers, apps/web, infra)
2) GitHub Actions triggers
3) Assume IAM role (OIDC)
4) CDK deploy attempts:
   - NoteshipApi-dev        OK
   - NoteshipWorkers-dev    OK
   - NoteshipWeb-dev        OK
   - NoteshipCore-dev       DENIED
   - NoteshipOpsGuardrails  DENIED
5) Web assets synced + CloudFront invalidation
6) Core infrastructure remains protected
```

## Updating the policy

1. Add a new statement to the policy JSON
2. Update the IAM policy in AWS Console or via IaC
3. Test locally first
4. Deploy via CI/CD

## Alternative: Separate environments

Consider separate AWS accounts:

- Dev account: CI can deploy everything (faster iteration)
- Prod account: CI deploys API/Workers/Web with tighter approvals for Core/Ops changes
- Manual approval gate for Core/Ops changes in prod
