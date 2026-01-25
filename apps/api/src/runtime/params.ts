import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { badRequest } from "./errors";

export const requirePathParam = (event: APIGatewayProxyEventV2, name: string): string => {
  const value = event.pathParameters?.[name];
  if (!value) {
    throw badRequest(`Missing path parameter: ${name}`);
  }
  return value;
};
