"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { TournamentCard } from "@/components/tournament-card"
import { EmptyState } from "@/components/empty-state"
import { TournamentListSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { Trophy, Sparkles } from "lucide-react"
import { useTournaments } from "@/hooks/use-tournaments"
import { TournamentCardWithData } from "@/components/tournament-card-with-data"

export default function TournamentsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "finalized">("all")
  const { isConnected } = useAccount()
  const { tournaments, isLoading: isLoadingList } = useTournaments()

  if (isLoadingList) {
    return (
      <div className="min-h-screen bg-bg-900 py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <TournamentListSkeleton count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      {/* Header Section */}
      <section className="border-b border-white/10 bg-gradient-to-b from-bg-900 to-bg-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-600/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-fg-100 mb-2">
                Active Tournaments
              </h1>
              <p className="text-fg-80 text-sm md:text-base">
                Join a tournament and compete for real prizes on Celo
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {(["all", "active", "finalized"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "All Tournaments" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCardWithData
                key={tournament.address}
                address={tournament.address}
                filter={filter}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No tournaments found"
            description="Try a different filter or create a new tournament"
            actionLabel="Create Tournament"
            actionHref="/create"
          />
        )}
      </section>
    </div>
  )
}
