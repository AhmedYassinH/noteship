const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
const tagging = new AWS.ResourceGroupsTaggingAPI();

const contentBucketName = process.env.NOTESHIP_CONTENT_BUCKET_NAME;
const tagApp = process.env.NOTESHIP_GUARDRAILS_TAG_APP ?? "noteship";
const tagEnv = process.env.NOTESHIP_GUARDRAILS_TAG_ENV;
type BucketPolicyDocument = {
  Version: string;
  Statement: Array<Record<string, unknown>> | Record<string, unknown>;
};

type SNSEvent = {
  Records?: Array<unknown>;
};
type AwsError = { code?: string };
type TagMapping = { ResourceARN?: string };
type TaggingResponse = { ResourceTagMappingList?: TagMapping[]; PaginationToken?: string };

const loadBucketPolicy = async (): Promise<BucketPolicyDocument> => {
  if (!contentBucketName) {
    throw new Error("NOTESHIP_CONTENT_BUCKET_NAME is required.");
  }

  try {
    const existing = await s3.getBucketPolicy({ Bucket: contentBucketName }).promise();
    return JSON.parse(existing.Policy ?? "{}") as BucketPolicyDocument;
  } catch (error) {
    const awsError = error as AwsError;
    if (awsError.code === "NoSuchBucketPolicy") {
      return { Version: "2012-10-17", Statement: [] };
    }
    throw error;
  }
};

const upsertDenyStatement = (
  policy: BucketPolicyDocument,
  roleArns: string[],
): BucketPolicyDocument => {
  const statement = {
    Sid: "OpsGuardrailsDenyNoteshipRoles",
    Effect: "Deny",
    Principal: { AWS: roleArns },
    Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
    Resource: [`arn:aws:s3:::${contentBucketName}`, `arn:aws:s3:::${contentBucketName}/*`],
  };

  const statements = policy.Statement
    ? Array.isArray(policy.Statement)
      ? policy.Statement
      : [policy.Statement]
    : [];
  const filtered = statements.filter((entry) => (entry as { Sid?: string }).Sid !== statement.Sid);
  return {
    ...policy,
    Statement: [...filtered, statement],
  };
};

const listTaggedLambdas = async (): Promise<string[]> => {
  const resources: string[] = [];
  let paginationToken: string | undefined;

  do {
    const response = (await tagging
      .getResources({
        ResourceTypeFilters: ["lambda:function"],
        TagFilters: [
          { Key: "app", Values: [tagApp] },
          ...(tagEnv ? [{ Key: "env", Values: [tagEnv] }] : []),
        ],
        PaginationToken: paginationToken,
      })
      .promise()) as TaggingResponse;

    for (const mapping of response.ResourceTagMappingList ?? []) {
      if (mapping.ResourceARN) {
        resources.push(mapping.ResourceARN);
      }
    }

    paginationToken = response.PaginationToken;
  } while (paginationToken);

  return resources;
};

const resolveRoleArns = async (functionArns: string[]): Promise<string[]> => {
  const roles = await Promise.all(
    functionArns.map(async (functionArn) => {
      const config = await lambda.getFunctionConfiguration({ FunctionName: functionArn }).promise();
      return config.Role;
    }),
  );

  return Array.from(new Set(roles.filter(Boolean)));
};

const setReservedConcurrencyZero = async (functionArns: string[]): Promise<void> => {
  await Promise.all(
    functionArns.map(async (functionArn) => {
      await lambda
        .putFunctionConcurrency({
          FunctionName: functionArn,
          ReservedConcurrentExecutions: 0,
        })
        .promise();
    }),
  );
};

const updateBucketPolicy = async (roleArns: string[]): Promise<void> => {
  if (!contentBucketName) {
    return;
  }

  const policy = await loadBucketPolicy();
  const nextPolicy = upsertDenyStatement(policy, roleArns);
  await s3
    .putBucketPolicy({
      Bucket: contentBucketName,
      Policy: JSON.stringify(nextPolicy),
    })
    .promise();
};

export const handler = async (event: SNSEvent): Promise<void> => {
  if (!event.Records?.length) {
    return;
  }

  const functionArns = await listTaggedLambdas();
  if (functionArns.length > 0) {
    await setReservedConcurrencyZero(functionArns);
  }

  const roleArns = await resolveRoleArns(functionArns);
  if (roleArns.length > 0) {
    await updateBucketPolicy(roleArns);
  }
};
