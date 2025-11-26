# 🚀 LUDIMINT - Complete Frontend-Contract Integration Plan

**Status**: Ready for Implementation  
**Date**: November 25, 2025  
**Network**: Celo Sepolia Testnet

---

## 📋 Executive Summary

This document outlines the complete integration plan to connect the LUDIMINT frontend with deployed smart contracts. All mock data will be replaced with real onchain interactions, ensuring a fully functional, production-ready application.

### Deployed Contracts
- **TournamentFactory**: `0x9efd2c4c69c9d05b2877164975823a5161f77698`
- **ReputationNFT**: `0x188d4d257a28839449e8a2fae6ba42e2f8a41196`

### Current State
- ✅ Contracts deployed and tested (26/26 tests passing)
- ✅ Frontend UI completed
- ❌ **No contract integration** - all data is mocked
- ❌ **No ABIs imported**
- ❌ **No real transactions**

---

## 🎯 Integration Goals

1. **Zero Mock Data**: All tournament data from onchain contracts
2. **Real Transactions**: All actions (create, join, reveal, claim) use real contract calls
3. **Error Handling**: Comprehensive error handling for all contract interactions
4. **Loading States**: Proper loading states during contract calls
5. **Event Listening**: Real-time updates via contract events
6. **Type Safety**: Full TypeScript types from contract ABIs

---

## 📦 Phase 1: Foundation Setup

### 1.1 Contract ABIs & Types
**Priority**: CRITICAL  
**Files to Create**:
- `apps/web/src/lib/contracts/abis/TournamentFactory.json`
- `apps/web/src/lib/contracts/abis/Tournament.json`
- `apps/web/src/lib/contracts/abis/ReputationNFT.json`
- `apps/web/src/lib/contracts/abis/ERC20.json`

**Actions**:
1. Copy ABIs from `apps/contracts/artifacts/contracts/`
2. Create TypeScript types using `viem` or manual types
3. Export contract addresses from environment variables

### 1.2 Contract Configuration
**File**: `apps/web/src/lib/contracts/config.ts`

**Content**:
```typescript
export const CONTRACT_ADDRESSES = {
  TOURNAMENT_FACTORY: process.env.NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS as `0x${string}`,
  REPUTATION_NFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS as `0x${string}`,
} as const

// ERC20 Token Address (cUSD on Celo Sepolia)
export const CUSD_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a" as `0x${string}`
```

### 1.3 Contract Instance Utilities
**File**: `apps/web/src/lib/contracts/instances.ts`

**Purpose**: Create reusable contract instances using wagmi/viem

---

## 🔧 Phase 2: Core Contract Interactions

### 2.1 TournamentFactory Integration

#### 2.1.1 Create Tournament Hook
**File**: `apps/web/src/hooks/use-create-tournament.ts`

**Functionality**:
- Call `createTournament()` on TournamentFactory
- Handle transaction approval for token (if needed)
- Listen for `TournamentCreated` event
- Return tournament address on success
- Error handling for all failure cases

**Parameters**:
- `token`: ERC20 token address (cUSD)
- `entryFee`: Entry fee in token units (wei)
- `maxPlayers`: Maximum players
- `topK`: Number of winners
- `commitDurationSeconds`: Commit phase duration
- `revealDurationSeconds`: Reveal phase duration

#### 2.1.2 Fetch All Tournaments Hook
**File**: `apps/web/src/hooks/use-tournaments.ts`

**Functionality**:
- Call `getTournaments()` on TournamentFactory
- Fetch tournament details for each address
- Return array of tournament data
- Real-time updates via events

### 2.2 Tournament Contract Integration

#### 2.2.1 Tournament Data Hook
**File**: `apps/web/src/hooks/use-tournament.ts`

**Functionality**:
- Read all tournament state:
  - `token()`, `entryFee()`, `maxPlayers()`, `topK()`
  - `commitEndTime()`, `revealEndTime()`
  - `finalized()`, `prizePool()`
  - `getPlayers()`, `getPlayerCount()`
  - `getStatus()` for phase
