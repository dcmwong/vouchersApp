export const runtime = "edge";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", margin: 0 }}>404 — Not found</h1>
      <p style={{ color: "#6b7280" }}>
        This page doesn&apos;t exist. <a href="/">Go home</a>.
      </p>
    </div>
  );
}
