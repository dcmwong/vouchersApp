"use client";

import { useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react";

interface UploadedImage {
  id: string;
  title: string | null;
  brand: string | null;
  value: string | null;
  refId: string | null;
  tags: string[];
  filename: string;
  sizeBytes: number;
}

interface UploadResult {
  image: UploadedImage;
  warning?: string;
}

const card: CSSProperties = {
  background: "var(--va-surface)",
  borderRadius: 18,
  padding: 22,
  maxWidth: "32rem",
  width: "100%",
  boxShadow: "0 1px 3px rgba(40,25,15,0.12), 0 0 0 1px var(--va-line)",
};

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/images", { method: "POST", body: fd });
      const data = (await res.json()) as UploadResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed (HTTP ${res.status})`);
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const rows: [string, string | null][] = result
    ? [
        ["Name", result.image.title],
        ["Brand", result.image.brand],
        ["Value", result.image.value],
        ["Ref ID", result.image.refId],
        ["Tags", result.image.tags?.join(", ") || null],
      ]
    : [];

  return (
    <form onSubmit={submit} style={{ ...card, display: "grid", gap: 16 }}>
      {/* Drop / pick zone */}
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          minHeight: 200,
          padding: 16,
          borderRadius: 14,
          border: "2px dashed var(--va-line)",
          background: "var(--va-chip)",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <input type="file" accept="image/*" onChange={pick} style={{ display: "none" }} />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 10, display: "block" }}
          />
        ) : (
          <>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--va-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 1px var(--va-line)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V5m0 0L8 9m4-4 4 4"
                  stroke="var(--va-accent)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 17v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"
                  stroke="var(--va-soft)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ fontFamily: "var(--va-head)", fontWeight: 800, fontSize: 16 }}>
              Choose an image
            </div>
            <div style={{ fontSize: 13, color: "var(--va-soft)" }}>
              Gift card or voucher · JPG, PNG, up to 5MB
            </div>
          </>
        )}
      </label>

      {file && (
        <div style={{ fontSize: 13, color: "var(--va-soft)", textAlign: "center" }}>
          {file.name}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || busy}
        style={{
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background: !file || busy ? "var(--va-line)" : "var(--va-accent)",
          color: "#fff",
          fontFamily: "var(--va-head)",
          fontWeight: 800,
          fontSize: 16,
          cursor: !file || busy ? "default" : "pointer",
          transition: "background .2s",
        }}
      >
        {busy ? "Categorising…" : "Upload & categorise"}
      </button>

      {error && (
        <p style={{ color: "#b91c1c", margin: 0, fontWeight: 600, fontSize: 14 }}>⚠ {error}</p>
      )}

      {result && (
        <div
          style={{
            display: "grid",
            gap: 10,
            background: "var(--va-chip)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <strong
            style={{
              color: "var(--va-accent2)",
              fontFamily: "var(--va-head)",
              fontWeight: 800,
            }}
          >
            Saved ✓
          </strong>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {rows.map(([label, val]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "0.3rem 0.75rem 0.3rem 0",
                      color: "var(--va-soft)",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ padding: "0.3rem 0", fontSize: 14, fontWeight: 600 }}>
                    {val ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.warning && (
            <p style={{ color: "#b45309", margin: 0, fontSize: 13 }}>{result.warning}</p>
          )}
          <a
            href="/"
            style={{
              marginTop: 4,
              textAlign: "center",
              padding: "12px",
              borderRadius: 14,
              border: "1.5px solid var(--va-line)",
              background: "var(--va-surface)",
              color: "var(--va-ink)",
              fontFamily: "var(--va-head)",
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            View in wallet
          </a>
        </div>
      )}
    </form>
  );
}
