"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

// ── Static family roster (matches the design tokens) ──────────────
interface FamilyMember {
  id: string;
  name: string;
  color: string;
}
const FAMILY: FamilyMember[] = [
  { id: "mom", name: "Mum", color: "#C2683F" },
  { id: "dad", name: "Dad", color: "#3F6B5E" },
  { id: "kids", name: "Kids", color: "#8E5B86" },
  { id: "all", name: "Everyone", color: "#6B7280" },
];

// ── Coast palette (baked-in theme tokens) ─────────────────────────
const THEME = {
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

interface Brand {
  id: string;
  name: string;
  color: string | null;
  tag: string | null;
  loyaltyScheme: string | null;
}

interface Voucher {
  id: string;
  brand: string | null;
  brandId: string;
  currentValue: string | null;
  value: string | null;
  owner: string;
  isLoyalty: boolean;
  active: boolean;
  url: string | null;
  refId: string | null;
}

interface HydratedVoucher extends Voucher {
  color: string;
  tag: string;
  loyaltyScheme: string | null;
}

const FALLBACK_COLOR = "#6B7280";
const CW = 214;
const CH = 314;

/** Leading currency symbol ("£42.50" → "£"); defaults to "£". */
function symbolOf(s: string | null | undefined): string {
  const m = (s ?? "").match(/^[^\d.]+/);
  return m?.[0].trim() || "£";
}
/** Numeric portion ("£42.50" → "42.50"). */
function numericPart(s: string | null | undefined): string {
  return (s ?? "").replace(/[^\d.]/g, "");
}

function familyOf(id: string): FamilyMember {
  return FAMILY.find((f) => f.id === id) ?? FAMILY[3];
}

function balanceText(v: HydratedVoucher): string {
  return v.currentValue ?? v.value ?? "—";
}

// ── Family avatar ─────────────────────────────────────────────────
function Avatar({ member, size = 26 }: { member: FamilyMember; size?: number }) {
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

// ── Brand monogram tile ───────────────────────────────────────────
function Monogram({
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

// ── Voucher card face (portrait) ──────────────────────────────────
function VoucherCard({
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

      <div
        style={{
          position: "relative",
          marginTop: "auto",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          {!v.isLoyalty && (
            <>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                Balance
              </div>
              <div
                style={{
                  fontFamily: "var(--va-head)",
                  fontWeight: 800,
                  fontSize: 38,
                  lineHeight: 1,
                  marginTop: 4,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {balanceText(v)}
              </div>
            </>
          )}
        </div>
        <Avatar member={fam} size={26} />
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
          {last4 ? `•••• ${last4}` : " "}
        </span>
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
      </div>
    </div>
  );
}

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

export function WalletHome() {
  const [vouchers, setVouchers] = useState<HydratedVoucher[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const drag = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [imgRes, brandRes] = await Promise.all([
          fetch("/api/images?all=1"),
          fetch("/api/brands"),
        ]);
        const imgData = (await imgRes.json()) as { images?: Voucher[]; error?: string };
        if (!imgRes.ok) throw new Error(imgData.error ?? "Failed to load wallet");
        const brandData = brandRes.ok
          ? ((await brandRes.json()) as { brands?: Brand[] })
          : { brands: [] };
        const byId = new Map((brandData.brands ?? []).map((b) => [b.id, b]));
        const hydrated = (imgData.images ?? []).map((v): HydratedVoucher => {
          const b = byId.get(v.brandId);
          return {
            ...v,
            color: b?.color ?? FALLBACK_COLOR,
            tag: b?.tag ?? "OTHER",
            loyaltyScheme: b?.loyaltyScheme ?? null,
          };
        });
        setVouchers(hydrated);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = vouchers.filter((v) => v.active);
  const hidden = vouchers.filter((v) => !v.active);

  // Clamp the index when the active list shrinks.
  useEffect(() => {
    if (index > active.length - 1) setIndex(Math.max(0, active.length - 1));
  }, [active.length, index]);

  const go = (dir: number) =>
    setIndex((i) => Math.max(0, Math.min(active.length - 1, i + dir)));

  const current = vouchers.find((v) => v.id === openId) ?? null;

  const showToast = (msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  };

  async function patchImage(
    id: string,
    body: Record<string, unknown>,
  ): Promise<Partial<HydratedVoucher>> {
    const res = await fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { image?: HydratedVoucher; error?: string };
    if (!res.ok || !data.image) {
      throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
    }
    return data.image;
  }

  const openCard = (v: HydratedVoucher) => {
    setOpenId(v.id);
    setShowLoyalty(false);
    setEditing(false);
  };
  const closeRedeem = () => {
    setOpenId(null);
    setEditing(false);
    setShowLoyalty(false);
  };

  const beginEdit = () => {
    if (!current) return;
    setDraft(numericPart(current.currentValue ?? current.value) || "0");
    setEditing(true);
  };
  const bump = (amt: number) =>
    setDraft((d) => Math.max(0, (parseFloat(d || "0") || 0) + amt).toFixed(2));

  const saveBalance = async () => {
    if (!current) return;
    const num = parseFloat(draft || "0") || 0;
    const next = `${symbolOf(current.currentValue ?? current.value)}${num.toFixed(2)}`;
    setBusy(true);
    try {
      const img = await patchImage(current.id, { currentValue: next });
      setVouchers((vs) =>
        vs.map((v) =>
          v.id === current.id ? { ...v, currentValue: img.currentValue ?? next } : v,
        ),
      );
      setEditing(false);
      showToast("Balance updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const restore = async (id: string) => {
    try {
      await patchImage(id, { active: true });
      setVouchers((vs) => vs.map((v) => (v.id === id ? { ...v, active: true } : v)));
      setToast(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err));
    }
  };

  const hideCard = async (id: string) => {
    setBusy(true);
    try {
      await patchImage(id, { active: false });
      setVouchers((vs) => vs.map((v) => (v.id === id ? { ...v, active: false } : v)));
      closeRedeem();
      setIndex((i) => Math.max(0, Math.min(i, active.length - 2)));
      showToast("Hidden from your wallet", () => restore(id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        ...THEME,
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--va-bg)",
        color: "var(--va-ink)",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Header */}
      <div style={{ padding: "24px 20px 4px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/family-wallet-logo.png"
              alt="Family Wallet"
              style={{ height: 36, width: "auto", display: "block" }}
            />
            <span
              style={{
                fontFamily: "var(--va-head)",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: "-0.02em",
              }}
            >
              Family Wallet
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              aria-label="Hidden cards"
              onClick={() => setHiddenOpen(true)}
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1.5px solid var(--va-line)",
                background: "var(--va-surface)",
                color: "var(--va-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="2" />
              </svg>
              {hidden.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 999,
                    background: "var(--va-ink)",
                    color: "var(--va-bg)",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--va-bg)",
                  }}
                >
                  {hidden.length}
                </span>
              )}
            </button>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "2px solid var(--va-surface)",
                overflow: "hidden",
                background: "#e7e4de",
                boxShadow: "0 1px 4px rgba(0,0,0,0.14), 0 0 0 1px var(--va-line)",
              }}
            >
              <svg width="42" height="42" viewBox="0 0 42 42" style={{ display: "block" }}>
                <rect width="42" height="42" fill="#eceae4" />
                <circle cx="21" cy="16.5" r="7.4" fill="#a9aeb3" />
                <path d="M7.5 40c0.7-8.2 6.6-12.6 13.5-12.6S33.8 31.8 34.5 40z" fill="#a9aeb3" />
              </svg>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--va-soft)", marginTop: 12, fontWeight: 500 }}>
          {active.length} card{active.length !== 1 ? "s" : ""} · shared with the family
        </div>
      </div>

      {/* Carousel */}
      <div
        onPointerDown={(e) => {
          drag.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (drag.current == null) return;
          const dx = e.clientX - drag.current;
          if (dx > 42) go(-1);
          else if (dx < -42) go(1);
          drag.current = null;
        }}
        style={{
          flex: 1,
          position: "relative",
          perspective: 1100,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          touchAction: "pan-y",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--va-soft)", padding: 24 }}>Loading…</div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#b91c1c", padding: 24 }}>⚠ {error}</div>
        ) : active.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--va-soft)", padding: 24 }}>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 18, color: "var(--va-ink)" }}>
              Wallet empty
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>Tap + to add a voucher.</div>
          </div>
        ) : (
          <div style={{ position: "relative", height: CH + 40, transformStyle: "preserve-3d" }}>
            {active.map((v, i) => {
              const off = i - index;
              const ab = Math.abs(off);
              if (ab > 2) return null;
              return (
                <div
                  key={v.id}
                  onClick={() => (off === 0 ? openCard(v) : setIndex(i))}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 20,
                    width: CW,
                    height: CH,
                    marginLeft: -CW / 2,
                    cursor: "pointer",
                    zIndex: 10 - ab,
                    opacity: ab > 1 ? 0.5 : 1,
                    transform: `translateX(${off * 56}%) translateZ(${off === 0 ? 0 : -120}px) rotateY(${off * -20}deg) scale(${1 - ab * 0.08})`,
                    transition: "transform .42s cubic-bezier(.2,.8,.25,1), opacity .42s",
                  }}
                >
                  <VoucherCard v={v} dim={off !== 0} elevated={off === 0} />
                </div>
              );
            })}
            {active.length > 1 && (
              <>
                {index > 0 && <NavArrow left onClick={() => go(-1)} />}
                {index < active.length - 1 && <NavArrow left={false} onClick={() => go(1)} />}
              </>
            )}
          </div>
        )}

        {active.length > 0 && (
          <div style={{ padding: "18px 22px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 18 }}>
              {active[index]?.brand}
            </div>
            <div style={{ fontSize: 13, color: "var(--va-soft)", marginTop: 2 }}>
              Tap to view · {balanceText(active[index])}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
              {active.map((v, i) => (
                <span
                  key={v.id}
                  onClick={() => setIndex(i)}
                  style={{
                    width: i === index ? 22 : 7,
                    height: 7,
                    borderRadius: 999,
                    cursor: "pointer",
                    background: i === index ? "var(--va-accent)" : "var(--va-line)",
                    transition: "all .3s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB → existing upload flow */}
      {!current && !hiddenOpen && (
        <a
          href="/upload"
          aria-label="Add a voucher"
          style={{
            position: "absolute",
            right: 18,
            bottom: "calc(30px + env(safe-area-inset-bottom))",
            zIndex: 30,
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "var(--va-accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 26px -6px var(--va-accent), 0 3px 8px rgba(0,0,0,0.22)",
            textDecoration: "none",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </a>
      )}

      {/* Redeem (full-screen) */}
      {current && (
        <RedeemFull
          v={current}
          showLoyalty={showLoyalty}
          setShowLoyalty={setShowLoyalty}
          onClose={closeRedeem}
          onEdit={beginEdit}
          onHide={() => hideCard(current.id)}
          busy={busy}
        />
      )}

      {/* Amount editor (modal) */}
      {current && editing && (
        <AmountEditor
          v={current}
          draft={draft}
          setDraft={setDraft}
          bump={bump}
          onCancel={() => setEditing(false)}
          onSave={saveBalance}
          busy={busy}
        />
      )}

      {/* Hidden cards (full-screen) */}
      {hiddenOpen && (
        <HiddenView
          hidden={hidden}
          onClose={() => setHiddenOpen(false)}
          onRestore={restore}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 40,
            zIndex: 90,
            background: "var(--va-ink)",
            color: "var(--va-bg)",
            borderRadius: 14,
            padding: "13px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              onClick={toast.undo}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--va-accent2)",
                fontFamily: "var(--va-head)",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NavArrow({ left, onClick }: { left: boolean; onClick: () => void }) {
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

function RedeemFull({
  v,
  showLoyalty,
  setShowLoyalty,
  onClose,
  onEdit,
  onHide,
  busy,
}: {
  v: HydratedVoucher;
  showLoyalty: boolean;
  setShowLoyalty: (b: boolean) => void;
  onClose: () => void;
  onEdit: () => void;
  onHide: () => void;
  busy: boolean;
}) {
  const fam = familyOf(v.owner);
  const hasLoyalty = !!v.loyaltyScheme;
  const onLoyalty = hasLoyalty && showLoyalty;

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

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
          <Monogram letter={(v.brand ?? "?")[0]} color={v.color} size={48} radius={14} />
          <div>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 24, lineHeight: 1.05 }}>
              {v.brand}
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.16em", opacity: 0.85, marginTop: 3 }}>
              {onLoyalty ? (v.loyaltyScheme ?? "").toUpperCase() : "GIFT CARD"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8 }}>
            {onLoyalty ? "Points" : "Balance"}
          </div>
          <div
            style={{
              fontFamily: "var(--va-head)",
              fontWeight: 800,
              fontSize: 46,
              lineHeight: 1,
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {onLoyalty ? "—" : balanceText(v)}
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
            {(["Gift card", v.loyaltyScheme ?? "Loyalty"] as const).map((label, i) => {
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
          Scan at checkout
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
          {v.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={v.url}
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
          Hide card
        </button>
      </div>
    </div>
  );
}

function AmountEditor({
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

function HiddenView({
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
