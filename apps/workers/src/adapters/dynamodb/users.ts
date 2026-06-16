import { UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isConditionalCheckFailure = (error: unknown): boolean =>
  error instanceof Error && error.name === "ConditionalCheckFailedException";

export const decrementUserCounter = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  field: "activeScheduledPosts",
): Promise<void> => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId },
        UpdateExpression: "SET #field = #field - :one",
        ConditionExpression: "#field >= :one",
        ExpressionAttributeNames: {
          "#field": field,
        },
        ExpressionAttributeValues: {
          ":one": 1,
        },
      }),
    );
  } catch (error) {
    if (!isConditionalCheckFailure(error)) {
      throw error;
    }
  }
};
