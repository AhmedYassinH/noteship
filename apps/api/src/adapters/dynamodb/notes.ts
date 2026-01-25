import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { type Note, fromNoteItem, toNoteItem } from "@noteship/domain";
import { ddbDocClient } from "./client";

const notesTableName = process.env.NOTES_TABLE_NAME;

if (!notesTableName) {
  throw new Error("NOTES_TABLE_NAME is required");
}

export const getNoteById = async (userId: string, noteId: string): Promise<Note | null> => {
  const result = await ddbDocClient.send(
    new GetCommand({
      TableName: notesTableName,
      Key: { userId, noteId },
    }),
  );

  if (!result.Item) {
    return null;
  }

  return fromNoteItem(result.Item);
};

export const putNote = async (note: Note): Promise<void> => {
  await ddbDocClient.send(
    new PutCommand({
      TableName: notesTableName,
      Item: toNoteItem(note),
    }),
  );
};
