import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { brands, type Brand } from "@/db/schema";

export const UNCATEGORISED_ID = "uncategorised";

/** All brands in the controlled vocabulary, alphabetical. */
export async function listBrands(): Promise<Brand[]> {
  return db.select().from(brands).orderBy(asc(brands.name));
}

/** Lowercase and strip punctuation/spacing so "Sainsbury's" === "Sainsburys". */
function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves a brand name (as chosen by the categoriser) to a brand row, ignoring
 * apostrophes, spacing and case. Falls back to "Uncategorised" when nothing
 * matches the vocabulary.
 */
export function resolveBrand(
  all: Brand[],
  name: string | null | undefined,
): Brand {
  const wanted = normalise(name ?? "");
  const match = wanted
    ? all.find((b) => normalise(b.name) === wanted)
    : undefined;
  if (match) return match;
  return (
    all.find((b) => b.id === UNCATEGORISED_ID) ?? {
      id: UNCATEGORISED_ID,
      name: "Uncategorised",
      color: null,
      tag: null,
      loyaltyScheme: null,
      createdAt: "",
    }
  );
}
