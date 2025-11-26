"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface BadgeDisplayProps {
  badgeType: "champion" | "winner" | "participant"
  tournamentName?: string
  className?: string
}

export function BadgeDisplay({
  badgeType,
  tournamentName,
  className,
}: BadgeDisplayProps) {
  const badgeConfig = {
    champion: {
      icon: Trophy,
      label: "Champion",
      color: "text-primary-600",
      bgColor: "bg-primary-600/10",
      borderColor: "border-primary-600/30",
    },
    winner: {
      icon: Award,
      label: "Winner",
      color: "text-accent-500",
      bgColor: "bg-accent-500/10",
      borderColor: "border-accent-500/30",
    },
    participant: {
      icon: Star,
      label: "Participant",
      color: "text-muted",
      bgColor: "bg-bg-800",
      borderColor: "border-white/10",
    },
  }

  const config = badgeConfig[badgeType]
  const Icon = config.icon

  return (
    <Card className={cn("border-2", config.borderColor, className)}>
      <CardContent className="p-6 text-center">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
          config.bgColor
        )}>
          <Icon className={cn("w-10 h-10", config.color)} />
        </div>
        <Badge variant={badgeType === "champion" ? "default" : "outline"} className="mb-2">
          {config.label}
        </Badge>
        {tournamentName && (
          <p className="text-sm text-fg-80 mt-2">{tournamentName}</p>
        )}
      </CardContent>
    </Card>
  )
}

