import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const userSchema = z.object({
  userId: idSchema,
  email: z.string().email(),
  name: nonEmptyStringSchema.optional(),
  createdAt: isoDateTimeSchema,
  planId: nonEmptyStringSchema.optional(),
  subscriptionStatus: nonEmptyStringSchema.optional(),
  currentPeriodEnd: isoDateTimeSchema.optional(),
  stripeCustomerId: nonEmptyStringSchema.optional(),
});

export type User = z.infer<typeof userSchema>;
export const userItemSchema = userSchema;
export type UserItem = z.infer<typeof userItemSchema>;

export const toUserItem = (input: User): UserItem => userSchema.parse(input);
export const fromUserItem = (input: unknown): User => userSchema.parse(input);
