/**
 * Hook for finalizing a tournament
 */

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { tournamentABI } from "@/lib/contracts/instances";
import { getFriendlyErrorMessage } from "@/lib/errors";

export function useFinalizeTournament(tournamentAddress: `0x${string}` | undefined) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const finalize = async () => {
    if (!tournamentAddress) {
      toast.error("Tournament address not provided");
      return;
    }

    setIsFinalizing(true);

    try {
      writeContract({
        address: tournamentAddress,
        abi: tournamentABI,
        functionName: "finalize",
        args: [],
      });
    } catch (err) {
      console.error("Error finalizing tournament:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to finalize tournament"));
      setIsFinalizing(false);
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Tournament finalized successfully!");
      setIsFinalizing(false);
    }
  }, [isSuccess]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Finalize tournament error:", error);
      toast.error(getFriendlyErrorMessage(error, "Failed to finalize tournament"));
      setIsFinalizing(false);
    }
  }, [error]);

  return {
    finalize,
    isFinalizing: isFinalizing || isPending || isConfirming,
    txHash: hash,
    isSuccess,
    error,
  };
}

