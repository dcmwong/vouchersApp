import { auth } from "@clerk/nextjs/server";
import { extractBalance } from "@/services/extractBalance";

// Cloudflare Pages requires the edge runtime for routes that use bindings/fetch.
export const runtime = "edge";

const SUPPORTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * POST /api/scan-balance
 *
 * Accepts a receipt photo as multipart/form-data under the `file` field and
 * returns the remaining gift-card balance Claude can read off it:
 * `{ found, balance, currency }`. Extraction only — nothing is persisted; the
 * client applies the balance via PATCH /api/images/:id.
 *
 * Auth: Clerk session only.
 */
export async function POST(req: Request): Promise<Response> {
  const { userId } = await auth();
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

  // `instanceof Blob`, not `File`: under next dev's edge runtime the part is a
  // File from another realm, so an `instanceof File` check rejects every upload.
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "Missing `file` field." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "Image exceeds the 5MB limit." },
      { status: 400 },
    );
  }

  // Camera captures are JPEG; Blob has no filename to fall back on.
  const mimeType = SUPPORTED_MIME.has(file.type) ? file.type : "image/jpeg";

  try {
    const result = await extractBalance(
      new Uint8Array(await file.arrayBuffer()),
      mimeType,
    );
    return Response.json(result);
  } catch (err) {
    console.error("Receipt balance extraction failed", err);
    return Response.json(
      { error: "Couldn't analyse the photo. Try again." },
      { status: 502 },
    );
  }
}
