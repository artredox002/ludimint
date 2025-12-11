/**
 * Contract Configuration
 * Centralized configuration for all smart contract addresses and settings
 */

// Network Configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "42220"),
  RPC_URL: process.env.NEXT_PUBLIC_CELO_RPC_URL || "https://forno.celo.org",
  EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://celoscan.io",
} as const;

export const CONTRACT_ADDRESSES = {
  TOURNAMENT_FACTORY: (process.env.NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS ||
    "0x69558333ec07c9d3a83726d70ee710adf07b2ca2") as `0x${string}`,
  REPUTATION_NFT: (process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS ||
    "0x62f483e33d392d30c01712a4bab67350e764d984") as `0x${string}`,
} as const;

// Known stable token addresses per network.
const DEFAULT_TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  "42220": "0x765de816845861e75a25fca122bb6898b8b1282a", // Mainnet cUSD
  "44787": "0x874069fa1eb16d44d622f2e0ca25eea172369bc1", // Alfajores cUSD
  "11142220": "0x874069fa1eb16d44d622f2e0ca25eea172369bc1", // Sepolia (no official cUSD, using Alfajores address)
};

const resolvedTokenAddress =
  (process.env.NEXT_PUBLIC_CUSD_ADDRESS as `0x${string}` | undefined) ??
  DEFAULT_TOKEN_ADDRESSES[NETWORK_CONFIG.CHAIN_ID.toString()];

if (!resolvedTokenAddress) {
  throw new Error(
    `NEXT_PUBLIC_CUSD_ADDRESS is required for chain ${NETWORK_CONFIG.CHAIN_ID}. ` +
      "Set it to the ERC20 token address you want tournaments to use.",
  );
}

if (!/^0x[0-9a-fA-F]{40}$/.test(resolvedTokenAddress)) {
  throw new Error("CUSD_ADDRESS must be a valid hex address");
}

export const CUSD_ADDRESS = resolvedTokenAddress as `0x${string}`;

// Validate addresses
if (!CONTRACT_ADDRESSES.TOURNAMENT_FACTORY.startsWith("0x")) {
  throw new Error("Invalid TOURNAMENT_FACTORY_ADDRESS");
}

if (!CONTRACT_ADDRESSES.REPUTATION_NFT.startsWith("0x")) {
  throw new Error("Invalid REPUTATION_NFT_ADDRESS");
}

if (!CUSD_ADDRESS.startsWith("0x")) {
  throw new Error("Invalid CUSD_ADDRESS");
}


