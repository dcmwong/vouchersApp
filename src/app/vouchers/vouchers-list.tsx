"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Voucher {
  id: string;
  title: string | null;
  brand: string | null;
  value: string | null;
  refId: string | null;
  tags: string[];
  groupId: string | null;
  isLoyalty: boolean;
  url: string | null;
  createdAt: string;
}

export function VouchersList() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/images");
      const data = (await res.json()) as { images?: Voucher[]; error?: string };
      if (!res.ok) setError(data.error ?? "Failed to load vouchers");
      else setItems(data.images ?? []);
      setLoading(false);
    })();
  }, []);

  const deactivate = useCallback(async (v: Voucher) => {
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
  }, []);

  if (loading) return <p style={{ color: "#6b7280" }}>Loading…</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>⚠ {error}</p>;
  if (items.length === 0)
    return <p style={{ color: "#6b7280" }}>No vouchers yet.</p>;

  const brands = [...new Set(items.map((v) => v.brand ?? "Uncategorised"))].sort(
    (a, b) => a.localeCompare(b),
  );

  // Filter by brand, then order: loyalty first, then by brand, then most recent.
  const ordered = items
    .filter((v) => !brandFilter || (v.brand ?? "Uncategorised") === brandFilter)
    .sort(
      (a, b) =>
        Number(b.isLoyalty) - Number(a.isLoyalty) ||
        (a.brand ?? "Uncategorised").localeCompare(b.brand ?? "Uncategorised") ||
        b.createdAt.localeCompare(a.createdAt),
    );

  return (
    <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "32rem" }}>
      <select
        value={brandFilter}
        onChange={(e) => setBrandFilter(e.target.value)}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #d1d5db",
          alignSelf: "start",
        }}
      >
        <option value="">All brands</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <Carousel vouchers={ordered} busyId={busyId} onDeactivate={deactivate} />
    </div>
  );
}

function Carousel({
  vouchers,
  busyId,
  onDeactivate,
}: {
  vouchers: Voucher[];
  busyId: string | null;
  onDeactivate: (v: Voucher) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(vouchers.length);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCount(emblaApi.scrollSnapList().length);
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  // Reset to the first slide whenever the (filtered) set changes.
  useEffect(() => {
    emblaApi?.scrollTo(0);
  }, [emblaApi, vouchers]);

  if (vouchers.length === 0)
    return <p style={{ color: "#6b7280" }}>No vouchers for this brand.</p>;

  const btn = (enabled: boolean): CSSProperties => ({
    padding: "0.4rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    background: "transparent",
    cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.4,
  });

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {vouchers.map((v) => (
            <div
              key={v.id}
              style={{ flex: "0 0 100%", minWidth: 0, paddingRight: "0.5rem" }}
            >
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                {v.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.url}
                    alt={v.title ?? "voucher"}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: 300,
                      objectFit: "contain",
                      background: "#f9fafb",
                      display: "block",
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 300, background: "#f3f4f6" }} />
                )}
                <div
                  style={{
                    padding: "0.9rem 1.1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>
                      {v.isLoyalty && <span title="Loyalty card">★ </span>}
                      {v.title ?? "Untitled"}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      {[
                        v.brand,
                        v.refId ? `Ref ${v.refId}` : null,
                        v.groupId ? "shared" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "grid", gap: "0.35rem", justifyItems: "end" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{v.value ?? ""}</div>
                    <button
                      onClick={() => onDeactivate(v)}
                      disabled={busyId === v.id}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "0.375rem",
                        border: "1px solid #d1d5db",
                        background: "transparent",
                        color: "#b91c1c",
                        cursor: busyId === v.id ? "default" : "pointer",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {busyId === v.id ? "…" : "Mark inactive"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={selected === 0}
          style={btn(selected > 0)}
        >
          ‹ Prev
        </button>
        <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          {selected + 1} / {count} · swipe
        </span>
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={selected >= count - 1}
          style={btn(selected < count - 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
