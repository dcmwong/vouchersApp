import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <SignIn />
    </div>
  );
}
