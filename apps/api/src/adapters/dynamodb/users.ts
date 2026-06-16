import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { type User, fromUserItem, toUserItem } from "@noteship/domain";
import { planLimitExceeded } from "../../runtime/errors";

const isConditionalCheckFailure = (error: unknown): boolean =>
  error instanceof Error && error.name === "ConditionalCheckFailedException";

export const getUserById = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
): Promise<User | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromUserItem(result.Item);
};

export const putUser = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  user: User,
): Promise<void> => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: toUserItem(user),
    }),
  );
};

export const incrementUserCounter = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  field: "notesUsed" | "activeScheduledPosts",
  limit: number,
): Promise<void> => {
  try {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId },
        UpdateExpression: "SET #field = if_not_exists(#field, :zero) + :one",
        ConditionExpression: "attribute_not_exists(#field) OR #field <= :remaining",
        ExpressionAttributeNames: {
          "#field": field,
        },
        ExpressionAttributeValues: {
          ":zero": 0,
          ":one": 1,
          ":remaining": Math.max(0, limit - 1),
        },
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      throw planLimitExceeded("Plan capacity exceeded");
    }
    throw error;
  }
};

export const decrementUserCounter = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  field: "notesUsed" | "activeScheduledPosts",
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
