import { auth } from "@clerk/nextjs/server";
import { createGroup, listUserGroups } from "@/services/groups";

export const runtime = "edge";

/** GET /api/groups — groups the current user belongs to. */
export async function GET(): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const groups = await listUserGroups(userId);
    return Response.json({ groups });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list groups.";
    return Response.json({ error: message }, { status: 500 });
  }
}

/** POST /api/groups — create a group; the creator becomes its admin member. */
export async function POST(req: Request): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let name = "";
  try {
    const body = (await req.json()) as { name?: unknown };
    name = typeof body.name === "string" ? body.name : "";
  } catch {
    /* empty/invalid body → default name */
  }

  try {
    const group = await createGroup(userId, name);
    return Response.json({ group }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create group.";
    return Response.json({ error: message }, { status: 500 });
  }
}
