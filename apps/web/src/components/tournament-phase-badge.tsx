"use client"

import { Badge } from "@/components/ui/badge"
import { TournamentPhase, getPhaseLabel } from "@/lib/tournament-states"
import { cn } from "@/lib/utils"

interface TournamentPhaseBadgeProps {
  phase: TournamentPhase
  className?: string
}

export function TournamentPhaseBadge({ phase, className }: TournamentPhaseBadgeProps) {
  const variantMap = {
    [TournamentPhase.OPEN]: "default" as const,
    [TournamentPhase.COMMIT]: "warning" as const,
    [TournamentPhase.REVEAL]: "warning" as const,
    [TournamentPhase.FINALIZED]: "success" as const,
  }

  return (
    <Badge
      variant={variantMap[phase]}
      className={cn("capitalize", className)}
    >
      {getPhaseLabel(phase)}
    </Badge>
  )
}

