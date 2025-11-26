"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

interface LogoTextProps {
  className?: string
  showText?: boolean
  animated?: boolean
  size?: "sm" | "md" | "lg"
}

export function LogoText({ 
  className, 
  showText = true, 
  animated = true,
  size = "md" 
}: LogoTextProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-3 hover:opacity-90 transition-opacity group",
        className
      )}
    >
      <Logo animated={animated} size={size} />
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent",
          "group-hover:from-primary-500 group-hover:to-accent-600 transition-all duration-300",
          textSizes[size]
        )}>
          LUDIMINT
        </span>
      )}
    </Link>
  )
}

