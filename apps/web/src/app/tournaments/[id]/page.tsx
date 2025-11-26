"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TournamentPhaseBadge } from "@/components/tournament-phase-badge"
import { CountdownTimer } from "@/components/countdown-timer"
import { BalanceDisplay } from "@/components/balance-display"
import { FaucetButton } from "@/components/faucet-button"
import { TransactionStatus } from "@/components/transaction-status"
import { ClaimPrizeButton } from "@/components/claim-prize-button"
import { ArrowLeft, Trophy, Coins, Users, Clock, Info, AlertCircle, BarChart3 } from "lucide-react"
import { formatAddress } from "@/lib/utils"
import { TournamentPhase, getTimeUntilNextPhase, TournamentTiming } from "@/lib/tournament-states"
import { useTokenBalance } from "@/hooks/use-balance"
import { getCommitData } from "@/lib/commit-reveal"
import { useTournament } from "@/hooks/use-tournament"
import { useReadContract } from "wagmi"
import { tournamentABI } from "@/lib/contracts/instances"
import { formatEther } from "viem"
import { useLeaderboard } from "@/hooks/use-leaderboard"
import { Loader2 } from "lucide-react"

export default function TournamentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const tournamentAddress = id as `0x${string}` | undefined
  const { address, isConnected } = useAccount()
  const { tournament, isLoading } = useTournament(tournamentAddress)
  const {
    entries: leaderboardEntries,
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
  } = useLeaderboard(tournamentAddress, { skip: !tournamentAddress })
  
  // Check if user has joined
  const { data: isPlayerData } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "isPlayer",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address },
  })
  
  const commitData = tournamentAddress ? getCommitData(tournamentAddress) : null
  const hasJoined = Boolean(isPlayerData) || !!commitData
  
  const { balance } = useTokenBalance()
  const hasEnoughBalance = tournament 
    ? parseFloat(balance) >= parseFloat(formatEther(tournament.entryFee))
    : false

  // Calculate timing for countdown
  const timing: TournamentTiming | null = tournament ? {
    startTime: Number(tournament.commitEndTime) - 3600, // Approximate
    commitEndTime: Number(tournament.commitEndTime),
    revealEndTime: Number(tournament.revealEndTime),
    finalizedAt: tournament.finalized ? Number(tournament.revealEndTime) : undefined,
  } : null

  const timeUntilNext = timing ? getTimeUntilNextPhase(timing) : null
  const phase = tournament?.phase || TournamentPhase.OPEN

  // Move useMemo before early return to follow Rules of Hooks
  const topPlayers = useMemo(() => leaderboardEntries.slice(0, 3), [leaderboardEntries])

  if (isLoading || !tournament) {
    return (
      <div className="min-h-screen bg-bg-900 text-fg-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-12 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const canJoin = phase === TournamentPhase.OPEN || phase === TournamentPhase.COMMIT
  const canReveal = phase === TournamentPhase.REVEAL && hasJoined && commitData
  const canClaim = phase === TournamentPhase.FINALIZED && hasJoined

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-fg-80 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournaments</span>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-fg-100 mb-3">
              Tournament {formatAddress(tournamentAddress || "0x")}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <TournamentPhaseBadge phase={phase} />
              {timeUntilNext && (
                <CountdownTimer
                  secondsRemaining={timeUntilNext.secondsRemaining}
                  variant={timeUntilNext.secondsRemaining < 300 ? "warning" : "default"}
                />
              )}
            </div>
          </div>
          {/* Leaderboard Button - Always visible when tournament has players or is in reveal/finalized phase */}
          {(phase === TournamentPhase.REVEAL || phase === TournamentPhase.FINALIZED || tournament.playerCount > 0n) && (
            <Link href={`/tournaments/${id}/leaderboard`}>
              <Button variant="secondary" size="lg" className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Leaderboard
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary-600" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Coins className="w-4 h-4" />
                      <span>Entry Fee</span>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {formatEther(tournament.entryFee)} cUSD
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Trophy className="w-4 h-4" />
                      <span>Prize Pool</span>
                    </div>
                    <div className="text-2xl font-bold text-accent-500">
                      {formatEther(tournament.prizePool)} cUSD
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Users className="w-4 h-4" />
                      <span>Players</span>
                    </div>
                    <div className="text-2xl font-bold text-fg-100">
                      {Number(tournament.playerCount)}/{Number(tournament.maxPlayers)}
                    </div>
                    <div className="w-full h-2 bg-bg-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-500"
                        style={{ width: `${(Number(tournament.playerCount) / Number(tournament.maxPlayers)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      <span>Top K</span>
                    </div>
                    <div className="text-lg font-semibold text-primary-600">
                      {Number(tournament.topK)} Winners
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside text-fg-80">
                  <li>Players join the tournament (entry fee: {tournament ? formatEther(tournament.entryFee) : "0"} cUSD)</li>
                  <li>Memory game: Match 8 pairs within 60 seconds</li>
                  <li>Top {tournament ? Number(tournament.topK) : 0} scorers win prizes</li>
                  <li>Winners receive prize pool split equally</li>
                  <li>Payouts sent instantly to Celo wallet</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Balance & Actions */}
            {isConnected && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-muted mb-2">Your Balance</div>
                    <BalanceDisplay />
                  </div>
                  
                  {!hasEnoughBalance && (
                    <div className="p-3 bg-warning-500/10 border border-warning-500/20 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-warning-500">
                          Insufficient balance. You need {tournament ? formatEther(tournament.entryFee) : "0"} cUSD to join.
                        </div>
                      </div>
                      <div className="mt-3">
                        <FaucetButton variant="outline" className="w-full" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {canJoin && !hasJoined && (
                <Link href={`/tournaments/${id}/play`} className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!isConnected || !hasEnoughBalance}
                  >
                    Join & Play
                  </Button>
                </Link>
              )}

              {hasJoined && phase === TournamentPhase.COMMIT && (
                <div className="p-4 bg-primary-600/10 border border-primary-600/20 rounded-md">
                  <p className="text-sm text-fg-100 mb-2 font-medium">
                    ✓ You've joined this tournament
                  </p>
                  <p className="text-xs text-muted">
                    Wait for the reveal phase to submit your score.
                  </p>
                </div>
              )}

              {canReveal && (
                <Link href={`/tournaments/${id}/reveal`} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Reveal Score
                  </Button>
                </Link>
              )}

              {canClaim && tournamentAddress && (
                <ClaimPrizeButton
                  tournamentId={tournamentAddress}
                  prizeAmount={tournament ? formatEther(tournament.prizePool / tournament.topK) : "0"}
                  onSuccess={() => {
                    router.push(`/tournaments/${id}/leaderboard`)
                  }}
                />
              )}

              {/* Leaderboard button in action section - visible during reveal phase and after */}
              {(phase === TournamentPhase.REVEAL || phase === TournamentPhase.FINALIZED) && (
                <Link href={`/tournaments/${id}/leaderboard`} className="block">
                  <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    View Leaderboard
                  </Button>
                </Link>
              )}
            </div>

            {/* Top Players */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingLeaderboard ? (
                  <div className="flex items-center gap-2 text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading top players...</span>
                  </div>
                ) : leaderboardError ? (
                  <p className="text-sm text-danger-500">{leaderboardError}</p>
                ) : topPlayers.length === 0 ? (
                  <p className="text-sm text-muted">No players have revealed their scores yet.</p>
                ) : (
                  topPlayers.map((player, index) => (
                    <div
                      key={player.address}
                      className="flex items-center justify-between p-3 rounded-md bg-bg-800/50 hover:bg-bg-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-primary-600 text-bg-900"
                              : index === 1
                              ? "bg-accent-500 text-bg-900"
                              : "bg-bg-700 text-fg-100"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-fg-100 block">
                            {formatAddress(player.address)}
                          </span>
                          <span className="text-xs text-muted">Score: {player.score}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        {player.prize > 0n
                          ? `${formatEther(player.prize)} cUSD`
                          : player.hasRevealed
                          ? "Revealed"
                          : "Pending"}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
