import { useRef, useState } from "react";
import type { HydratedVoucher } from "../types";
import { balanceText } from "../utils";

export function RedeemFull({
  v,
  onClose,
  onEdit,
  onHide,
  onPrev,
  onNext,
  busy,
}: {
  v: HydratedVoucher;
  onClose: () => void;
  onEdit: () => void;
  onHide: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  busy: boolean;
}) {
  // Rotating to landscape lets a wide barcode fill the screen's long edge; native
  // pinch-zoom still works on top of this for fine adjustment.
  const [rotated, setRotated] = useState(false);
  const shownUrl = v.url;

  // Swipe the whole view up to hide ("Remove card"). The card follows the finger
  // and only commits once pulled past HIDE_THRESHOLD. We track active pointers so
  // a two-finger pinch is left to the browser (native zoom) instead of dragging.
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"v" | "h" | null>(null);
  const pointers = useRef<Set<number>>(new Set());
  const [dragY, setDragY] = useState(0);
  const [animating, setAnimating] = useState(false);
  const HIDE_THRESHOLD = 140;
  const pastThreshold = dragY < -HIDE_THRESHOLD;

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.add(e.pointerId);
    if (pointers.current.size > 1) {
      // Second finger down → a pinch; abort any drag and let the browser zoom.
      start.current = null;
      axis.current = null;
      if (dragY !== 0) {
        setAnimating(true);
        setDragY(0);
      }
      return;
    }
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    setAnimating(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.size > 1 || !start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    // Lock the axis after a small initial movement so button taps still work.
    if (axis.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis.current = Math.abs(dy) > Math.abs(dx) ? "v" : "h";
    }
    if (axis.current === "v") setDragY(Math.min(0, dy));
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const moved = axis.current;
    start.current = null;
    axis.current = null;
    if (moved === "h") {
      // Horizontal flick → previous / next card.
      if (dx > 42) onPrev?.();
      else if (dx < -42) onNext?.();
      return;
    }
    if (moved !== "v") return;
    setAnimating(true);
    if (dy < -HIDE_THRESHOLD) {
      // Slide the rest of the way off-screen, then commit the hide.
      setDragY(-window.innerHeight);
      window.setTimeout(onHide, 220);
    } else {
      setDragY(0); // not far enough — spring back into place
    }
  };

  return (
    <>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          touchAction: "pinch-zoom",
          transform: `translateY(${dragY}px)`,
          opacity: Math.max(0.3, 1 - Math.abs(dragY) / 700),
          transition: animating ? "transform .22s ease, opacity .22s ease" : "none",
        }}
      >
        {/* Balance, floated over the top of the image */}
        <div
          style={{
            position: "absolute",
            top: "calc(16px + env(safe-area-inset-top))",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: "rgba(0,0,0,0.05)",
              color: "var(--va-ink)",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--va-head)",
              letterSpacing: "0.02em",
            }}
          >
            {v.brand ? `${v.brand} · ` : ""}
            {balanceText(v)}
          </span>
        </div>

        {/* Rotate toggle, floated top-right */}
        {shownUrl && (
          <button
            onClick={() => setRotated((r) => !r)}
            aria-label="Rotate"
            style={{
              position: "absolute",
              top: "calc(14px + env(safe-area-inset-top))",
              right: 14,
              zIndex: 2,
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              background: "rgba(0,0,0,0.06)",
              color: "var(--va-ink)",
              borderRadius: 999,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 8V3M20 8h-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* The barcode, filling the screen. Pinch-zoom works (touch-action). */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: 16,
          }}
        >
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownUrl}
              alt={v.brand ?? "voucher"}
              style={
                rotated
                  ? { transform: "rotate(90deg)", maxWidth: "100vh", maxHeight: "100vw", display: "block" }
                  : { maxWidth: "100%", maxHeight: "100%", display: "block", borderRadius: 10 }
              }
            />
          ) : (
            <div style={{ color: "var(--va-soft)", fontSize: 14 }}>No image</div>
          )}
        </div>

        {/* Action buttons, floated along the bottom over a fade for legibility */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "40px 18px calc(20px + env(safe-area-inset-bottom))",
            background: "linear-gradient(to top, rgba(255,255,255,0.96), rgba(255,255,255,0))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onHide}
              disabled={busy}
              style={{
                flex: 1,
                padding: "15px",
                borderRadius: 14,
                border: "1.5px solid rgba(185,28,28,0.5)",
                background: "var(--va-surface)",
                color: "#b91c1c",
                fontWeight: 800,
                fontFamily: "var(--va-head)",
                cursor: "pointer",
              }}
            >
              Remove card
            </button>
            <button
              onClick={onEdit}
              disabled={busy}
              style={{
                flex: 1,
                padding: "15px",
                borderRadius: 14,
                border: "none",
                background: v.color,
                color: "#fff",
                fontWeight: 800,
                fontFamily: "var(--va-head)",
                cursor: "pointer",
              }}
            >
              Update balance
            </button>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "13px",
              borderRadius: 14,
              border: "none",
              background: "rgba(0,0,0,0.06)",
              color: "var(--va-ink)",
              fontWeight: 700,
              fontFamily: "var(--va-head)",
              cursor: "pointer",
            }}
          >
            ‹ Back to Wallet
          </button>
        </div>
      </div>

      {/* Live feedback while swiping the view up to remove it. */}
      {dragY < -16 && !animating && (
        <div
          style={{
            position: "fixed",
            top: "calc(20px + env(safe-area-inset-top))",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 45,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              background: pastThreshold ? "#b91c1c" : "rgba(0,0,0,0.72)",
              color: "#fff",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--va-head)",
              transition: "background .15s",
            }}
          >
            {pastThreshold ? "Release to remove card" : "Keep pulling up to remove"}
          </span>
        </div>
      )}
    </>
  );
}
