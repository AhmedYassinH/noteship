import { GetCommand, PutCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type User, fromUserItem, toUserItem } from "@noteship/domain";

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
