import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { WalletHome } from "./wallet/wallet-home";

export const runtime = "edge";

export default function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <SignedIn>
        <WalletHome />
      </SignedIn>

      <SignedOut>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "2rem", margin: 0 }}>Family Wallet</h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem", margin: 0 }}>
            Sign in to view and manage your family&apos;s gift cards.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <SignInButton mode="modal">
              <button
                style={{
                  padding: "0.6rem 1.25rem",
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
                  padding: "0.6rem 1.25rem",
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
          </div>
        </main>
      </SignedOut>
    </>
  );
}
