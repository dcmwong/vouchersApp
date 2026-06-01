import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Family Wallet",
  description: "Your family's gift cards and loyalty cards in one wallet.",
  appleWebApp: {
    capable: true,
    title: "Family Wallet",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F1E7",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
