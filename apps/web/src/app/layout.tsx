import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ludimint',
  description: 'Ludimint is a mobile-first, fully decentralised micro-tournament platform where users compete in short, skill-based challenges and earn small stablecoin rewards via MiniPay on the Celo network. Spectators can optionally create tiny side-pools to support or back challengers, creating social engagement without promoting gambling. The app emphasises trustless prize distribution, minimal friction for onboarding, and a strong mobile UX that runs as a Progressive Web App or React Native app that integrates with MiniPay deeplinks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <WalletProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
