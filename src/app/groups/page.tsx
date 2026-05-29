import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { GroupsManager } from "./groups-manager";

export const runtime = "edge";

export default function GroupsPage() {
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
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Groups</h1>
        <p style={{ color: "#6b7280", margin: 0, textAlign: "center", maxWidth: "32rem" }}>
          Vouchers you upload are shared with your group. Share a group&apos;s
          code with family so they can join and see the same vouchers.
        </p>
        <GroupsManager />
      </section>
    </main>
  );
}
