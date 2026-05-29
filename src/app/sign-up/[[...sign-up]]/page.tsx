import { SignUp } from "@clerk/nextjs";

export const runtime = "edge";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <SignUp />
    </div>
  );
}
