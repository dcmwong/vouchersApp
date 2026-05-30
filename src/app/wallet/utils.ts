import { FAMILY } from "./theme";
import type { FamilyMember, HydratedVoucher } from "./types";

/** Leading currency symbol ("£42.50" → "£"); defaults to "£". */
export function symbolOf(s: string | null | undefined): string {
  const m = (s ?? "").match(/^[^\d.]+/);
  return m?.[0].trim() || "£";
}

/** Numeric portion ("£42.50" → "42.50"). */
export function numericPart(s: string | null | undefined): string {
  return (s ?? "").replace(/[^\d.]/g, "");
}

export function familyOf(id: string): FamilyMember {
  return FAMILY.find((f) => f.id === id) ?? FAMILY[3];
}

export function balanceText(v: HydratedVoucher | null | undefined): string {
  return v?.currentValue ?? v?.value ?? "—";
}
