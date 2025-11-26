/**
 * Hook for fetching a single tournament's data
 */

import { useReadContract, useWatchContractEvent } from "wagmi";
import { useTournamentContract } from "@/lib/contracts/instances";
import { useMemo } from "react";
import { TournamentPhase, getTournamentPhase } from "@/lib/tournament-states";

export interface TournamentData {
  address: `0x${string}`;
  token: `0x${string}`;
  entryFee: bigint;
  maxPlayers: bigint;
  topK: bigint;
  creator: `0x${string}`;
  commitEndTime: bigint;
  revealEndTime: bigint;
  finalized: boolean;
  prizePool: bigint;
  playerCount: bigint;
  isFull: boolean;
  phase: TournamentPhase;
  players: readonly `0x${string}`[];
}

export function useTournament(tournamentAddress: `0x${string}` | undefined) {
  const tournament = useTournamentContract(tournamentAddress!);

  // Read all tournament state
  const { data: token, isLoading: isLoadingToken } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "token",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: entryFee, isLoading: isLoadingEntryFee } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "entryFee",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: maxPlayers, isLoading: isLoadingMaxPlayers } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "maxPlayers",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: topK, isLoading: isLoadingTopK } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "topK",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: creator, isLoading: isLoadingCreator } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "creator",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: commitEndTime, isLoading: isLoadingCommitEnd } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "commitEndTime",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: revealEndTime, isLoading: isLoadingRevealEnd } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "revealEndTime",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: finalized, isLoading: isLoadingFinalized } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "finalized",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: prizePool, isLoading: isLoadingPrizePool } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "prizePool",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: playerCount, isLoading: isLoadingPlayerCount } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "getPlayerCount",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: players, isLoading: isLoadingPlayers } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "getPlayers",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const { data: status, isLoading: isLoadingStatus } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "getStatus",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  // Watch for state changes
  useWatchContractEvent({
    address: tournamentAddress,
    abi: tournament?.abi,
    eventName: "PlayerJoined",
    onLogs() {
      // Refetch player data
      // Note: wagmi will auto-refetch, but we can trigger manual refetch if needed
    },
  });

  useWatchContractEvent({
    address: tournamentAddress,
    abi: tournament?.abi,
    eventName: "PlayerRevealed",
    onLogs() {
      // Refetch on reveal
    },
  });

  useWatchContractEvent({
    address: tournamentAddress,
    abi: tournament?.abi,
    eventName: "TournamentFinalized",
    onLogs() {
      // Refetch on finalization
    },
  });

  // Combine all data
  const isLoading =
    isLoadingToken ||
    isLoadingEntryFee ||
    isLoadingMaxPlayers ||
    isLoadingTopK ||
    isLoadingCreator ||
    isLoadingCommitEnd ||
    isLoadingRevealEnd ||
    isLoadingFinalized ||
    isLoadingPrizePool ||
    isLoadingPlayerCount ||
    isLoadingPlayers ||
    isLoadingStatus;

  const tournamentData = useMemo((): TournamentData | null => {
    if (
      !tournamentAddress ||
      !token ||
      entryFee === undefined ||
      maxPlayers === undefined ||
      topK === undefined ||
      !creator ||
      commitEndTime === undefined ||
      revealEndTime === undefined ||
      finalized === undefined ||
      prizePool === undefined ||
      playerCount === undefined ||
      !players ||
      !status
    ) {
      return null;
    }

    const [phaseNum, , isFull] = status as [bigint, bigint, boolean];
    const phase = getTournamentPhase({
      startTime: Number(commitEndTime - BigInt(3600)), // Approximate start time
      commitEndTime: Number(commitEndTime),
      revealEndTime: Number(revealEndTime),
      finalizedAt: finalized ? Number(commitEndTime) : undefined,
    });

    return {
      address: tournamentAddress,
      token: token as `0x${string}`,
      entryFee: entryFee as bigint,
      maxPlayers: maxPlayers as bigint,
      topK: topK as bigint,
      creator: creator as `0x${string}`,
      commitEndTime: commitEndTime as bigint,
      revealEndTime: revealEndTime as bigint,
      finalized: finalized as boolean,
      prizePool: prizePool as bigint,
      playerCount: playerCount as bigint,
      isFull,
      phase,
      players: players as readonly `0x${string}`[],
    };
  }, [
    tournamentAddress,
    token,
    entryFee,
    maxPlayers,
    topK,
    creator,
    commitEndTime,
    revealEndTime,
    finalized,
    prizePool,
    playerCount,
    players,
    status,
  ]);

  return {
    tournament: tournamentData,
    isLoading,
    error: null, // Could aggregate errors if needed
  };
}


