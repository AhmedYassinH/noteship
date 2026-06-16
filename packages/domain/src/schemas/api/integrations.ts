import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "../common";

export const apiIntegrationProviderSchema = z.enum(["linkedin"]);
export const apiIntegrationStatusSchema = z.enum(["connected", "revoked", "error"]);

export const connectIntegrationSchema = z.object({
  redirectUrl: nonEmptyStringSchema.optional(),
});

export const finalizeIntegrationCallbackSchema = z.object({
  code: nonEmptyStringSchema,
  state: nonEmptyStringSchema,
  redirectUrl: nonEmptyStringSchema.optional(),
});

export const connectIntegrationResponseSchema = z.object({
  url: nonEmptyStringSchema,
  state: nonEmptyStringSchema,
});

export const disconnectIntegrationSchema = z.object({});

export const integrationAccountResponseSchema = z.object({
  provider: apiIntegrationProviderSchema,
  accountId: idSchema,
  status: apiIntegrationStatusSchema,
  scopes: z.array(z.string().min(1)).optional(),
  connectedAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const listIntegrationsResponseSchema = z.object({
  items: z.array(integrationAccountResponseSchema),
});
