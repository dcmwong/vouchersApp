const chev = (left: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d={left ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
      stroke="var(--va-ink)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function NavArrow({ left, onClick }: { left: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: "absolute",
        top: "50%",
        left: left ? 6 : undefined,
        right: left ? undefined : 6,
        transform: "translateY(-50%)",
        width: 38,
        height: 38,
        borderRadius: "50%",
        zIndex: 20,
        border: "none",
        background: "var(--va-surface)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        opacity: 0.96,
      }}
    >
      {chev(left)}
    </button>
  );
}
