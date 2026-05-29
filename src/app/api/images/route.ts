import { auth } from "@clerk/nextjs/server";
import { categoriseImage } from "@/services/categoriseImage";
import { uploadImage } from "@/services/imageUpload";
import { getSignedGetUrl } from "@/lib/r2";
import { getPrimaryGroupId, listVisibleImages } from "@/services/groups";
import { listBrands, resolveBrand, UNCATEGORISED_ID } from "@/services/brands";

// Cloudflare Pages requires the edge runtime for routes that use bindings/fetch.
export const runtime = "edge";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
const SUPPORTED_MIME = new Set(Object.values(MIME_BY_EXT));

/** Constant-time string comparison for the upload token. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Resolves the uploader. Two auth modes:
 *  - `x-api-key` header matching UPLOAD_API_TOKEN → a headless client (e.g. an
 *    iOS Shortcut); attributed to UPLOAD_USER_ID.
 *  - otherwise the Clerk browser session.
 */
async function resolveUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("x-api-key");
  const expected = process.env.UPLOAD_API_TOKEN;
  if (token && expected && safeEqual(token, expected)) {
    return process.env.UPLOAD_USER_ID || "shortcut";
  }
  const { userId } = await auth();
  return userId ?? null;
}

/** Picks a supported image MIME type, falling back to the filename extension. */
function resolveMime(file: File): string {
  if (SUPPORTED_MIME.has(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "image/jpeg";
}

/**
 * POST /api/images
 *
 * Accepts a single image as multipart/form-data under the `file` field,
 * categorises it into a short name + tags, stores the bytes in R2 and records
 * the metadata (including the category name) in D1.
 *
 * Auth: a Clerk session (browser) or an `x-api-key: <UPLOAD_API_TOKEN>` header.
 */
export async function POST(req: Request): Promise<Response> {
  const userId = await resolveUserId(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { error: "Expected multipart/form-data with a `file` field." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "Missing `file` field." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = resolveMime(file);

  // Categorise the image. This is best-effort: if the AI service is not
  // configured or fails, we still save the image under a name derived from the
  // filename and surface a warning rather than failing the whole upload.
  const brands = await listBrands();

  let name: string;
  let tags: string[] = [];
  let brand = "Uncategorised";
  let brandId = UNCATEGORISED_ID;
  let value: string | null = null;
  let refId: string | null = null;
  let warning: string | undefined;
  try {
    const categorisation = await categoriseImage(
      bytes,
      mimeType,
      brands.map((b) => b.name),
    );
    name = categorisation.name;
    tags = categorisation.tags;
    value = categorisation.value;
    refId = categorisation.refId;
    const chosen = resolveBrand(brands, categorisation.brand);
    brand = chosen.name;
    brandId = chosen.id;
  } catch (err) {
    name = file.name.replace(/\.[^.]+$/, "") || "Untitled image";
    warning = `Categorisation failed: ${
      err instanceof Error ? err.message : String(err)
    }`;
    console.error("Image categorisation failed", err);
  }

  // Auto-share: tag the upload with the user's group so everyone in it sees it.
  const groupId = await getPrimaryGroupId(userId);

  try {
    const image = await uploadImage({
      userId,
      filename: file.name,
      mimeType,
      sizeBytes: file.size,
      buffer: bytes,
      title: name,
      brand,
      brandId,
      value,
      refId,
      groupId,
      tags,
    });

    return Response.json({ image, warning }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    // Validation errors (size / mime type) are client errors; the rest are 500.
    const status = /5MB limit|Unsupported mime type/.test(message) ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

/**
 * GET /api/images
 *
 * Lists the vouchers the current user can see: their own plus any shared with
 * a group they belong to.
 */
export async function GET(req: Request): Promise<Response> {
  const userId = await resolveUserId(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ?all=1 includes inactive vouchers too (used by the admin page).
  const includeInactive =
    new URL(req.url).searchParams.get("all") === "1";

  try {
    const rows = await listVisibleImages(userId, includeInactive);
    // Attach a short-lived presigned URL so the client can render the image.
    const images = await Promise.all(
      rows.map(async (img) => ({
        ...img,
        url: await getSignedGetUrl(img.r2Key).catch(() => null),
      })),
    );
    return Response.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list images.";
    return Response.json({ error: message }, { status: 500 });
  }
}
