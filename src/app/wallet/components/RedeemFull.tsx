import { useRef } from "react";
import type { HydratedVoucher } from "../types";
import { balanceText, familyOf } from "../utils";
import { Avatar } from "./Avatar";

export function RedeemFull({
  v,
  loyaltyUrl,
  showLoyalty,
  setShowLoyalty,
  onClose,
  onEdit,
  onHide,
  onPrev,
  onNext,
  busy,
}: {
  v: HydratedVoucher;
  loyaltyUrl: string | null;
  showLoyalty: boolean;
  setShowLoyalty: (b: boolean) => void;
  onClose: () => void;
  onEdit: () => void;
  onHide: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  busy: boolean;
}) {
  // Track the gesture start so a pointer release can be classified as a
  // horizontal swipe (prev/next card) or an upward swipe (back to wallet).
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < -60) onClose(); // swipe up → back to wallet
      return;
    }
    if (dx > 42) onPrev?.();
    else if (dx < -42) onNext?.();
  };
  const fam = familyOf(v.owner);
  // A loyalty card exists for this brand only if we have its image.
  const hasLoyalty = !!loyaltyUrl;
  const onLoyalty = hasLoyalty && showLoyalty;
  const shownUrl = onLoyalty ? loyaltyUrl : v.url;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "var(--va-bg)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        touchAction: "pan-y",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background: v.color,
          color: "#fff",
          padding: "56px 22px 26px",
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              cursor: "pointer",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              borderRadius: 999,
              padding: "7px 14px 7px 10px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--va-head)",
            }}
          >
            ‹ Wallet
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, opacity: 0.9 }}>
              {fam.id === "all" ? "Shared" : `${fam.name}'s`}
            </span>
            <Avatar member={fam} size={28} />
          </div>
        </div>

        {hasLoyalty && (
          <div
            style={{
              marginTop: 18,
              position: "relative",
              display: "flex",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: 3,
            }}
          >
            {(["Gift card", "Loyalty"] as const).map((label, i) => {
              const activeSeg = (i === 1) === onLoyalty;
              return (
                <button
                  key={label}
                  onClick={() => setShowLoyalty(i === 1)}
                  style={{
                    flex: 1,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 999,
                    padding: "8px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "var(--va-head)",
                    background: activeSeg ? "#fff" : "transparent",
                    color: activeSeg ? v.color : "#fff",
                    transition: "background .2s, color .2s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Code panel — the voucher image (illustrative) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "26px 22px",
        }}
      >
        <div style={{ fontSize: 10.5, letterSpacing: "0.16em", color: "var(--va-soft)", textTransform: "uppercase" }}>
          Current balance: {balanceText(v)}
        </div>
        <div
          style={{
            background: "var(--va-surface)",
            borderRadius: 16,
            padding: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            maxWidth: 320,
            width: "100%",
          }}
        >
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownUrl}
              alt={v.brand ?? "voucher"}
              style={{ width: "100%", borderRadius: 8, display: "block" }}
            />
          ) : (
            <div style={{ height: 200, background: "var(--va-chip)", borderRadius: 8 }} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, padding: "0 22px calc(30px + env(safe-area-inset-bottom))" }}>
        {!onLoyalty && (
          <button
            onClick={onEdit}
            disabled={busy}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: 14,
              border: "1.5px solid var(--va-line)",
              background: "var(--va-surface)",
              color: "var(--va-ink)",
              fontWeight: 800,
              fontFamily: "var(--va-head)",
              cursor: "pointer",
            }}
          >
            Update balance
          </button>
        )}
        <button
          onClick={onHide}
          disabled={busy}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: 14,
            border: `1.5px solid ${onLoyalty ? "var(--va-line)" : "rgba(185,28,28,0.5)"}`,
            background: "var(--va-surface)",
            color: onLoyalty ? "var(--va-ink)" : "#b91c1c",
            fontWeight: 800,
            fontFamily: "var(--va-head)",
            cursor: "pointer",
          }}
        >
          All used up
        </button>
      </div>
    </div>
  );
}
