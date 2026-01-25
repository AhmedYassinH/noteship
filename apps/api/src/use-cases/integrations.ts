import { randomUUID } from "node:crypto";
import type { IntegrationAccount } from "@noteship/domain";
import {
  listIntegrationsForProvider,
  listIntegrationsForUser,
  putIntegrationAccount,
} from "../adapters/dynamodb/integrations";
import type { Deps } from "../runtime/deps";
import { badRequest } from "../runtime/errors";
import { createConnector, type ConnectorProvider } from "@noteship/connectors";

const nowIso = (): string => new Date().toISOString();

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
  const connector = createConnector(provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
  });

  const state = randomUUID();
  const url = connector.buildOAuthUrl({
    state,
    redirectUrl: input.redirectUrl,
  });

  return { url, state };
};

export const handleIntegrationCallback = async (
  deps: Deps,
  userId: string,
  input: {
    provider: IntegrationAccount["provider"];
    code: string;
    redirectUrl?: string;
  },
): Promise<IntegrationAccount> => {
  const provider = resolveProvider(input.provider);
  const connectorConfig = deps.connectors[provider];
  const connector = createConnector(provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
  });

  const result = await connector.exchangeCode({
    code: input.code,
    redirectUrl: input.redirectUrl,
  });

  const now = nowIso();
  const account: IntegrationAccount = {
    userId,
    provider,
    accountId: result.accountId,
    status: "connected",
    scopes: result.scopes,
    connectedAt: now,
    updatedAt: now,
    tokenRef: result.tokenRef,
    providerMetadata: result.providerMetadata,
  };

  await putIntegrationAccount(deps.ddb, deps.tableNames.integrations, account);
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
    updatedAt: now,
  }));

  await Promise.all(
    revoked.map((account) =>
      putIntegrationAccount(deps.ddb, deps.tableNames.integrations, account),
    ),
  );

  return { items: revoked };
};
