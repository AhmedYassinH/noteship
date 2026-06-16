import { GetCommand, UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type Usage, fromUsageItem } from "@noteship/domain";
import { planLimitExceeded } from "../../runtime/errors";

const isConditionalCheckFailure = (error: unknown): boolean =>
  error instanceof Error && error.name === "ConditionalCheckFailedException";

export const getUsageByPeriod = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
): Promise<Usage | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId, periodStart },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromUsageItem(result.Item);
};

export const incrementUsage = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
  fields: Partial<
    Pick<Usage, "aiGenerationsUsed" | "scheduledPostsUsed" | "postsPublished" | "storageUsedMb">
  >,
): Promise<Usage> => {
  const increments = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (increments.length === 0) {
    const existing = await getUsageByPeriod(ddb, tableName, userId, periodStart);
    if (!existing) {
      throw new Error("Usage record not found after empty increment");
    }
    return existing;
  }

  const updateExpressions: string[] = [];
  const attributeValues: Record<string, number | string> = {
    ":zero": 0,
    ":updatedAt": new Date().toISOString(),
  };
  const attributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };

  increments.forEach(([field, value], index) => {
    const nameKey = `#f${index}`;
    const valueKey = `:v${index}`;
    attributeNames[nameKey] = field;
    attributeValues[valueKey] = Number(value);
    updateExpressions.push(`${nameKey} = if_not_exists(${nameKey}, :zero) + ${valueKey}`);
  });

  const ensuredFields = new Set(increments.map(([field]) => field));
  (["aiGenerationsUsed", "scheduledPostsUsed"] as const).forEach((field, index) => {
    if (ensuredFields.has(field)) {
      return;
    }
    const nameKey = `#r${index}`;
    attributeNames[nameKey] = field;
    updateExpressions.push(`${nameKey} = if_not_exists(${nameKey}, :zero)`);
  });

  updateExpressions.push("#updatedAt = :updatedAt");

  const result = await ddb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, periodStart },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "ALL_NEW",
    }),
  );

  if (!result.Attributes) {
    throw new Error("Failed to update usage");
  }

  return fromUsageItem(result.Attributes);
};

export const reserveAiGeneration = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
  limit: number,
): Promise<Usage> => {
  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId, periodStart },
        UpdateExpression:
          "SET #reserved = if_not_exists(#reserved, :zero) + :one, #accounted = if_not_exists(#accounted, :zero) + :one, #used = if_not_exists(#used, :zero), #scheduled = if_not_exists(#scheduled, :zero), #updatedAt = :updatedAt",
        ConditionExpression: "attribute_not_exists(#accounted) OR #accounted <= :remaining",
        ExpressionAttributeNames: {
          "#reserved": "aiGenerationsReserved",
          "#accounted": "aiGenerationsAccounted",
          "#used": "aiGenerationsUsed",
          "#scheduled": "scheduledPostsUsed",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":remaining": Math.max(0, limit - 1),
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!result.Attributes) {
      throw new Error("Failed to reserve AI generation");
    }

    return fromUsageItem(result.Attributes);
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      throw planLimitExceeded("AI generation quota exceeded");
    }
    throw error;
  }
};

export const commitAiGenerationReservation = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
): Promise<void> => {
  await ddb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, periodStart },
      UpdateExpression:
        "SET #reserved = #reserved - :one, #used = if_not_exists(#used, :zero) + :one, #scheduled = if_not_exists(#scheduled, :zero), #updatedAt = :updatedAt",
      ConditionExpression: "#reserved >= :one",
      ExpressionAttributeNames: {
        "#reserved": "aiGenerationsReserved",
        "#used": "aiGenerationsUsed",
        "#scheduled": "scheduledPostsUsed",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ":one": 1,
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );
};

export const releaseAiGenerationReservation = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
): Promise<void> => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId, periodStart },
        UpdateExpression:
          "SET #reserved = #reserved - :one, #accounted = #accounted - :one, #used = if_not_exists(#used, :zero), #scheduled = if_not_exists(#scheduled, :zero), #updatedAt = :updatedAt",
        ConditionExpression: "#reserved >= :one AND #accounted >= :one",
        ExpressionAttributeNames: {
          "#reserved": "aiGenerationsReserved",
          "#accounted": "aiGenerationsAccounted",
          "#used": "aiGenerationsUsed",
          "#scheduled": "scheduledPostsUsed",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":updatedAt": new Date().toISOString(),
        },
      }),
    );
  } catch (error) {
    if (!isConditionalCheckFailure(error)) {
      throw error;
    }
  }
};
