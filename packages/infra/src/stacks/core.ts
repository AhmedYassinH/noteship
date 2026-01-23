import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
  TableEncryption
} from "aws-cdk-lib/aws-dynamodb";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import type { NoteshipEnv } from "../config";

export interface NoteshipCoreStackProps extends StackProps {
  envConfig: NoteshipEnv;
}

export class NoteshipCoreStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipCoreStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: props.envConfig.account,
        region: props.envConfig.region
      }
    });

    const { envName } = props.envConfig;
    Tags.of(this).add("app", "noteship");
    Tags.of(this).add("env", envName);

    const contentBucket = new Bucket(this, "ContentBucket", {
      bucketName: `noteship-content-${envName}`,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false
    });

    const usersTable = this.createTable("UsersTable", {
      tableName: `noteship-users-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING }
    });

    const notesTable = this.createTable("NotesTable", {
      tableName: `noteship-notes-${envName}`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING }
    });
    notesTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    });

    const postsTable = this.createTable("PostsTable", {
      tableName: `noteship-posts-${envName}`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING }
    });
    postsTable.addGlobalSecondaryIndex({
      indexName: "GSIStatus",
      partitionKey: { name: "GSI1PK", type: AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    });
    postsTable.addGlobalSecondaryIndex({
      indexName: "GSISchedule",
      partitionKey: { name: "GSI2PK", type: AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL
    });

    const integrationsTable = this.createTable("IntegrationsTable", {
      tableName: `noteship-integrations-${envName}`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING }
    });

    const usageTable = this.createTable("UsageTable", {
      tableName: `noteship-usage-${envName}`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING }
    });

    const jobsTable = this.createTable("JobsTable", {
      tableName: `noteship-jobs-${envName}`,
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING }
    });

    const dlq = new Queue(this, "JobsDlq", {
      queueName: `noteship-jobs-dlq-${envName}`,
      retentionPeriod: cdk.Duration.days(14)
    });

    const jobsQueue = new Queue(this, "JobsQueue", {
      queueName: `noteship-jobs-${envName}`,
      visibilityTimeout: cdk.Duration.minutes(2),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 5
      }
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
    }
  ): Table {
    return new Table(this, id, {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN
    });
  }
}
