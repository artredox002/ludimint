"use client"

import type React from "react"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "icon"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  href?: string
  asChild?: boolean
  children: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  href,
  asChild = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : href ? Link : "button"
  const baseStyles =
    "font-semibold rounded-md transition-all duration-120 focus-visible:ring-3 focus-visible:ring-[#00bfb6] focus-visible:outline-offset-2 disabled:opacity-48 disabled:pointer-events-none min-h-11 min-w-11 flex items-center justify-center gap-2"

  const variants = {
    primary: "bg-[#00bfb6] text-[#0b0f13] hover:bg-[#00d1c7] hover:-translate-y-0.5 active:translate-y-px",
    secondary:
      "bg-transparent border border-[#00bfb6] text-[#00bfb6] hover:bg-[#00bfb6]/10 hover:-translate-y-0.5 active:translate-y-px",
    ghost: "bg-transparent text-[#e6f0f6] hover:bg-white/5 active:bg-white/10",
    icon: "bg-transparent text-[#e6f0f6] hover:bg-white/5 p-2",
  }

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  const buttonClasses = cn(baseStyles, variants[variant], sizes[size], className)

  if (asChild) {
    return (
      <Comp className={buttonClasses} {...props}>
        {children}
      </Comp>
    )
  }

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </Link>
    )
  }

  return (
    <button disabled={disabled || isLoading} className={buttonClasses} {...props}>
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}
