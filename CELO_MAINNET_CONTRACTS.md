# LUDIMINT - Celo Mainnet Contract Addresses

## Core Smart Contracts

### TournamentFactory
**Address:** `0x69558333ec07c9d3a83726d70ee710adf07b2ca2`

**Purpose:** Factory contract for creating and managing Tournament instances.

**Explorer Links:**
- CeloScan: https://celoscan.io/address/0x69558333ec07c9d3a83726d70ee710adf07b2ca2
- Blockscout: https://explorer.celo.org/address/0x69558333ec07c9d3a83726d70ee710adf07b2ca2

**Key Functions:**
- Creates new tournament instances
- Maintains index of all tournaments
- Configurable limits (min entry fee, max players, min durations)
- Owner-controlled parameters

---

### ReputationNFT
**Address:** `0x62f483e33d392d30c01712a4bab67350e764d984`

**Purpose:** ERC-721 contract for minting reputation badges to tournament winners.

**Explorer Links:**
- CeloScan: https://celoscan.io/address/0x62f483e33d392d30c01712a4bab67350e764d984
- Blockscout: https://explorer.celo.org/address/0x62f483e33d392d30c01712a4bab67350e764d984

**Key Functions:**
- Mint badges to tournament winners
- Batch minting support
- IPFS metadata support
- Prevents duplicate badges per tournament

**Token Details:**
- Name: LUDIMINT Reputation Badges
- Symbol: LUDI
- Base URI: https://ipfs.io/ipfs/

---

## Stablecoin Token Addresses (Used by Platform)

### cUSD (Celo Dollar)
**Address:** `0x765de816845861e75a25fca122bb6898b8b1282a`

**Purpose:** Primary stablecoin used for tournament entry fees and prizes.

**Explorer Links:**
- CeloScan: https://celoscan.io/address/0x765de816845861e75a25fca122bb6898b8b1282a
- Blockscout: https://explorer.celo.org/address/0x765de816845861e75a25fca122bb6898b8b1282a

---

### USDC (USD Coin)
**Address:** `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`

**Purpose:** Alternative stablecoin supported by the platform.

**Explorer Links:**
- CeloScan: https://celoscan.io/address/0xcebA9300f2b948710d2653dD7B07f33A8B32118C
- Blockscout: https://explorer.celo.org/address/0xcebA9300f2b948710d2653dD7B07f33A8B32118C

---

### USDT (Tether)
**Address:** `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e`

**Purpose:** Alternative stablecoin supported by the platform.

**Explorer Links:**
- CeloScan: https://celoscan.io/address/0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e
- Blockscout: https://explorer.celo.org/address/0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e

---

## Network Information

**Network:** Celo Mainnet  
**Chain ID:** 42220  
**RPC URL:** https://forno.celo.org  
**Explorer:** https://celoscan.io

---

## Important Notes

### Tournament Contracts
- **Tournament contracts are created dynamically** by the TournamentFactory
- Each tournament has its own contract address
- Tournament addresses can be retrieved from the factory's `tournaments` mapping or events
- There is no single Tournament contract address - they are created per tournament instance

### Contract Verification
All contracts are verified on CeloScan and Blockscout. You can view:
- Source code
- ABI
- Read/Write functions
- Transaction history
- Events

### Security
- ✅ Contracts use OpenZeppelin libraries
- ✅ Reentrancy protection implemented
- ✅ Access control with owner-only functions
- ✅ Input validation on all parameters
- ✅ Safe token transfers using SafeERC20

---

## Quick Reference

```typescript
// Contract addresses for frontend configuration
export const CONTRACT_ADDRESSES = {
  TOURNAMENT_FACTORY: "0x69558333ec07c9d3a83726d70ee710adf07b2ca2",
  REPUTATION_NFT: "0x62f483e33d392d30c01712a4bab67350e764d984",
  CUSD: "0x765de816845861e75a25fca122bb6898b8b1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
} as const;
```

---

## Deployment Status

✅ **Production-Ready**
- Smart contracts deployed to Celo mainnet
- Contracts verified on CeloScan
- Fully tested and audited
- Ready for use

---

*Last Updated: Based on current codebase configuration*

