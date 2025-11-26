"use client"

import { useTokenBalance } from "@/hooks/use-balance"
import { Coins, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface BalanceDisplayProps {
  tokenAddress?: `0x${string}`
  showIcon?: boolean
  className?: string
  compact?: boolean
}

export function BalanceDisplay({
  tokenAddress,
  showIcon = true,
  className,
  compact = false,
}: BalanceDisplayProps) {
  const { balance, formatted, isLoading, hasBalance } = useTokenBalance(tokenAddress)

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showIcon && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
        <Skeleton className="h-4 w-16" />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <Coins className={cn(
          "w-4 h-4",
          hasBalance ? "text-primary-600" : "text-muted"
        )} />
      )}
      <span className={cn(
        "text-sm font-medium",
        hasBalance ? "text-fg-100" : "text-muted"
      )}>
        {compact ? formatted : `${formatted} cUSD`}
      </span>
    </div>
  )
}

