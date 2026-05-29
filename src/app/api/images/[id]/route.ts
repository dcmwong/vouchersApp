import { auth } from "@clerk/nextjs/server";
import { setImageActive } from "@/services/groups";

export const runtime = "edge";

/**
 * PATCH /api/images/:id  { active: boolean }
 *
 * Toggles a voucher active/inactive. Allowed for the owner or any member of the
 * group the voucher is shared with. Inactive vouchers are hidden from listing.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let active: boolean;
  try {
    const body = (await req.json()) as { active?: unknown };
    if (typeof body.active !== "boolean") {
      return Response.json(
        { error: "Body must include a boolean `active`." },
        { status: 400 },
      );
    }
    active = body.active;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const image = await setImageActive(userId, params.id, active);
    if (!image) {
      return Response.json(
        { error: "Voucher not found or not accessible." },
        { status: 404 },
      );
    }
    return Response.json({ image });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
