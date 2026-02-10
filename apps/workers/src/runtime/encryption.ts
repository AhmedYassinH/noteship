import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const AES_256_GCM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

export type EncryptedCredentials = {
  ciphertext: string;
  iv: string;
  tag: string;
  alg: "aes-256-gcm";
  keyVersion: string;
};

const decodeKey = (rawKeyB64: string): Buffer => {
  const key = Buffer.from(rawKeyB64, "base64");
  if (key.length !== 32) {
    throw new Error("NOTESHIP_INTEGRATION_CREDENTIALS_KEY_B64 must decode to 32 bytes");
  }
  return key;
};

export const encryptCredentials = (
  input: Record<string, unknown>,
  keyB64: string,
  keyVersion: string,
): EncryptedCredentials => {
  const key = decodeKey(keyB64);
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(AES_256_GCM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(input), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    alg: "aes-256-gcm",
    keyVersion,
  };
};

export const decryptCredentials = <T>(input: EncryptedCredentials, keyB64: string): T => {
  if (input.alg !== AES_256_GCM) {
    throw new Error(`Unsupported encryption algorithm: ${input.alg}`);
  }

  const key = decodeKey(keyB64);
  const decipher = createDecipheriv(AES_256_GCM, key, Buffer.from(input.iv, "base64"));
  decipher.setAuthTag(Buffer.from(input.tag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64")),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString("utf8")) as T;
};
