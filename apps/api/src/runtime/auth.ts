import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { unauthorized } from "./errors";

export const getUserId = (event: APIGatewayProxyEventV2): string => {
  const authorizer = (event.requestContext as { authorizer?: { jwt?: { claims?: unknown } } })
    ?.authorizer;
  const claims = authorizer?.jwt?.claims as { sub?: string } | undefined;
  const userIdFromJwt = typeof claims?.sub === "string" ? claims.sub : undefined;
  const userIdHeader = event.headers?.["x-user-id"];

  if (userIdFromJwt) {
    return userIdFromJwt;
  }

  if (userIdHeader) {
    return userIdHeader;
  }

  throw unauthorized("Missing user identity");
};
