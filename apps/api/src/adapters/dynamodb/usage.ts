import { GetCommand, UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type Usage, fromUsageItem } from "@noteship/domain";

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
  fields: Partial<Pick<Usage, "aiGenerationsUsed" | "scheduledPostsUsed" | "postsPublished">>,
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
