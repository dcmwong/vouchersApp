// ── Brand monogram tile ───────────────────────────────────────────
export function Monogram({
  letter,
  color,
  size = 38,
  radius = 11,
}: {
  letter: string;
  color: string;
  size?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "rgba(255,255,255,0.94)",
        color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--va-head)",
        fontWeight: 800,
        fontSize: size * 0.46,
      }}
    >
      {letter}
    </div>
  );
}
