"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Voucher {
  id: string;
  title: string | null;
  brand: string | null;
  value: string | null;
  currentValue: string | null;
  valueUpdatedAt: string | null;
  refId: string | null;
  tags: string[];
  groupId: string | null;
  isLoyalty: boolean;
  brandId: string;
  url: string | null;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
}

const UNCATEGORISED_ID = "uncategorised";

/** Leading currency symbol of a value string ("£42.50" → "£"); defaults to "£". */
function symbolOf(s: string | null | undefined): string {
  const m = (s ?? "").match(/^[^\d.]+/);
  return m?.[0].trim() || "£";
}

/** Numeric portion of a value string ("£42.50" → "42.50"). */
function numericPart(s: string | null | undefined): string {
  return (s ?? "").replace(/[^\d.]/g, "");
}

/** "2 Jun 2026, 14:30" — friendly local rendering of an ISO timestamp. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VouchersList() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState("");
  const [brandOptions, setBrandOptions] = useState<Brand[]>([]);

  useEffect(() => {
    (async () => {
      const [imgRes, brandRes] = await Promise.all([
        fetch("/api/images"),
        fetch("/api/brands"),
      ]);
      const imgData = (await imgRes.json()) as {
        images?: Voucher[];
        error?: string;
      };
      if (!imgRes.ok) setError(imgData.error ?? "Failed to load vouchers");
      else setItems(imgData.images ?? []);

      if (brandRes.ok) {
        const brandData = (await brandRes.json()) as { brands?: Brand[] };
        setBrandOptions(brandData.brands ?? []);
      }
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

  const updateValue = useCallback(async (v: Voucher, newValue: string) => {
    const currentValue = newValue.trim();
    // Require an actual number, and skip if unchanged.
    if (!/\d/.test(currentValue) || currentValue === v.currentValue) return;
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/images/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue }),
      });
      const data = (await res.json()) as {
        image?: { currentValue: string | null; valueUpdatedAt: string | null };
        error?: string;
      };
      if (!res.ok || !data.image) {
        throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
      }
      const updated = data.image;
      setItems((prev) =>
        prev.map((x) =>
          x.id === v.id
            ? {
                ...x,
                currentValue: updated.currentValue,
                valueUpdatedAt: updated.valueUpdatedAt,
              }
            : x,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, []);

  const categorise = useCallback(async (v: Voucher, brandId: string) => {
    if (!brandId || brandId === v.brandId) return;
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/images/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      const data = (await res.json()) as {
        image?: { brand: string | null; brandId: string };
        error?: string;
      };
      if (!res.ok || !data.image) {
        throw new Error(data.error ?? `Failed (HTTP ${res.status})`);
      }
      const updated = data.image;
      setItems((prev) =>
        prev.map((x) =>
          x.id === v.id
            ? { ...x, brand: updated.brand, brandId: updated.brandId }
            : x,
        ),
      );
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

      <Carousel
        vouchers={ordered}
        brandOptions={brandOptions}
        busyId={busyId}
        onDeactivate={deactivate}
        onUpdateValue={updateValue}
        onCategorise={categorise}
      />
    </div>
  );
}

function Carousel({
  vouchers,
  brandOptions,
  busyId,
  onDeactivate,
  onUpdateValue,
  onCategorise,
}: {
  vouchers: Voucher[];
  brandOptions: Brand[];
  busyId: string | null;
  onDeactivate: (v: Voucher) => void;
  onUpdateValue: (v: Voucher, newValue: string) => void;
  onCategorise: (v: Voucher, brandId: string) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(vouchers.length);
  const [fullscreen, setFullscreen] = useState<Voucher | null>(null);
  // Per-voucher draft text for the balance editor.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  // Records pointer-down position so a swipe isn't mistaken for a tap.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

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
                    onPointerDown={(e) => {
                      pointerStart.current = { x: e.clientX, y: e.clientY };
                    }}
                    onClick={(e) => {
                      const s = pointerStart.current;
                      // Only treat as a tap if the pointer barely moved (not a swipe).
                      if (s && Math.abs(e.clientX - s.x) < 8 && Math.abs(e.clientY - s.y) < 8) {
                        setFullscreen(v);
                      }
                    }}
                    style={{
                      width: "100%",
                      height: 300,
                      objectFit: "contain",
                      background: "#f9fafb",
                      display: "block",
                      cursor: "zoom-in",
                    }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 300, background: "#f3f4f6" }} />
                )}
                <div style={{ padding: "0.9rem 1.1rem", display: "grid", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
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

                  {!v.isLoyalty && (
                  <div
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "0.6rem",
                      display: "grid",
                      gap: "0.3rem",
                    }}
                  >
                    <label style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      Balance{v.value ? ` (face value ${v.value})` : ""}
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #d1d5db",
                          borderRadius: "0.375rem",
                          paddingLeft: "0.6rem",
                        }}
                      >
                        <span style={{ color: "#6b7280", fontWeight: 700 }}>
                          {symbolOf(v.currentValue ?? v.value)}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={drafts[v.id] ?? numericPart(v.currentValue ?? v.value)}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [v.id]: e.target.value }))
                          }
                          placeholder="0.00"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "0.4rem 0.6rem",
                            border: "none",
                            outline: "none",
                            borderRadius: "0.375rem",
                            fontWeight: 700,
                            background: "transparent",
                          }}
                        />
                      </div>
                      <button
                        onClick={() =>
                          onUpdateValue(
                            v,
                            symbolOf(v.currentValue ?? v.value) +
                              (drafts[v.id] ?? numericPart(v.currentValue ?? v.value)),
                          )
                        }
                        disabled={busyId === v.id}
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "0.375rem",
                          border: "none",
                          background: "#111827",
                          color: "white",
                          cursor: busyId === v.id ? "default" : "pointer",
                        }}
                      >
                        {busyId === v.id ? "…" : "Save"}
                      </button>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
                      {v.valueUpdatedAt
                        ? `Updated ${formatDate(v.valueUpdatedAt)}`
                        : "Not updated yet"}
                    </div>
                  </div>
                  )}

                  {v.brandId === UNCATEGORISED_ID && (
                    <div
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "0.6rem",
                        display: "grid",
                        gap: "0.3rem",
                      }}
                    >
                      <label style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                        Categorise this voucher
                      </label>
                      <select
                        value=""
                        onChange={(e) => onCategorise(v, e.target.value)}
                        disabled={busyId === v.id}
                        style={{
                          padding: "0.5rem 0.6rem",
                          borderRadius: "0.375rem",
                          border: "1px solid #d1d5db",
                        }}
                      >
                        <option value="">Choose a brand…</option>
                        {brandOptions
                          .filter((b) => b.id !== UNCATEGORISED_ID)
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
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

      {fullscreen && (
        <div
          onClick={() => setFullscreen(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <button
            aria-label="Close"
            onClick={() => setFullscreen(null)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1.25rem",
              fontSize: "1.75rem",
              lineHeight: 1,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          {fullscreen.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fullscreen.url}
              alt={fullscreen.title ?? "voucher"}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
