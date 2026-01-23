export type NoteshipEnv = {
  envName: string;
  region: string;
  account?: string;
};

export const resolveEnv = (input: {
  contextEnv?: string;
  defaultRegion?: string;
  accountEnv?: string | undefined;
}): NoteshipEnv => {
  const envName = input.contextEnv || "dev";
  const region = input.defaultRegion || process.env.CDK_DEFAULT_REGION || "us-east-1";
  const account = input.accountEnv || process.env.CDK_DEFAULT_ACCOUNT;

  return { envName, region, account };
};
