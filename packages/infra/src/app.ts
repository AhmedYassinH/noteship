import * as cdk from "aws-cdk-lib";
import { resolveEnv } from "./config";
import { NoteshipApiStack } from "./stacks/api";
import { NoteshipCoreStack } from "./stacks/core";
import { NoteshipWebStack } from "./stacks/web";
import { NoteshipWorkersStack } from "./stacks/workers";

const app = new cdk.App();
const envName = app.node.tryGetContext("env") ?? app.node.tryGetContext("defaultEnv");
const envConfig = resolveEnv({
  contextEnv: envName,
  defaultRegion: app.node.tryGetContext("region"),
  accountEnv: process.env.CDK_DEFAULT_ACCOUNT,
});

new NoteshipCoreStack(app, `NoteshipCore-${envConfig.envName}`, {
  envConfig,
});

new NoteshipApiStack(app, `NoteshipApi-${envConfig.envName}`, {
  envConfig,
});

new NoteshipWorkersStack(app, `NoteshipWorkers-${envConfig.envName}`, {
  envConfig,
});

new NoteshipWebStack(app, `NoteshipWeb-${envConfig.envName}`, {
  envConfig,
});
