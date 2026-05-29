"use client";

import { useEffect, useState } from "react";

interface Voucher {
  id: string;
  title: string | null;
  brand: string | null;
  value: string | null;
  refId: string | null;
  tags: string[];
  groupId: string | null;
  createdAt: string;
}

export function VouchersList() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/images");
      const data = (await res.json()) as { images?: Voucher[]; error?: string };
      if (!res.ok) setError(data.error ?? "Failed to load vouchers");
      else setItems(data.images ?? []);
      setLoading(false);
    })();
  }, []);

  async function deactivate(v: Voucher) {
    const label = v.title ?? "this voucher";
    if (
      !window.confirm(
        `Mark "${label}" as inactive? It will no longer appear in this list.`,
      )
    ) {
      return;
    }
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/images/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
      }
      setItems((prev) => prev.filter((x) => x.id !== v.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p style={{ color: "#6b7280" }}>Loading…</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>⚠ {error}</p>;
  if (items.length === 0)
    return <p style={{ color: "#6b7280" }}>No vouchers yet.</p>;

  return (
    <div style={{ display: "grid", gap: "0.75rem", width: "100%", maxWidth: "40rem" }}>
      {items.map((v) => (
        <div
          key={v.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "0.9rem 1.1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{v.title ?? "Untitled"}</div>
            <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              {[v.brand, v.refId ? `Ref ${v.refId}` : null, (v.tags ?? []).join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <div style={{ textAlign: "right", whiteSpace: "nowrap", display: "grid", gap: "0.35rem", justifyItems: "end" }}>
            <div style={{ fontWeight: 700 }}>{v.value ?? ""}</div>
            {v.groupId && (
              <div style={{ color: "#047857", fontSize: "0.75rem" }}>shared</div>
            )}
            <button
              onClick={() => deactivate(v)}
              disabled={busyId === v.id}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                background: "transparent",
                color: "#b91c1c",
                cursor: busyId === v.id ? "default" : "pointer",
                fontSize: "0.8rem",
              }}
            >
              {busyId === v.id ? "…" : "Mark inactive"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
