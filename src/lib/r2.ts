import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * R2 access via the S3-compatible API. Configured with R2_ACCOUNT_ID,
 * R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME (see .env.example).
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`,
    );
  }
  return value;
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    const accountId = env("R2_ACCOUNT_ID");
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env("R2_ACCESS_KEY_ID"),
        secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

/** Uploads a single object to the configured R2 bucket. */
export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** A short-lived presigned URL to GET an object directly from R2 (for <img>). */
export async function getSignedGetUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: env("R2_BUCKET_NAME"), Key: key }),
    { expiresIn },
  );
}
