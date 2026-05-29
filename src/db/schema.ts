import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const timestamp = (name: string) =>
  text(name)
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`);

// Controlled vocabulary of voucher brands. `id` is a stable slug.
export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at"),
});

// A group (e.g. a family) that vouchers can be shared with.
export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(), // share this to let others join
  createdBy: text("created_by").notNull(), // Clerk user ID of the creator
  createdAt: timestamp("created_at"),
});

// Membership: which Clerk users belong to which groups.
export const groupMembers = sqliteTable(
  "group_members",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // Clerk user ID
    role: text("role").notNull().default("member"), // "admin" | "member"
    createdAt: timestamp("created_at"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  }),
);

export const images = sqliteTable("images", {
  id: text("id").primaryKey(), // nanoid
  userId: text("user_id").notNull(), // Clerk user ID
  r2Key: text("r2_key").notNull().unique(), // R2 object key
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  title: text("title"),
  description: text("description"),
  // Denormalised brand display name (kept in sync with brandId for easy listing).
  brand: text("brand"),
  // Controlled brand, referencing the brands table. Defaults to "uncategorised".
  brandId: text("brand_id")
    .notNull()
    .default("uncategorised")
    .references(() => brands.id),
  // Face value at issue (as read from the card).
  value: text("value"),
  // Manually-maintained remaining balance, and when it was last updated.
  currentValue: text("current_value"),
  valueUpdatedAt: text("value_updated_at"),
  // Note: card number and PIN are intentionally NOT persisted. They are
  // extracted for the upload response only — never written to the database.
  refId: text("ref_id"),
  // When set, every member of this group can see the image. Null = private to userId.
  groupId: text("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  // Inactive vouchers (e.g. used/expired) are hidden from the listing.
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  // Loyalty cards are pinned to the top of their brand on the vouchers page.
  isLoyalty: integer("is_loyalty", { mode: "boolean" }).notNull().default(false),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Brand = typeof brands.$inferSelect;
