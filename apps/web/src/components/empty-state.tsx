"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-[#00bfb6]/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#00bfb6]" />
      </div>
      <h3 className="text-xl font-bold text-[#e6f0f6] mb-2 text-center">{title}</h3>
      <p className="text-[#93a6ad] text-center mb-6 max-w-sm">{description}</p>
      {actionLabel && actionHref && <Button href={actionHref}>{actionLabel}</Button>}
    </div>
  )
}
