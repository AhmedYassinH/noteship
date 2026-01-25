import { meResponseSchema } from "@noteship/domain";
import { withDeps } from "../../runtime/handler";
import { getUserClaims } from "../../runtime/auth";
import { badRequest } from "../../runtime/errors";
import { jsonResponse } from "../../runtime/http";
import { getOrCreateUser } from "../../use-cases/users";

export const handler = withDeps(async (deps, event) => {
  const { userId, email, name } = getUserClaims(event);
  if (!email) {
    throw badRequest("Email claim is required to bootstrap user.");
  }

  const user = await getOrCreateUser(deps, { userId, email, name });
  return jsonResponse(200, meResponseSchema.parse({ user }));
});
