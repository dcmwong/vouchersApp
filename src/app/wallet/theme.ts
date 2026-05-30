import type { CSSProperties } from "react";
import type { FamilyMember } from "./types";

// ── Static family roster (matches the design tokens) ──────────────
export const FAMILY: FamilyMember[] = [
  { id: "mom", name: "Mum", color: "#C2683F" },
  { id: "dad", name: "Dad", color: "#3F6B5E" },
  { id: "kids", name: "Kids", color: "#8E5B86" },
  { id: "all", name: "Everyone", color: "#6B7280" },
];

// ── Coast palette (baked-in theme tokens) ─────────────────────────
export const THEME = {
  "--va-accent": "#2C6FE0",
  "--va-accent2": "#17A06A",
  "--va-bg": "#F6F1E7",
  "--va-surface": "#FFFFFF",
  "--va-ink": "#2A211B",
  "--va-soft": "rgba(42,33,27,0.55)",
  "--va-line": "rgba(42,33,27,0.13)",
  "--va-chip": "rgba(42,33,27,0.065)",
  "--va-head": "Nunito, system-ui, sans-serif",
  "--va-body": "Nunito, system-ui, sans-serif",
  fontFamily: "var(--va-body)",
} as unknown as CSSProperties;

export const FALLBACK_COLOR = "#6B7280";
export const CW = 214;
export const CH = 314;
