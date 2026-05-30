import type { FamilyMember } from "../types";

// ── Family avatar ─────────────────────────────────────────────────
export function Avatar({ member, size = 26 }: { member: FamilyMember; size?: number }) {
  const isAll = member.id === "all";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: isAll ? "rgba(255,255,255,0.25)" : member.color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.42,
        fontFamily: "var(--va-head)",
        flexShrink: 0,
      }}
    >
      {isAll ? "✦" : member.name[0]}
    </div>
  );
}
