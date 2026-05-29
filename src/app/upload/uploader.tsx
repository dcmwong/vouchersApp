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
  border: "1px solid #e5e7eb",
  borderRadius: "0.75rem",
  padding: "1.25rem",
  maxWidth: "32rem",
  width: "100%",
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
    <form onSubmit={submit} style={{ ...card, display: "grid", gap: "1rem" }}>
      <input type="file" accept="image/*" onChange={pick} />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="preview"
          style={{ maxWidth: "100%", borderRadius: "0.5rem" }}
        />
      )}

      <button
        type="submit"
        disabled={!file || busy}
        style={{
          padding: "0.6rem 1rem",
          borderRadius: "0.5rem",
          border: "none",
          background: !file || busy ? "#9ca3af" : "#111827",
          color: "white",
          cursor: !file || busy ? "default" : "pointer",
        }}
      >
        {busy ? "Categorising…" : "Upload & categorise"}
      </button>

      {error && <p style={{ color: "#b91c1c", margin: 0 }}>⚠ {error}</p>}

      {result && (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <strong style={{ color: "#047857" }}>Saved ✓</strong>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {rows.map(([label, val]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "0.25rem 0.75rem 0.25rem 0",
                      color: "#6b7280",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </td>
                  <td style={{ padding: "0.25rem 0" }}>{val ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.warning && (
            <p style={{ color: "#b45309", margin: 0 }}>{result.warning}</p>
          )}
        </div>
      )}
    </form>
  );
}
