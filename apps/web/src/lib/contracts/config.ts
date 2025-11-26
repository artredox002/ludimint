/**
 * Contract Configuration
 * Centralized configuration for all smart contract addresses and settings
 */

// Network Configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11142220"),
  RPC_URL: process.env.NEXT_PUBLIC_CELO_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org",
  EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://celo-sepolia.blockscout.com",
} as const;

export const CONTRACT_ADDRESSES = {
  TOURNAMENT_FACTORY: (process.env.NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS ||
    "0x9efd2c4c69c9d05b2877164975823a5161f77698") as `0x${string}`,
  REPUTATION_NFT: (process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS ||
    "0x188d4d257a28839449e8a2fae6ba42e2f8a41196") as `0x${string}`,
} as const;

// Known stable token addresses per network.
// For Celo Sepolia (11142220) there is no official cUSD yet, so an explicit env var is required.
const DEFAULT_TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  "42220": "0x765de816845861e75a25fca122bb6898b8b1282a", // Mainnet cUSD
  "44787": "0x874069fa1eb16d44d622f2e0ca25eea172369bc1", // Alfajores cUSD
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


