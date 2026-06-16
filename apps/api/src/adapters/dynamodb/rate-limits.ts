import { UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { rateLimited } from "../../runtime/errors";

const isConditionalCheckFailure = (error: unknown): boolean =>
  error instanceof Error && error.name === "ConditionalCheckFailedException";

const windowSecondsFor = (window: "minute" | "hour" | "day"): number => {
  switch (window) {
    case "minute":
      return 60;
    case "hour":
      return 60 * 60;
    case "day":
      return 24 * 60 * 60;
  }
};

const bucketStartEpoch = (nowEpoch: number, windowSeconds: number): number =>
  Math.floor(nowEpoch / windowSeconds) * windowSeconds;

export const consumeRateLimit = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  input: {
    userId: string;
    key: string;
    limit: number;
    window: "minute" | "hour" | "day";
  },
): Promise<void> => {
  if (input.limit <= 0) {
    throw rateLimited("Rate limit exceeded");
  }

  const now = new Date();
  const nowEpoch = Math.floor(now.getTime() / 1000);
  const windowSeconds = windowSecondsFor(input.window);
  const windowStart = bucketStartEpoch(nowEpoch, windowSeconds);
  const bucketKey = `${input.key}#${input.window}#${windowStart}`;

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId: input.userId, bucketKey },
        UpdateExpression:
          "SET #count = if_not_exists(#count, :zero) + :one, #expiresAtEpoch = :expiresAtEpoch, #updatedAt = :updatedAt",
        ConditionExpression: "attribute_not_exists(#count) OR #count < :limit",
        ExpressionAttributeNames: {
          "#count": "count",
          "#expiresAtEpoch": "expiresAtEpoch",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":limit": input.limit,
          ":expiresAtEpoch": windowStart + windowSeconds + windowSeconds,
          ":updatedAt": now.toISOString(),
        },
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      throw rateLimited("Rate limit exceeded");
    }
    throw error;
  }
};
