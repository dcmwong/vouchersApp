"use client";

import { useEffect, useState } from "react";

interface AdminVoucher {
  id: string;
  title: string | null;
  brand: string | null;
  value: string | null;
  active: boolean;
  isLoyalty: boolean;
  url: string | null;
}

export function AdminList() {
  const [items, setItems] = useState<AdminVoucher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/images?all=1");
      const data = (await res.json()) as {
        images?: AdminVoucher[];
        error?: string;
      };
      if (!res.ok) setError(data.error ?? "Failed to load");
      else setItems(data.images ?? []);
      setLoading(false);
    })();
  }, []);

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

  if (loading) return <p style={{ color: "#6b7280" }}>Loading…</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>⚠ {error}</p>;
  if (items.length === 0)
    return <p style={{ color: "#6b7280" }}>No images yet.</p>;

  return (
    <div style={{ display: "grid", gap: "0.5rem", width: "100%", maxWidth: "44rem" }}>
      {items.map((v) => (
        <div
          key={v.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            opacity: v.active ? 1 : 0.55,
          }}
        >
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", minWidth: 0 }}>
            {v.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.url}
                alt={v.title ?? "voucher"}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "cover",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  flexShrink: 0,
                  background: "#f3f4f6",
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "0.5rem",
                  background: "#f3f4f6",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>
                {v.title ?? "Untitled"}
                {!v.active && (
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}> · inactive</span>
                )}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                {[v.brand, v.value].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleLoyalty(v)}
            disabled={busyId === v.id}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: "0.375rem",
              border: v.isLoyalty ? "none" : "1px solid #d1d5db",
              background: v.isLoyalty ? "#047857" : "transparent",
              color: v.isLoyalty ? "white" : "#111827",
              cursor: busyId === v.id ? "default" : "pointer",
              fontSize: "0.8rem",
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
