/**
 * Hook for revealing score in a tournament
 */

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { tournamentABI } from "@/lib/contracts/instances";
import { getFriendlyErrorMessage } from "@/lib/errors";

export interface RevealScoreParams {
  tournamentAddress: `0x${string}`;
  secret: string;
  score: bigint;
}

export function useRevealScore() {
  const [isRevealing, setIsRevealing] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const revealScore = async (params: RevealScoreParams) => {
    setIsRevealing(true);
    setTxHash(undefined);

    try {
      // Pre-validate: Check if user is a player
      if (address && publicClient) {
        try {
          const isPlayer = await publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "isPlayer",
            args: [address],
          }) as boolean;

          if (!isPlayer) {
            toast.error("You are not a player in this tournament. Please join the tournament first.");
            setIsRevealing(false);
            return;
          }

          // Check if already revealed
          const hasRevealed = await publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "hasRevealed",
            args: [address],
          }) as boolean;

          if (hasRevealed) {
            toast.error("You have already revealed your score for this tournament.");
            setIsRevealing(false);
            return;
          }
        } catch (validationError) {
          console.warn("Could not validate player status:", validationError);
          // Continue anyway, let the contract revert with a clearer message
        }

        // Simulate the transaction first to catch errors early
        try {
          await publicClient.simulateContract({
            account: address,
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "reveal",
            args: [params.secret, params.score],
          });
        } catch (simulateError) {
          const errorMsg = getFriendlyErrorMessage(simulateError, "Cannot reveal score");
          toast.error(errorMsg);
          setIsRevealing(false);
          return;
        }
      }

      toast.info("Submitting reveal transaction...");

      // Submit the transaction
      const hash = await writeContractAsync({
        address: params.tournamentAddress,
        abi: tournamentABI,
        functionName: "reveal",
        args: [params.secret, params.score],
      });

      if (!hash) {
        toast.error("Failed to submit reveal transaction. Please try again.");
        setIsRevealing(false);
        return;
      }

      setTxHash(hash);
      toast.success("Reveal transaction submitted! Waiting for confirmation...");
    } catch (err) {
      console.error("Error revealing score:", err);
      const errorMsg = getFriendlyErrorMessage(err, "Failed to reveal score");
      toast.error(errorMsg);
      setIsRevealing(false);
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Score revealed successfully!");
      setIsRevealing(false);
    }
  }, [isSuccess]);

  return {
    revealScore,
    isRevealing: isRevealing || isConfirming,
    txHash,
    isSuccess,
  };
}