- Real-time updates
- Error handling

#### 2.2.2 Join Tournament Hook
**File**: `apps/web/src/hooks/use-join-tournament.ts`

**Functionality**:
1. Check user balance
2. Approve token spending (if needed)
3. Call `join(commitHash)` on Tournament contract
4. Handle `PlayerJoined` event
5. Error handling for:
   - Insufficient balance
   - Tournament full
   - Already joined
   - Commit phase ended

**Critical**: Must use correct commit hash format:
```typescript
keccak256(abi.encodePacked(
  playerAddress,
  uint256(uint160(tournamentAddress)),
  secret,
  score
))
```

#### 2.2.3 Reveal Score Hook
**File**: `apps/web/src/hooks/use-reveal-score.ts`

**Functionality**:
1. Verify commit hash locally first
2. Call `reveal(secret, score)` on Tournament contract
3. Handle `PlayerRevealed` event
4. Error handling for:
   - Not a player
   - Already revealed
   - Commit mismatch
   - Reveal phase ended

#### 2.2.4 Finalize Tournament Hook
**File**: `apps/web/src/hooks/use-finalize-tournament.ts`

**Functionality**:
- Call `finalize()` on Tournament contract
- Handle `TournamentFinalized` event
- Fetch winners and prize amounts
- Error handling

#### 2.2.5 Claim Prize Hook
**File**: `apps/web/src/hooks/use-claim-prize.ts`

**Functionality**:
- Call `claimPrize()` on Tournament contract
- Handle `PrizeClaimed` event
- Check if user is winner
- Error handling for:
   - Not a winner
   - Already claimed
   - Not finalized

### 2.3 ReputationNFT Integration

#### 2.3.1 Fetch User Badges Hook
**File**: `apps/web/src/hooks/use-user-badges.ts`

**Functionality**:
- Query NFT balance for user
- Fetch token URIs
- Get tournament associations
- Display badge metadata

---

## 🎨 Phase 3: Frontend Integration

### 3.1 Create Tournament Page
**File**: `apps/web/src/app/create/page.tsx`

**Changes Required**:
1. ✅ Remove mock submission
2. ✅ Use `useCreateTournament` hook
3. ✅ Convert form data to contract parameters:
   - Entry fee: convert to wei (parseEther)
   - Durations: convert to seconds
   - Token: use CUSD_ADDRESS
4. ✅ Show transaction status
5. ✅ Redirect to new tournament on success
6. ✅ Error handling UI

**Form Fields Mapping**:
- `name` → (metadata, not onchain)
- `entryFee` → `entryFee` (in wei)
- `maxPlayers` → `maxPlayers`
- `startTime` → Calculate `commitDurationSeconds` and `revealDurationSeconds`
- Default `topK` → `Math.floor(maxPlayers * 0.1)` or user input

### 3.2 Tournaments List Page
**File**: `apps/web/src/app/tournaments/page.tsx`

**Changes Required**:
1. ✅ Remove mock `TOURNAMENTS` array
2. ✅ Use `useTournaments` hook
3. ✅ Fetch tournament data for each address
4. ✅ Display real tournament status
5. ✅ Loading states
6. ✅ Empty state when no tournaments

**Data Structure**:
```typescript
interface Tournament {
  address: `0x${string}`
  entryFee: bigint
  maxPlayers: bigint
  topK: bigint
  commitEndTime: bigint
  revealEndTime: bigint
  finalized: boolean
  prizePool: bigint
  playerCount: bigint
  // ... other fields
}
```

### 3.3 Tournament Detail Page
**File**: `apps/web/src/app/tournaments/[id]/page.tsx`

**Changes Required**:
1. ✅ Remove mock tournament data
2. ✅ Use `useTournament` hook with tournament address
3. ✅ Check if user has joined (check `commits[address]`)
4. ✅ Display real player count, prize pool
5. ✅ Real phase calculation from contract
6. ✅ Real top players from contract (after reveal)
7. ✅ Conditional actions based on real state

