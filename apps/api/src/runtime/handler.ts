import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { errorResponse } from "./http";
import { type Deps, getDeps } from "./deps";
import { appendRequestContext, logger } from "./logger";
import { HttpError } from "./errors";
import { getUserId } from "./auth";
import { safeStringify } from "@noteship/utils";

export type HandlerFn = (
  _deps: Deps,
  _event: APIGatewayProxyEventV2,
) => Promise<APIGatewayProxyResultV2>;

const getOptionalUserId = (event: APIGatewayProxyEventV2): string | undefined => {
  try {
    return getUserId(event);
  } catch {
    return undefined;
  }
};

const formatErrorPayload = (error: unknown): { error: string; stack?: string } => {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }

  return { error: safeStringify(error) };
};

export const withDeps =
  (handler: HandlerFn, overrideDeps?: Deps) =>
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const start = Date.now();
    const requestId = event.requestContext?.requestId;
    const userId = getOptionalUserId(event);
    const clearContext = appendRequestContext({ requestId, userId });

    try {
      const deps = overrideDeps ?? getDeps();
      logger.info("request_start", {
        requestId,
        routeKey: event.routeKey,
        path: event.rawPath,
        method: event.requestContext?.http?.method,
        userId,
      });
      const response = await handler(deps, event);
      const durationMs = Date.now() - start;
      const statusCode = typeof response === "string" ? 200 : response.statusCode;
      logger.info("request_end", {
        requestId,
        userId,
        statusCode,
        durationMs,
      });
      return response;
    } catch (error) {
      const durationMs = Date.now() - start;
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      const isExpectedHttpError = error instanceof HttpError && error.statusCode < 500;

      if (!isExpectedHttpError) {
        logger.error("request_error", {
          requestId,
          userId,
          statusCode,
          durationMs,
          ...formatErrorPayload(error),
        });
      }

      logger.info("request_end", { requestId, userId, statusCode, durationMs });
      return errorResponse(error);
    } finally {
      clearContext();
    }
  };
