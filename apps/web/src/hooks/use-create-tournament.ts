/**
 * Hook for creating a new tournament
 * Calls TournamentFactory.createTournament()
 */

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import { toast } from "sonner";
import { tournamentFactoryABI } from "@/lib/contracts/instances";
import { CONTRACT_ADDRESSES, CUSD_ADDRESS } from "@/lib/contracts/config";
import { getFriendlyErrorMessage } from "@/lib/errors";

export interface CreateTournamentParams {
  entryFee: string; // In token units (e.g., "2.5" for 2.5 cUSD)
  maxPlayers: number;
  topK: number;
  commitDurationSeconds: number; // Duration in seconds
  revealDurationSeconds: number; // Duration in seconds
  tokenAddress?: `0x${string}`; // Optional, defaults to cUSD
}

export function useCreateTournament() {
  const [isCreating, setIsCreating] = useState(false);
  const [tournamentAddress, setTournamentAddress] = useState<`0x${string}` | null>(null);
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createTournament = async (params: CreateTournamentParams) => {
    if (!publicClient) {
      toast.error("Wallet not connected");
      return null;
    }

    setIsCreating(true);
    setTournamentAddress(null);

    try {
      const token = params.tokenAddress || CUSD_ADDRESS;
      const entryFeeWei = parseEther(params.entryFee);

      // Ensure the token address points to contract code on this chain.
      try {
        const tokenBytecode = await publicClient.getBytecode({ address: token });
        if (!tokenBytecode || tokenBytecode === "0x") {
          toast.error("Token address has no contract deployed on this network. Please provide a valid ERC20.");
          setIsCreating(false);
          return null;
        }
      } catch (bytecodeError) {
        console.error("Could not verify token contract bytecode:", bytecodeError);
        toast.error("Unable to verify token contract on this network. Please try again.");
        setIsCreating(false);
        return null;
      }

      // Validate parameters
      if (params.maxPlayers < 2) {
        toast.error("Maximum players must be at least 2");
        setIsCreating(false);
        return null;
      }

      if (params.topK < 1 || params.topK > params.maxPlayers) {
        toast.error("Top K must be between 1 and max players");
        setIsCreating(false);
        return null;
      }

      if (params.commitDurationSeconds < 3600) {
        toast.error("Commit duration must be at least 1 hour");
        setIsCreating(false);
        return null;
      }

      if (params.revealDurationSeconds < 3600) {
        toast.error("Reveal duration must be at least 1 hour");
        setIsCreating(false);
        return null;
      }

      // Call createTournament
      writeContract({
        address: CONTRACT_ADDRESSES.TOURNAMENT_FACTORY,
        abi: tournamentFactoryABI,
        functionName: "createTournament",
        args: [
          token,
          entryFeeWei,
          BigInt(params.maxPlayers),
          BigInt(params.topK),
          BigInt(params.commitDurationSeconds),
          BigInt(params.revealDurationSeconds),
        ],
      });
    } catch (err) {
      console.error("Error creating tournament:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to create tournament"));
      setIsCreating(false);
      return null;
    }
  };

  // Watch for transaction success and extract tournament address
  useEffect(() => {
    if (isSuccess && hash && publicClient) {
      publicClient
        .getTransactionReceipt({ hash })
        .then((receipt) => {
          // Decode TournamentCreated event
          // Event signature: TournamentCreated(address indexed creator, address indexed tournament, address indexed token, uint256 entryFee, uint256 maxPlayers, uint256 topK)
          for (const log of receipt.logs) {
            try {
              const decoded = decodeEventLog({
                abi: tournamentFactoryABI,
                data: log.data,
                topics: log.topics,
              });

              if (decoded.eventName === "TournamentCreated") {
                const tournamentAddr = decoded.args.tournament as `0x${string}`;
                setTournamentAddress(tournamentAddr);
                toast.success("Tournament created successfully!");
                setIsCreating(false);
                return;
              }
            } catch {
              // Not the event we're looking for, continue
              continue;
            }
          }

          // If event not found, try fallback
          toast.warning("Tournament created but address not found in event. Please check manually.");
          setIsCreating(false);
        })
        .catch((err) => {
          console.error("Error fetching transaction receipt:", err);
          toast.error("Failed to fetch tournament address");
          setIsCreating(false);
        });
    }
  }, [isSuccess, hash, publicClient]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
      toast.error(getFriendlyErrorMessage(error, "Failed to create tournament"));
      setIsCreating(false);
    }
  }, [error]);

  return {
    createTournament,
    isCreating: isCreating || isPending || isConfirming,
    tournamentAddress,
    txHash: hash,
    isSuccess,
    error,
  };
}

