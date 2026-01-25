import { z } from "zod";

export const idSchema = z.string().min(1);
export const nonEmptyStringSchema = z.string().min(1);
export const isoDateTimeSchema = z.string().datetime();
