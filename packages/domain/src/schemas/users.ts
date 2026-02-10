import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const directionSchema = z.enum(["ltr", "rtl"]);
export const languageSchema = z.enum(["en", "ar"]);

export const userSchema = z.object({
  userId: idSchema,
  email: z.string().email(),
  name: nonEmptyStringSchema.optional(),
  createdAt: isoDateTimeSchema,
  language: languageSchema.optional(),
  timezone: nonEmptyStringSchema.optional(),
  planId: nonEmptyStringSchema.optional(),
  subscriptionStatus: nonEmptyStringSchema.optional(),
  currentPeriodStart: isoDateTimeSchema.optional(),
  currentPeriodEnd: isoDateTimeSchema.optional(),
  stripeCustomerId: nonEmptyStringSchema.optional(),
  siteDirection: directionSchema.optional(),
  editorDirection: directionSchema.optional(),
  editorDirectionLinkedToSite: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;
export const userItemSchema = userSchema;
export type UserItem = z.infer<typeof userItemSchema>;

export const toUserItem = (input: User): UserItem => userSchema.parse(input);
export const fromUserItem = (input: unknown): User => userSchema.parse(input);
