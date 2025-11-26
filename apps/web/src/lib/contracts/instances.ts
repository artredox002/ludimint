/**
 * Contract Instance Utilities
 * Helper functions to create contract instances using wagmi/viem
 */

import { getContract } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESSES } from "./config";
import TournamentFactoryABI from "./abis/TournamentFactory.json";
import TournamentABI from "./abis/Tournament.json";
import ReputationNFTABI from "./abis/ReputationNFT.json";
import { useMemo } from "react";

// Type-safe ABI exports
export const tournamentFactoryABI = TournamentFactoryABI.abi as const;
export const tournamentABI = TournamentABI.abi as const;
export const reputationNFTABI = ReputationNFTABI.abi as const;

export const erc20ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * Get TournamentFactory contract instance
 */
export function useTournamentFactoryContract() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient) return null;

    return getContract({
      address: CONTRACT_ADDRESSES.TOURNAMENT_FACTORY,
      abi: tournamentFactoryABI,
      client: {
        public: publicClient,
        wallet: walletClient || undefined,
      },
    });
  }, [publicClient, walletClient]);
}

/**
 * Get Tournament contract instance
 */
export function useTournamentContract(address: `0x${string}`) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient || !address) return null;

    return getContract({
      address,
      abi: tournamentABI,
      client: {
        public: publicClient,
        wallet: walletClient || undefined,
      },
    });
  }, [address, publicClient, walletClient]);
}

/**
 * Get ReputationNFT contract instance
 */
export function useReputationNFTContract() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient) return null;

    return getContract({
      address: CONTRACT_ADDRESSES.REPUTATION_NFT,
      abi: reputationNFTABI,
      client: {
        public: publicClient,
        wallet: walletClient || undefined,
      },
    });
  }, [publicClient, walletClient]);
}

/**
 * Get ERC20 contract instance (for token operations)
 */
export function useERC20Contract(tokenAddress: `0x${string}`) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMemo(() => {
    if (!publicClient || !tokenAddress) return null;

    return getContract({
      address: tokenAddress,
      abi: erc20ABI,
      client: {
        public: publicClient,
        wallet: walletClient || undefined,
      },
    });
  }, [tokenAddress, publicClient, walletClient]);
}


