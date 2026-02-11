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
  contentDomain: string;
  contentCookieDomain?: string;
  cloudfrontKeyPairId: string;
  cloudfrontPrivateKey: string;
  connectors: {
    linkedin: {
      clientId: string;
      clientSecret: string;
      apiVersion?: string;
    };
    medium: {
      clientId: string;
      clientSecret: string;
    };
  };
  integrationSecurity: {
    credentialsKeyB64: string;
    credentialsKeyVersion: string;
  };
  linkedin: {
    textMaxChars: number;
    commentMaxChars: number;
    maxImagesPerPost: number;
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

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

export const getDeps = (): Deps => {
  if (!deps) {
    const llmProvider = (process.env.NOTESHIP_LLM_PROVIDER as LlmProvider | undefined) ?? "openai";
    const vectorDbProvider =
      (process.env.NOTESHIP_VECTOR_DB_PROVIDER as VectorDbProvider | undefined) ?? "qdrant";

    const s3Endpoint = process.env.NOTESHIP_S3_ENDPOINT;
    const sqsEndpoint = process.env.NOTESHIP_SQS_ENDPOINT;

    deps = {
      ddb: ddbDocClient,
      s3: new S3Client({
        ...(s3Endpoint && { endpoint: s3Endpoint, forcePathStyle: true }),
      }),
      sqs: new SQSClient({
        ...(sqsEndpoint && { endpoint: sqsEndpoint }),
      }),
      tableNames: {
        users: requireEnv("NOTESHIP_USERS_TABLE_NAME"),
        notes: requireEnv("NOTESHIP_NOTES_TABLE_NAME"),
        posts: requireEnv("NOTESHIP_POSTS_TABLE_NAME"),
        integrations: requireEnv("NOTESHIP_INTEGRATIONS_TABLE_NAME"),
        usage: requireEnv("NOTESHIP_USAGE_TABLE_NAME"),
        jobs: requireEnv("NOTESHIP_JOBS_TABLE_NAME"),
      },
      bucketName: requireEnv("NOTESHIP_CONTENT_BUCKET_NAME"),
      jobsQueueUrl: requireEnv("NOTESHIP_JOBS_QUEUE_URL"),
      llm: createLlmClient(llmProvider, requireEnv("OPENAI_API_KEY")),
      llmModels: {
        embeddings: requireEnv("OPENAI_EMBED_MODEL"),
        draft: requireEnv("OPENAI_DRAFT_MODEL"),
      },
      vectorDb: createVectorDbClient(
        vectorDbProvider,
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
      contentDomain: requireEnv("NOTESHIP_CONTENT_DOMAIN"),
      contentCookieDomain: process.env.NOTESHIP_CONTENT_COOKIE_DOMAIN,
      cloudfrontKeyPairId: requireEnv("NOTESHIP_CLOUDFRONT_KEY_PAIR_ID"),
      cloudfrontPrivateKey: requireEnv("NOTESHIP_CLOUDFRONT_PRIVATE_KEY"),
      connectors: {
        linkedin: {
          clientId: requireEnv("LINKEDIN_CLIENT_ID"),
          clientSecret: requireEnv("LINKEDIN_CLIENT_SECRET"),
          apiVersion: process.env.LINKEDIN_API_VERSION,
        },
        medium: {
          clientId: requireEnv("MEDIUM_CLIENT_ID"),
          clientSecret: requireEnv("MEDIUM_CLIENT_SECRET"),
        },
      },
      integrationSecurity: {
        credentialsKeyB64: requireEnv("NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64"),
        credentialsKeyVersion: process.env.NOTESHIP_INTEGRATION_CREDENTIALS_KEY_VERSION ?? "v1",
      },
      linkedin: {
        textMaxChars: parsePositiveInt(process.env.LINKEDIN_TEXT_MAX_CHARS, 3000),
        commentMaxChars: parsePositiveInt(process.env.LINKEDIN_COMMENT_MAX_CHARS, 1250),
        maxImagesPerPost: Math.max(
          1,
          Math.min(parsePositiveInt(process.env.LINKEDIN_MAX_IMAGES_PER_POST, 20), 20),
        ),
      },
    };
  }

  return deps;
};
