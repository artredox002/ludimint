/**
 * Hook for fetching user statistics and tournament history
 */

import { useEffect, useMemo, useState } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { tournamentABI } from "@/lib/contracts/instances"
import { useTournaments } from "./use-tournaments"
import { formatEther } from "viem"

export interface UserTournamentEntry {
  address: `0x${string}`
  isPlayer: boolean
  hasRevealed: boolean
  score: number
  prizeAmount: bigint
  prizeClaimed: boolean
  finalized: boolean
  phase: "open" | "commit" | "reveal" | "finalized"
}

export interface UserStats {
  tournamentsEntered: number
  tournamentsWon: number
  totalEarnings: bigint
  totalEarningsFormatted: string
  winRate: number
  winRateFormatted: string
  tournaments: UserTournamentEntry[]
  isLoading: boolean
}

export function useUserStats() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { tournaments, isLoading: isLoadingTournaments } = useTournaments()
  const [userTournaments, setUserTournaments] = useState<UserTournamentEntry[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    if (!address || !publicClient || tournaments.length === 0) {
      setUserTournaments([])
      setIsLoadingData(false)
      return
    }

    let cancelled = false

    async function loadUserData() {
      setIsLoadingData(true)

      try {
        // Check which tournaments the user is a player in (using individual calls instead of multicall)
        const isPlayerChecks = await Promise.all(
          tournaments.map((tournament) =>
            publicClient
              .readContract({
                address: tournament.address,
                abi: tournamentABI,
                functionName: "isPlayer",
                args: [address],
              })
              .catch(() => false)
          )
        )

        // Filter to only tournaments where user is a player
        const playerTournaments = tournaments.filter(
          (_, index) => isPlayerChecks[index] === true
        )

        if (playerTournaments.length === 0) {
          setUserTournaments([])
          setIsLoadingData(false)
          return
        }

        // Fetch all data for tournaments where user is a player (using individual calls)
        const tournamentDataPromises = playerTournaments.map(async (tournament) => {
          try {
            const [hasRevealed, score, prizeAmount, prizeClaimed, finalized, status] =
              await Promise.all([
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "hasRevealed",
                    args: [address],
                  })
                  .catch(() => false),
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "scores",
                    args: [address],
                  })
                  .catch(() => 0n),
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "prizeAmounts",
                    args: [address],
                  })
                  .catch(() => 0n),
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "prizeClaimed",
                    args: [address],
                  })
                  .catch(() => false),
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "finalized",
                  })
                  .catch(() => false),
                publicClient
                  .readContract({
                    address: tournament.address,
                    abi: tournamentABI,
                    functionName: "getStatus",
                  })
                  .catch(() => undefined),
              ])

            const phaseNum = (status as [bigint, bigint, boolean] | undefined)?.[0]
            let phase: "open" | "commit" | "reveal" | "finalized" = "open"
            if (finalized || phaseNum === 3n) {
              phase = "finalized"
            } else if (phaseNum === 2n) {
              phase = "reveal"
            } else if (phaseNum === 1n) {
              phase = "commit"
            }

            return {
              address: tournament.address,
              isPlayer: true,
              hasRevealed: Boolean(hasRevealed),
              score: Number(score ?? 0n),
              prizeAmount: (prizeAmount as bigint | undefined) ?? 0n,
              prizeClaimed: Boolean(prizeClaimed),
              finalized: Boolean(finalized),
              phase,
            }
          } catch (error) {
            console.error(`Error loading data for tournament ${tournament.address}:`, error)
            return null
          }
        })

        const results = await Promise.all(tournamentDataPromises)
        const mapped = results.filter((entry): entry is UserTournamentEntry => entry !== null)

        if (cancelled) return

        setUserTournaments(mapped)
      } catch (error) {
        console.error("Failed to load user stats:", error)
        if (!cancelled) {
          setUserTournaments([])
        }
      } finally {
        if (!cancelled) {
          setIsLoadingData(false)
        }
      }
    }

    loadUserData()

    return () => {
      cancelled = true
    }
  }, [address, publicClient, tournaments])

  const stats = useMemo((): UserStats => {
    if (!address) {
      return {
        tournamentsEntered: 0,
        tournamentsWon: 0,
        totalEarnings: 0n,
        totalEarningsFormatted: "0.00",
        winRate: 0,
        winRateFormatted: "0%",
        tournaments: [],
        isLoading: isLoadingTournaments || isLoadingData,
      }
    }

    const tournamentsEntered = userTournaments.length
    const tournamentsWon = userTournaments.filter((t) => t.prizeAmount > 0n).length
    const totalEarnings = userTournaments.reduce((acc, t) => acc + t.prizeAmount, 0n)
    const totalEarningsFormatted = formatEther(totalEarnings)
    const winRate = tournamentsEntered > 0 ? (tournamentsWon / tournamentsEntered) * 100 : 0
    const winRateFormatted = `${winRate.toFixed(1)}%`

    return {
      tournamentsEntered,
      tournamentsWon,
      totalEarnings,
      totalEarningsFormatted,
      winRate,
      winRateFormatted,
      tournaments: userTournaments.sort((a, b) => {
        // Sort by finalized first, then by phase
        if (a.finalized !== b.finalized) {
          return a.finalized ? -1 : 1
        }
        const phaseOrder = { finalized: 0, reveal: 1, commit: 2, open: 3 }
        return phaseOrder[a.phase] - phaseOrder[b.phase]
      }),
      isLoading: isLoadingTournaments || isLoadingData,
    }
  }, [address, userTournaments, isLoadingTournaments, isLoadingData])

  return stats
}
