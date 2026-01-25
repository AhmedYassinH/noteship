import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const integrationProviderSchema = z.enum(["linkedin", "medium"]);
export const integrationStatusSchema = z.enum(["connected", "revoked", "error"]);

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
});

export type IntegrationAccount = z.infer<typeof integrationAccountSchema>;

export const buildProviderAccountId = (
  provider: IntegrationAccount["provider"],
  accountId: string,
): string => `${provider}#${accountId}`;

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