**Critical Fixes**:
- Tournament ID should be contract address, not number
- Fetch all data from contract
- Check user's join status onchain

### 3.4 Play Page
**File**: `apps/web/src/app/tournaments/[id]/play/page.tsx`

**Changes Required**:
1. ✅ Remove mock transaction simulation
2. ✅ Use `useJoinTournament` hook
3. ✅ Fix commit hash computation:
   - Use tournament **address** (not ID number)
   - Match contract format exactly
4. ✅ Handle token approval flow
5. ✅ Real transaction submission
6. ✅ Store commit data with tournament address

**Critical**: Commit hash must match contract:
```solidity
keccak256(abi.encodePacked(
  msg.sender,
  uint256(uint160(address(this))),
  secret,
  score
))
```

Frontend equivalent:
```typescript
keccak256(encodePacked(
  ['address', 'uint256', 'string', 'uint256'],
  [playerAddress, BigInt(tournamentAddress), secret, score]
))
```

### 3.5 Reveal Page
**File**: `apps/web/src/app/tournaments/[id]/reveal/page.tsx`

**Changes Required**:
1. ✅ Remove mock transaction simulation
2. ✅ Use `useRevealScore` hook
3. ✅ Fix commit verification:
   - Use tournament address (not ID)
   - Match contract format
4. ✅ Real transaction submission
5. ✅ Error handling for commit mismatch

### 3.6 Leaderboard Page
**File**: `apps/web/src/app/tournaments/[id]/leaderboard/page.tsx`

**Changes Required**:
1. ✅ Fetch winners from contract (`winners[]` array)
2. ✅ Fetch scores from contract (`scores[address]`)
3. ✅ Display real leaderboard
4. ✅ Show prize amounts (`prizeAmounts[address]`)
5. ✅ Show claim status (`prizeClaimed[address]`)

### 3.7 Claim Prize Component
**File**: `apps/web/src/components/claim-prize-button.tsx`

**Changes Required**:
1. ✅ Remove mock simulation
2. ✅ Use `useClaimPrize` hook
3. ✅ Check if user is winner
4. ✅ Check if already claimed
5. ✅ Real transaction
6. ✅ Optional: Mint ReputationNFT after claim

### 3.8 Profile Page
**File**: `apps/web/src/app/profile/page.tsx`

**Changes Required**:
1. ✅ Fetch user badges from ReputationNFT
2. ✅ Display tournament history
3. ✅ Show claimable prizes
4. ✅ Real balance display

---

## 🔐 Phase 4: Security & Validation

### 4.1 Commit Hash Verification
**Critical**: Ensure frontend and contract use identical hash computation.

**Contract**:
```solidity
bytes32 computedHash = keccak256(
    abi.encodePacked(msg.sender, uint256(uint160(address(this))), secret, score)
);
```

**Frontend** (must match):
```typescript
const tournamentId = BigInt(tournamentAddress) // uint256(uint160(address))
const packed = encodePacked(
  ['address', 'uint256', 'string', 'uint256'],
  [playerAddress, tournamentId, secret, score]
)
const commitHash = keccak256(packed)
```

### 4.2 Input Validation
- Entry fee: Must be >= minEntryFee from factory
- Max players: Must be >= 2 and <= maxPlayersPerTournament
- Durations: Must be >= minCommitDuration and minRevealDuration
- TopK: Must be > 0 and <= maxPlayers

### 4.3 Error Handling
All contract calls must handle:
- User rejection
- Insufficient balance
- Transaction failures
- Network errors
- Contract revert reasons

---

## 📊 Phase 5: Data Fetching & Caching

### 5.1 Tournament List Caching
- Cache tournament list
- Refresh on new tournament creation
- Listen to `TournamentCreated` events

### 5.2 Tournament Data Caching
- Cache individual tournament data
- Refresh on state changes
- Listen to events: `PlayerJoined`, `PlayerRevealed`, `TournamentFinalized`

