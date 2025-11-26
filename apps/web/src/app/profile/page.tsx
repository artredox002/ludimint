"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { formatAddress } from "@/lib/utils"
import { Trophy, User, Award, TrendingUp, Copy, Check, Loader2, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useUserStats } from "@/hooks/use-user-stats"
import { TournamentPhaseBadge } from "@/components/tournament-phase-badge"
import { formatEther } from "viem"
import { TournamentPhase } from "@/lib/tournament-states"

export default function ProfilePage() {
  const [tab, setTab] = useState("overview")
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)
  const userStats = useUserStats()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const stats = [
    { label: "Tournaments Entered", value: userStats.tournamentsEntered.toString(), icon: Trophy },
    { label: "Tournaments Won", value: userStats.tournamentsWon.toString(), icon: Award },
    { label: "Total Earnings", value: `${userStats.totalEarningsFormatted} cUSD`, icon: TrendingUp },
    { label: "Win Rate", value: userStats.winRateFormatted, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <Avatar className="w-20 h-20 md:w-24 md:h-24">
                <AvatarFallback className="bg-primary-600 text-bg-900 text-2xl md:text-3xl font-bold">
                  {isConnected && address ? address.slice(2, 4).toUpperCase() : "👤"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-fg-100 mb-2">
                    {isConnected && address ? formatAddress(address) : "Not Connected"}
                  </h1>
                  <p className="text-fg-80 text-sm md:text-base">
                    {userStats.tournamentsEntered > 0
                      ? `${userStats.tournamentsEntered} tournament${userStats.tournamentsEntered !== 1 ? "s" : ""} played`
                      : "No tournaments played yet"}
                  </p>
                </div>

                {isConnected && address && (
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1.5 bg-bg-800 border border-white/10 rounded-md text-xs font-mono text-fg-100">
                      {address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyAddress}
                      className="h-8 w-8"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                  {stats.map((stat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <stat.icon className="w-3.5 h-3.5" />
                        <span>{stat.label}</span>
                      </div>
                      <div className="text-lg md:text-xl font-semibold text-primary-600">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6 bg-bg-800 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-xs text-muted mb-2">
                      <stat.icon className="w-4 h-4" />
                      <span>{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            {userStats.isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-fg-80">Loading tournament history...</p>
                </CardContent>
              </Card>
            ) : userStats.tournaments.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={Trophy}
                    title="No tournaments yet"
                    description="You haven't participated in any tournaments yet. Join one to get started!"
                    actionLabel="Browse Tournaments"
                    actionHref="/tournaments"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userStats.tournaments.map((tournament) => (
                  <Card key={tournament.address}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Link
                              href={`/tournaments/${tournament.address}`}
                              className="text-lg font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                            >
                              {formatAddress(tournament.address)}
                            </Link>
                            <TournamentPhaseBadge
                              phase={
                                tournament.phase === "open"
                                  ? TournamentPhase.OPEN
                                  : tournament.phase === "commit"
                                  ? TournamentPhase.COMMIT
                                  : tournament.phase === "reveal"
                                  ? TournamentPhase.REVEAL
                                  : TournamentPhase.FINALIZED
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted mb-1">Score</div>
                              <div className="font-semibold text-fg-100">
                                {tournament.hasRevealed ? tournament.score : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted mb-1">Prize</div>
                              <div className="font-semibold text-primary-600">
                                {tournament.prizeAmount > 0n
                                  ? `${formatEther(tournament.prizeAmount)} cUSD`
                                  : "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted mb-1">Status</div>
                              <div className="font-semibold text-fg-100">
                                {tournament.hasRevealed ? (
                                  <Badge variant="success" className="text-xs">
                                    Revealed
                                  </Badge>
                                ) : tournament.isPlayer ? (
                                  <Badge variant="warning" className="text-xs">
                                    Not Revealed
                                  </Badge>
                                ) : (
                                  "—"
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted mb-1">Claimed</div>
                              <div className="font-semibold text-fg-100">
                                {tournament.prizeClaimed ? (
                                  <Badge variant="success" className="text-xs">
                                    Claimed
                                  </Badge>
                                ) : tournament.prizeAmount > 0n ? (
                                  <Badge variant="warning" className="text-xs">
                                    Unclaimed
                                  </Badge>
                                ) : (
                                  "—"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Link href={`/tournaments/${tournament.address}`}>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards">
            {userStats.tournamentsWon === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <EmptyState
                    icon={Award}
                    title="No rewards yet"
                    description="Win tournaments to earn rewards and badges!"
                    actionLabel="Browse Tournaments"
                    actionHref="/tournaments"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary-600" />
                      Tournament Wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {userStats.tournamentsWon}
                    </div>
                    <p className="text-fg-80 text-sm">
                      You've won {userStats.tournamentsWon} tournament
                      {userStats.tournamentsWon !== 1 ? "s" : ""}!
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent-500" />
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent-500 mb-2">
                      {userStats.totalEarningsFormatted} cUSD
                    </div>
                    <p className="text-fg-80 text-sm">
                      Total prize money earned from tournaments
                    </p>
                  </CardContent>
                </Card>

                {userStats.tournaments.filter((t) => t.prizeAmount > 0n).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-fg-100 mb-4">Recent Wins</h3>
                    <div className="space-y-3">
                      {userStats.tournaments
                        .filter((t) => t.prizeAmount > 0n)
                        .slice(0, 5)
                        .map((tournament) => (
                          <Card key={tournament.address}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-fg-100 mb-1">
                                    {formatAddress(tournament.address)}
                                  </div>
                                  <div className="text-sm text-muted">
                                    Prize: {formatEther(tournament.prizeAmount)} cUSD
                                    {tournament.prizeClaimed ? " • Claimed" : " • Unclaimed"}
                                  </div>
                                </div>
                                <Link href={`/tournaments/${tournament.address}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
