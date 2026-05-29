import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const runtime = "edge";

export default function HomePage() {
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
        <strong style={{ fontSize: "1.125rem" }}>Vouchers</strong>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Welcome to Vouchers</h1>
        <SignedOut>
          <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
            Sign up or sign in to upload and auto-categorise your images.
          </p>
        </SignedOut>
        <SignedIn>
          <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
            You&apos;re signed in. Upload a voucher to catalogue it automatically.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="/upload"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                background: "#111827",
                color: "white",
                textDecoration: "none",
              }}
            >
              Upload a voucher
            </a>
            <a
              href="/vouchers"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              My vouchers
            </a>
            <a
              href="/groups"
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Groups
            </a>
          </div>
        </SignedIn>
      </section>
    </main>
  );
}
