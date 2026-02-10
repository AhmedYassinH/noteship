import { randomUUID } from "node:crypto";
import type { IntegrationAccount } from "@noteship/domain";
import {
  deleteIntegrationOauthTransaction,
  getIntegrationOauthTransaction,
  listIntegrationsForProvider,
  listIntegrationsForUser,
  putIntegrationAccount,
  putIntegrationOauthTransaction,
} from "../adapters/dynamodb/integrations";
import type { Deps } from "../runtime/deps";
import { HttpError, badRequest } from "../runtime/errors";
import { createConnector, type ConnectorProvider } from "@noteship/connectors";
import { encryptCredentials } from "../runtime/encryption";

const nowIso = (): string => new Date().toISOString();
const addMinutesIso = (minutes: number): string =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

const resolveProvider = (provider: string): ConnectorProvider => {
  if (provider === "linkedin" || provider === "medium") {
    return provider;
  }

  throw badRequest("Unsupported provider");
};

const mapExchangeCodeError = (provider: ConnectorProvider, error: unknown): HttpError => {
  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("revoked by the user")) {
    return new HttpError(
      401,
      "INTEGRATION_REAUTH_REQUIRED",
      `${provider} authorization was revoked. Reconnect your account and try again.`,
    );
  }

  if (
    normalizedMessage.includes("invalid_grant") ||
    normalizedMessage.includes("invalid authorization code") ||
    normalizedMessage.includes("authorization code expired")
  ) {
    return new HttpError(
      400,
      "INTEGRATION_OAUTH_CODE_INVALID",
      "OAuth code is invalid or expired. Restart the connection flow and try again.",
    );
  }

  return new HttpError(
    502,
    "INTEGRATION_PROVIDER_ERROR",
    `Failed to finalize ${provider} integration: ${message}`,
  );
};

export const listIntegrations = async (
  deps: Deps,
  userId: string,
): Promise<{ items: IntegrationAccount[] }> => {
  const items = await listIntegrationsForUser(deps.ddb, deps.tableNames.integrations, userId);
  return { items };
};

export const startIntegration = async (
  deps: Deps,
  userId: string,
  input: {
    provider: IntegrationAccount["provider"];
    redirectUrl?: string;
  },
): Promise<{ url: string; state: string }> => {
  const provider = resolveProvider(input.provider);
  const connectorConfig = deps.connectors[provider];
  const apiVersion = provider === "linkedin" ? deps.connectors.linkedin.apiVersion : undefined;
  const connector = createConnector(provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
    apiVersion,
  });

  const state = randomUUID();
  const nonce = randomUUID();
  const now = nowIso();
  await putIntegrationOauthTransaction(deps.ddb, deps.tableNames.integrations, {
    userId,
    provider,
    state,
    nonce,
    redirectUrl: input.redirectUrl,
    createdAt: now,
    expiresAt: addMinutesIso(10),
  });

  const url = connector.buildOAuthUrl({
    state,
    redirectUri: input.redirectUrl,
  });

  return { url, state };
};

export const handleIntegrationCallback = async (
  deps: Deps,
  userId: string,
  input: {
    provider: IntegrationAccount["provider"];
    code: string;
    state: string;
    redirectUrl?: string;
  },
): Promise<IntegrationAccount> => {
  const provider = resolveProvider(input.provider);
  const oauthTransaction = await getIntegrationOauthTransaction(
    deps.ddb,
    deps.tableNames.integrations,
    userId,
    provider,
    input.state,
  );

  if (!oauthTransaction) {
    throw badRequest("Invalid or expired OAuth state");
  }

  if (oauthTransaction.expiresAt <= nowIso()) {
    await deleteIntegrationOauthTransaction(
      deps.ddb,
      deps.tableNames.integrations,
      userId,
      provider,
      input.state,
    );
    throw badRequest("OAuth state expired");
  }

  if (
    oauthTransaction.redirectUrl &&
    input.redirectUrl &&
    oauthTransaction.redirectUrl !== input.redirectUrl
  ) {
    throw badRequest("OAuth redirect URL mismatch");
  }

  const redirectUri = oauthTransaction.redirectUrl ?? input.redirectUrl;

  const connectorConfig = deps.connectors[provider];
  const apiVersion = provider === "linkedin" ? deps.connectors.linkedin.apiVersion : undefined;
  const connector = createConnector(provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
    apiVersion,
  });

  let result: Awaited<ReturnType<typeof connector.exchangeCode>>;
  try {
    result = await connector.exchangeCode({
      code: input.code,
      redirectUri,
    });
  } catch (error) {
    await deleteIntegrationOauthTransaction(
      deps.ddb,
      deps.tableNames.integrations,
      userId,
      provider,
      input.state,
    );
    throw mapExchangeCodeError(provider, error);
  }

  const encrypted = encryptCredentials(
    result.credentials as Record<string, unknown>,
    deps.integrationSecurity.credentialsKeyB64,
    deps.integrationSecurity.credentialsKeyVersion,
  );

  const now = nowIso();
  const account: IntegrationAccount = {
    userId,
    provider,
    accountId: result.accountId,
    status: "connected",
    scopes: result.scopes,
    connectedAt: now,
    updatedAt: now,
    providerMetadata: result.providerMetadata,
    credentialsCiphertext: encrypted.ciphertext,
    credentialsIv: encrypted.iv,
    credentialsTag: encrypted.tag,
    credentialsAlg: encrypted.alg,
    credentialsKeyVersion: encrypted.keyVersion,
    credentialsUpdatedAt: now,
    tokenExpiresAt: result.credentials.expiresAt,
    refreshTokenExpiresAt: result.credentials.refreshTokenExpiresAt,
  };

  await Promise.all([
    putIntegrationAccount(deps.ddb, deps.tableNames.integrations, account),
    deleteIntegrationOauthTransaction(
      deps.ddb,
      deps.tableNames.integrations,
      userId,
      provider,
      input.state,
    ),
  ]);
  return account;
};

export const disconnectIntegration = async (
  deps: Deps,
  userId: string,
  input: {
    provider: IntegrationAccount["provider"];
    accountId?: string;
  },
): Promise<{ items: IntegrationAccount[] }> => {
  const now = nowIso();
  const accounts = input.accountId
    ? [
        {
          userId,
          provider: input.provider,
          accountId: input.accountId,
          status: "revoked",
          connectedAt: now,
          updatedAt: now,
        },
      ]
    : await listIntegrationsForProvider(
        deps.ddb,
        deps.tableNames.integrations,
        userId,
        input.provider,
      );

  const revoked = accounts.map((account) => ({
    ...account,
    status: "revoked" as const,
    credentialsCiphertext: undefined,
    credentialsIv: undefined,
    credentialsTag: undefined,
    credentialsAlg: undefined,
    credentialsKeyVersion: undefined,
    credentialsUpdatedAt: undefined,
    tokenExpiresAt: undefined,
    refreshTokenExpiresAt: undefined,
    updatedAt: now,
  }));

  await Promise.all(
    revoked.map((account) =>
      putIntegrationAccount(deps.ddb, deps.tableNames.integrations, account),
    ),
  );

  return { items: revoked };
};
