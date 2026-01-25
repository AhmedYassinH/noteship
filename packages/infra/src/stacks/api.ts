import * as cdk from "aws-cdk-lib";
import { Duration, Stack, type StackProps } from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
  HttpNoneAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import path from "path";
import type { NoteshipEnv } from "../config";

export interface NoteshipApiStackProps extends StackProps {
  envConfig: NoteshipEnv;
}

type RouteConfig = {
  id: string;
  path: string;
  methods: HttpMethod[];
  entry: string;
  auth?: boolean;
};

export class NoteshipApiStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipApiStackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: props.envConfig.account,
        region: props.envConfig.region,
      },
    });

    const { envName, auth0Audience, auth0IssuerBaseUrl } = props.envConfig;
    if (!auth0Audience || !auth0IssuerBaseUrl) {
      throw new Error("AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE are required for API stack.");
    }

    const bucketName = `noteship-content-${envName}`;
    const contentBucket = Bucket.fromBucketName(this, "ContentBucket", bucketName);

    const usersTable = Table.fromTableName(this, "UsersTable", `noteship-users-${envName}`);
    const notesTable = Table.fromTableName(this, "NotesTable", `noteship-notes-${envName}`);
    const postsTable = Table.fromTableName(this, "PostsTable", `noteship-posts-${envName}`);
    const integrationsTable = Table.fromTableName(
      this,
      "IntegrationsTable",
      `noteship-integrations-${envName}`,
    );
    const usageTable = Table.fromTableName(this, "UsageTable", `noteship-usage-${envName}`);
    const jobsTable = Table.fromTableName(this, "JobsTable", `noteship-jobs-${envName}`);

    const queueName = `noteship-jobs-${envName}`;
    const jobsQueue = Queue.fromQueueAttributes(this, "JobsQueue", {
      queueArn: cdk.Stack.of(this).formatArn({ service: "sqs", resource: queueName }),
      queueUrl: `https://sqs.${cdk.Aws.REGION}.amazonaws.com/${cdk.Aws.ACCOUNT_ID}/${queueName}`,
    });

    const envVars: Record<string, string> = {
      CONTENT_BUCKET_NAME: bucketName,
      USERS_TABLE_NAME: usersTable.tableName,
      NOTES_TABLE_NAME: notesTable.tableName,
      POSTS_TABLE_NAME: postsTable.tableName,
      INTEGRATIONS_TABLE_NAME: integrationsTable.tableName,
      USAGE_TABLE_NAME: usageTable.tableName,
      JOBS_TABLE_NAME: jobsTable.tableName,
      JOBS_QUEUE_URL: jobsQueue.queueUrl,
      VECTOR_DB_PROVIDER: process.env.VECTOR_DB_PROVIDER ?? "qdrant",
      QDRANT_URL: process.env.QDRANT_URL ?? "",
      QDRANT_API_KEY: process.env.QDRANT_API_KEY ?? "",
      QDRANT_COLLECTION: process.env.QDRANT_COLLECTION ?? "",
      LLM_PROVIDER: process.env.LLM_PROVIDER ?? "openai",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
      OPENAI_EMBED_MODEL: process.env.OPENAI_EMBED_MODEL ?? "",
      OPENAI_DRAFT_MODEL: process.env.OPENAI_DRAFT_MODEL ?? "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
      STRIPE_PRICE_PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
      LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ?? "",
      LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      MEDIUM_CLIENT_ID: process.env.MEDIUM_CLIENT_ID ?? "",
      MEDIUM_CLIENT_SECRET: process.env.MEDIUM_CLIENT_SECRET ?? "",
    };

    const jwtAuthorizer = new HttpJwtAuthorizer("Auth0Authorizer", auth0IssuerBaseUrl, {
      jwtAudience: [auth0Audience],
    });

    const api = new HttpApi(this, "NoteshipHttpApi", {
      apiName: `noteship-api-${envName}`,
      defaultAuthorizer: jwtAuthorizer,
      corsPreflight: {
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ["*"],
      },
    });

    const routes: RouteConfig[] = [
      { id: "GetMe", path: "/me", methods: [HttpMethod.GET], entry: "users/me.ts" },
      { id: "CreateNote", path: "/notes", methods: [HttpMethod.POST], entry: "notes/create.ts" },
      { id: "ListNotes", path: "/notes", methods: [HttpMethod.GET], entry: "notes/list.ts" },
      { id: "GetNote", path: "/notes/{noteId}", methods: [HttpMethod.GET], entry: "notes/get.ts" },
      {
        id: "UpdateNote",
        path: "/notes/{noteId}",
        methods: [HttpMethod.PUT],
        entry: "notes/update.ts",
      },
      {
        id: "DeleteNote",
        path: "/notes/{noteId}",
        methods: [HttpMethod.DELETE],
        entry: "notes/delete.ts",
      },
      {
        id: "UploadNoteArtifact",
        path: "/notes/{noteId}/uploads",
        methods: [HttpMethod.POST],
        entry: "notes/upload.ts",
      },
      { id: "SearchNotes", path: "/search", methods: [HttpMethod.POST], entry: "search/post.ts" },
      {
        id: "CreateDraft",
        path: "/notes/{noteId}/drafts",
        methods: [HttpMethod.POST],
        entry: "drafts/create.ts",
      },
      { id: "CreatePost", path: "/posts", methods: [HttpMethod.POST], entry: "posts/create.ts" },
      { id: "ListPosts", path: "/posts", methods: [HttpMethod.GET], entry: "posts/list.ts" },
      {
        id: "PublishPost",
        path: "/posts/{postId}/publish",
        methods: [HttpMethod.POST],
        entry: "posts/publish.ts",
      },
      {
        id: "SchedulePost",
        path: "/posts/{postId}/schedule",
        methods: [HttpMethod.POST],
        entry: "posts/schedule.ts",
      },
      {
        id: "CancelPost",
        path: "/posts/{postId}/cancel",
        methods: [HttpMethod.POST],
        entry: "posts/cancel.ts",
      },
      {
        id: "ListIntegrations",
        path: "/integrations",
        methods: [HttpMethod.GET],
        entry: "integrations/list.ts",
      },
      {
        id: "ConnectIntegration",
        path: "/integrations/{provider}/connect",
        methods: [HttpMethod.POST],
        entry: "integrations/connect.ts",
      },
      {
        id: "IntegrationCallback",
        path: "/integrations/{provider}/callback",
        methods: [HttpMethod.GET],
        entry: "integrations/callback.ts",
      },
      {
        id: "DisconnectIntegration",
        path: "/integrations/{provider}/disconnect",
        methods: [HttpMethod.POST],
        entry: "integrations/disconnect.ts",
      },
      {
        id: "BillingCheckout",
        path: "/billing/checkout",
        methods: [HttpMethod.POST],
        entry: "billing/checkout.ts",
      },
      {
        id: "BillingPortal",
        path: "/billing/portal",
        methods: [HttpMethod.POST],
        entry: "billing/portal.ts",
      },
      {
        id: "BillingWebhook",
        path: "/billing/webhook",
        methods: [HttpMethod.POST],
        entry: "billing/webhook.ts",
        auth: false,
      },
    ];

    const handlers = routes.map((route) => {
      const handler = this.createHandler(route.id, route.entry, envVars);
      api.addRoutes({
        path: route.path,
        methods: route.methods,
        integration: new HttpLambdaIntegration(`${route.id}Integration`, handler),
        authorizer: route.auth === false ? new HttpNoneAuthorizer() : undefined,
      });
      return handler;
    });

    handlers.forEach((handler) => {
      usersTable.grantReadWriteData(handler);
      notesTable.grantReadWriteData(handler);
      postsTable.grantReadWriteData(handler);
      integrationsTable.grantReadWriteData(handler);
      usageTable.grantReadWriteData(handler);
      jobsTable.grantReadWriteData(handler);
      contentBucket.grantReadWrite(handler);
      jobsQueue.grantSendMessages(handler);
    });

    new cdk.CfnOutput(this, "ApiUrl", { value: api.apiEndpoint });
  }

  private createHandler(id: string, entry: string, environment: Record<string, string>) {
    const repoRoot = path.resolve(__dirname, "../../../..");
    return new NodejsFunction(this, id, {
      entry: path.join(repoRoot, "apps/api/src/handlers", entry),
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      memorySize: 512,
      timeout: Duration.seconds(30),
      environment,
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: path.join(repoRoot, "pnpm-lock.yaml"),
    });
  }
}
