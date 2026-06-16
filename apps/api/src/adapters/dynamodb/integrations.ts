import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  buildIntegrationOauthStateId,
  buildProviderAccountId,
  fromIntegrationOauthTransactionItem,
  type IntegrationAccount,
  type IntegrationOauthTransaction,
  fromIntegrationAccountItem,
  toIntegrationOauthTransactionItem,
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
  const linkedin = await listIntegrationsForProvider(ddb, tableName, userId, "linkedin");
  return linkedin.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
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

export const putIntegrationOauthTransaction = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  transaction: IntegrationOauthTransaction,
): Promise<void> => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: toIntegrationOauthTransactionItem(transaction),
    }),
  );
};

export const getIntegrationOauthTransaction = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  provider: IntegrationAccount["provider"],
  state: string,
): Promise<IntegrationOauthTransaction | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        userId,
        providerAccountId: buildIntegrationOauthStateId(provider, state),
      },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromIntegrationOauthTransactionItem(result.Item);
};

export const deleteIntegrationOauthTransaction = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  provider: IntegrationAccount["provider"],
  state: string,
): Promise<void> => {
  await ddb.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        userId,
        providerAccountId: buildIntegrationOauthStateId(provider, state),
      },
    }),
  );
};
