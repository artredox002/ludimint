"use client"

import { useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAccount } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionStatus } from "@/components/transaction-status"
import { EmptyState } from "@/components/empty-state"
import { ClaimPrizeButton } from "@/components/claim-prize-button"
import { useTournament } from "@/hooks/use-tournament"
import { useFinalizeTournament } from "@/hooks/use-finalize-tournament"
import { useLeaderboard } from "@/hooks/use-leaderboard"
import { formatAddress } from "@/lib/utils"
import { formatEther } from "viem"
import { toast } from "sonner"
import { ArrowLeft, Crown, Loader2, Copy, Trophy } from "lucide-react"

export default function LeaderboardPage() {
  const params = useParams()
  const tournamentAddress = params?.id as `0x${string}` | undefined
  const { address: userAddress } = useAccount()
  const { tournament, isLoading: isLoadingTournament } = useTournament(tournamentAddress)
  const { finalize, isFinalizing, txHash, isSuccess: finalizeSuccess } = useFinalizeTournament(tournamentAddress)
  const {
    entries,
    isLoading: isLoadingLeaderboard,
    error,
    refresh,
    totalPrizeDistributed,
    hasPlayers,
  } = useLeaderboard(tournamentAddress)

  const canFinalize =
    tournament &&
    !tournament.finalized &&
    Date.now() / 1000 > Number(tournament.revealEndTime)

  const isLoadingPage = isLoadingTournament || isLoadingLeaderboard

  const userEntry = useMemo(() => {
    if (!userAddress) return null
    return entries.find((entry) => entry.address.toLowerCase() === userAddress.toLowerCase())
  }, [entries, userAddress])

  useEffect(() => {
    if (finalizeSuccess) {
      refresh()
      toast.success("Tournament finalized successfully")
    }
  }, [finalizeSuccess, refresh])

  // Memoize the claim success callback to prevent infinite loops
  const handleClaimSuccess = useCallback(() => {
    refresh() // Refresh leaderboard to update claim status
    // Note: ClaimPrizeButton already shows a success toast, so we don't need another one here
  }, [refresh])

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href={`/tournaments/${tournamentAddress}`}
          className="inline-flex items-center gap-2 text-fg-80 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournament</span>
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-fg-100 mb-2">Tournament Leaderboard</h1>
            {tournament && (
              <p className="text-sm text-muted">
                Address: <span className="font-mono text-primary-500">{formatAddress(tournament.address)}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {tournament && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted">Prize Pool</p>
                <p className="text-2xl font-semibold text-primary-500">
                  {formatEther(tournament.prizePool)} cUSD
                </p>
              </div>
            )}

            {canFinalize && (
              <Button onClick={finalize} disabled={isFinalizing} isLoading={isFinalizing}>
                Finalize Tournament
              </Button>
            )}
          </div>
        </div>

        {txHash && (
          <div className="mb-6">
            <TransactionStatus hash={txHash} description="Finalizing tournament..." />
          </div>
        )}

        {isLoadingPage ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
            <p className="text-fg-80">Loading leaderboard...</p>
                </div>
        ) : error ? (
          <Card className="border-danger-500/20 bg-danger-500/5">
            <CardContent className="p-6 text-center text-danger-500">
              {error}
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title={tournament?.finalized ? "No winners yet" : "Waiting for reveals"}
            description={
              tournament?.finalized
                ? "No players revealed scores for this tournament."
                : "Players have not revealed their scores yet. Check back after the reveal phase."
            }
            actionLabel="Back to tournaments"
            actionHref="/tournaments"
          />
        ) : (
          <Card className="bg-bg-800/60 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary-500" />
                  {tournament?.finalized ? "Final Results" : "Live Rankings"}
                </CardTitle>
                <p className="text-sm text-muted">
                  {tournament?.finalized
                    ? "Tournament finalized — winners can claim their prizes."
                    : "Tournament not finalized yet. Rankings update as players reveal."}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>Total prize distributed</p>
                <p className="text-primary-500 font-semibold">
                  {formatEther(totalPrizeDistributed)} cUSD
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-bg-900/80 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Prize</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, index) => {
                      const isUser = userAddress && entry.address.toLowerCase() === userAddress.toLowerCase()
                      const prizeFormatted = entry.prize > 0n ? `${formatEther(entry.prize)} cUSD` : "-"
                      const rank = index + 1

                      return (
                        <tr
                          key={entry.address}
                          className={`border-t border-white/5 ${
                            isUser ? "bg-primary-600/10" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-semibold">
                              {rank <= 3 ? (
                                <span
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-bg-900 ${
                                    rank === 1
                                      ? "bg-primary-500"
                                      : rank === 2
                                        ? "bg-accent-500"
                                        : "bg-warning-500"
                                  }`}
                                >
                                  {rank}
                                </span>
                              ) : (
                                <span>{rank}</span>
                              )}
            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{formatAddress(entry.address)}</span>
                              <button
                                className="text-muted hover:text-primary-500 transition-colors"
                                onClick={() => {
                                  navigator.clipboard.writeText(entry.address)
                                  toast.success("Address copied to clipboard")
                                }}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold">{entry.score}</td>
                          <td className="px-4 py-3 text-primary-500 font-semibold">{prizeFormatted}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            {entry.prize > 0n ? (
                              entry.claimed ? (
                                <span className="text-success-500">Claimed</span>
                              ) : (
                                <span className="text-warning-500">Unclaimed</span>
                              )
                            ) : entry.hasRevealed ? (
                              <span className="text-fg-80">Revealed</span>
                            ) : (
                              <span className="text-muted">Pending</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
        </div>
            </CardContent>
          </Card>
        )}

        {userEntry && (
          <Card className="mt-8 border-primary-500/20 bg-primary-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted uppercase tracking-wide">Your Result</p>
                <p className="text-xl font-semibold text-fg-100">
                  Score: {userEntry.score} • Prize:{" "}
                  {userEntry.prize > 0n ? `${formatEther(userEntry.prize)} cUSD` : "—"}
                </p>
              </div>
                <div className="flex gap-3 flex-wrap">
                  {/* Claim button if user is a winner with unclaimed prize */}
                  {userEntry.prize > 0n && !userEntry.claimed && tournament?.finalized && tournamentAddress && (
                    <div className="min-w-[200px]">
                      <ClaimPrizeButton
                        tournamentId={tournamentAddress}
                        prizeAmount={formatEther(userEntry.prize)}
                        onSuccess={handleClaimSuccess}
                      />
                    </div>
                  )}
              <Button asChild variant="secondary">
                <Link href={`/tournaments/${tournamentAddress}`}>Back to Tournament</Link>
              </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
