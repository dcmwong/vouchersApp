import { auth } from "@clerk/nextjs/server";
import { updateImageFlags } from "@/services/groups";

export const runtime = "edge";

/**
 * PATCH /api/images/:id  { active?: boolean, isLoyalty?: boolean }
 *
 * Updates a voucher's flags. Allowed for the owner or any member of the group
 * the voucher is shared with. Inactive vouchers are hidden from listing;
 * loyalty cards are pinned to the top of their brand.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let patch: { active?: boolean; isLoyalty?: boolean };
  try {
    const body = (await req.json()) as Record<string, unknown>;
    patch = {};
    if (typeof body.active === "boolean") patch.active = body.active;
    if (typeof body.isLoyalty === "boolean") patch.isLoyalty = body.isLoyalty;
    if (patch.active === undefined && patch.isLoyalty === undefined) {
      return Response.json(
        { error: "Provide a boolean `active` and/or `isLoyalty`." },
        { status: 400 },
      );
    }
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const image = await updateImageFlags(userId, params.id, patch);
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
