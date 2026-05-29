import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const images = sqliteTable("images", {
  id: text("id").primaryKey(), // nanoid
  userId: text("user_id").notNull(), // Clerk user ID
  r2Key: text("r2_key").notNull().unique(), // R2 object key
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  title: text("title"),
  description: text("description"),
  brand: text("brand"),
  value: text("value"),
  // Note: card number and PIN are intentionally NOT persisted. They are
  // extracted for the upload response only — never written to the database.
  refId: text("ref_id"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
