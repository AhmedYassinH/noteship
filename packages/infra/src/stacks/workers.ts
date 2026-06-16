import { Duration, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import type { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Bucket } from "aws-cdk-lib/aws-s3";
import type { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import path from "path";
import type { NoteshipEnv } from "../config";

export interface NoteshipWorkersStackProps extends StackProps {
  envConfig: NoteshipEnv;
  contentBucket: Bucket;
  usersTable: Table;
  notesTable: Table;
  postsTable: Table;
  integrationsTable: Table;
  usageTable: Table;
  jobsQueue: Queue;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for infra deploy`);
  }
  return value;
};

const maybeSetEnv = (env: Record<string, string>, key: string): void => {
  const value = process.env[key];
  if (value) {
    env[key] = value;
  }
};

export class NoteshipWorkersStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipWorkersStackProps) {
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
    const repoRoot = path.resolve(__dirname, "../../../..");

    const {
      contentBucket,
      usersTable,
      notesTable,
      postsTable,
      integrationsTable,
      usageTable,
      jobsQueue,
    } = props;

    const powertoolsLogLevel = envName === "prod" ? "INFO" : "DEBUG";

    const envVars: Record<string, string> = {
      NOTESHIP_ENV_NAME: envName,
      NOTESHIP_CONTENT_BUCKET_NAME: contentBucket.bucketName,
      NOTESHIP_USERS_TABLE_NAME: usersTable.tableName,
      NOTESHIP_NOTES_TABLE_NAME: notesTable.tableName,
      NOTESHIP_POSTS_TABLE_NAME: postsTable.tableName,
      NOTESHIP_INTEGRATIONS_TABLE_NAME: integrationsTable.tableName,
      NOTESHIP_USAGE_TABLE_NAME: usageTable.tableName,
      NOTESHIP_JOBS_QUEUE_URL: jobsQueue.queueUrl,
      OPENAI_API_KEY: requireEnv("OPENAI_API_KEY"),
      OPENAI_EMBED_MODEL: requireEnv("OPENAI_EMBED_MODEL"),
      QDRANT_URL: requireEnv("QDRANT_URL"),
      QDRANT_COLLECTION: requireEnv("QDRANT_COLLECTION"),
      LINKEDIN_CLIENT_ID: requireEnv("LINKEDIN_CLIENT_ID"),
      LINKEDIN_CLIENT_SECRET: requireEnv("LINKEDIN_CLIENT_SECRET"),
      NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64: requireEnv(
        "NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64",
      ),
      POWERTOOLS_SERVICE_NAME: "noteship-workers",
      POWERTOOLS_LOG_LEVEL: powertoolsLogLevel,
    };

    maybeSetEnv(envVars, "NOTESHIP_LLM_PROVIDER");
    maybeSetEnv(envVars, "NOTESHIP_EMBEDDING_ENABLED");
    maybeSetEnv(envVars, "NOTESHIP_VECTOR_DB_PROVIDER");
    maybeSetEnv(envVars, "QDRANT_API_KEY");
    maybeSetEnv(envVars, "POWERTOOLS_LOGGER_SAMPLE_RATE");
    maybeSetEnv(envVars, "NOTESHIP_INTEGRATION_CREDENTIALS_KEY_VERSION");
    maybeSetEnv(envVars, "LINKEDIN_API_VERSION");
    maybeSetEnv(envVars, "LINKEDIN_TEXT_MAX_CHARS");
    maybeSetEnv(envVars, "LINKEDIN_COMMENT_MAX_CHARS");
    maybeSetEnv(envVars, "LINKEDIN_MAX_IMAGES_PER_POST");

    const jobsHandler = new NodejsFunction(this, "JobsWorker", {
      entry: path.join(repoRoot, "apps/workers/src/handlers/jobs.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: Duration.seconds(60),
      environment: envVars,
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: path.join(repoRoot, "pnpm-lock.yaml"),
    });

    jobsHandler.addEventSource(
      new SqsEventSource(jobsQueue, {
        batchSize: 5,
        maxBatchingWindow: Duration.seconds(10),
      }),
    );

    const schedulerHandler = new NodejsFunction(this, "SchedulerWorker", {
      entry: path.join(repoRoot, "apps/workers/src/handlers/scheduler.ts"),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: envVars,
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: path.join(repoRoot, "pnpm-lock.yaml"),
    });

    new Rule(this, "ScheduledDispatcherRule", {
      schedule: Schedule.rate(Duration.minutes(1)),
    }).addTarget(new LambdaFunction(schedulerHandler));

    jobsQueue.grantConsumeMessages(jobsHandler);
    jobsQueue.grantSendMessages(schedulerHandler);

    [jobsHandler, schedulerHandler].forEach((handler) => {
      usersTable.grantReadWriteData(handler);
      notesTable.grantReadWriteData(handler);
      postsTable.grantReadWriteData(handler);
      integrationsTable.grantReadWriteData(handler);
      usageTable.grantReadWriteData(handler);
      contentBucket.grantReadWrite(handler);
    });
  }
}
