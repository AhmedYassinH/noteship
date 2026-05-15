import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const integrationProviderSchema = z.enum(["linkedin", "medium"]);
export const integrationStatusSchema = z.enum(["connected", "revoked", "error"]);
export const integrationCredentialAlgSchema = z.literal("aes-256-gcm");

export const integrationCredentialBlobSchema = z.object({
  credentialsCiphertext: nonEmptyStringSchema,
  credentialsIv: nonEmptyStringSchema,
  credentialsTag: nonEmptyStringSchema,
  credentialsAlg: integrationCredentialAlgSchema,
  credentialsKeyVersion: nonEmptyStringSchema,
  credentialsUpdatedAt: isoDateTimeSchema,
  tokenExpiresAt: isoDateTimeSchema.optional(),
  refreshTokenExpiresAt: isoDateTimeSchema.optional(),
});

export const integrationAccountSchema = z.object({
  userId: idSchema,
  provider: integrationProviderSchema,
  accountId: idSchema,
  status: integrationStatusSchema,
  scopes: z.array(z.string().min(1)).optional(),
  connectedAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  tokenRef: nonEmptyStringSchema.optional(),
  providerMetadata: z.record(z.string(), z.string()).optional(),
  credentialsCiphertext: nonEmptyStringSchema.optional(),
  credentialsIv: nonEmptyStringSchema.optional(),
  credentialsTag: nonEmptyStringSchema.optional(),
  credentialsAlg: integrationCredentialAlgSchema.optional(),
  credentialsKeyVersion: nonEmptyStringSchema.optional(),
  credentialsUpdatedAt: isoDateTimeSchema.optional(),
  tokenExpiresAt: isoDateTimeSchema.optional(),
  refreshTokenExpiresAt: isoDateTimeSchema.optional(),
});

export type IntegrationAccount = z.infer<typeof integrationAccountSchema>;

export const buildProviderAccountId = (
  provider: IntegrationAccount["provider"],
  accountId: string,
): string => `${provider}#${accountId}`;

export const integrationOauthTransactionSchema = z.object({
  userId: idSchema,
  provider: integrationProviderSchema,
  state: idSchema,
  redirectUrl: nonEmptyStringSchema.optional(),
  nonce: idSchema,
  createdAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
});

export type IntegrationOauthTransaction = z.infer<typeof integrationOauthTransactionSchema>;

export const buildIntegrationOauthStateId = (
  provider: IntegrationAccount["provider"],
  state: string,
): string => `oauth#${provider}#${state}`;

export const integrationAccountItemSchema = integrationAccountSchema.extend({
  providerAccountId: nonEmptyStringSchema,
});

export type IntegrationAccountItem = z.infer<typeof integrationAccountItemSchema>;

export const toIntegrationAccountItem = (input: IntegrationAccount): IntegrationAccountItem => {
  const account = integrationAccountSchema.parse(input);

  return integrationAccountItemSchema.parse({
    ...account,
    providerAccountId: buildProviderAccountId(account.provider, account.accountId),
  });
};

export const fromIntegrationAccountItem = (input: unknown): IntegrationAccount => {
  const { providerAccountId: _providerAccountId, ...account } =
    integrationAccountItemSchema.parse(input);

  return account;
};

export const integrationOauthTransactionItemSchema = integrationOauthTransactionSchema.extend({
  providerAccountId: nonEmptyStringSchema,
});

export type IntegrationOauthTransactionItem = z.infer<typeof integrationOauthTransactionItemSchema>;

export const toIntegrationOauthTransactionItem = (
  input: IntegrationOauthTransaction,
): IntegrationOauthTransactionItem => {
  const transaction = integrationOauthTransactionSchema.parse(input);
  return integrationOauthTransactionItemSchema.parse({
    ...transaction,
    providerAccountId: buildIntegrationOauthStateId(transaction.provider, transaction.state),
  });
};

export const fromIntegrationOauthTransactionItem = (
  input: unknown,
): IntegrationOauthTransaction => {
  const { providerAccountId: _providerAccountId, ...transaction } =
    integrationOauthTransactionItemSchema.parse(input);
  return transaction;
};
