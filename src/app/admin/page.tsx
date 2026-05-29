import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AdminList } from "./admin-list";

export const runtime = "edge";

export default function AdminPage() {
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
          <Link href="/vouchers">Vouchers</Link>
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
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Admin · all images</h1>
        <p style={{ color: "#6b7280", margin: 0, textAlign: "center", maxWidth: "32rem" }}>
          Flag a card as a loyalty card to pin it to the top of its brand on the
          vouchers page. Inactive vouchers are shown here too.
        </p>
        <AdminList />
      </section>
    </main>
  );
}
