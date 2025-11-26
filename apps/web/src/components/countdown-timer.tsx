"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { formatTimeRemaining } from "@/lib/tournament-states"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  secondsRemaining: number
  className?: string
  showIcon?: boolean
  variant?: "default" | "warning" | "danger"
}

export function CountdownTimer({
  secondsRemaining,
  className,
  showIcon = true,
  variant = "default",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(secondsRemaining)

  useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const isUrgent = timeLeft < 300 // Less than 5 minutes
  const isCritical = timeLeft < 60 // Less than 1 minute

  const variantStyles = {
    default: "text-fg-100",
    warning: isUrgent ? "text-warning-500" : "text-fg-100",
    danger: isCritical ? "text-danger-500 animate-pulse" : isUrgent ? "text-warning-500" : "text-fg-100",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <Clock className={cn(
          "w-4 h-4",
          variantStyles[variant]
        )} />
      )}
      <span className={cn("text-sm font-medium", variantStyles[variant])}>
        {formatTimeRemaining(timeLeft)}
      </span>
    </div>
  )
}

