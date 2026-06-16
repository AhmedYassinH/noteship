import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { type UploadLease, fromUploadLeaseItem, toUploadLeaseItem } from "@noteship/domain";
import { notFound, planLimitExceeded } from "../../runtime/errors";

const isConditionalCheckFailure = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === "ConditionalCheckFailedException" ||
    error.name === "TransactionCanceledException");

export const getUploadLease = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  artifactId: string,
): Promise<UploadLease | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId, artifactId },
    }),
  );

  return result.Item ? fromUploadLeaseItem(result.Item) : null;
};

export const createUploadLease = async (
  ddb: DynamoDBDocumentClient,
  input: {
    usersTableName: string;
    uploadLeasesTableName: string;
    lease: UploadLease;
    storageLimitMb: number;
  },
): Promise<void> => {
  try {
    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: input.usersTableName,
              Key: { userId: input.lease.userId },
              UpdateExpression:
                "SET #reserved = if_not_exists(#reserved, :zero) + :size, #accounted = if_not_exists(#accounted, :zero) + :size, #used = if_not_exists(#used, :zero)",
              ConditionExpression: "attribute_not_exists(#accounted) OR #accounted <= :remaining",
              ExpressionAttributeNames: {
                "#reserved": "storageReservedMb",
                "#accounted": "storageAccountedMb",
                "#used": "storageUsedMb",
              },
              ExpressionAttributeValues: {
                ":zero": 0,
                ":size": input.lease.sizeMb,
                ":remaining": Math.max(0, input.storageLimitMb - input.lease.sizeMb),
              },
            },
          },
          {
            Put: {
              TableName: input.uploadLeasesTableName,
              Item: toUploadLeaseItem(input.lease),
              ConditionExpression: "attribute_not_exists(#artifactId)",
              ExpressionAttributeNames: {
                "#artifactId": "artifactId",
              },
            },
          },
        ],
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      throw planLimitExceeded("Storage capacity exceeded");
    }
    throw error;
  }
};

export const completeUploadLease = async (
  ddb: DynamoDBDocumentClient,
  input: {
    usersTableName: string;
    uploadLeasesTableName: string;
    userId: string;
    artifactId: string;
    sizeMb: number;
    expiresAtEpoch: number;
  },
): Promise<void> => {
  try {
    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: input.uploadLeasesTableName,
              Key: { userId: input.userId, artifactId: input.artifactId },
              UpdateExpression:
                "SET #status = :completed, #updatedAt = :updatedAt, #expiresAtEpoch = :expiresAtEpoch",
              ConditionExpression: "#status = :reserved",
              ExpressionAttributeNames: {
                "#status": "status",
                "#updatedAt": "updatedAt",
                "#expiresAtEpoch": "expiresAtEpoch",
              },
              ExpressionAttributeValues: {
                ":reserved": "reserved",
                ":completed": "completed",
                ":updatedAt": new Date().toISOString(),
                ":expiresAtEpoch": input.expiresAtEpoch,
              },
            },
          },
          {
            Update: {
              TableName: input.usersTableName,
              Key: { userId: input.userId },
              UpdateExpression:
                "SET #reserved = #reserved - :size, #used = if_not_exists(#used, :zero) + :size",
              ConditionExpression: "#reserved >= :size",
              ExpressionAttributeNames: {
                "#reserved": "storageReservedMb",
                "#used": "storageUsedMb",
              },
              ExpressionAttributeValues: {
                ":zero": 0,
                ":size": input.sizeMb,
              },
            },
          },
        ],
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      const lease = await getUploadLease(
        ddb,
        input.uploadLeasesTableName,
        input.userId,
        input.artifactId,
      );
      if (lease?.status === "completed") {
        return;
      }
      throw notFound("Upload lease is not active");
    }
    throw error;
  }
};

export const abandonUploadLease = async (
  ddb: DynamoDBDocumentClient,
  input: {
    usersTableName: string;
    uploadLeasesTableName: string;
    userId: string;
    artifactId: string;
    sizeMb: number;
    expiresAtEpoch: number;
  },
): Promise<void> => {
  try {
    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: input.uploadLeasesTableName,
              Key: { userId: input.userId, artifactId: input.artifactId },
              UpdateExpression:
                "SET #status = :abandoned, #updatedAt = :updatedAt, #expiresAtEpoch = :expiresAtEpoch",
              ConditionExpression: "#status = :reserved",
              ExpressionAttributeNames: {
                "#status": "status",
                "#updatedAt": "updatedAt",
                "#expiresAtEpoch": "expiresAtEpoch",
              },
              ExpressionAttributeValues: {
                ":reserved": "reserved",
                ":abandoned": "abandoned",
                ":updatedAt": new Date().toISOString(),
                ":expiresAtEpoch": input.expiresAtEpoch,
              },
            },
          },
          {
            Update: {
              TableName: input.usersTableName,
              Key: { userId: input.userId },
              UpdateExpression:
                "SET #reserved = #reserved - :size, #accounted = #accounted - :size",
              ConditionExpression: "#reserved >= :size AND #accounted >= :size",
              ExpressionAttributeNames: {
                "#reserved": "storageReservedMb",
                "#accounted": "storageAccountedMb",
              },
              ExpressionAttributeValues: {
                ":size": input.sizeMb,
              },
            },
          },
        ],
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      return;
    }
    throw error;
  }
};

export const releaseExpiredUploadLeases = async (
  ddb: DynamoDBDocumentClient,
  input: {
    usersTableName: string;
    uploadLeasesTableName: string;
    userId: string;
    nowIso: string;
    expiresAtEpoch: number;
    limit?: number;
  },
): Promise<void> => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: input.uploadLeasesTableName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "#status = :reserved AND #expiresAt <= :now",
      ExpressionAttributeNames: {
        "#status": "status",
        "#expiresAt": "expiresAt",
      },
      ExpressionAttributeValues: {
        ":userId": input.userId,
        ":reserved": "reserved",
        ":now": input.nowIso,
      },
      Limit: input.limit ?? 25,
    }),
  );

  const leases = (result.Items ?? []).map((item) => fromUploadLeaseItem(item));
  await Promise.all(
    leases.map((lease) =>
      abandonUploadLease(ddb, {
        usersTableName: input.usersTableName,
        uploadLeasesTableName: input.uploadLeasesTableName,
        userId: input.userId,
        artifactId: lease.artifactId,
        sizeMb: lease.sizeMb,
        expiresAtEpoch: input.expiresAtEpoch,
      }),
    ),
  );
};
