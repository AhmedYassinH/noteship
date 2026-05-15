import type { User } from "@noteship/domain";
import type { Deps } from "../runtime/deps";
import { getUserById, putUser } from "../adapters/dynamodb/users";
import { notFound } from "../runtime/errors";

const nowIso = (): string => new Date().toISOString();

export const getOrCreateUser = async (
  deps: Deps,
  input: { userId: string; email: string; name?: string },
): Promise<User> => {
  const existing = await getUserById(deps.ddb, deps.tableNames.users, input.userId);
  if (existing) {
    return existing;
  }

  const user: User = {
    userId: input.userId,
    email: input.email,
    name: input.name,
    createdAt: nowIso(),
    language: "en",
    siteDirection: "ltr",
    editorDirection: "ltr",
    editorDirectionLinkedToSite: true,
  };

  await putUser(deps.ddb, deps.tableNames.users, user);
  return user;
};

export const updateUserSettings = async (
  deps: Deps,
  userId: string,
  input: {
    language: "en" | "ar";
    timezone?: string;
  },
): Promise<User> => {
  const existing = await getUserById(deps.ddb, deps.tableNames.users, userId);
  if (!existing) {
    throw notFound("User not found");
  }

  const direction = input.language === "ar" ? "rtl" : "ltr";
  const updated: User = {
    ...existing,
    language: input.language,
    timezone: input.timezone ?? existing.timezone,
    siteDirection: direction,
    editorDirection: direction,
    editorDirectionLinkedToSite: true,
  };

  await putUser(deps.ddb, deps.tableNames.users, updated);
  return updated;
};
