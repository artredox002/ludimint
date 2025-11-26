"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount, useReadContract } from "wagmi"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionStatus } from "@/components/transaction-status"
import { ArrowLeft, Trophy, Clock, CheckCircle2, Loader2 } from "lucide-react"
import { generateSecret, computeCommitHash, storeCommitData, getCommitData } from "@/lib/commit-reveal"
import { formatTxHash } from "@/lib/explorer"
import { toast } from "sonner"
import { useJoinTournament } from "@/hooks/use-join-tournament"
import { useTournament } from "@/hooks/use-tournament"
import { formatEther } from "viem"
import { tournamentABI } from "@/lib/contracts/instances"

const SYMBOLS = ["🌟", "🎮", "🏆", "🎯", "💎", "🚀", "🌈", "⚡"]

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { address, isConnected } = useAccount()
  
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState(new Set<number>())
  const [matched, setMatched] = useState(new Set<number>())
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [commitHash, setCommitHash] = useState<`0x${string}` | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const tournamentAddress = id as `0x${string}` | undefined
  const { tournament } = useTournament(tournamentAddress)
  const { joinTournament, isJoining, txHash, approvalTxHash, isSuccess: joinSuccess } = useJoinTournament()
  
  // Check if user has already joined
  const { data: isPlayer } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "isPlayer",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address },
  })

  // Restore commit data from localStorage if it exists
  useEffect(() => {
    if (id && address) {
      const stored = getCommitData(id)
      if (stored) {
        setCommitHash(stored.commitHash as `0x${string}`)
        setSecret(stored.secret)
        setScore(stored.score)
        setGameCompleted(true)
        console.log('[Play Page] Restored commit data from localStorage:', stored)
      } else {
        initializeGame()
      }
    }
  }, [id, address])

  useEffect(() => {
    if (joinSuccess) {
      toast.success("Successfully joined tournament!")
      setTimeout(() => {
        router.push(`/tournaments/${id}`)
      }, 1500)
    }
  }, [joinSuccess, id, router])

  useEffect(() => {
    if (!gameStarted || timer <= 0 || gameCompleted) return
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleGameEnd()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameStarted, timer, gameCompleted])

  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0 && !gameCompleted) {
      handleGameEnd()
    }
  }, [matched, cards.length, gameCompleted])

  const initializeGame = () => {
    const deck = [...SYMBOLS, ...SYMBOLS].sort(() => Math.random() - 0.5)
    setCards(deck)
    setFlipped(new Set())
    setMatched(new Set())
    setScore(0)
    setTimer(60)
    setGameCompleted(false)
    setCommitHash(null)
    setSecret(null)
  }

  const handleGameEnd = () => {
    setGameCompleted(true)
    setGameStarted(false)
    
    // Ensure score is an integer (should already be, but enforce it)
    const finalScore = Math.floor(score)
    
    if (finalScore < 0) {
      console.error('Invalid score:', finalScore)
      toast.error('Invalid score. Please try again.')
      return
    }
    
    // Generate commit data
    const gameSecret = generateSecret()
    setSecret(gameSecret)
    
    if (address && id) {
      try {
        // id is the tournament address
        const tournamentAddress = id as `0x${string}`
        
        // Validate tournament address format
        if (!tournamentAddress.startsWith('0x') || tournamentAddress.length !== 42) {
          console.error('Invalid tournament address:', tournamentAddress)
          toast.error('Invalid tournament address. Please try again.')
          return
        }
        
        // Compute commit hash
        const hash = computeCommitHash(
          address as `0x${string}`,
          tournamentAddress,
          gameSecret,
          BigInt(finalScore)
        )
        
        setCommitHash(hash)
        
        // Store locally with validation
        storeCommitData(tournamentAddress, gameSecret, finalScore, hash)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Game End] Commit data generated:', {
            score: finalScore,
            commitHash: hash,
            tournamentAddress: tournamentAddress.toLowerCase(),
          })
        }
      } catch (error) {
        console.error('[Game End] Failed to generate commit data:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to generate commit data. Please try again.')
      }
    } else {
      console.error('[Game End] Missing address or tournament ID')
      toast.error('Missing wallet address or tournament information. Please try again.')
    }
  }

  const toggleFlip = (index: number) => {
    if (!gameStarted || gameCompleted || matched.has(index) || flipped.size >= 2) return

    const newFlipped = new Set(flipped)
    newFlipped.add(index)
    setFlipped(newFlipped)

    if (newFlipped.size === 2) {
      const [first, second] = Array.from(newFlipped)
      if (cards[first] === cards[second]) {
        setMatched(new Set([...matched, first, second]))
        // Ensure score is always an integer
        setScore(prevScore => {
          const newScore = prevScore + 10
          return Math.floor(newScore) // Ensure integer
        })
        setFlipped(new Set())
      } else {
        setTimeout(() => setFlipped(new Set()), 600)
      }
    }
  }

  const handleStartGame = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    initializeGame()
    setGameStarted(true)
  }

  const handleSubmitCommit = async () => {
    if (!commitHash || !address || !id || !tournament) {
      toast.error("Missing commit data or tournament info")
      console.error('[Play Page] Missing data:', { commitHash: !!commitHash, address: !!address, id, tournament: !!tournament })
      return
    }

    if (!tournamentAddress) {
      toast.error("Invalid tournament address")
      return
    }

    console.log('[Play Page] Submitting commit to join tournament:', {
      tournamentAddress,
      commitHash,
      tokenAddress: tournament.token,
      entryFee: tournament.entryFee.toString(),
    })

    try {
      await joinTournament({
        tournamentAddress,
        commitHash,
        tokenAddress: tournament.token,
        entryFee: tournament.entryFee,
      })
    } catch (error) {
      console.error("[Play Page] Failed to join tournament:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to join tournament"
      toast.error(errorMessage)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-900 text-fg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-fg-80 mb-4">Please connect your wallet to play</p>
            <Button asChild>
              <Link href={`/tournaments/${id}`}>Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Memory Game</h1>
          <Link
            href={`/tournaments/${id}`}
            className="inline-flex items-center gap-2 text-fg-80 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Transaction Status */}
        {approvalTxHash && !txHash && (
          <div className="mb-6">
            <TransactionStatus 
              hash={approvalTxHash} 
              description="Approving entry fee..." 
              onSuccess={() => {
                // Approval confirmed, join transaction should be sent automatically
                toast.info("Approval confirmed. Join transaction will be sent next...");
              }}
            />
          </div>
        )}
        {txHash && (
          <div className="mb-6">
            <TransactionStatus
              hash={txHash}
              description="Joining tournament..."
              onSuccess={() => {
                toast.success("Successfully joined tournament!");
                setTimeout(() => {
                  router.push(`/tournaments/${id}`)
                }, 1500);
              }}
              onError={() => {
                toast.error("Join transaction failed. Please try again.");
              }}
            />
          </div>
        )}

        {!tournament && (
          <Card className="mb-6 border-warning-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-warning-500">Loading tournament data...</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted mb-1">Score</div>
              <div className="text-2xl font-bold text-primary-600">{score}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted mb-1">Time Left</div>
              <div className={`text-2xl font-bold ${timer > 10 ? "text-success-500" : "text-danger-500"}`}>
                {timer}s
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-muted mb-1">Matches</div>
              <div className="text-2xl font-bold text-fg-100">{matched.size / 2}/{SYMBOLS.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        {!gameStarted && !gameCompleted && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Memory Challenge</h2>
              <p className="text-fg-80 mb-6">
                Match all pairs of cards within 60 seconds. Your score will be committed onchain.
              </p>
              <Button onClick={handleStartGame} size="lg" variant="primary">
                Start Game
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        {gameStarted && !gameCompleted && (
          <div className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {cards.map((card, index) => {
              const isFlipped = flipped.has(index)
              const isMatched = matched.has(index)
              const showCard = isFlipped || isMatched

              return (
                <button
                  key={index}
                  onClick={() => toggleFlip(index)}
                  disabled={isMatched}
                  className={`
                    aspect-square rounded-md text-3xl md:text-4xl font-bold
                    transition-all duration-300 transform
                    ${showCard 
                      ? "bg-primary-600 text-bg-900 rotateY-0" 
                      : "bg-bg-700 text-transparent hover:bg-bg-800 rotateY-180"
                    }
                    ${isMatched ? "opacity-50" : "hover:scale-105"}
                    cursor-pointer
                  `}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {showCard ? card : "?"}
                </button>
              )
            })}
          </div>
        )}

        {/* Game Completed */}
        {gameCompleted && !joinSuccess && !isPlayer && (
          <Card className="mb-6 border-success-500/30">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
              <p className="text-fg-80 mb-4">
                Final Score: <span className="text-primary-600 font-bold">{score}</span>
              </p>
              {commitHash && (
                <div className="mb-6 p-4 bg-bg-800 rounded-md">
                  <p className="text-xs text-muted mb-2">Commit Hash</p>
                  <code className="text-xs font-mono text-fg-100 break-all">
                    {formatTxHash(commitHash)}
                  </code>
                </div>
              )}
              {!txHash && !isJoining && (
                <>
                  <Button
                    onClick={handleSubmitCommit}
                    size="lg"
                    variant="primary"
                    disabled={isJoining || !commitHash}
                    className="w-full"
                  >
                    Join Tournament
                  </Button>
                  <p className="text-xs text-muted mt-4">
                    Your score is securely committed. You'll reveal it during the reveal phase.
                  </p>
                </>
              )}
              {isJoining && !txHash && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    <p className="text-sm text-fg-80">
                      {approvalTxHash && !txHash ? "Approval confirmed. Joining tournament..." : "Processing..."}
                    </p>
                  </div>
                  <p className="text-xs text-muted text-center">
                    Please wait while we process your transaction...
                  </p>
                </div>
              )}
              {txHash && !joinSuccess && (
                <div className="space-y-4">
                  <p className="text-sm text-fg-80">
                    Join transaction submitted. Waiting for confirmation...
                  </p>
                  <p className="text-xs text-muted">
                    This may take a few moments. Please wait for the transaction to confirm.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success State - Already Joined or Join Successful */}
        {(joinSuccess || isPlayer) && (
          <Card className="mb-6 border-success-500/30">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Successfully Joined!</h2>
              <p className="text-fg-80 mb-6">
                {isPlayer
                  ? "You've successfully joined this tournament. Your commit hash is recorded on-chain."
                  : "You've successfully joined the tournament. Redirecting to tournament page..."}
              </p>
              {commitHash && (
                <div className="mb-6 p-4 bg-bg-800 rounded-md">
                  <p className="text-xs text-muted mb-2">Your Commit Hash</p>
                  <code className="text-xs font-mono text-fg-100 break-all">
                    {formatTxHash(commitHash)}
                  </code>
                </div>
              )}
              <Button
                asChild
                variant="primary"
                size="lg"
                className="w-full"
              >
                <Link href={`/tournaments/${id}`}>Go to Tournament</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {gameStarted && !gameCompleted && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-fg-80 text-center">
                Click cards to flip them. Match pairs to score points!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
