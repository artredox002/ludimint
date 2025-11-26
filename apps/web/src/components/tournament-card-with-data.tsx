"use client"

import { useTournament } from "@/hooks/use-tournament"
import { TournamentCard } from "./tournament-card"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TournamentCardWithDataProps {
  address: `0x${string}`
  filter: "all" | "active" | "finalized"
}

export function TournamentCardWithData({ address, filter }: TournamentCardWithDataProps) {
  const { tournament, isLoading } = useTournament(address)

  if (isLoading) {
    return (
      <Card className="border-white/5 bg-bg-800/40">
        <CardContent className="p-6 space-y-4 animate-pulse">
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-full col-span-2" />
            <Skeleton className="h-3 w-3/4 col-span-2" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!tournament) {
    return null
  }

  const isActive = tournament.phase === "OPEN" || tournament.phase === "COMMIT" || tournament.phase === "REVEAL"

  if (filter === "active" && !isActive) {
    return null
  }

  if (filter === "finalized" && tournament.phase !== "FINALIZED") {
    return null
  }

  return (
    <TournamentCard
      address={tournament.address}
      entryFee={tournament.entryFee}
      prizePool={tournament.prizePool}
      players={tournament.playerCount}
      maxPlayers={tournament.maxPlayers}
      phase={tournament.phase}
    />
  )
}

