export type NoteshipEnv = {
  envName: string;
  region: string;
  account?: string;
  auth0IssuerBaseUrl?: string;
  auth0Audience?: string;
};

export const resolveEnv = (input: {
  contextEnv?: string;
  defaultRegion?: string;
  accountEnv?: string | undefined;
  auth0IssuerBaseUrl?: string;
  auth0Audience?: string;
}): NoteshipEnv => {
  const envName = input.contextEnv || "dev";
  const region = input.defaultRegion || process.env.CDK_DEFAULT_REGION || "us-east-1";
  const account = input.accountEnv || process.env.CDK_DEFAULT_ACCOUNT;
  const auth0IssuerBaseUrl = input.auth0IssuerBaseUrl || process.env.AUTH0_ISSUER_BASE_URL;
  const auth0Audience = input.auth0Audience || process.env.AUTH0_AUDIENCE;

  return { envName, region, account, auth0IssuerBaseUrl, auth0Audience };
};
