import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import { RouteGuard } from "@/components/route-guard";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LUDIMINT - Micro Tournaments on Celo",
  description:
    "LUDIMINT is a mobile-first, fully decentralised micro-tournament platform where users compete in short, skill-based challenges and earn small stablecoin rewards via MiniPay on the Celo network. Spectators can optionally create tiny side-pools to support or back challengers, creating social engagement without promoting gambling. The app emphasises trustless prize distribution, minimal friction for onboarding, and a strong mobile UX that runs as a Progressive Web App or React Native app that integrates with MiniPay deeplinks.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LUDIMINT - Micro Tournaments on Celo",
    description: "Play skill-based micro-tournaments with trustless payouts",
    type: "website",
    locale: "en_US",
  },
  generator: "v0.app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0b0f13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={inter.className}>
        <WalletProvider>
          <RouteGuard>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </RouteGuard>
        </WalletProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
