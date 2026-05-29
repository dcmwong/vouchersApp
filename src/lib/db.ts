import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@/db/schema";

/**
 * Drizzle client backed by the Cloudflare D1 HTTP API.
 *
 * We use the HTTP API (rather than a Workers D1 binding) so the same code path
 * works both under `next dev` (plain Node) and on Cloudflare Pages. It requires
 * CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID and CLOUDFLARE_D1_TOKEN.
 */

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example.`,
    );
  }
  return value;
}

async function d1Query(
  sql: string,
  params: unknown[],
): Promise<Record<string, unknown>[]> {
  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const databaseId = env("CLOUDFLARE_D1_DATABASE_ID");
  const token = env("CLOUDFLARE_D1_TOKEN");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  const body = (await res.json()) as {
    success: boolean;
    errors?: { message: string }[];
    result?: { results: Record<string, unknown>[] }[];
  };

  if (!res.ok || !body.success) {
    const message =
      body.errors?.map((e) => e.message).join("; ") ?? res.statusText;
    throw new Error(`D1 query failed: ${message}`);
  }

  return body.result?.[0]?.results ?? [];
}

export const db = drizzle(
  async (sql, params, method) => {
    const results = await d1Query(sql, params);
    // sqlite-proxy expects each row as an array of column values in select order.
    const rows = results.map((row) => Object.values(row));
    return { rows: method === "get" ? (rows[0] ?? []) : rows };
  },
  { schema },
);
