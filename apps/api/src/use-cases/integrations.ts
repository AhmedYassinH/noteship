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
import { badRequest } from "../runtime/errors";
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

  const result = await connector.exchangeCode({
    code: input.code,
    redirectUri,
  });

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
