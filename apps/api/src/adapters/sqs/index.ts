import { SendMessageCommand, type SQSClient } from "@aws-sdk/client-sqs";
import type { JobMessage } from "@noteship/domain";

export const enqueueJob = async (
  sqs: SQSClient,
  queueUrl: string,
  body: JobMessage,
): Promise<void> => {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(body),
    }),
  );
};
