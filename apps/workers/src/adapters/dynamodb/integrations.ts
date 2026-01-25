import { QueryCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { fromIntegrationAccountItem, type IntegrationAccount } from "@noteship/domain";

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
