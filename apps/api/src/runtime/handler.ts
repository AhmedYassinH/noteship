import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { errorResponse } from "./http";
import { type Deps, getDeps } from "./deps";

export type HandlerFn = (
  deps: Deps,
  event: APIGatewayProxyEventV2,
) => Promise<APIGatewayProxyResultV2>;

export const withDeps =
  (handler: HandlerFn) =>
  async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      const deps = getDeps();
      return await handler(deps, event);
    } catch (error) {
      return errorResponse(error);
    }
  };
