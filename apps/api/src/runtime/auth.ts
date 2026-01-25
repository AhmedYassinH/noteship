import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { unauthorized } from "./errors";

type ClaimMap = Record<string, unknown>;

const getClaims = (event: APIGatewayProxyEventV2): ClaimMap | undefined => {
  const authorizer = (event.requestContext as { authorizer?: unknown })?.authorizer;
  const jwtClaims = (authorizer as { jwt?: { claims?: unknown } })?.jwt?.claims;
  const legacyClaims = (authorizer as { claims?: unknown })?.claims;
  return (jwtClaims ?? legacyClaims) as ClaimMap | undefined;
};

const getStringClaim = (claims: ClaimMap | undefined, key: string): string | undefined => {
  const value = claims?.[key];
  return typeof value === "string" ? value : undefined;
};

export const getUserClaims = (
  event: APIGatewayProxyEventV2,
): { userId: string; email?: string; name?: string } => {
  const claims = getClaims(event);
  const userIdFromJwt = getStringClaim(claims, "sub");
  const userIdHeader = event.headers?.["x-user-id"];
  const userId = userIdFromJwt || userIdHeader;

  if (!userId) {
    throw unauthorized("Missing user identity");
  }

  const name = getStringClaim(claims, "name") ?? getStringClaim(claims, "nickname");
  return {
    userId,
    email: getStringClaim(claims, "email"),
    name,
  };
};

export const getUserId = (event: APIGatewayProxyEventV2): string => {
  const { userId } = getUserClaims(event);
  return userId;
};

export const getUserEmail = (event: APIGatewayProxyEventV2): string | undefined => {
  const { email } = getUserClaims(event);
  return email;
};
