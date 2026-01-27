import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const DYNAMODB_ENDPOINT = process.env.NOTESHIP_DYNAMODB_ENDPOINT || "http://localhost:8000";
const S3_ENDPOINT = process.env.NOTESHIP_S3_ENDPOINT || "http://localhost:4566";
const SQS_ENDPOINT = process.env.NOTESHIP_SQS_ENDPOINT || "http://localhost:4566";

const ddb = new DynamoDBClient({ endpoint: DYNAMODB_ENDPOINT, region: AWS_REGION });
const s3 = new S3Client({ endpoint: S3_ENDPOINT, forcePathStyle: true, region: AWS_REGION });
const sqs = new SQSClient({ endpoint: SQS_ENDPOINT, region: AWS_REGION });

const TABLES = [
  {
    TableName: "Users",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  },
  {
    TableName: "Notes",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "noteId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "noteId", AttributeType: "S" },
      { AttributeName: "updatedAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "updatedAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  {
    TableName: "Posts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "postId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "postId", AttributeType: "S" },
    ],
  },
  {
    TableName: "IntegrationAccounts",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "providerAccountId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "providerAccountId", AttributeType: "S" },
    ],
  },
  {
    TableName: "Usage",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "periodStart", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "periodStart", AttributeType: "S" },
    ],
  },
  {
    TableName: "Jobs",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "jobId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "jobId", AttributeType: "S" },
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
