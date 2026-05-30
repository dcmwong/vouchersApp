import { WalletHome } from "./wallet-home";

export const runtime = "edge";

export default function WalletPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <WalletHome />
    </>
  );
}
