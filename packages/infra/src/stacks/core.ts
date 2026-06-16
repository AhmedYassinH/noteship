import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, Stack, type StackProps, Tags } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  Distribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { HttpMethods } from "aws-cdk-lib/aws-s3";
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

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for infra deploy`);
  }
  return value;
};

const parseCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const parsePositiveIntEnv = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return parsed;
};

export class NoteshipCoreStack extends Stack {
  public readonly contentBucket: Bucket;
  public readonly usersTable: Table;
  public readonly notesTable: Table;
  public readonly postsTable: Table;
  public readonly integrationsTable: Table;
  public readonly usageTable: Table;
  public readonly rateLimitsTable: Table;
  public readonly uploadLeasesTable: Table;
  public readonly jobsTable: Table;
  public readonly jobsQueue: Queue;
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

    // Keep total provisioned RCUs/WCUs across tables + GSIs within Always Free (25/25).
    // Revisit the production throughput strategy before go-live; see
    // docs/technical/ops/production-checklist.md.
    const capacityCaps = {
      users: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      notes: { minRead: 1, maxRead: 4, minWrite: 1, maxWrite: 4 },
      notesByUpdatedAt: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      posts: { minRead: 1, maxRead: 4, minWrite: 1, maxWrite: 4 },
      postsByStatusUpdatedAt: { minRead: 1, maxRead: 3, minWrite: 1, maxWrite: 3 },
      postsBySchedule: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
      integrations: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 1 },
      usage: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 1 },
      rateLimits: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 2 },
      uploadLeases: { minRead: 1, maxRead: 1, minWrite: 1, maxWrite: 2 },
      jobs: { minRead: 1, maxRead: 2, minWrite: 1, maxWrite: 2 },
    } satisfies Record<string, CapacityCaps>;

    const contentUploadOrigins = parseCsv(requireEnv("NOTESHIP_CONTENT_UPLOAD_ORIGIN"));
    const tempUploadLifecycleDays = parsePositiveIntEnv("NOTESHIP_TEMP_UPLOAD_LIFECYCLE_DAYS", 1);

    this.contentBucket = new Bucket(this, "ContentBucket", {
      bucketName: `noteship-content-${envName}`,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      lifecycleRules: [
        {
          id: "ExpireTemporaryUploads",
          prefix: "uploads/tmp/",
          expiration: cdk.Duration.days(tempUploadLifecycleDays),
          noncurrentVersionExpiration: cdk.Duration.days(tempUploadLifecycleDays),
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(tempUploadLifecycleDays),
        },
      ],
      cors: [
        {
          allowedOrigins: contentUploadOrigins,
          allowedMethods: [HttpMethods.PUT, HttpMethods.GET, HttpMethods.HEAD],
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const contentCustomDomain = requireEnv("NOTESHIP_CONTENT_CUSTOM_DOMAIN");
    const contentCertificateArn = requireEnv("NOTESHIP_CONTENT_CERTIFICATE_ARN");
    const contentCertificate = Certificate.fromCertificateArn(
      this,
      "ContentCertificate",
      contentCertificateArn,
    );
    const contentOai = new OriginAccessIdentity(this, "ContentOAI");
    this.contentBucket.grantRead(contentOai);

    const contentDistribution = new Distribution(this, "ContentDistribution", {
      defaultBehavior: {
        origin: new S3Origin(this.contentBucket, { originAccessIdentity: contentOai }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        ...(props.envConfig.account ? { trustedSigners: [props.envConfig.account] } : {}),
      },
      domainNames: [contentCustomDomain],
      certificate: contentCertificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    this.usersTable = this.createTable("UsersTable", {
      tableName: `noteship-users-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      readCapacity: capacityCaps.users.minRead,
      writeCapacity: capacityCaps.users.minWrite,
    });

    this.notesTable = this.createTable("NotesTable", {
      tableName: `noteship-notes-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "noteId", type: AttributeType.STRING },
      readCapacity: capacityCaps.notes.minRead,
      writeCapacity: capacityCaps.notes.minWrite,
    });
    this.notesTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "updatedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.notesByUpdatedAt.minRead,
      writeCapacity: capacityCaps.notesByUpdatedAt.minWrite,
    });

    this.postsTable = this.createTable("PostsTable", {
      tableName: `noteship-posts-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "postId", type: AttributeType.STRING },
      readCapacity: capacityCaps.posts.minRead,
      writeCapacity: capacityCaps.posts.minWrite,
    });
    this.postsTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "statusUpdatedAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.postsByStatusUpdatedAt.minRead,
      writeCapacity: capacityCaps.postsByStatusUpdatedAt.minWrite,
    });
    this.postsTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "scheduleStatus", type: AttributeType.STRING },
      sortKey: { name: "scheduledAt", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
      readCapacity: capacityCaps.postsBySchedule.minRead,
      writeCapacity: capacityCaps.postsBySchedule.minWrite,
    });

    this.integrationsTable = this.createTable("IntegrationsTable", {
      tableName: `noteship-integrations-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "providerAccountId", type: AttributeType.STRING },
      readCapacity: capacityCaps.integrations.minRead,
      writeCapacity: capacityCaps.integrations.minWrite,
    });

    this.usageTable = this.createTable("UsageTable", {
      tableName: `noteship-usage-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "periodStart", type: AttributeType.STRING },
      readCapacity: capacityCaps.usage.minRead,
      writeCapacity: capacityCaps.usage.minWrite,
    });

    this.rateLimitsTable = this.createTable("RateLimitsTable", {
      tableName: `noteship-rate-limits-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "bucketKey", type: AttributeType.STRING },
      readCapacity: capacityCaps.rateLimits.minRead,
      writeCapacity: capacityCaps.rateLimits.minWrite,
      timeToLiveAttribute: "expiresAtEpoch",
    });

    this.uploadLeasesTable = this.createTable("UploadLeasesTable", {
      tableName: `noteship-upload-leases-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "artifactId", type: AttributeType.STRING },
      readCapacity: capacityCaps.uploadLeases.minRead,
      writeCapacity: capacityCaps.uploadLeases.minWrite,
      timeToLiveAttribute: "expiresAtEpoch",
    });

    this.jobsTable = this.createTable("JobsTable", {
      tableName: `noteship-jobs-${envName}`,
      partitionKey: { name: "userId", type: AttributeType.STRING },
      sortKey: { name: "jobId", type: AttributeType.STRING },
      readCapacity: capacityCaps.jobs.minRead,
      writeCapacity: capacityCaps.jobs.minWrite,
    });

    const dlq = new Queue(this, "JobsDlq", {
      queueName: `noteship-jobs-dlq-${envName}`,
      retentionPeriod: cdk.Duration.days(14),
    });

    this.jobsQueue = new Queue(this, "JobsQueue", {
      queueName: `noteship-jobs-${envName}`,
      visibilityTimeout: cdk.Duration.minutes(2),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 5,
      },
    });

    new cdk.CfnOutput(this, "ContentBucketName", { value: this.contentBucket.bucketName });
    new cdk.CfnOutput(this, "ContentDistributionId", {
      value: contentDistribution.distributionId,
    });
    new cdk.CfnOutput(this, "ContentDistributionDomain", {
      value: contentDistribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "ContentCustomDomain", {
      value: contentCustomDomain,
    });
    new cdk.CfnOutput(this, "ContentCloudflareCnameTarget", {
      value: contentDistribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "UsersTableName", { value: this.usersTable.tableName });
    new cdk.CfnOutput(this, "NotesTableName", { value: this.notesTable.tableName });
    new cdk.CfnOutput(this, "PostsTableName", { value: this.postsTable.tableName });
    new cdk.CfnOutput(this, "IntegrationsTableName", { value: this.integrationsTable.tableName });
    new cdk.CfnOutput(this, "UsageTableName", { value: this.usageTable.tableName });
    new cdk.CfnOutput(this, "RateLimitsTableName", { value: this.rateLimitsTable.tableName });
    new cdk.CfnOutput(this, "UploadLeasesTableName", {
      value: this.uploadLeasesTable.tableName,
    });
    new cdk.CfnOutput(this, "JobsTableName", { value: this.jobsTable.tableName });
    new cdk.CfnOutput(this, "JobsQueueUrl", { value: this.jobsQueue.queueUrl });
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
      timeToLiveAttribute?: string;
    },
  ): Table {
    return new Table(this, id, {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: props.readCapacity ?? 1,
      writeCapacity: props.writeCapacity ?? 1,
      timeToLiveAttribute: props.timeToLiveAttribute,
      encryption: TableEncryption.AWS_MANAGED,
      // PITR is disabled for cost control; enable for prod (see docs/technical/ops/production-checklist.md).
      pointInTimeRecovery: false,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
