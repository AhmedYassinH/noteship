import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";

const streamToString = async (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};

export const getObjectString = async (
  s3: S3Client,
  bucket: string,
  key: string,
): Promise<string> => {
  const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!result.Body) {
    return "";
  }

  return streamToString(result.Body as Readable);
};

export const putObjectString = async (
  s3: S3Client,
  bucket: string,
  key: string,
  body: string,
): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "text/markdown",
    }),
  );
};

export const putObjectJson = async (
  s3: S3Client,
  bucket: string,
  key: string,
  body: Record<string, unknown>,
): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(body),
      ContentType: "application/json",
    }),
  );
};

export const deleteObject = async (s3: S3Client, bucket: string, key: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

export const createPresignedPutUrl = async (
  s3: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds = 900,
): Promise<string> =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn: expiresInSeconds,
  });
