import {
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { type Post, fromPostItem, toPostItem } from "@noteship/domain";

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

export const listScheduledPostsDue = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  nowIso: string,
  limit = 50,
): Promise<Post[]> => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "GSI2",
      KeyConditionExpression: "scheduleStatus = :scheduled AND scheduledAt <= :now",
      ExpressionAttributeValues: {
        ":scheduled": "scheduled",
        ":now": nowIso,
      },
      Limit: limit,
    }),
  );

  return (result.Items ?? []).map((item) => fromPostItem(item));
};
