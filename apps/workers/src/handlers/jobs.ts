import type { SQSEvent } from "aws-lambda";
import {
  embedNoteJobPayloadSchema,
  jobMessageSchema,
  publishPostJobPayloadSchema,
} from "@noteship/domain";
import { getDeps } from "../runtime/deps";
import { embedNote } from "../use-cases/embedding";
import { publishPost } from "../use-cases/publishing";

export const handler = async (event: SQSEvent): Promise<void> => {
  const deps = getDeps();

  for (const record of event.Records) {
    const message = jobMessageSchema.parse(JSON.parse(record.body));

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
      await publishPost(deps, { userId: message.userId, postId: payload.postId });
      continue;
    }
  }
};
