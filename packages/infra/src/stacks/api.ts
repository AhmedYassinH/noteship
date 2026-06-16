import * as cdk from "aws-cdk-lib";
import { Duration, Stack, type StackProps, Tags } from "aws-cdk-lib";
import {
  CfnApiMapping,
  CfnDomainName,
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
  HttpNoneAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import type { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Bucket } from "aws-cdk-lib/aws-s3";
import type { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";
import path from "path";
import type { NoteshipEnv } from "../config";

export interface NoteshipApiStackProps extends StackProps {
  envConfig: NoteshipEnv;
  contentBucket: Bucket;
  usersTable: Table;
  notesTable: Table;
  postsTable: Table;
  integrationsTable: Table;
  usageTable: Table;
  rateLimitsTable: Table;
  uploadLeasesTable: Table;
  jobsTable: Table;
  jobsQueue: Queue;
}

type RouteConfig = {
  id: string;
  path: string;
  methods: HttpMethod[];
  entry: string;
  auth?: boolean;
};

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

export class NoteshipApiStack extends Stack {
  constructor(scope: Construct, id: string, props: NoteshipApiStackProps) {
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

    const {
      contentBucket,
      usersTable,
      notesTable,
      postsTable,
      integrationsTable,
      usageTable,
      rateLimitsTable,
      uploadLeasesTable,
      jobsTable,
      jobsQueue,
    } = props;

    const powertoolsLogLevel = envName === "prod" ? "INFO" : "DEBUG";

    const auth0IssuerBaseUrl = requireEnv("AUTH0_ISSUER_BASE_URL");
    const auth0Audience = requireEnv("AUTH0_AUDIENCE");
    const jwtAuthorizer = new HttpJwtAuthorizer("Auth0Authorizer", auth0IssuerBaseUrl, {
      jwtAudience: [auth0Audience],
    });

    const envVars: Record<string, string> = {
      NOTESHIP_ENV_NAME: envName,
      NOTESHIP_CONTENT_BUCKET_NAME: contentBucket.bucketName,
      NOTESHIP_USERS_TABLE_NAME: usersTable.tableName,
      NOTESHIP_NOTES_TABLE_NAME: notesTable.tableName,
      NOTESHIP_POSTS_TABLE_NAME: postsTable.tableName,
      NOTESHIP_INTEGRATIONS_TABLE_NAME: integrationsTable.tableName,
      NOTESHIP_USAGE_TABLE_NAME: usageTable.tableName,
      NOTESHIP_RATE_LIMITS_TABLE_NAME: rateLimitsTable.tableName,
      NOTESHIP_UPLOAD_LEASES_TABLE_NAME: uploadLeasesTable.tableName,
      NOTESHIP_JOBS_TABLE_NAME: jobsTable.tableName,
      NOTESHIP_JOBS_QUEUE_URL: jobsQueue.queueUrl,
      AUTH0_ISSUER_BASE_URL: auth0IssuerBaseUrl,
      AUTH0_AUDIENCE: auth0Audience,
      OPENAI_API_KEY: requireEnv("OPENAI_API_KEY"),
      OPENAI_EMBED_MODEL: requireEnv("OPENAI_EMBED_MODEL"),
      OPENAI_DRAFT_MODEL: requireEnv("OPENAI_DRAFT_MODEL"),
      QDRANT_URL: requireEnv("QDRANT_URL"),
      QDRANT_COLLECTION: requireEnv("QDRANT_COLLECTION"),
      STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),
      LINKEDIN_CLIENT_ID: requireEnv("LINKEDIN_CLIENT_ID"),
      LINKEDIN_CLIENT_SECRET: requireEnv("LINKEDIN_CLIENT_SECRET"),
      NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64: requireEnv(
        "NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64",
      ),
      NOTESHIP_CONTENT_CUSTOM_DOMAIN: requireEnv("NOTESHIP_CONTENT_CUSTOM_DOMAIN"),
      NOTESHIP_CLOUDFRONT_KEY_PAIR_ID: requireEnv("NOTESHIP_CLOUDFRONT_KEY_PAIR_ID"),
      NOTESHIP_CLOUDFRONT_PRIVATE_KEY: requireEnv("NOTESHIP_CLOUDFRONT_PRIVATE_KEY"),
      POWERTOOLS_SERVICE_NAME: "noteship-api",
      POWERTOOLS_LOG_LEVEL: powertoolsLogLevel,
    };

    maybeSetEnv(envVars, "NOTESHIP_LLM_PROVIDER");
    maybeSetEnv(envVars, "NOTESHIP_BILLING_ENABLED");
    maybeSetEnv(envVars, "NOTESHIP_EMBEDDING_ENABLED");
    maybeSetEnv(envVars, "NOTESHIP_VECTOR_DB_PROVIDER");
    maybeSetEnv(envVars, "QDRANT_API_KEY");
    maybeSetEnv(envVars, "STRIPE_PRICE_PRO_MONTHLY");
    maybeSetEnv(envVars, "STRIPE_PRICE_PRO_YEARLY");
    maybeSetEnv(envVars, "NOTESHIP_CONTENT_COOKIE_DOMAIN");
    maybeSetEnv(envVars, "NOTESHIP_CONTENT_SESSION_TTL_SECONDS");
    maybeSetEnv(envVars, "NOTESHIP_TEMP_UPLOAD_EXPIRY_MINUTES");
    maybeSetEnv(envVars, "NOTESHIP_TEMP_UPLOAD_LIFECYCLE_DAYS");
    maybeSetEnv(envVars, "POWERTOOLS_LOGGER_SAMPLE_RATE");
    maybeSetEnv(envVars, "NOTESHIP_INTEGRATION_CREDENTIALS_KEY_VERSION");
    maybeSetEnv(envVars, "LINKEDIN_API_VERSION");
    maybeSetEnv(envVars, "LINKEDIN_TEXT_MAX_CHARS");
    maybeSetEnv(envVars, "LINKEDIN_COMMENT_MAX_CHARS");
    maybeSetEnv(envVars, "LINKEDIN_MAX_IMAGES_PER_POST");

    const api = new HttpApi(this, "NoteshipHttpApi", {
      apiName: `noteship-api-${envName}`,
      defaultAuthorizer: jwtAuthorizer,
      corsPreflight: {
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: requireEnv("NOTESHIP_WEB_ORIGIN")
          .split(",")
          .map((origin) => origin.trim()),
        allowCredentials: true,
      },
    });

    const routes: RouteConfig[] = [
      { id: "GetMe", path: "/me", methods: [HttpMethod.GET], entry: "users/me.ts" },
      {
        id: "UpdateMeSettings",
        path: "/me/settings",
        methods: [HttpMethod.PUT],
        entry: "users/settings.ts",
      },
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
      {
        id: "CompleteNoteUpload",
        path: "/notes/{noteId}/uploads/{artifactId}/complete",
        methods: [HttpMethod.POST],
        entry: "notes/completeUpload.ts",
      },
      {
        id: "AbandonNoteUpload",
        path: "/notes/{noteId}/uploads/{artifactId}/abandon",
        methods: [HttpMethod.POST],
        entry: "notes/abandonUpload.ts",
      },
      {
        id: "ContentSession",
        path: "/content/session",
        methods: [HttpMethod.POST],
        entry: "content/session.ts",
      },
      {
        id: "SearchNotes",
        path: "/search",
        methods: [HttpMethod.POST],
        entry: "search/searchInNotes.ts",
      },
      {
        id: "CreateDraft",
        path: "/notes/{noteId}/drafts",
        methods: [HttpMethod.POST],
        entry: "drafts/create.ts",
      },
      {
        id: "RegenerateDraft",
        path: "/notes/{noteId}/drafts/regenerate",
        methods: [HttpMethod.POST],
        entry: "drafts/regenerate.ts",
      },
      { id: "CreatePost", path: "/posts", methods: [HttpMethod.POST], entry: "posts/create.ts" },
      { id: "ListPosts", path: "/posts", methods: [HttpMethod.GET], entry: "posts/list.ts" },
      {
        id: "UpdatePostDraft",
        path: "/posts/{postId}/draft",
        methods: [HttpMethod.PUT],
        entry: "posts/draft.ts",
      },
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
        id: "FinalizeIntegrationCallback",
        path: "/integrations/{provider}/callback/finalize",
        methods: [HttpMethod.POST],
        entry: "integrations/finalize.ts",
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
      rateLimitsTable.grantReadWriteData(handler);
      uploadLeasesTable.grantReadWriteData(handler);
      jobsTable.grantReadWriteData(handler);
      contentBucket.grantReadWrite(handler);
      jobsQueue.grantSendMessages(handler);
    });

    const apiCustomDomain = requireEnv("NOTESHIP_API_CUSTOM_DOMAIN");
    const apiCertificateArn = requireEnv("NOTESHIP_API_CERTIFICATE_ARN");
    const apiCertificate = Certificate.fromCertificateArn(
      this,
      "ApiCertificate",
      apiCertificateArn,
    );
    const domainName = new CfnDomainName(this, "ApiCustomDomain", {
      domainName: apiCustomDomain,
      domainNameConfigurations: [
        {
          endpointType: "REGIONAL",
          certificateArn: apiCertificate.certificateArn,
          securityPolicy: "TLS_1_2",
        },
      ],
    });
    new CfnApiMapping(this, "ApiRootMapping", {
      apiId: api.httpApiId,
      domainName: apiCustomDomain,
      stage: "$default",
    }).addDependency(domainName);

    new cdk.CfnOutput(this, "ApiUrl", { value: api.apiEndpoint });
    new cdk.CfnOutput(this, "ApiCustomDomainName", { value: apiCustomDomain });
    new cdk.CfnOutput(this, "ApiRegionalDomainName", {
      value: domainName.attrRegionalDomainName,
    });
    new cdk.CfnOutput(this, "ApiRegionalHostedZoneId", {
      value: domainName.attrRegionalHostedZoneId,
    });
    new cdk.CfnOutput(this, "ApiCloudflareCnameTarget", {
      value: domainName.attrRegionalDomainName,
    });
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
