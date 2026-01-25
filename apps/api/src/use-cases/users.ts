import type { User } from "@noteship/domain";
import type { Deps } from "../runtime/deps";
import { getUserById, putUser } from "../adapters/dynamodb/users";

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
  };

  await putUser(deps.ddb, deps.tableNames.users, user);
  return user;
};
