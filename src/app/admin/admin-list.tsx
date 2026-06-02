"use client";

import { useEffect, useState } from "react";

interface AdminVoucher {
  id: string;
  title: string | null;
  brand: string | null;
  brandId: string;
  value: string | null;
  active: boolean;
  isLoyalty: boolean;
  url: string | null;
}

interface Brand {
  id: string;
  name: string;
}

export function AdminList() {
  const [items, setItems] = useState<AdminVoucher[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [imgRes, brandRes] = await Promise.all([
        fetch("/api/images?all=1"),
        fetch("/api/brands"),
      ]);
      const data = (await imgRes.json()) as {
        images?: AdminVoucher[];
        error?: string;
      };
      if (!imgRes.ok) setError(data.error ?? "Failed to load");
      else setItems(data.images ?? []);
      if (brandRes.ok) {
        const bd = (await brandRes.json()) as { brands?: Brand[] };
        setBrands(bd.brands ?? []);
      }
      setLoading(false);
    })();
  }, []);

  async function changeBrand(v: AdminVoucher, brandId: string) {
    if (brandId === v.brandId) return;
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/images/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      const data = (await res.json()) as {
        image?: { brandId: string; brand: string | null };
        error?: string;
      };
      if (!res.ok || !data.image) {
        throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
      }
      setItems((prev) =>
        prev.map((x) =>
          x.id === v.id
            ? { ...x, brandId: data.image!.brandId, brand: data.image!.brand }
            : x,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleLoyalty(v: AdminVoucher) {
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/images/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLoyalty: !v.isLoyalty }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
      setItems((prev) =>
        prev.map((x) => (x.id === v.id ? { ...x, isLoyalty: !x.isLoyalty } : x)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading)
    return <p style={{ color: "var(--va-soft)", textAlign: "center" }}>Loading…</p>;
  if (error)
    return <p style={{ color: "#b91c1c", fontWeight: 600, textAlign: "center" }}>⚠ {error}</p>;
  if (items.length === 0)
    return <p style={{ color: "var(--va-soft)", textAlign: "center" }}>No images yet.</p>;

  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: "32rem" }}>
      {items.map((v) => (
        <div
          key={v.id}
          style={{
            background: "var(--va-surface)",
            borderRadius: 18,
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 1px 3px rgba(40,25,15,0.12), 0 0 0 1px var(--va-line)",
            opacity: v.active ? 1 : 0.55,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
            {v.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.url}
                alt={v.title ?? "voucher"}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 12,
                  flexShrink: 0,
                  background: "var(--va-chip)",
                  boxShadow: "0 0 0 1px var(--va-line)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: "var(--va-chip)",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 15 }}>
                {v.title ?? "Untitled"}
                {!v.active && (
                  <span style={{ color: "var(--va-soft)", fontWeight: 600 }}> · inactive</span>
                )}
              </div>
              <div style={{ color: "var(--va-soft)", fontSize: 13, marginTop: 1 }}>
                {[v.brand, v.value].filter(Boolean).join(" · ")}
              </div>
              <select
                value={v.brandId}
                onChange={(e) => changeBrand(v, e.target.value)}
                disabled={busyId === v.id || brands.length === 0}
                style={{
                  marginTop: 8,
                  padding: "7px 10px",
                  borderRadius: 999,
                  border: "1.5px solid var(--va-line)",
                  background: "var(--va-chip)",
                  color: "var(--va-ink)",
                  fontFamily: "var(--va-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  maxWidth: "12rem",
                  cursor: busyId === v.id ? "default" : "pointer",
                }}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => toggleLoyalty(v)}
            disabled={busyId === v.id}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: v.isLoyalty ? "none" : "1.5px solid var(--va-line)",
              background: v.isLoyalty ? "var(--va-accent2)" : "var(--va-surface)",
              color: v.isLoyalty ? "#fff" : "var(--va-ink)",
              fontFamily: "var(--va-head)",
              fontWeight: 800,
              cursor: busyId === v.id ? "default" : "pointer",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            {busyId === v.id
              ? "…"
              : v.isLoyalty
                ? "★ Loyalty card"
                : "Flag as loyalty"}
          </button>
        </div>
      ))}
    </div>
  );
}
