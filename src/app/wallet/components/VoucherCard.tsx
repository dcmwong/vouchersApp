import type { HydratedVoucher } from "../types";
import { balanceText, familyOf } from "../utils";
import { Avatar } from "./Avatar";
import { Monogram } from "./Monogram";

// ── Voucher card face (portrait) ──────────────────────────────────
export function VoucherCard({
  v,
  dim,
  elevated,
}: {
  v: HydratedVoucher;
  dim: boolean;
  elevated: boolean;
}) {
  const fam = familyOf(v.owner);
  const last4 = v.refId ? v.refId.replace(/\s/g, "").slice(-4) : null;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 24,
        overflow: "hidden",
        color: "#fff",
        background: v.color,
        boxShadow: elevated
          ? "0 24px 50px -14px rgba(40,25,15,0.5), 0 2px 6px rgba(0,0,0,0.12)"
          : "0 8px 22px -8px rgba(40,25,15,0.4)",
        transition: "box-shadow .3s",
        display: "flex",
        flexDirection: "column",
        padding: "22px 22px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 42%), linear-gradient(330deg, rgba(0,0,0,0.3), rgba(0,0,0,0) 55%)",
        }}
      />
      {dim && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(20,12,8,0.30)" }} />
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Monogram letter={(v.brand ?? "?")[0]} color={v.color} size={38} radius={11} />
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.2)",
          }}
        >
          {v.isLoyalty ? "Loyalty" : "Gift card"}
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 11 }}>
        <div
          style={{
            fontFamily: "var(--va-head)",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {v.brand ?? "Untitled"}
        </div>
        <div style={{ fontSize: 9.5, letterSpacing: "0.16em", opacity: 0.82, marginTop: 4 }}>
          {v.tag}
        </div>
      </div>

      {/* Voucher image in the middle, with the value overlaid on top */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "12px 0",
          minHeight: 0,
        }}
      >
        {v.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.url}
            alt={v.brand ?? "voucher"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
            }}
          />
        )}
        {!v.isLoyalty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              background: v.url
                ? "radial-gradient(ellipse at center, rgba(0,0,0,0.45), rgba(0,0,0,0) 70%)"
                : "transparent",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: 0.85,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              Balance
            </div>
            <div
              style={{
                fontFamily: "var(--va-head)",
                fontWeight: 800,
                fontSize: 54,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              }}
            >
              {balanceText(v)}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 12,
            letterSpacing: "0.18em",
            opacity: 0.78,
          }}
        >
          {last4 ? `•••• ${last4}` : " "}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {v.loyaltyScheme && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.2)",
                fontFamily: "var(--va-head)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              {v.loyaltyScheme}
            </span>
          )}
          <Avatar member={fam} size={26} />
        </div>
      </div>
    </div>
  );
}
