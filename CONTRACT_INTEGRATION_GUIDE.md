# Contract Integration Guide - Frontend & Smart Contracts

## Important: Commit Hash Format Update

The commit hash computation has been updated to use the **tournament contract address** instead of the tournament ID.

### Frontend Changes Required

When calling `computeCommitHash()`, you must now pass:
- `playerAddress` - Player's wallet address
- `tournamentAddress` - Tournament contract address (not the route ID)
- `secret` - Generated secret
- `score` - Player's score

### Example Usage

```typescript
import { computeCommitHash, generateSecret } from "@/lib/commit-reveal"

// Get tournament contract address (from contract or props)
const tournamentAddress = "0x..." // Tournament contract address

// Generate secret and compute hash
const secret = generateSecret()
const score = 100
const commitHash = computeCommitHash(
  playerAddress,
  tournamentAddress as `0x${string}`,
  secret,
  score
)
```

### Storage Key Update

Local storage now uses the tournament contract address as the key:
- Old: `commit_${tournamentId}` (e.g., "commit_1")
- New: `commit_${tournamentAddress.toLowerCase()}` (e.g., "commit_0x1234...")

## Contract Addresses

After deploying contracts, update your frontend `.env`:

```env
NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
```

## Integration Flow

### 1. Create Tournament
```typescript
// Frontend calls factory.createTournament()
// Receives tournament contract address
// Store address for later use
```

### 2. Join Tournament
```typescript
// Use tournament contract address (not route ID)
const commitHash = computeCommitHash(
  playerAddress,
  tournamentAddress, // Contract address!
  secret,
  score
)

// Call tournament.join(commitHash)
```

### 3. Reveal Score
```typescript
// Retrieve stored commit data using tournament address
const commitData = getCommitData(tournamentAddress)

// Call tournament.reveal(secret, score)
```

## Migration Notes

If you have existing commit data stored with tournament IDs, you'll need to:
1. Migrate to use contract addresses
2. Or clear old data and re-join tournaments

