import { useCallback, useEffect, useMemo, useState } from "react"
import { usePublicClient, useReadContract } from "wagmi"
import { tournamentABI } from "@/lib/contracts/instances"

export interface LeaderboardEntry {
  address: `0x${string}`
  score: number
  hasRevealed: boolean
  prize: bigint
  claimed: boolean
}

interface UseLeaderboardOptions {
  skip?: boolean
}

export function useLeaderboard(
  tournamentAddress?: `0x${string}`,
  options: UseLeaderboardOptions = {}
) {
  const publicClient = usePublicClient()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const {
    data: players,
    isLoading: isLoadingPlayers,
    error: playersError,
  } = useReadContract({
    address: tournamentAddress,
    abi: tournamentABI,
    functionName: "getPlayers",
    query: {
      enabled: !!tournamentAddress && !options.skip,
    },
  })

  useEffect(() => {
    if (options.skip) {
      return
    }

    if (!publicClient || !tournamentAddress) {
      setEntries([])
      return
    }

    if (!players || players.length === 0) {
      setEntries([])
      setError(null)
      return
    }

    let cancelled = false

    async function loadLeaderboard() {
      setIsLoadingEntries(true)
      setError(null)

      const supportsMulticall = Boolean(publicClient.chain?.contracts?.multicall3)

      type ContractCall = {
        address: `0x${string}`
        abi: typeof tournamentABI
        functionName: string
        args: readonly unknown[]
      }

      async function executeCalls(contracts: ContractCall[]) {
        if (contracts.length === 0) return []

        if (supportsMulticall) {
          return publicClient.multicall({
            allowFailure: true,
            contracts,
          })
        }

        return Promise.all(
          contracts.map(async (contract) => {
            try {
              const result = await publicClient.readContract(contract)
              return {
                status: "success" as const,
                result,
              }
            } catch (fallbackError) {
              console.warn("[Leaderboard] Fallback contract read failed:", fallbackError)
              return {
                status: "failure" as const,
                error: fallbackError as Error,
              }
            }
          }),
        )
      }

      try {
        const scoreCalls = players.map((player) => ({
          address: tournamentAddress,
          abi: tournamentABI,
          functionName: "scores",
          args: [player],
        }))

        const revealedCalls = players.map((player) => ({
          address: tournamentAddress,
          abi: tournamentABI,
          functionName: "hasRevealed",
          args: [player],
        }))

        const prizeCalls = players.map((player) => ({
          address: tournamentAddress,
          abi: tournamentABI,
          functionName: "prizeAmounts",
          args: [player],
        }))

        const claimedCalls = players.map((player) => ({
          address: tournamentAddress,
          abi: tournamentABI,
          functionName: "prizeClaimed",
          args: [player],
        }))

        const [scoreResults, revealedResults, prizeResults, claimedResults] = await Promise.all([
          executeCalls(scoreCalls),
          executeCalls(revealedCalls),
          executeCalls(prizeCalls),
          executeCalls(claimedCalls),
        ])

        if (cancelled) return

        const mappedEntries: LeaderboardEntry[] = players.map((player, index) => {
          const score = Number(scoreResults[index]?.result ?? 0n)
          const hasRevealed = Boolean(revealedResults[index]?.result)
          const prize = (prizeResults[index]?.result as bigint | undefined) ?? 0n
          const claimed = Boolean(claimedResults[index]?.result)

          return {
            address: player as `0x${string}`,
            score,
            hasRevealed,
            prize,
            claimed,
          }
        })

        const filtered = mappedEntries
          .filter((entry) => entry.hasRevealed || entry.prize > 0n)
          .sort((a, b) => {
            if (b.score === a.score) {
              return a.address.localeCompare(b.address)
            }
            return b.score - a.score
          })

        setEntries(filtered)
      } catch (err) {
        console.error("Failed to load leaderboard", err)
        if (!cancelled) {
          setError("Unable to load leaderboard data")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEntries(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [publicClient, tournamentAddress, players, refreshNonce, options.skip])

  const refresh = useCallback(() => {
    setRefreshNonce((nonce) => nonce + 1)
  }, [])

  const isLoading = isLoadingPlayers || isLoadingEntries

  const totalPrizeDistributed = useMemo(() => {
    return entries.reduce((acc, entry) => acc + entry.prize, 0n)
  }, [entries])

  return {
    entries,
    isLoading,
    error: error || (playersError ? "Unable to load players" : null),
    refresh,
    totalPrizeDistributed,
    hasPlayers: !!players && players.length > 0,
  }
}

