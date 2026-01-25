import { z } from "zod";
import { nonEmptyStringSchema } from "../common";

export const checkoutSessionRequestSchema = z.object({
  priceId: nonEmptyStringSchema,
  successUrl: nonEmptyStringSchema,
  cancelUrl: nonEmptyStringSchema,
});

export const portalSessionRequestSchema = z.object({
  returnUrl: nonEmptyStringSchema,
});

export const checkoutSessionResponseSchema = z.object({
  url: nonEmptyStringSchema,
});

export const portalSessionResponseSchema = z.object({
  url: nonEmptyStringSchema,
});
