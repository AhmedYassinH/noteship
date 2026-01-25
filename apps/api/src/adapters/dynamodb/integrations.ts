import {
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  buildProviderAccountId,
  type IntegrationAccount,
  fromIntegrationAccountItem,
  toIntegrationAccountItem,
} from "@noteship/domain";

export const getIntegrationAccount = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  provider: IntegrationAccount["provider"],
  accountId: string,
): Promise<IntegrationAccount | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId, providerAccountId: buildProviderAccountId(provider, accountId) },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromIntegrationAccountItem(result.Item);
};

export const listIntegrationsForUser = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
): Promise<IntegrationAccount[]> => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }),
  );

  return (result.Items ?? []).map((item) => fromIntegrationAccountItem(item));
};

export const listIntegrationsForProvider = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  provider: IntegrationAccount["provider"],
): Promise<IntegrationAccount[]> => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "userId = :userId AND begins_with(providerAccountId, :prefix)",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":prefix": `${provider}#`,
      },
    }),
  );

  return (result.Items ?? []).map((item) => fromIntegrationAccountItem(item));
};

export const putIntegrationAccount = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  account: IntegrationAccount,
): Promise<void> => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: toIntegrationAccountItem(account),
    }),
  );
};
