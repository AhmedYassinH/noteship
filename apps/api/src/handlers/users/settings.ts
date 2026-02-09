import { meResponseSchema, updateMeSettingsSchema } from "@noteship/domain";
import { withDeps } from "../../runtime/handler";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { updateUserSettings } from "../../use-cases/users";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = updateMeSettingsSchema.parse(payload);

  const user = await updateUserSettings(deps, userId, input);
  return jsonResponse(200, meResponseSchema.parse({ user }));
});
