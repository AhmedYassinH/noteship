import { UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type Usage, fromUsageItem } from "@noteship/domain";

export const incrementUsage = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  periodStart: string,
  field: keyof Pick<Usage, "postsPublished">,
): Promise<Usage> => {
  const result = await ddb.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userId, periodStart },
      UpdateExpression: "SET #field = if_not_exists(#field, :zero) + :inc, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#field": field,
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ":inc": 1,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  if (!result.Attributes) {
    throw new Error("Failed to increment usage");
  }

  return fromUsageItem(result.Attributes);
};
