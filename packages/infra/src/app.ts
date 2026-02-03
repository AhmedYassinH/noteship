import * as cdk from "aws-cdk-lib";
import { resolveEnv } from "./config";
import { NoteshipApiStack } from "./stacks/api";
import { NoteshipCoreStack } from "./stacks/core";
import { NoteshipOpsGuardrailsStack } from "./stacks/ops-guardrails";
import { NoteshipWebStack } from "./stacks/web";
import { NoteshipWorkersStack } from "./stacks/workers";

const app = new cdk.App();
const envName = app.node.tryGetContext("env") ?? app.node.tryGetContext("defaultEnv");
const envConfig = resolveEnv({
  contextEnv: envName,
  defaultRegion: app.node.tryGetContext("region"),
  accountEnv: process.env.CDK_DEFAULT_ACCOUNT,
});

const coreStack = new NoteshipCoreStack(app, `NoteshipCore-${envConfig.envName}`, {
  envConfig,
});

new NoteshipApiStack(app, `NoteshipApi-${envConfig.envName}`, {
  envConfig,
  contentBucket: coreStack.contentBucket,
  usersTable: coreStack.usersTable,
  notesTable: coreStack.notesTable,
  postsTable: coreStack.postsTable,
  integrationsTable: coreStack.integrationsTable,
  usageTable: coreStack.usageTable,
  jobsTable: coreStack.jobsTable,
  jobsQueue: coreStack.jobsQueue,
});

new NoteshipWorkersStack(app, `NoteshipWorkers-${envConfig.envName}`, {
  envConfig,
  contentBucket: coreStack.contentBucket,
  notesTable: coreStack.notesTable,
  postsTable: coreStack.postsTable,
  integrationsTable: coreStack.integrationsTable,
  usageTable: coreStack.usageTable,
  jobsQueue: coreStack.jobsQueue,
});

new NoteshipWebStack(app, `NoteshipWeb-${envConfig.envName}`, {
  envConfig,
});

new NoteshipOpsGuardrailsStack(app, `NoteshipOpsGuardrails-${envConfig.envName}`, {
  envConfig,
});
