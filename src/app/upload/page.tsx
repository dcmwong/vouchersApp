import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Uploader } from "./uploader";

export const runtime = "edge";

export default function UploadPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>
          Vouchers
        </Link>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          padding: "2rem 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Upload a voucher</h1>
        <p style={{ color: "#6b7280", margin: 0, textAlign: "center", maxWidth: "32rem" }}>
          Pick an image of a gift card or voucher. It&apos;s read and catalogued
          automatically — card numbers and PINs are never stored.
        </p>
        <Uploader />
      </section>
    </main>
  );
}
