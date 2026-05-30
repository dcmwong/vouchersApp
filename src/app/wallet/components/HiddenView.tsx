import type { HydratedVoucher } from "../types";
import { balanceText } from "../utils";

export function HiddenView({
  hidden,
  onClose,
  onRestore,
}: {
  hidden: HydratedVoucher[];
  onClose: () => void;
  onRestore: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "var(--va-bg)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 22px 12px",
        }}
      >
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--va-accent)",
            fontWeight: 800,
            fontFamily: "var(--va-head)",
            fontSize: 15,
          }}
        >
          Done
        </button>
        <span style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 17 }}>
          Hidden cards
        </span>
        <span style={{ width: 44 }} />
      </div>

      <div style={{ padding: "0 22px", display: "grid", gap: 10 }}>
        {hidden.length === 0 ? (
          <p style={{ color: "var(--va-soft)", textAlign: "center", marginTop: 24 }}>
            Nothing hidden.
          </p>
        ) : (
          hidden.map((v) => (
            <div
              key={v.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--va-surface)",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: v.color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--va-head)",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(v.brand ?? "?")[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{v.brand}</div>
                <div style={{ fontSize: 13, color: "var(--va-soft)" }}>{balanceText(v)}</div>
              </div>
              <button
                onClick={() => onRestore(v.id)}
                style={{
                  border: "none",
                  background: "var(--va-accent)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontWeight: 800,
                  fontFamily: "var(--va-head)",
                  cursor: "pointer",
                }}
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
