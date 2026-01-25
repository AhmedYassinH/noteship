import type { ScheduledEvent } from "aws-lambda";
import { getDeps } from "../runtime/deps";
import { dispatchScheduledPosts } from "../use-cases/publishing";

export const handler = async (_event: ScheduledEvent): Promise<void> => {
  const deps = getDeps();
  await dispatchScheduledPosts(deps);
};
