import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const DYNAMODB_ENDPOINT = process.env.NOTESHIP_DYNAMODB_ENDPOINT || "http://localhost:8000";
const S3_ENDPOINT = process.env.NOTESHIP_S3_ENDPOINT || "http://localhost:4566";
const SQS_ENDPOINT = process.env.NOTESHIP_SQS_ENDPOINT || "http://localhost:4566";

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
};

const ddb = new DynamoDBClient({ endpoint: DYNAMODB_ENDPOINT, region: AWS_REGION, credentials });
const s3 = new S3Client({ endpoint: S3_ENDPOINT, forcePathStyle: true, region: AWS_REGION, credentials });
const sqs = new SQSClient({ endpoint: SQS_ENDPOINT, region: AWS_REGION, credentials });

const TABLES = [
  {
    TableName: "Users",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" as const }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" as const }],
  },
  {
    TableName: "Notes",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" as const },
      { AttributeName: "noteId", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "noteId", AttributeType: "S" as const },
      { AttributeName: "updatedAt", AttributeType: "S" as const },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" as const },
          { AttributeName: "updatedAt", KeyType: "RANGE" as const },
        ],
        Projection: { ProjectionType: "ALL" as const },
      },
    ],
  },
  {
    TableName: "Posts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" as const },
      { AttributeName: "postId", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "postId", AttributeType: "S" as const },
    ],
  },
  {
    TableName: "IntegrationAccounts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" as const },
      { AttributeName: "providerAccountId", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "providerAccountId", AttributeType: "S" as const },
    ],
  },
  {
    TableName: "Usage",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" as const },
      { AttributeName: "periodStart", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "periodStart", AttributeType: "S" as const },
    ],
  },
  {
    TableName: "Jobs",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" as const },
      { AttributeName: "jobId", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" as const },
      { AttributeName: "jobId", AttributeType: "S" as const },
    ],
  },
];

async function createTables() {
  const existing = await ddb.send(new ListTablesCommand({}));
  const existingNames = new Set(existing.TableNames ?? []);

  for (const table of TABLES) {
    if (existingNames.has(table.TableName)) {
      console.log(`Table ${table.TableName} already exists, skipping.`);
      continue;
    }
    await ddb.send(
      new CreateTableCommand({
        ...table,
        BillingMode: "PAY_PER_REQUEST",
      }),
    );
    console.log(`Created table: ${table.TableName}`);
  }
}

async function createBucket() {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: "noteship-content-local" }));
    console.log("Created S3 bucket: noteship-content-local");
  } catch (err: any) {
    if (err.name === "BucketAlreadyOwnedByYou" || err.name === "BucketAlreadyExists") {
      console.log("S3 bucket already exists, skipping.");
    } else {
      throw err;
    }
  }
}

async function createQueue() {
  try {
    const result = await sqs.send(new CreateQueueCommand({ QueueName: "noteship-jobs-local" }));
    console.log("Created SQS queue:", result.QueueUrl);
  } catch (err: any) {
    if (err.name === "QueueAlreadyExists") {
      console.log("SQS queue already exists, skipping.");
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log("Initializing local resources...");
  await createTables();
  await createBucket();
  await createQueue();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
