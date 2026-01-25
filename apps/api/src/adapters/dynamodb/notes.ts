import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { type Note, fromNoteItem, toNoteItem } from "@noteship/domain";
import { decodeCursor, encodeCursor } from "./common";

export const getNoteById = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  noteId: string,
): Promise<Note | null> => {
  const result = await ddb.send(
    new GetCommand({
      TableName: tableName,
      Key: { userId, noteId },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromNoteItem(result.Item);
};

export const putNote = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  note: Note,
): Promise<void> => {
  await ddb.send(
    new PutCommand({
      TableName: tableName,
      Item: toNoteItem(note),
    }),
  );
};

export const deleteNote = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  noteId: string,
): Promise<void> => {
  await ddb.send(
    new DeleteCommand({
      TableName: tableName,
      Key: { userId, noteId },
    }),
  );
};

export const listNotes = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  limit = 20,
  cursor?: string,
): Promise<{ items: Note[]; nextCursor?: string }> => {
  const result = await ddb.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: "GSI1",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: decodeCursor(cursor),
    }),
  );

  const items = (result.Items ?? []).map((item) => fromNoteItem(item));

  return {
    items,
    nextCursor: encodeCursor(result.LastEvaluatedKey),
  };
};

export const batchGetNotesByIds = async (
  ddb: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  noteIds: string[],
): Promise<Note[]> => {
  if (noteIds.length === 0) {
    return [];
  }

  const result = await ddb.send(
    new BatchGetCommand({
      RequestItems: {
        [tableName]: {
          Keys: noteIds.map((noteId) => ({ userId, noteId })),
        },
      },
    }),
  );

  const items = result.Responses?.[tableName] ?? [];
  return items.map((item) => fromNoteItem(item));
};
