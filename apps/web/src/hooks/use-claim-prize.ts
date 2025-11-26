/**
 * Hook for claiming prize in a tournament
 */

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { toast } from "sonner";
import { useTournamentContract } from "@/lib/contracts/instances";
import { useAccount } from "wagmi";
import { getFriendlyErrorMessage } from "@/lib/errors";

export function useClaimPrize(tournamentAddress: `0x${string}` | undefined) {
  const [isClaiming, setIsClaiming] = useState(false);
  const { address } = useAccount();
  const tournament = useTournamentContract(tournamentAddress!);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user is a winner and has unclaimed prize
  const { data: prizeAmount, isLoading: isLoadingPrize } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "prizeAmounts",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address && !!tournament },
  });

  const { data: prizeClaimed, isLoading: isLoadingClaimed } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "prizeClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!tournamentAddress && !!address && !!tournament },
  });

  const { data: finalized, isLoading: isLoadingFinalized } = useReadContract({
    address: tournamentAddress,
    abi: tournament?.abi,
    functionName: "finalized",
    query: { enabled: !!tournamentAddress && !!tournament },
  });

  const canClaim =
    !!address &&
    !!prizeAmount &&
    prizeAmount > 0n &&
    !prizeClaimed &&
    finalized;

  const claimPrize = async () => {
    if (!tournamentAddress || !tournament) {
      toast.error("Tournament contract not found");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!canClaim) {
      toast.error("You are not eligible to claim a prize");
      return;
    }

    setIsClaiming(true);

    try {
      writeContract({
        address: tournamentAddress,
        abi: tournament.abi,
        functionName: "claimPrize",
        args: [],
      });
    } catch (err) {
      console.error("Error claiming prize:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to claim prize"));
      setIsClaiming(false);
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Prize claimed successfully!");
      setIsClaiming(false);
    }
  }, [isSuccess]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Claim prize error:", error);
      toast.error(getFriendlyErrorMessage(error, "Failed to claim prize"));
      setIsClaiming(false);
    }
  }, [error]);

  return {
    claimPrize,
    isClaiming: isClaiming || isPending || isConfirming,
    canClaim,
    prizeAmount,
    txHash: hash,
    isSuccess,
    error,
    isLoading: isLoadingPrize || isLoadingClaimed || isLoadingFinalized,
  };
}


