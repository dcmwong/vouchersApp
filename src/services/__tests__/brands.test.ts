import { describe, it, expect } from "vitest";
import { resolveBrand } from "../brands";
import type { Brand } from "@/db/schema";

const mk = (id: string, name: string): Brand => ({
  id,
  name,
  color: null,
  tag: null,
  loyaltyScheme: null,
  createdAt: "",
});
const brands: Brand[] = [
  mk("tesco", "Tesco"),
  mk("sainsburys", "Sainsbury's"),
  mk("vue-cinema", "Vue Cinema"),
  mk("uncategorised", "Uncategorised"),
];

describe("resolveBrand", () => {
  it("matches an exact name", () => {
    expect(resolveBrand(brands, "Tesco").id).toBe("tesco");
  });

  it("ignores case", () => {
    expect(resolveBrand(brands, "TESCO").id).toBe("tesco");
  });

  it("ignores apostrophes/spacing", () => {
    expect(resolveBrand(brands, "Sainsbury's").id).toBe("sainsburys");
    expect(resolveBrand(brands, "Sainsburys").id).toBe("sainsburys");
    expect(resolveBrand(brands, "vuecinema").id).toBe("vue-cinema");
  });

  it("falls back to Uncategorised for unknown / empty", () => {
    expect(resolveBrand(brands, "Costa").id).toBe("uncategorised");
    expect(resolveBrand(brands, null).id).toBe("uncategorised");
    expect(resolveBrand(brands, "").id).toBe("uncategorised");
  });
});
