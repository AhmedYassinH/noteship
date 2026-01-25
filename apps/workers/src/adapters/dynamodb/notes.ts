import { GetCommand, PutCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { type Note, fromNoteItem, toNoteItem } from "@noteship/domain";

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
