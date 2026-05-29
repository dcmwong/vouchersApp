import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { VouchersList } from "./vouchers-list";

export const runtime = "edge";

export default function VouchersPage() {
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
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/upload">Upload</Link>
          <Link href="/groups">Groups</Link>
          <UserButton afterSignOutUrl="/" />
        </nav>
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
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Your vouchers</h1>
        <p style={{ color: "#6b7280", margin: 0, textAlign: "center", maxWidth: "32rem" }}>
          Your own vouchers plus any shared with your groups.
        </p>
        <VouchersList />
      </section>
    </main>
  );
}
