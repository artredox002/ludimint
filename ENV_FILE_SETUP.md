# Environment Variables Setup - Celo Mainnet

## Copy-Paste Ready .env File

Create a `.env` file in your `apps/web` directory (or root directory) with these values:

```env
# LUDIMINT - Celo Mainnet Configuration

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_EXPLORER_URL=https://celoscan.io

# Smart Contract Addresses (Celo Mainnet)
NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x69558333ec07c9d3a83726d70ee710adf07b2ca2
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x62f483e33d392d30c01712a4bab67350e764d984

# Stablecoin Token Addresses (Celo Mainnet)
NEXT_PUBLIC_CUSD_ADDRESS=0x765de816845861e75a25fca122bb6898b8b1282a
```

---

## Quick Copy-Paste (No Comments)

```env
NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo.org
NEXT_PUBLIC_EXPLORER_URL=https://celoscan.io
NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x69558333ec07c9d3a83726d70ee710adf07b2ca2
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x62f483e33d392d30c01712a4bab67350e764d984
NEXT_PUBLIC_CUSD_ADDRESS=0x765de816845861e75a25fca122bb6898b8b1282a
```

---

## Environment Variable Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CHAIN_ID` | `42220` | Celo Mainnet Chain ID |
| `NEXT_PUBLIC_CELO_RPC_URL` | `https://forno.celo.org` | Celo RPC endpoint |
| `NEXT_PUBLIC_EXPLORER_URL` | `https://celoscan.io` | Block explorer URL |
| `NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS` | `0x69558333ec07c9d3a83726d70ee710adf07b2ca2` | TournamentFactory contract |
| `NEXT_PUBLIC_REPUTATION_NFT_ADDRESS` | `0x62f483e33d392d30c01712a4bab67350e764d984` | ReputationNFT contract |
| `NEXT_PUBLIC_CUSD_ADDRESS` | `0x765de816845861e75a25fca122bb6898b8b1282a` | cUSD token address |

---

## Additional Stablecoin Addresses (Optional)

If you want to support other stablecoins, you can add:

```env
# USDC (USD Coin)
NEXT_PUBLIC_USDC_ADDRESS=0xcebA9300f2b948710d2653dD7B07f33A8B32118C

# USDT (Tether)
NEXT_PUBLIC_USDT_ADDRESS=0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e
```

---

## Setup Instructions

1. **Navigate to your web app directory:**
   ```bash
   cd apps/web
   ```

2. **Create or edit `.env.local` file:**
   ```bash
   nano .env.local
   # or
   code .env.local
   ```

3. **Paste the environment variables above**

4. **Save the file**

5. **Restart your development server:**
   ```bash
   pnpm dev
   ```

---

## Verification

After setting up, verify the addresses are loaded correctly by checking:
- The app connects to Celo mainnet (Chain ID 42220)
- Contracts are accessible
- Token balances display correctly

---

*Note: Make sure `.env.local` is in your `.gitignore` file to avoid committing sensitive information.*