### 5.3 Real-time Updates
Use wagmi's `useWatchContractEvent` or similar to:
- Update tournament list on new tournaments
- Update player count on joins
- Update scores on reveals
- Update winners on finalization

---

## 🧪 Phase 6: Testing & Validation

### 6.1 Integration Testing Checklist
- [ ] Create tournament → Verify onchain
- [ ] Join tournament → Verify commit stored
- [ ] Reveal score → Verify score recorded
- [ ] Finalize tournament → Verify winners
- [ ] Claim prize → Verify transfer
- [ ] Check badge minting (if implemented)

### 6.2 Edge Cases
- [ ] Tournament full
- [ ] Commit phase ended
- [ ] Reveal phase ended
- [ ] Already joined
- [ ] Already revealed
- [ ] Not a winner trying to claim
- [ ] Insufficient balance

### 6.3 Error Scenarios
- [ ] Network disconnection
- [ ] Transaction rejection
- [ ] Contract revert
- [ ] Invalid parameters

---

## 📝 Phase 7: Documentation & Cleanup

### 7.1 Code Documentation
- JSDoc comments for all hooks
- Inline comments for complex logic
- README updates

### 7.2 Environment Variables
Ensure `.env.local` has:
```env
NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x9efd2c4c69c9d05b2877164975823a5161f77698
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x188d4d257a28839449e8a2fae6ba42e2f8a41196
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
NEXT_PUBLIC_EXPLORER_URL=https://celo-sepolia.blockscout.com
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_CUSD_ADDRESS=0x765de816845861e75a25fca122bb6898b8b1282a
```

### 7.3 Remove All Mock Data
- Search for "mock", "simulate", "TODO", "FIXME"
- Remove all hardcoded tournament data
- Remove all simulated transactions

---

## 🚀 Implementation Order

### Step 1: Foundation (Day 1)
1. Copy contract ABIs
2. Create contract config
3. Create contract instance utilities
4. Set up environment variables

### Step 2: Core Hooks (Day 1-2)
1. `useCreateTournament`
2. `useTournaments`
3. `useTournament`
4. `useJoinTournament`
5. `useRevealScore`
6. `useFinalizeTournament`
7. `useClaimPrize`

### Step 3: Frontend Integration (Day 2-3)
1. Create Tournament page
2. Tournaments list page
3. Tournament detail page
4. Play page
5. Reveal page
6. Leaderboard page
7. Claim prize component

### Step 4: Testing & Polish (Day 3-4)
1. End-to-end testing
2. Error handling
3. Loading states
4. Real-time updates
5. Documentation

---

## ⚠️ Critical Issues to Fix

### Issue 1: Tournament ID vs Address
**Problem**: Frontend uses numeric IDs, contracts use addresses  
**Solution**: Use tournament contract address as ID throughout

### Issue 2: Commit Hash Mismatch
**Problem**: Frontend may use wrong format  
**Solution**: Ensure exact match with contract computation

### Issue 3: Mock Data Everywhere
**Problem**: All data is mocked  
**Solution**: Replace with contract calls

### Issue 4: No Error Handling
**Problem**: No proper error handling  
**Solution**: Add comprehensive error handling

### Issue 5: No Loading States
**Problem**: No feedback during transactions  
**Solution**: Add proper loading states

---

## ✅ Success Criteria

1. ✅ Zero mock data in production code
2. ✅ All transactions are real onchain calls
3. ✅ All data fetched from contracts
4. ✅ Proper error handling throughout
5. ✅ Loading states for all async operations
6. ✅ Real-time updates via events
7. ✅ Full TypeScript type safety
8. ✅ All edge cases handled
9. ✅ End-to-end flow works on testnet
10. ✅ Code is production-ready

---

## 📚 Resources

- Contract ABIs: `apps/contracts/artifacts/contracts/`
- Contract Addresses: `apps/contracts/deployments.sepolia.json`
- Wagmi Docs: https://wagmi.sh
- Viem Docs: https://viem.sh
- Contract Source: `apps/contracts/contracts/`

---

**Next Step**: Begin Phase 1 - Foundation Setup


