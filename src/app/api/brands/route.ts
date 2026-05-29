import { auth } from "@clerk/nextjs/server";
import { listBrands } from "@/services/brands";

export const runtime = "edge";

/** GET /api/brands — the controlled brand vocabulary. */
export async function GET(): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const brands = await listBrands();
    return Response.json({ brands });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list brands.";
    return Response.json({ error: message }, { status: 500 });
  }
}
