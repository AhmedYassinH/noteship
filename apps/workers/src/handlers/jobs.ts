import type { SQSEvent } from "aws-lambda";
import {
  embedNoteJobPayloadSchema,
  jobMessageSchema,
  publishPostJobPayloadSchema,
} from "@noteship/domain";
import { getDeps } from "../runtime/deps";
import { appendJobContext, logger } from "../runtime/logger";
import { embedNote } from "../use-cases/embedding";
import { publishPost } from "../use-cases/publishing";
import { safeStringify } from "@noteship/utils";

const formatErrorPayload = (error: unknown): { error: string; stack?: string } => {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }

  return { error: safeStringify(error) };
};

export const handler = async (event: SQSEvent): Promise<void> => {
  const deps = getDeps();
  logger.info("jobs_batch_received", {
    recordCount: event.Records.length,
    messageIds: event.Records.map((record) => record.messageId),
  });

  for (const record of event.Records) {
    const start = Date.now();
    let clearContext = () => {};
    let jobId: string | undefined;
    let jobType: string | undefined;
    let userId: string | undefined;
    let status = "succeeded";

    try {
      logger.info("job_record_received", {
        messageId: record.messageId,
        attributes: record.attributes,
        messageAttributes: record.messageAttributes,
        body: record.body,
      });

      const message = jobMessageSchema.parse(JSON.parse(record.body));
      jobId = message.jobId;
      jobType = message.type;
      userId = message.userId;
      clearContext = appendJobContext({
        jobId,
        jobType,
        messageId: record.messageId,
        userId,
      });

      logger.info("job_start", {
        jobId,
        jobType,
        messageId: record.messageId,
        userId,
      });

      if (message.type === "EMBED_NOTE") {
        const payload = embedNoteJobPayloadSchema.parse(message.payload);
        await embedNote(deps, {
          userId: message.userId,
          noteId: payload.noteId,
          s3Key: payload.s3Key,
          version: payload.version,
        });
        continue;
      }

      if (message.type === "PUBLISH_POST") {
        const payload = publishPostJobPayloadSchema.parse(message.payload);
        await publishPost(deps, {
          userId: message.userId,
          postId: payload.postId,
          mode: payload.mode,
        });
        continue;
      }
    } catch (error) {
      status = "failed";
      const durationMs = Date.now() - start;
      logger.error("job_error", {
        jobId,
        jobType,
        messageId: record.messageId,
        userId,
        durationMs,
        ...formatErrorPayload(error),
      });
      throw error;
    } finally {
      const durationMs = Date.now() - start;
      if (jobId && jobType) {
        logger.info("job_end", {
          jobId,
          jobType,
          messageId: record.messageId,
          userId,
          durationMs,
          status,
        });
      }
      clearContext();
    }
  }
};
