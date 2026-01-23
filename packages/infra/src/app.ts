import * as cdk from "aws-cdk-lib";
import { resolveEnv } from "./config";
import { NoteshipCoreStack } from "./stacks/core";

const app = new cdk.App();
const envName = app.node.tryGetContext("env") ?? app.node.tryGetContext("defaultEnv");
const envConfig = resolveEnv({
  contextEnv: envName,
  defaultRegion: app.node.tryGetContext("region"),
  accountEnv: process.env.CDK_DEFAULT_ACCOUNT
});

new NoteshipCoreStack(app, `NoteshipCore-${envConfig.envName}`, {
  envConfig
});
