"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ConnectButton } from "@/components/connect-button"
import { LogoText } from "@/components/logo-text"
import { BalanceDisplay } from "@/components/balance-display"

// Landing page navigation (shown when not connected)
const landingNavLinks = [
  { name: "Home", href: "/" },
]

// App navigation (shown when connected)
const appNavLinks = [
  { name: "Tournaments", href: "/tournaments" },
  { name: "Create", href: "/create" },
  { name: "Profile", href: "/profile" },
]

export function Navbar() {
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which navigation to show
  // Show app navigation when connected, landing nav when not connected
  const navLinks = (mounted && isConnected) ? appNavLinks : landingNavLinks

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-bg-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg-900/80">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-2 mb-8">
                <LogoText size="sm" />
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-base font-medium transition-colors ${
                      pathname === link.href 
                        ? "text-primary-600 font-semibold" 
                        : "text-fg-80 hover:text-primary-500"
                    }`}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t">
                  <ConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <LogoText size="md" />
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-primary-600 font-semibold"
                  : "text-fg-80 hover:text-primary-500"
              }`}
            >
              {link.name}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            {mounted && isConnected && (
              <BalanceDisplay compact className="hidden md:flex" />
            )}
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}
