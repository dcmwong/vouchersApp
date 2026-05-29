import { auth } from "@clerk/nextjs/server";
import { joinGroup } from "@/services/groups";

export const runtime = "edge";

/** POST /api/groups/join — join a group by its share code. Body: { code }. */
export async function POST(req: Request): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let code = "";
  try {
    const body = (await req.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    /* fall through to validation below */
  }
  if (!code.trim()) {
    return Response.json({ error: "A join code is required." }, { status: 400 });
  }

  try {
    const group = await joinGroup(userId, code);
    if (!group) {
      return Response.json({ error: "No group found for that code." }, { status: 404 });
    }
    return Response.json({ group });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to join group.";
    return Response.json({ error: message }, { status: 500 });
  }
}
