import { GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";

export const getObjectString = async (
  s3: S3Client,
  bucket: string,
  key: string,
): Promise<string> => {
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!result.Body) {
    return "";
  }

  return result.Body.transformToString();
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
      ContentType: "text/plain",
    }),
  );
};
