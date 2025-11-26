"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionStatus } from "@/components/transaction-status"
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Copy } from "lucide-react"
import { getCommitData, clearCommitData, verifyCommit } from "@/lib/commit-reveal"
import { formatTxHash } from "@/lib/explorer"
import { toast } from "sonner"
import { useRevealScore } from "@/hooks/use-reveal-score"
import { tournamentABI } from "@/lib/contracts/instances"

export default function RevealPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { address, isConnected } = useAccount()
  
  const [commitData, setCommitData] = useState<{
    secret: string
    score: number
    commitHash: string
    timestamp: number
  } | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const tournamentAddress = id as `0x${string}` | undefined
  const { revealScore, isRevealing, txHash, isSuccess } = useRevealScore()

  // Check if user is a player
  const { data: isPlayer, isLoading: isLoadingPlayer } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "isPlayer",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address },
  })

  useEffect(() => {
    if (!id || !address) return
    
    const stored = getCommitData(id)
    if (stored) {
      setCommitData(stored)
    }
  }, [id, address])

  useEffect(() => {
    if (isSuccess && commitData) {
      setRevealed(true)
      clearCommitData(id)
      toast.success("Score revealed successfully!")
      setTimeout(() => {
        router.push(`/tournaments/${id}/leaderboard`)
      }, 2000)
    }
  }, [isSuccess, commitData, id, router])

  const handleReveal = async () => {
    if (!commitData || !address || !id) {
      toast.error("Missing commit data or wallet information")
      return
    }

    // Validate commit data
    if (!commitData.secret || typeof commitData.secret !== 'string') {
      toast.error("Invalid secret in commit data")
      return
    }
    if (typeof commitData.score !== 'number' || isNaN(commitData.score) || commitData.score < 0) {
      toast.error("Invalid score in commit data")
      return
    }
    if (!commitData.commitHash || !commitData.commitHash.startsWith('0x') || commitData.commitHash.length !== 66) {
      toast.error("Invalid commit hash format")
      return
    }

    // Ensure score is an integer
    const integerScore = Math.floor(commitData.score)
    if (integerScore !== commitData.score) {
      console.warn('[Reveal] Score was not an integer, rounding:', commitData.score, '->', integerScore)
    }

    // Verify commit hash before revealing
    const tournamentAddress = id as `0x${string}`
    
    if (!tournamentAddress.startsWith('0x') || tournamentAddress.length !== 42) {
      toast.error("Invalid tournament address")
      return
    }

    const isValid = verifyCommit(
      commitData.commitHash as `0x${string}`,
      address as `0x${string}`,
      tournamentAddress,
      commitData.secret,
      BigInt(integerScore)
    )

    if (!isValid) {
      toast.error("Commit verification failed. The commit hash does not match your secret and score. Please check your data.")
      console.error('[Reveal] Commit verification failed:', {
        commitHash: commitData.commitHash,
        playerAddress: address,
        tournamentAddress: tournamentAddress,
        score: integerScore,
      })
      return
    }

    try {
      await revealScore({
        tournamentAddress: tournamentAddress,
        secret: commitData.secret,
        score: BigInt(integerScore),
      })
    } catch (error) {
      console.error("Failed to reveal score:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to reveal score"
      toast.error(errorMessage)
    }
  }

  const copySecret = () => {
    if (commitData?.secret) {
      navigator.clipboard.writeText(commitData.secret)
      toast.success("Secret copied to clipboard")
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-900 text-fg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-fg-80 mb-4">Please connect your wallet</p>
            <Button asChild>
              <Link href={`/tournaments/${id}`}>Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!commitData) {
    return (
      <div className="min-h-screen bg-bg-900 text-fg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Commit Found</h2>
            <p className="text-fg-80 mb-6">
              You haven't joined this tournament yet or your commit data was not found.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="secondary">
                <Link href={`/tournaments/${id}`}>Back to Tournament</Link>
              </Button>
              <Button asChild>
                <Link href={`/tournaments/${id}/play`}>Join & Play</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is a player (show warning if not)
  if (!isLoadingPlayer && !isPlayer) {
    return (
      <div className="min-h-screen bg-bg-900 text-fg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Not a Player</h2>
            <p className="text-fg-80 mb-6">
              You are not registered as a player in this tournament. You must join the tournament first before you can reveal your score.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="secondary">
                <Link href={`/tournaments/${id}`}>Back to Tournament</Link>
              </Button>
              <Button asChild>
                <Link href={`/tournaments/${id}/play`}>Join & Play</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href={`/tournaments/${id}`}
          className="inline-flex items-center gap-2 text-fg-80 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tournament</span>
        </Link>

        {/* Transaction Status */}
        {txHash && (
          <div className="mb-6">
            <TransactionStatus
              hash={txHash}
              description="Revealing score..."
              onSuccess={() => {
                setRevealed(true)
                clearCommitData(id)
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fg-100 mb-2">
            Reveal Your Score
          </h1>
          <p className="text-fg-80">
            Submit your secret and score to verify your commitment
          </p>
        </div>

        {!revealed ? (
          <Card>
            <CardHeader>
              <CardTitle>Commit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="p-4 bg-primary-600/10 border border-primary-600/20 rounded-md">
                <div className="text-sm text-muted mb-1">Your Score</div>
                <div className="text-3xl font-bold text-primary-600">{commitData.score}</div>
              </div>

              {/* Commit Hash */}
              <div>
                <div className="text-sm text-muted mb-2">Commit Hash</div>
                <code className="block p-3 bg-bg-800 rounded-md text-xs font-mono text-fg-100 break-all">
                  {formatTxHash(commitData.commitHash)}
                </code>
              </div>

              {/* Secret */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted">Secret Phrase</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSecret(!showSecret)}
                      className="h-8 w-8"
                    >
                      {showSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copySecret}
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-bg-800 rounded-md">
                  <code className="text-xs font-mono text-fg-100 break-all">
                    {showSecret ? commitData.secret : "•".repeat(64)}
                  </code>
                </div>
                <p className="text-xs text-muted mt-2">
                  This secret was generated when you played. Keep it safe until reveal.
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-warning-500">
                    <strong>Important:</strong> Once you reveal, your score will be recorded onchain. 
                    Make sure the secret and score are correct.
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleReveal}
                size="lg"
                variant="primary"
                disabled={isRevealing}
                isLoading={isRevealing}
                className="w-full"
              >
                {isRevealing ? "Revealing..." : "Reveal Score"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-success-500/30">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Score Revealed!</h2>
              <p className="text-fg-80 mb-6">
                Your score of <span className="text-primary-600 font-bold">{commitData.score}</span> has been verified onchain.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="primary">
                  <Link href={`/tournaments/${id}/leaderboard`}>View Leaderboard</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/tournaments">Browse Tournaments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
