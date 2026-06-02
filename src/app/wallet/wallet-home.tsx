"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CH, CW, FALLBACK_COLOR, THEME } from "./theme";
import type { Brand, HydratedVoucher, Voucher } from "./types";
import { balanceText, symbolOf } from "./utils";
import { AccountMenu } from "./components/AccountMenu";
import { AmountEditor } from "./components/AmountEditor";
import { HiddenView } from "./components/HiddenView";
import { NavArrow } from "./components/NavArrow";
import { RedeemFull } from "./components/RedeemFull";
import { VoucherCard } from "./components/VoucherCard";

export function WalletHome() {
  const { user } = useUser();
  const [vouchers, setVouchers] = useState<HydratedVoucher[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const drag = useRef<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadWallet = useCallback(async () => {
    setError(null);
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
    }
  }, []);

  useEffect(() => {
    loadWallet().finally(() => setLoading(false));
  }, [loadWallet]);

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadWallet();
    } finally {
      setRefreshing(false);
    }
  };

  const active = vouchers.filter((v) => v.active);
  const hidden = vouchers.filter((v) => !v.active);

  // Distinct brands among the active cards, for the filter pills.
  const brandPills: { id: string; name: string; color: string }[] = [];
  const seenBrand = new Set<string>();
  for (const v of active) {
    if (!seenBrand.has(v.brandId)) {
      seenBrand.add(v.brandId);
      brandPills.push({ id: v.brandId, name: v.brand ?? "Untitled", color: v.color });
    }
  }

  // The cards shown in the carousel, narrowed to the selected brand pill and
  // ordered so loyalty cards always come first (stable sort preserves the rest).
  const visible = (
    brandFilter === "all" ? active : active.filter((v) => v.brandId === brandFilter)
  )
    .slice()
    .sort((a, b) => Number(b.isLoyalty) - Number(a.isLoyalty));

  // A render-safe index: state can briefly lag behind a shrinking list (e.g.
  // right after switching brand filters), so clamp before indexing `visible`.
  const idx = visible.length ? Math.min(index, visible.length - 1) : 0;

  // Reset to the first card whenever the brand filter changes.
  useEffect(() => {
    setIndex(0);
  }, [brandFilter]);

  // If the filtered brand no longer has any active cards, fall back to "All".
  useEffect(() => {
    if (brandFilter !== "all" && !active.some((v) => v.brandId === brandFilter)) {
      setBrandFilter("all");
    }
  }, [brandFilter, active]);

  // Clamp the index when the visible list shrinks.
  useEffect(() => {
    if (index > visible.length - 1) setIndex(Math.max(0, visible.length - 1));
  }, [visible.length, index]);

  const go = (dir: number) =>
    setIndex((i) => Math.max(0, Math.min(visible.length - 1, i + dir)));

  const current = vouchers.find((v) => v.id === openId) ?? null;
  // The brand's single loyalty card (isLoyalty). Its image is shown in the
  // redeem view when the "Loyalty" tab is selected.
  const loyaltyCard = current
    ? active.find((x) => x.brandId === current.brandId && x.isLoyalty)
    : undefined;

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
  // Open the card at a given carousel position, keeping the carousel index in
  // sync so the right card is centred when the full-screen view is closed.
  const openAt = (i: number) => {
    const v = visible[i];
    if (!v) return;
    setIndex(i);
    setOpenId(v.id);
    setShowLoyalty(false);
    setEditing(false);
  };
  const openPrev = () => {
    if (idx > 0) openAt(idx - 1);
  };
  const openNext = () => {
    if (idx < visible.length - 1) openAt(idx + 1);
  };
  const closeRedeem = () => {
    setOpenId(null);
    setEditing(false);
    setShowLoyalty(false);
  };

  const beginEdit = () => {
    if (!current) return;
    setDraft("");
    setEditing(true);
  };

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
      setIndex((i) => Math.max(0, Math.min(i, visible.length - 2)));
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
      <style>{`@keyframes va-spin { to { transform: rotate(360deg); } }`}</style>
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
              aria-label="Refresh wallet"
              onClick={refresh}
              disabled={refreshing}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1.5px solid var(--va-line)",
                background: "var(--va-surface)",
                color: "var(--va-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: refreshing ? "default" : "pointer",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transformOrigin: "center",
                  animation: refreshing ? "va-spin 0.8s linear infinite" : "none",
                }}
              >
                <path
                  d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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
            <button
              aria-label="Account menu"
              onClick={() => setAccountOpen(true)}
              style={{
                width: 42,
                height: 42,
                padding: 0,
                borderRadius: "50%",
                border: "2px solid var(--va-surface)",
                overflow: "hidden",
                background: "#e7e4de",
                boxShadow: "0 1px 4px rgba(0,0,0,0.14), 0 0 0 1px var(--va-line)",
                cursor: "pointer",
              }}
            >
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "Account"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <svg width="42" height="42" viewBox="0 0 42 42" style={{ display: "block" }}>
                  <rect width="42" height="42" fill="#eceae4" />
                  <circle cx="21" cy="16.5" r="7.4" fill="#a9aeb3" />
                  <path d="M7.5 40c0.7-8.2 6.6-12.6 13.5-12.6S33.8 31.8 34.5 40z" fill="#a9aeb3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--va-soft)", marginTop: 12, fontWeight: 500 }}>
          {active.length} card{active.length !== 1 ? "s" : ""} · shared with the family
        </div>
      </div>

      {/* Brand filter pills */}
      {brandPills.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            padding: "14px 20px 6px",
            flexShrink: 0,
          }}
        >
          {[{ id: "all", name: "All", color: "var(--va-soft)" }, ...brandPills].map((b) => {
            const selected = brandFilter === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBrandFilter(b.id)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--va-head)",
                  fontWeight: 800,
                  fontSize: 16,
                  background: selected ? "var(--va-accent)" : "var(--va-surface)",
                  color: selected ? "#fff" : "var(--va-ink)",
                  boxShadow: selected
                    ? "0 1px 3px rgba(40,25,15,0.12)"
                    : "0 1px 3px rgba(40,25,15,0.12), 0 0 0 1px var(--va-line)",
                  transition: "background .2s, color .2s, box-shadow .2s",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: selected ? "rgba(255,255,255,0.95)" : b.color,
                    flexShrink: 0,
                  }}
                />
                {b.name}
              </button>
            );
          })}
        </div>
      )}

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
            {visible.map((v, i) => {
              const off = i - idx;
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
            {visible.length > 1 && (
              <>
                {idx > 0 && <NavArrow left onClick={() => go(-1)} />}
                {idx < visible.length - 1 && <NavArrow left={false} onClick={() => go(1)} />}
              </>
            )}
          </div>
        )}

        {visible.length > 0 && (
          <div style={{ padding: "18px 22px 0", marginTop: '50px', textAlign: "center" }}>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 18 }}>
              {visible[idx]?.brand}
            </div>
            <div style={{ fontSize: 13, color: "var(--va-soft)", marginTop: 2 }}>
              Tap to view · {balanceText(visible[idx])}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
              {visible.map((v, i) => (
                <span
                  key={v.id}
                  onClick={() => setIndex(i)}
                  style={{
                    width: i === idx ? 22 : 7,
                    height: 7,
                    borderRadius: 999,
                    cursor: "pointer",
                    background: i === idx ? "var(--va-accent)" : "var(--va-line)",
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
          loyaltyUrl={loyaltyCard?.url ?? null}
          showLoyalty={showLoyalty}
          setShowLoyalty={setShowLoyalty}
          onClose={closeRedeem}
          onEdit={beginEdit}
          onHide={() => hideCard(current.id)}
          onPrev={idx > 0 ? openPrev : undefined}
          onNext={idx < visible.length - 1 ? openNext : undefined}
          busy={busy}
        />
      )}

      {/* Amount editor (modal) */}
      {current && editing && (
        <AmountEditor
          v={current}
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setEditing(false)}
          onSave={saveBalance}
          busy={busy}
        />
      )}

      {/* Account menu (popover under the profile avatar) */}
      {accountOpen && (
        <AccountMenu
          hiddenCount={hidden.length}
          onHidden={() => {
            setAccountOpen(false);
            setHiddenOpen(true);
          }}
          onClose={() => setAccountOpen(false)}
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
