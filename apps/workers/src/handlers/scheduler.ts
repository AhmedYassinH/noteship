import type { ScheduledEvent } from "aws-lambda";
import { getDeps } from "../runtime/deps";
import { logger } from "../runtime/logger";
import { dispatchScheduledPosts } from "../use-cases/publishing";
import { safeStringify } from "@noteship/utils";

export const handler = async (_event: ScheduledEvent): Promise<void> => {
  const start = Date.now();
  const deps = getDeps();
  logger.info("scheduler_tick");

  try {
    await dispatchScheduledPosts(deps);
    const durationMs = Date.now() - start;
    logger.info("scheduler_tick_complete", { durationMs });
  } catch (error) {
    const durationMs = Date.now() - start;
    if (error instanceof Error) {
      logger.error("scheduler_tick_error", {
        durationMs,
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error("scheduler_tick_error", { durationMs, error: safeStringify(error) });
    }
    throw error;
  }
};
