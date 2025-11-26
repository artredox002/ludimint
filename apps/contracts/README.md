# LUDIMINT Smart Contracts

Production-ready smart contracts for the LUDIMINT micro-tournament platform on Celo.

## Contracts

### 1. TournamentFactory
Factory contract for creating and managing Tournament instances.

**Key Features:**
- Creates new tournament instances
- Maintains index of all tournaments
- Configurable limits (min entry fee, max players, min durations)
- Owner-controlled parameters

### 2. Tournament
Core tournament contract implementing commit-reveal pattern.

**Key Features:**
- Commit-reveal pattern for fair score submission
- Time-window enforcement (commit phase, reveal phase)
- Top-K winner selection
- Pull pattern for prize claims (gas optimization)
- Emergency withdraw (owner-only, with timelock)

**Lifecycle:**
1. **Open/Commit Phase**: Players join by submitting commit hash + entry fee
2. **Reveal Phase**: Players reveal secret and score
3. **Finalized**: Winners determined, prizes can be claimed

### 3. ReputationNFT
ERC-721 contract for minting reputation badges to winners.

**Key Features:**
- Mint badges to tournament winners
- Batch minting support
- IPFS metadata support
- Prevents duplicate badges per tournament

## Security Features

✅ **Reentrancy Protection**: All external calls protected with `nonReentrant`
✅ **Access Control**: Owner-only functions with proper checks
✅ **Input Validation**: All parameters validated
✅ **Safe Token Transfers**: Uses OpenZeppelin's SafeERC20
✅ **Commit-Reveal Security**: Prevents cheating and replay attacks
✅ **Time Window Enforcement**: Strict phase boundaries
✅ **Gas Optimization**: Efficient data structures and pull patterns

## Installation

```bash
cd apps/contracts
pnpm install
```

## Compilation

```bash
pnpm run compile
```

## Testing

```bash
pnpm test
```

## Deployment

### Deploy to Alfajores Testnet

1. Set environment variables:
```bash
export PRIVATE_KEY=your_private_key
export CELOSCAN_API_KEY=your_api_key
```

2. Deploy:
```bash
pnpm run deploy:alfajores
```

### Deploy to Celo Mainnet

```bash
pnpm run deploy:celo
```

## Contract Addresses

After deployment, update these in your frontend `.env`:
- `NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS`
- `NEXT_PUBLIC_REPUTATION_NFT_ADDRESS`

## Usage

### Creating a Tournament

```solidity
factory.createTournament(
    tokenAddress,      // ERC20 token for entry fees
    entryFee,          // Entry fee amount
    maxPlayers,        // Maximum players (2-200)
    topK,              // Number of winners (1-maxPlayers)
    commitDuration,    // Commit phase duration (seconds)
    revealDuration     // Reveal phase duration (seconds)
);
```

### Joining a Tournament

1. Generate commit hash offchain: `keccak256(abi.encodePacked(playerAddress, tournamentId, secret, score))`
2. Approve token spending
3. Call `tournament.join(commitHash)`

### Revealing Score

1. Wait for reveal phase
2. Call `tournament.reveal(secret, score)`
3. Contract verifies commit hash matches

### Finalizing Tournament

1. Wait for reveal phase to end
2. Anyone can call `tournament.finalize()`
3. Winners are determined and prize amounts calculated

### Claiming Prize

1. Winners call `tournament.claimPrize()`
2. Prize is transferred to winner
3. Badge can be minted (optional)

## Commit-Reveal Pattern

The commit-reveal pattern ensures fair play:

1. **Commit**: Player generates secret locally, computes hash of (address, tournamentId, secret, score), submits hash
2. **Reveal**: Player reveals secret and score, contract verifies hash matches
3. **Security**: Secret never exposed until reveal, prevents cheating

Hash format: `keccak256(abi.encodePacked(playerAddress, tournamentId, secret, score))`

## Gas Optimization

- **Pull Pattern**: Winners claim prizes instead of contract pushing (saves gas)
- **EnumerableSet**: Efficient player tracking
- **Events**: Offchain indexing instead of onchain storage
- **Bounded Loops**: Maximum player limits prevent DoS

## Security Considerations

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for detailed security analysis.

## License

MIT
