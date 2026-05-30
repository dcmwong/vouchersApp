import type { HydratedVoucher } from "../types";
import { symbolOf } from "../utils";

export function AmountEditor({
  v,
  draft,
  setDraft,
  bump,
  onCancel,
  onSave,
  busy,
}: {
  v: HydratedVoucher;
  draft: string;
  setDraft: (s: string) => void;
  bump: (amt: number) => void;
  onCancel: () => void;
  onSave: () => void;
  busy: boolean;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: "rgba(20,12,8,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--va-surface)",
          borderRadius: 18,
          padding: 22,
          width: "100%",
          maxWidth: 340,
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 18 }}>
            Update balance
          </div>
          <div style={{ fontSize: 13, color: "var(--va-soft)", marginTop: 2 }}>
            {v.brand} gift card
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontFamily: "var(--va-head)",
            fontWeight: 800,
          }}
        >
          <span style={{ fontSize: 30, color: "var(--va-soft)" }}>
            {symbolOf(v.currentValue ?? v.value)}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            style={{
              width: "60%",
              border: "none",
              outline: "none",
              textAlign: "center",
              fontFamily: "var(--va-head)",
              fontWeight: 800,
              fontSize: 46,
              background: "transparent",
              color: "var(--va-ink)",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {[-5, -1, 1, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => bump(n)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 999,
                border: "1px solid var(--va-line)",
                background: "var(--va-chip)",
                color: "var(--va-ink)",
                fontWeight: 700,
                cursor: "pointer",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {n > 0 ? `+${n}` : n}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 13,
              border: "1.5px solid var(--va-line)",
              background: "var(--va-surface)",
              fontWeight: 800,
              fontFamily: "var(--va-head)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={busy}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 13,
              border: "none",
              background: "var(--va-accent)",
              color: "#fff",
              fontWeight: 800,
              fontFamily: "var(--va-head)",
              cursor: busy ? "default" : "pointer",
            }}
          >
            {busy ? "…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
