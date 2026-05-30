import { db } from "@/lib/db";
import { putObject } from "@/lib/r2";
import { images, type Image } from "@/db/schema";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export interface UploadImageInput {
  userId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer | Uint8Array;
  title?: string | null;
  description?: string | null;
  brand?: string | null;
  brandId?: string;
  value?: string | null;
  refId?: string | null;
  groupId?: string | null;
  owner?: string;
  tags?: string[];
}

function extensionFor(filename: string, mimeType: string): string {
  const fromName = filename.includes(".")
    ? filename.split(".").pop()!.toLowerCase()
    : "";
  return fromName || ALLOWED_MIME_TYPES[mimeType];
}

/**
 * Validates an uploaded image, stores the bytes in R2, then records its
 * metadata in D1. R2 is written first so a storage failure never leaves an
 * orphaned database row pointing at a missing object.
 */
export async function uploadImage(input: UploadImageInput): Promise<Image> {
  if (input.sizeBytes > MAX_SIZE_BYTES) {
    throw new Error(
      `Image is too large: ${input.sizeBytes} bytes exceeds the 5MB limit.`,
    );
  }

  if (!ALLOWED_MIME_TYPES[input.mimeType]) {
    throw new Error(
      `Unsupported mime type "${input.mimeType}". Allowed: ${Object.keys(
        ALLOWED_MIME_TYPES,
      ).join(", ")}.`,
    );
  }

  const id = crypto.randomUUID();
  const ext = extensionFor(input.filename, input.mimeType);
  const r2Key = `${input.userId}/${id}.${ext}`;
  const now = new Date().toISOString();

  // R2 first — only record metadata once the bytes are safely stored.
  await putObject(r2Key, input.buffer, input.mimeType);

  const record: Image = {
    id,
    userId: input.userId,
    r2Key,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    title: input.title ?? null,
    description: input.description ?? null,
    brand: input.brand ?? null,
    brandId: input.brandId ?? "uncategorised",
    value: input.value ?? null,
    // Current balance starts at the face value, stamped now.
    currentValue: input.value ?? null,
    valueUpdatedAt: now,
    refId: input.refId ?? null,
    groupId: input.groupId ?? null,
    owner: input.owner ?? "all",
    active: true,
    isLoyalty: false,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(images).values(record);

  return record;
}
