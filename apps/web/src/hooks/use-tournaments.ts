/**
 * Hook for fetching all tournaments from TournamentFactory
 */

import { useReadContract, useWatchContractEvent } from "wagmi";
import { useTournamentFactoryContract } from "@/lib/contracts/instances";
import { useMemo } from "react";

export interface TournamentListItem {
  address: `0x${string}`;
  creator: `0x${string}`;
}

export function useTournaments() {
  const factory = useTournamentFactoryContract();

  // Read all tournament addresses
  const {
    data: tournamentAddresses,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: factory?.address,
    abi: factory?.abi,
    functionName: "getTournaments",
    query: {
      enabled: !!factory,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  // Watch for new tournaments
  useWatchContractEvent({
    address: factory?.address,
    abi: factory?.abi,
    eventName: "TournamentCreated",
    onLogs() {
      // Refetch when new tournament is created
      refetch();
    },
  });

  // Transform addresses to list items
  const tournaments = useMemo(() => {
    if (!tournamentAddresses || !factory) return [];

    return tournamentAddresses.map((address) => ({
      address: address as `0x${string}`,
      creator: "0x0000000000000000000000000000000000000000" as `0x${string}`, // Will be fetched separately if needed
    }));
  }, [tournamentAddresses, factory]);

  return {
    tournaments,
    isLoading,
    error,
    refetch,
  };
}


