"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAccount } from "wagmi"

// Protected routes that require wallet connection
const PROTECTED_ROUTES = [
  "/tournaments",
  "/create",
  "/profile",
]

// Check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected, isConnecting } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isConnecting) return

    const isProtected = isProtectedRoute(pathname)
    
    // If trying to access protected route without connection, redirect to home
    if (isProtected && !isConnected) {
      router.push("/")
    }
    
    // If connected and on landing page, redirect to tournaments
    if (isConnected && pathname === "/") {
      router.push("/tournaments")
    }
  }, [mounted, isConnected, isConnecting, pathname, router])

  // Show loading state while checking connection (only briefly)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0f13]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-[#93a6ad]">Loading...</p>
        </div>
      </div>
    )
  }

  // Block protected routes if not connected
  if (isProtectedRoute(pathname) && !isConnected) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}

