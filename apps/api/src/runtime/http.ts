import type { APIGatewayProxyResultV2 } from "aws-lambda";
import type { ErrorResponse } from "@noteship/domain";
import { HttpError } from "./errors";

export const jsonResponse = (
  statusCode: number,
  body: Record<string, unknown> | unknown[] | null,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: body === null ? "" : JSON.stringify(body),
});

export const errorResponse = (error: unknown): APIGatewayProxyResultV2 => {
  if (error instanceof HttpError) {
    const payload: ErrorResponse = { code: error.code, message: error.message };
    return jsonResponse(error.statusCode, payload);
  }

  const payload: ErrorResponse = {
    code: "INTERNAL",
    message: "Unexpected error",
  };

  return jsonResponse(500, payload);
};

export const parseJsonBody = <T>(body: string | undefined | null): T => {
  if (!body) {
    throw new HttpError(400, "BAD_REQUEST", "Request body is required");
  }

  return JSON.parse(body) as T;
};
