import { describe, it, expect } from "vitest";
import { resolveBrand } from "../brands";
import type { Brand } from "@/db/schema";

const brands: Brand[] = [
  { id: "tesco", name: "Tesco", createdAt: "" },
  { id: "sainsburys", name: "Sainsbury's", createdAt: "" },
  { id: "vue-cinema", name: "Vue Cinema", createdAt: "" },
  { id: "uncategorised", name: "Uncategorised", createdAt: "" },
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
