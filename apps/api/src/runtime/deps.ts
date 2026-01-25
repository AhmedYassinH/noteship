import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type Stripe from "stripe";
import { ddbDocClient } from "../adapters/dynamodb";
import { createLlmClient, type LlmClient, type LlmProvider } from "../adapters/llm";
import {
  createVectorDbClient,
  type VectorDbClient,
  type VectorDbProvider,
} from "../adapters/vector-db";
import { createStripeClient } from "../adapters/stripe";

export type Deps = {
  ddb: DynamoDBDocumentClient;
  s3: S3Client;
  sqs: SQSClient;
  tableNames: {
    users: string;
    notes: string;
    posts: string;
    integrations: string;
    usage: string;
    jobs: string;
  };
  bucketName: string;
  jobsQueueUrl: string;
  llm: LlmClient;
  llmModels: {
    embeddings: string;
    draft: string;
  };
  vectorDb: VectorDbClient;
  vectorDbCollection: string;
  stripe: Stripe;
  stripeWebhookSecret: string;
  stripePriceMap: {
    proMonthly?: string;
    proYearly?: string;
  };
  connectors: {
    linkedin: {
      clientId: string;
      clientSecret: string;
    };
    medium: {
      clientId: string;
      clientSecret: string;
    };
  };
};

let deps: Deps | null = null;

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

export const getDeps = (): Deps => {
  if (deps) {
    return deps;
  }

  deps = {
    ddb: ddbDocClient,
    s3: new S3Client({}),
    sqs: new SQSClient({}),
    tableNames: {
      users: requireEnv("USERS_TABLE_NAME"),
      notes: requireEnv("NOTES_TABLE_NAME"),
      posts: requireEnv("POSTS_TABLE_NAME"),
      integrations: requireEnv("INTEGRATIONS_TABLE_NAME"),
      usage: requireEnv("USAGE_TABLE_NAME"),
      jobs: requireEnv("JOBS_TABLE_NAME"),
    },
    bucketName: requireEnv("CONTENT_BUCKET_NAME"),
    jobsQueueUrl: requireEnv("JOBS_QUEUE_URL"),
    llm: createLlmClient(
      (process.env.LLM_PROVIDER as LlmProvider | undefined) ?? "openai",
      requireEnv("OPENAI_API_KEY"),
    ),
    llmModels: {
      embeddings: requireEnv("OPENAI_EMBED_MODEL"),
      draft: requireEnv("OPENAI_DRAFT_MODEL"),
    },
    vectorDb: createVectorDbClient(
      (process.env.VECTOR_DB_PROVIDER as VectorDbProvider | undefined) ?? "qdrant",
      requireEnv("QDRANT_URL"),
      process.env.QDRANT_API_KEY,
    ),
    vectorDbCollection: requireEnv("QDRANT_COLLECTION"),
    stripe: createStripeClient(requireEnv("STRIPE_SECRET_KEY")),
    stripeWebhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
    stripePriceMap: {
      proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    connectors: {
      linkedin: {
        clientId: requireEnv("LINKEDIN_CLIENT_ID"),
        clientSecret: requireEnv("LINKEDIN_CLIENT_SECRET"),
      },
      medium: {
        clientId: requireEnv("MEDIUM_CLIENT_ID"),
        clientSecret: requireEnv("MEDIUM_CLIENT_SECRET"),
      },
    },
  };

  return deps;
};
