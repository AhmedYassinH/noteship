import * as cdk from "aws-cdk-lib";
import { Duration, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { Alarm, ComparisonOperator, Metric } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription, LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import path from "path";
import type { NoteshipEnv } from "../config";

export interface NoteshipOpsGuardrailsStackProps extends StackProps {
  envConfig: NoteshipEnv;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for guardrails infra deploy`);
  }
  return value;
};

const parseCsv = (value: string): string[] =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export class NoteshipOpsGuardrailsStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipOpsGuardrailsStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: props.envConfig.account,
        region: props.envConfig.region,
      },
    });

    const { envName } = props.envConfig;
    Tags.of(this).add("app", "noteship");
    Tags.of(this).add("env", envName);

    const budgetLimitUsd = Number(requireEnv("NOTESHIP_GUARDRAILS_BUDGET_LIMIT_USD"));
    const billingAlarmThresholdUsd = Number(requireEnv("NOTESHIP_GUARDRAILS_BILLING_ALARM_USD"));
    if (!Number.isFinite(budgetLimitUsd) || budgetLimitUsd <= 0) {
      throw new Error("NOTESHIP_GUARDRAILS_BUDGET_LIMIT_USD must be a positive number.");
    }
    if (!Number.isFinite(billingAlarmThresholdUsd) || billingAlarmThresholdUsd <= 0) {
      throw new Error("NOTESHIP_GUARDRAILS_BILLING_ALARM_USD must be a positive number.");
    }

    const topic = new Topic(this, "OpsGuardrailsTopic", {
      topicName: `noteship-ops-guardrails-${envName}`,
    });

    const emailSubscribers = process.env.NOTESHIP_GUARDRAILS_EMAILS
      ? parseCsv(process.env.NOTESHIP_GUARDRAILS_EMAILS)
      : [];
    emailSubscribers.forEach((email, index) => {
      topic.addSubscription(new EmailSubscription(email, { json: true }));
      new cdk.CfnOutput(this, `GuardrailsEmailSubscriber${index + 1}`, { value: email });
    });

    topic.addToResourcePolicy(
      new PolicyStatement({
        sid: "AllowBudgetsPublish",
        principals: [new ServicePrincipal("budgets.amazonaws.com")],
        actions: ["sns:Publish"],
        resources: [topic.topicArn],
      }),
    );

    const budgetName = `noteship-cost-${envName}`;
    new cdk.aws_budgets.CfnBudget(this, "NoteshipBudget", {
      budget: {
        budgetName,
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: {
          amount: budgetLimitUsd,
          unit: "USD",
        },
        costFilters: {
          TagKeyValue: [`app$noteship`, `env$${envName}`],
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              address: topic.topicArn,
              subscriptionType: "SNS",
            },
          ],
        },
      ],
    });

    // AWS Billing metrics are published only in us-east-1 region.
    if (props.envConfig.region === "us-east-1") {
      const billingAlarm = new Alarm(this, "BillingAlarm", {
        alarmName: `noteship-billing-${envName}`,
        metric: new Metric({
          namespace: "AWS/Billing",
          metricName: "EstimatedCharges",
          dimensionsMap: { Currency: "USD" },
          period: Duration.hours(6),
          statistic: "Maximum",
        }),
        threshold: billingAlarmThresholdUsd,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        evaluationPeriods: 1,
      });
      billingAlarm.addAlarmAction(new SnsAction(topic));
    }

    const apiId = process.env.NOTESHIP_HTTP_API_ID;
    if (apiId) {
      new Alarm(this, "ApiGateway5xxAlarm", {
        alarmName: `noteship-api-5xx-${envName}`,
        metric: new Metric({
          namespace: "AWS/ApiGateway",
          metricName: "5XXError",
          dimensionsMap: { ApiId: apiId },
          period: Duration.minutes(5),
          statistic: "Sum",
        }),
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      }).addAlarmAction(new SnsAction(topic));

      new Alarm(this, "ApiGateway4xxAlarm", {
        alarmName: `noteship-api-4xx-${envName}`,
        metric: new Metric({
          namespace: "AWS/ApiGateway",
          metricName: "4XXError",
          dimensionsMap: { ApiId: apiId },
          period: Duration.minutes(5),
          statistic: "Sum",
        }),
        threshold: 50,
        evaluationPeriods: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      }).addAlarmAction(new SnsAction(topic));

      new Alarm(this, "ApiGatewayLatencyAlarm", {
        alarmName: `noteship-api-latency-p95-${envName}`,
        metric: new Metric({
          namespace: "AWS/ApiGateway",
          metricName: "Latency",
          dimensionsMap: { ApiId: apiId },
          period: Duration.minutes(5),
          statistic: "p95",
        }),
        threshold: 3000,
        evaluationPeriods: 1,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      }).addAlarmAction(new SnsAction(topic));
    }

    const contentBucket = Bucket.fromBucketName(
      this,
      "ContentBucket",
      `noteship-content-${envName}`,
    );

    // const tables = [
    //   { id: "UsersTable", name: `noteship-users-${envName}` },
    //   { id: "NotesTable", name: `noteship-notes-${envName}` },
    //   { id: "PostsTable", name: `noteship-posts-${envName}` },
    //   { id: "IntegrationsTable", name: `noteship-integrations-${envName}` },
    //   { id: "UsageTable", name: `noteship-usage-${envName}` },
    //   { id: "JobsTable", name: `noteship-jobs-${envName}` },
    // ].map((entry) => Table.fromTableName(this, entry.id, entry.name));

    // tables.forEach((table) => {
    //   new Alarm(this, `${table.node.id}ThrottleAlarm`, {
    //     alarmName: `noteship-${table.node.id.toLowerCase()}-throttles-${envName}`,
    //     metric: table.metricThrottledRequests({ period: Duration.minutes(5), statistic: "Sum" }),
    //     threshold: 10,
    //     evaluationPeriods: 1,
    //     comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    //   }).addAlarmAction(new SnsAction(topic));
    // });

    const dlq = Queue.fromQueueAttributes(this, "JobsDlq", {
      queueName: `noteship-jobs-dlq-${envName}`,
      queueArn: cdk.Stack.of(this).formatArn({
        service: "sqs",
        resource: `noteship-jobs-dlq-${envName}`,
      }),
    });

    new Alarm(this, "JobsDlqAlarm", {
      alarmName: `noteship-jobs-dlq-${envName}`,
      metric: dlq.metricApproximateNumberOfMessagesVisible({
        period: Duration.minutes(5),
        statistic: "Maximum",
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    }).addAlarmAction(new SnsAction(topic));

    new Alarm(this, "LambdaConcurrencyAlarm", {
      alarmName: `noteship-lambda-concurrency-${envName}`,
      metric: new Metric({
        namespace: "AWS/Lambda",
        metricName: "ConcurrentExecutions",
        period: Duration.minutes(5),
        statistic: "Maximum",
      }),
      threshold: 50,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    }).addAlarmAction(new SnsAction(topic));

    // new Alarm(this, "LambdaInvocationsAlarm", {
    //   alarmName: `noteship-lambda-invocations-${envName}`,
    //   metric: new Metric({
    //     namespace: "AWS/Lambda",
    //     metricName: "Invocations",
    //     period: Duration.minutes(5),
    //     statistic: "Sum",
    //   }),
    //   threshold: 1000,
    //   evaluationPeriods: 1,
    //   comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    // }).addAlarmAction(new SnsAction(topic));

    new Alarm(this, "S3BucketSizeAlarm", {
      alarmName: `noteship-content-size-${envName}`,
      metric: new Metric({
        namespace: "AWS/S3",
        metricName: "BucketSizeBytes",
        dimensionsMap: {
          BucketName: contentBucket.bucketName,
          StorageType: "StandardStorage",
        },
        period: Duration.hours(24),
        statistic: "Average",
      }),
      threshold: 5_000_000_000,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    }).addAlarmAction(new SnsAction(topic));

    const repoRoot = path.resolve(__dirname, "../../../..");
    const guardrailsHandler = new NodejsFunction(this, "OpsGuardrailsHandler", {
      entry: path.join(repoRoot, "packages/infra/src/handlers/ops-guardrails.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        NOTESHIP_ENV_NAME: envName,
        NOTESHIP_CONTENT_BUCKET_NAME: contentBucket.bucketName,
        NOTESHIP_GUARDRAILS_TAG_APP: "noteship",
        NOTESHIP_GUARDRAILS_TAG_ENV: envName,
      },
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: path.join(repoRoot, "pnpm-lock.yaml"),
    });

    guardrailsHandler.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "lambda:PutFunctionConcurrency",
          "lambda:DeleteFunctionConcurrency",
          "lambda:ListFunctions",
          "lambda:GetFunctionConfiguration",
          "tag:GetResources",
        ],
        resources: ["*"],
      }),
    );

    guardrailsHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ["s3:GetBucketPolicy", "s3:PutBucketPolicy", "s3:DeleteBucketPolicy"],
        resources: [`arn:aws:s3:::noteship-content-${envName}`],
      }),
    );

    topic.addSubscription(new LambdaSubscription(guardrailsHandler));

    new cdk.CfnOutput(this, "OpsGuardrailsTopicArn", { value: topic.topicArn });
  }
}
