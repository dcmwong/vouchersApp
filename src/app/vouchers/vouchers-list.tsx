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

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/images");
      const data = (await res.json()) as { images?: Voucher[]; error?: string };
      if (!res.ok) setError(data.error ?? "Failed to load vouchers");
      else setItems(data.images ?? []);
      setLoading(false);
    })();
  }, []);

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
          <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: 700 }}>{v.value ?? ""}</div>
            {v.groupId && (
              <div style={{ color: "#047857", fontSize: "0.75rem" }}>shared</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
