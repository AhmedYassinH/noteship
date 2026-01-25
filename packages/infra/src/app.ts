import * as cdk from "aws-cdk-lib";
import { resolveEnv } from "./config";
import { NoteshipApiStack } from "./stacks/api";
import { NoteshipCoreStack } from "./stacks/core";

const app = new cdk.App();
const envName = app.node.tryGetContext("env") ?? app.node.tryGetContext("defaultEnv");
const envConfig = resolveEnv({
  contextEnv: envName,
  defaultRegion: app.node.tryGetContext("region"),
  accountEnv: process.env.CDK_DEFAULT_ACCOUNT,
  auth0IssuerBaseUrl:
    app.node.tryGetContext("auth0IssuerBaseUrl") ?? process.env.AUTH0_ISSUER_BASE_URL,
  auth0Audience: app.node.tryGetContext("auth0Audience") ?? process.env.AUTH0_AUDIENCE,
});

new NoteshipCoreStack(app, `NoteshipCore-${envConfig.envName}`, {
  envConfig,
});

new NoteshipApiStack(app, `NoteshipApi-${envConfig.envName}`, {
  envConfig,
});
