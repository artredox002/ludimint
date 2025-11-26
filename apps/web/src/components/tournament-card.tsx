"use client"

import Link from "next/link"
import { Trophy, Users, Coins } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatEther } from "viem"

interface TournamentCardProps {
  address: `0x${string}`
  entryFee: bigint
  prizePool: bigint
  players: bigint
  maxPlayers: bigint
  phase: "OPEN" | "COMMIT" | "REVEAL" | "FINALIZED"
  className?: string
}

export function TournamentCard({
  address,
  entryFee,
  prizePool,
  players,
  maxPlayers,
  phase,
  className,
}: TournamentCardProps) {
  const isActive = phase === "OPEN" || phase === "COMMIT" || phase === "REVEAL"
  const isFull = players >= maxPlayers
  const entryFeeFormatted = parseFloat(formatEther(entryFee))
  const prizePoolFormatted = parseFloat(formatEther(prizePool))
  const playersNum = Number(players)
  const maxPlayersNum = Number(maxPlayers)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:border-primary-600/30 hover:shadow-lg hover:shadow-primary-600/10",
        "hover:-translate-y-1",
        className
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-fg-100 flex-1 pr-2 line-clamp-2">
            Tournament {address.slice(0, 6)}...{address.slice(-4)}
          </h3>
          <Badge
            variant={isActive ? "success" : phase === "FINALIZED" ? "default" : "warning"}
            className="shrink-0"
          >
            {phase}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Coins className="w-3.5 h-3.5" />
              <span>Entry Fee</span>
            </div>
            <div className="text-lg font-semibold text-primary-600">
              {entryFeeFormatted.toFixed(2)} cUSD
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Trophy className="w-3.5 h-3.5" />
              <span>Prize Pool</span>
            </div>
            <div className="text-lg font-semibold text-accent-500">
              {prizePoolFormatted.toFixed(2)} cUSD
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Users className="w-3.5 h-3.5" />
              <span>Players</span>
            </div>
            <div className="text-base font-semibold text-fg-100">
              {playersNum}/{maxPlayersNum}
            </div>
            <div className="w-full h-1.5 bg-bg-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${(playersNum / maxPlayersNum) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/tournaments/${address}`} className="block">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            disabled={isFull && !isActive}
          >
            {isFull ? "Tournament Full" : isActive ? "Join Tournament" : "View Details"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

