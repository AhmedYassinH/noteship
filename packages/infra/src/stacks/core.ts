import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
  TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import type { NoteshipEnv } from "../config";

export interface NoteshipCoreStackProps extends StackProps {
  envConfig: NoteshipEnv;
}

type CapacityCaps = {
  minRead: number;
  maxRead: number;
  minWrite: number;
  maxWrite: number;
};

export class NoteshipCoreStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipCoreStackProps) {
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

    // Keep total max RCUs/WCUs across tables + GSIs within Always Free (25/25).
    // Adjust caps for prod traffic; see PRODUCTION-CHECKLIST.md.
    const capacityCaps = {
      users: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      notes: { minRead: 1, maxRead: 4, minWrite: 1, maxWrite: 4 },
      notesByUpdatedAt: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      posts: { minRead: 1, maxRead: 4, minWrite: 1, maxWrite: 4 },
      postsByStatusUpdatedAt: { minRead: 1, maxRead: 3, minWrite: 1, maxWrite: 3 },
      postsBySchedule: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      integrations: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 1 },
      usage: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 1 },
      jobs: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
    } satisfies Record<string, CapacityCaps>;

    const contentBucket = new Bucket(this, "ContentBucket", {
      bucketName: `noteship-content-${envName}`,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const usersTable = this.createTable("UsersTable", {
      tableName: `noteship-users-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      readCapacity: capacityCaps.users.minRead,
      writeCapacity: capacityCaps.users.minWrite,
    });
    this.configureTableAutoScaling(usersTable, capacityCaps.users);

    const notesTable = this.createTable("NotesTable", {
      tableName: `noteship-notes-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "noteId", type: AttributeType.STRING },
      readCapacity: capacityCaps.notes.minRead,
      writeCapacity: capacityCaps.notes.minWrite,
    });
    notesTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "updatedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.notesByUpdatedAt.minRead,
      writeCapacity: capacityCaps.notesByUpdatedAt.minWrite,
    });
    this.configureTableAutoScaling(notesTable, capacityCaps.notes);
    this.configureGsiAutoScaling(notesTable, "GSI1", capacityCaps.notesByUpdatedAt);

    const postsTable = this.createTable("PostsTable", {
      tableName: `noteship-posts-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "postId", type: AttributeType.STRING },
      readCapacity: capacityCaps.posts.minRead,
      writeCapacity: capacityCaps.posts.minWrite,
    });
    postsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "statusUpdatedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.postsByStatusUpdatedAt.minRead,
      writeCapacity: capacityCaps.postsByStatusUpdatedAt.minWrite,
    });
    postsTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "scheduleStatus", type: AttributeType.STRING },
      sortKey: { name: "scheduledAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.postsBySchedule.minRead,
      writeCapacity: capacityCaps.postsBySchedule.minWrite,
    });
    this.configureTableAutoScaling(postsTable, capacityCaps.posts);
    this.configureGsiAutoScaling(postsTable, "GSI1", capacityCaps.postsByStatusUpdatedAt);
    this.configureGsiAutoScaling(postsTable, "GSI2", capacityCaps.postsBySchedule);

    const integrationsTable = this.createTable("IntegrationsTable", {
      tableName: `noteship-integrations-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "providerAccountId", type: AttributeType.STRING },
      readCapacity: capacityCaps.integrations.minRead,
      writeCapacity: capacityCaps.integrations.minWrite,
    });
    this.configureTableAutoScaling(integrationsTable, capacityCaps.integrations);

    const usageTable = this.createTable("UsageTable", {
      tableName: `noteship-usage-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "periodStart", type: AttributeType.STRING },
      readCapacity: capacityCaps.usage.minRead,
      writeCapacity: capacityCaps.usage.minWrite,
    });
    this.configureTableAutoScaling(usageTable, capacityCaps.usage);

    const jobsTable = this.createTable("JobsTable", {
      tableName: `noteship-jobs-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "jobId", type: AttributeType.STRING },
      readCapacity: capacityCaps.jobs.minRead,
      writeCapacity: capacityCaps.jobs.minWrite,
    });
    this.configureTableAutoScaling(jobsTable, capacityCaps.jobs);

    const dlq = new Queue(this, "JobsDlq", {
      queueName: `noteship-jobs-dlq-${envName}`,
      retentionPeriod: cdk.Duration.days(14),
    });

    const jobsQueue = new Queue(this, "JobsQueue", {
      queueName: `noteship-jobs-${envName}`,
      visibilityTimeout: cdk.Duration.minutes(2),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 5,
      },
    });

    new cdk.CfnOutput(this, "ContentBucketName", { value: contentBucket.bucketName });
    new cdk.CfnOutput(this, "UsersTableName", { value: usersTable.tableName });
    new cdk.CfnOutput(this, "NotesTableName", { value: notesTable.tableName });
    new cdk.CfnOutput(this, "PostsTableName", { value: postsTable.tableName });
    new cdk.CfnOutput(this, "IntegrationsTableName", { value: integrationsTable.tableName });
    new cdk.CfnOutput(this, "UsageTableName", { value: usageTable.tableName });
    new cdk.CfnOutput(this, "JobsTableName", { value: jobsTable.tableName });
    new cdk.CfnOutput(this, "JobsQueueUrl", { value: jobsQueue.queueUrl });
    new cdk.CfnOutput(this, "JobsDlqUrl", { value: dlq.queueUrl });
  }

  private createTable(
    id: string,
    props: {
      tableName: string;
      partitionKey: { name: string; type: AttributeType };
      sortKey?: { name: string; type: AttributeType };
      readCapacity?: number;
      writeCapacity?: number;
    },
  ): Table {
    return new Table(this, id, {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: props.readCapacity ?? 1,
      writeCapacity: props.writeCapacity ?? 1,
      encryption: TableEncryption.AWS_MANAGED,
      // PITR is disabled for cost control; enable for prod (see PRODUCTION-CHECKLIST.md).
      pointInTimeRecovery: false,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }

  private configureTableAutoScaling(table: Table, caps: CapacityCaps): void {
    table
      .autoScaleReadCapacity({
        minCapacity: caps.minRead,
        maxCapacity: caps.maxRead,
      })
      .scaleOnUtilization({ targetUtilizationPercent: 70 });
    table
      .autoScaleWriteCapacity({
        minCapacity: caps.minWrite,
        maxCapacity: caps.maxWrite,
      })
      .scaleOnUtilization({ targetUtilizationPercent: 70 });
  }

  private configureGsiAutoScaling(table: Table, indexName: string, caps: CapacityCaps): void {
    table
      .autoScaleGlobalSecondaryIndexReadCapacity(indexName, {
        minCapacity: caps.minRead,
        maxCapacity: caps.maxRead,
      })
      .scaleOnUtilization({ targetUtilizationPercent: 70 });
    table
      .autoScaleGlobalSecondaryIndexWriteCapacity(indexName, {
        minCapacity: caps.minWrite,
        maxCapacity: caps.maxWrite,
      })
      .scaleOnUtilization({ targetUtilizationPercent: 70 });
  }
}
