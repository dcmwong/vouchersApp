import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  groupMembers,
  groups,
  images,
  type Group,
  type Image,
} from "@/db/schema";

// Unambiguous alphabet (no 0/O/1/I) for human-shareable join codes.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateJoinCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join(
    "",
  );
}

/** Creates a group and makes the creator its first (admin) member. */
export async function createGroup(
  userId: string,
  name: string,
): Promise<Group> {
  const group: Group = {
    id: crypto.randomUUID(),
    name: name.trim() || "My group",
    joinCode: generateJoinCode(),
    createdBy: userId,
    createdAt: new Date().toISOString(),
  };
  await db.insert(groups).values(group);
  await db
    .insert(groupMembers)
    .values({ groupId: group.id, userId, role: "admin" });
  return group;
}

/** Adds the user to the group with the given join code. Returns null if no match. */
export async function joinGroup(
  userId: string,
  code: string,
): Promise<Group | null> {
  const found = await db
    .select()
    .from(groups)
    .where(eq(groups.joinCode, code.trim().toUpperCase()))
    .limit(1);
  const group = found[0];
  if (!group) return null;

  await db
    .insert(groupMembers)
    .values({ groupId: group.id, userId, role: "member" })
    .onConflictDoNothing();
  return group;
}

/** All group IDs the user belongs to. */
export async function getUserGroupIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));
  return rows.map((r) => r.groupId);
}

/** Groups the user belongs to (most recently joined first). */
export async function listUserGroups(userId: string): Promise<Group[]> {
  return db
    .select({
      id: groups.id,
      name: groups.name,
      joinCode: groups.joinCode,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groupMembers.createdAt));
}

/**
 * The group a fresh upload should be shared with ("share all to my family").
 * Uses the user's most-recently-joined group, or null if they're in none.
 */
export async function getPrimaryGroupId(
  userId: string,
): Promise<string | null> {
  const rows = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groupMembers.createdAt))
    .limit(1);
  return rows[0]?.groupId ?? null;
}

/**
 * Active images the user can see: their own plus anything shared with their
 * groups. Inactive (used/expired) vouchers are excluded.
 */
export async function listVisibleImages(userId: string): Promise<Image[]> {
  const groupIds = await getUserGroupIds(userId);
  const visible = groupIds.length
    ? or(eq(images.userId, userId), inArray(images.groupId, groupIds))
    : eq(images.userId, userId);
  return db
    .select()
    .from(images)
    .where(and(eq(images.active, true), visible))
    .orderBy(desc(images.createdAt));
}

/** True if the user owns the image or shares a group with it. */
async function canAccessImage(userId: string, image: Image): Promise<boolean> {
  if (image.userId === userId) return true;
  if (!image.groupId) return false;
  return (await getUserGroupIds(userId)).includes(image.groupId);
}

/**
 * Sets a voucher active/inactive. Allowed for the owner or any member of the
 * group it's shared with. Returns the updated image, or null if not found or
 * the user isn't allowed to touch it.
 */
export async function setImageActive(
  userId: string,
  imageId: string,
  active: boolean,
): Promise<Image | null> {
  const found = await db
    .select()
    .from(images)
    .where(eq(images.id, imageId))
    .limit(1);
  const image = found[0];
  if (!image || !(await canAccessImage(userId, image))) return null;

  await db
    .update(images)
    .set({ active, updatedAt: new Date().toISOString() })
    .where(eq(images.id, imageId));
  return { ...image, active };
}
