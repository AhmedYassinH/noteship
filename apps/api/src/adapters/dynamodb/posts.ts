import {
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { type Post, fromPostItem, toPostItem } from "@noteship/domain";
import { decodeCursor, encodeCursor } from "./common";

export const getPostById = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  postId: string,
): Promise<Post | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId, postId },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromPostItem(result.Item);
};

export const putPost = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  post: Post,
): Promise<void> => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: toPostItem(post),
    }),
  );
};

export const listPosts = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  status: Post["status"] | undefined,
  limit = 20,
  cursor?: string,
): Promise<{ items: Post[]; nextCursor?: string }> => {
  const useStatusIndex = Boolean(status);
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: useStatusIndex ? "GSI1" : undefined,
      KeyConditionExpression: useStatusIndex
        ? "userId = :userId AND begins_with(statusUpdatedAt, :statusPrefix)"
        : "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
        ...(useStatusIndex ? { ":statusPrefix": `${status}#` } : {}),
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: decodeCursor(cursor),
    }),
  );

  const items = (result.Items ?? []).map((item) => fromPostItem(item));

  return {
    items,
    nextCursor: encodeCursor(result.LastEvaluatedKey),
  };
};
