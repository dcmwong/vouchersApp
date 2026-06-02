import Link from "next/link";
import { THEME } from "../wallet/theme";
import { Uploader } from "./uploader";

export const runtime = "edge";

export default function UploadPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <main
        style={{
          ...THEME,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--va-bg)",
          color: "var(--va-ink)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 20px 4px", flexShrink: 0 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              border: "1.5px solid var(--va-line)",
              background: "var(--va-surface)",
              color: "var(--va-ink)",
              borderRadius: 999,
              padding: "8px 16px 8px 12px",
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "var(--va-head)",
              textDecoration: "none",
            }}
          >
            ‹ Wallet
          </Link>
        </div>

        {/* Title */}
        <div style={{ padding: "16px 22px 8px" }}>
          <h1
            style={{
              fontFamily: "var(--va-head)",
              fontWeight: 800,
              fontSize: 26,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Add a voucher
          </h1>
          <p style={{ color: "var(--va-soft)", margin: "8px 0 0", fontSize: 14, maxWidth: "32rem" }}>
            Pick an image of a gift card or voucher. It&apos;s read and catalogued
            automatically — card numbers and PINs are never stored.
          </p>
        </div>

        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px 40px",
          }}
        >
          <Uploader />
        </section>
      </main>
    </>
  );
}
