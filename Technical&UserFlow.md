Technical architecture and user flows — LudiMint / SkillStake

Complete, production-ready blueprint for a mobile-first, MiniPay-first, fully decentralised micro-tournament platform. This document covers every technical component, onchain contract design, data flows, UX state machine, dev tooling, deployment and security considerations. Use it as the single source of truth for development and the hackathon demo.

0. Overview (one line)

LudiMint is a mobile Progressive Web App that lets users create and join short skill tournaments, stake tiny stablecoin entry fees using MiniPay, and receive trustless payouts via Solidity contracts on the Celo network. Spectators may create side-pools. Reputation badges are minted as NFTs.

1. High level architecture (components)

Client

React PWA (mobile-first) with optional React Native / Expo wrapper. Theme and components follow the dark LudiMint design system.

Handles gameplay UI, local commit/reveal computation, wallet connection, deeplink flows for MiniPay, transaction status, and video capture for demos.

Blockchain

Celo network (Alfajores testnet for development, Celo mainnet for production).

Solidity contracts: TournamentFactory, Tournament, SidePool, ReputationNFT, TreasuryManager (optional).

Token: cUSD or an ERC20 test stable token.

MiniPay / Wallet layer

MiniPay deeplinks and WalletConnect/Valora/ContractKit integration for signing and sending transactions.

Offchain services (optional, minimal)

Static hosting for frontend (Netlify, Vercel, GitHub Pages, or IPFS).

IPFS for NFT metadata and static game assets.

Optional read API (serverless functions) for efficient leaderboards and aggregated views; must not hold critical logic or secrets.

Tooling

Hardhat (Solidity development), Ethers.js for scripts, TypeChain for types, Prettier, ESLint.

CI/CD: GitHub Actions for tests, build, deploy to Alfajores.

Monitoring: Tenderly or Blockscout links for transactions; Sentry for frontend error tracking.

ASCII summary

[Mobile PWA] <---> [MiniPay / Wallet] <---TX---> [Celo Contracts]
       |                                       ^
       |                                       |
       v                                       |
[IPFS / Static Hosting]                [Block Explorer / Oracles]
       ^
       |
[Optional Read API / Serverless]

2. Smart contract design
2.1 Contracts and responsibilities

TournamentFactory

Deploys and registers Tournament instances. Keeps index of active tournaments. Emits TournamentCreated.

Tournament (core)

Holds entry fees in escrow. Manages lifecycle: Created → Open → CommitPhase → RevealPhase → Finalized → Claimed.

Stores commits, revealed scores, players list, and payout logic. Supports top-K winners. Emits PlayerJoined, PlayerRevealed, TournamentFinalized, PrizeClaimed.

SidePool (optional, per tournament)

Manages spectator stakes (prediction on success), calculates payouts proportional to correct backers.

ReputationNFT

ERC-721-lite to mint badges for winners. Metadata references on IPFS.

TreasuryManager (optional)

Fee splitting, donation or hackathon fee forwarding, admin withdraw in emergencies.

2.2 Key invariants and security rules

Tokens only moved via safeTransferFrom / safeTransfer patterns.

Commit-reveal uses keccak256(abi.encodePacked(secret, score, address(this))) so commits are unique per tournament and cannot be replayed cross-contract.

Time windows enforced with require(block.timestamp <= commitEnd) and require(block.timestamp > commitEnd && block.timestamp <= revealEnd) etc.

Finalization only possible after reveal window. Or allow owner to call finalize to compute winners.

Emergency withdraw only allowed to owner and only after a long timelock; for hackathon set owner to deployer for dispute only.

2.3 Minimal Solidity interfaces / function signatures
interface IERC20 {
  function transferFrom(address from, address to, uint amount) external returns (bool);
  function transfer(address to, uint amount) external returns (bool);
  function balanceOf(address owner) external view returns (uint);
  function approve(address spender, uint amount) external returns (bool);
}

contract TournamentFactory {
  function createTournament(
    address token,
    uint entryFee,
    uint maxPlayers,
    uint commitDurationSeconds,
    uint revealDurationSeconds,
    uint topK
  ) external returns (address);
  function getTournaments() external view returns (address[] memory);
  event TournamentCreated(address indexed creator, address tournament);
}

contract Tournament {
  function join(bytes32 commitHash) external;
  function reveal(string calldata secret, uint score) external;
  function finalize() external;
  function claimPrize() external;
  function getPlayers() external view returns (address[] memory);
  event PlayerJoined(address player, bytes32 commit);
  event PlayerRevealed(address player, uint score);
  event TournamentFinalized(address[] winners, uint[] amounts);
}


Add events for transparency.

2.4 Onchain storage model (per Tournament)

address token

uint entryFee

uint commitEnd

uint revealEnd

address[] players

mapping(address => bytes32) commits

mapping(address => uint) scores

bool finalized

mapping(address => bool) prizeClaimed

3. Commit-reveal pattern (detail)

Commit phase: Player generates secret (random salt) and score after playing. They compute commitHash = keccak256(abi.encodePacked(secret, score)). That commitHash is sent onchain via join(commitHash) together with entry fee. Note: compute commit after play if score deterministic; else allow pre-commit with placeholder then update commit via reveal step. For fairness, instruct players on UI to produce secret locally and keep it safe.

Reveal phase: Player calls reveal(secret, score). Contract recomputes hash and checks equality with stored commit. If match, record score. If not revealed within window, treat player as forfeit.

Anti-cheat: For games where score can be faked, capture game evidence locally, e.g. ephemeral signed session proof or hashed replay data. For hackathon MVP, rely on simple games where client computes score deterministic and commit-reveal is sufficient.

Hash example:

commitHash = keccak256(abi.encodePacked(address(player), tournamentId, secret, score))


Including address and tournamentId prevents commit reuse.

4. MiniPay integration and wallet flows
4.1 Options

MiniPay deeplink: preferred for low friction mobile UX. Use deeplink to open MiniPay and pre-populate payment amount and recipient. For joining tournaments, deeplink triggers transfer of token to the tournament escrow address or to a relay escrow account.

WalletConnect / ContractKit: fallback for users without MiniPay. Use @celo-tools/use-contractkit for web flows.

4.2 Flow for entry fee (user experience)

User clicks Join. UI computes commitHash locally.

App opens MiniPay deeplink with a payment request of entryFee to the Tournament contract address. Include memo with tournamentId and commitHash.

User accepts in MiniPay, transaction is signed and broadcast.

Frontend watches for the transaction receipt and calls join(commitHash) if token transfer used separate from contract call. Alternatively, if contract accepts transferFrom, user must approve the contract first through MiniPay then call join. For simplest UX, set tournament to accept direct token transfer and then call registerJoin to link sender to commit; or use a join call that pulls tokens via transferFrom. Implementation choice documented in README.

4.3 Design decision: two patterns

Pull model (recommended): user approve tournament contract to spend entryFee, then call join(commitHash) which calls transferFrom. Advantage: single contract records commit atomically with token transfer. Downsides: two transactions for approval and join.

Push model: user sends token to contract address and optionally sends a separate join transaction to register commitHash referencing tx hash. This requires more UX and mapping logic. For hackathon, pull model is easier to reason about; use approval via MiniPay deeplink where possible.

5. Frontend architecture and modules
5.1 Core modules

Auth / Wallet: connect, detect network, request test tokens faucet, show balance.

Tournaments: list, create, detail, lifecycle state.

Gameplay: mini-games, commit generation, local evidence capture.

Transactions: tx queue, pending UI, explorer links, retry.

Profile: badges, claims, withdraw.

Admin / Debug: testnet faucet automation, emergency controls.

5.2 Client data handling

Minimal server reliance. Use the chain and optionally a read-only indexing layer (serverless function or The Graph) to speed up list queries. For hackathon, simple onchain scanning via Ethers.js and caching in local storage is fine.

5.3 Folder structure (example)
/frontend
  /src
    /components
    /screens
    /services
      wallet.ts
      contracts.ts
      ipfs.ts
    /games
    /hooks
  /public
  tailwind.config.js
  package.json

/contracts
  Tournament.sol
  TournamentFactory.sol
  ReputationNFT.sol
  SidePool.sol
  migrations
  scripts
  test

6. User flows — detailed state machine and sequences

Below are the main user journeys with step by step states and UI notes.

6.1 Onboarding — first app open

Splash → short brand intro and access to privacy rules.

Connect wallet screen: options MiniPay, WalletConnect, Valora.

If MiniPay selected, open deeplink connect and request permission. On success, return to app with wallet address.

Show testnet faucet button if balance < entry fee. Link to faucet and auto-check after tap.

Show “Ready to Play” CTA.

UI states to show

Connecting, Success (address truncated), Failure with troubleshooting.

6.2 Create tournament

Creator taps Create. Form fields: title, description, entry fee, token, max players, commit duration, reveal duration, game type, topK winners, enable side-pool toggle.

Creator confirms and approves contract to create tournament (factory). This triggers createTournament transaction. UI shows tx pending and explorer link.

On success, show tournament card with share link. Optionally mint initial prize or deposit.

Edge cases

Validate durations, cap max players, ensure entryFee >= minimum.

6.3 Join tournament (player)

Player opens tournament detail. App shows Join if in Open/Commit window. Shows entryFee and balance.

Player taps Join. Frontend runs local game session. On game completion, compute score and generate secret. Compute commitHash = keccak256(address, tournamentId, secret, score).

Call approve on token for entryFee via MiniPay deeplink (if required). After approval, call join(commitHash) contract method in same session. UI shows pending tx and then confirmation PlayerJoined event.

Show player commit state and reveal countdown.

Note

Optionally, allow pre-commit to register before play; but the score must be computed and commit created before reveal.

6.4 Reveal

During Reveal window, user opens tournament and taps Reveal. The UI asks for the secret or reveals automatically from local storage if secret saved.

Call reveal(secret, score) contract method. Contract verifies hash. On success, UI shows PlayerRevealed and their onchain score.

Security

Keep the secret local until reveal. If user loses secret, they forfeit.

6.5 Finalise and payout

After reveal window ends, anyone (or the tournament owner) can call finalize() which computes winners and records payout obligations.

Winners call claimPrize() or contract transfers automatically during finalize depending on gas and design. For gas optimisation let winners pull (claim) to avoid large single tx gas spikes.

On claim, ReputationNFT minted and assigned. UI shows claim status and provides Share CTA.

6.6 Side-pool flow (spectator)

Before tournament starts or during commit window, spectators can open SidePool and stake funds on a challenger’s success.

On finalize, side-pool calculates shares of winners and allows claim. Use simple proportional payout formula.

6.7 Withdraw and profile

Profile shows earned balances; a Withdraw button opens MiniPay deeplink to transfer tokens to external wallet or bank-integration flow. For testnet demo, show simulated withdraw or transfer to another address.

7. Offchain indexer / optional read API

For performance and UI responsiveness:

Implement a serverless read API that listens to contract events and writes to a lightweight DB (DynamoDB, Fauna, or Vercel KV). Index tournaments, players, leaderboards and token balances. This is optional but recommended for a polished demo and to avoid expensive onchain scans.

Endpoints

GET /tournaments listing summary

GET /tournaments/:id full detail with players and reveal status

GET /profiles/:address user badges and history

Security: This API must be read-only and may be hosted as serverless functions in the GitHub repo.

8. Testing strategy
8.1 Smart contract tests (Hardhat)

Unit tests for all functions: join, reveal, finalize, claim, edge time windows, reentrancy checks.

Gas benchmarks to ensure join+reveal+claim are reasonable.

Fuzz tests for invalid reveals, duplicate commits, out-of-window calls.

8.2 Integration tests

Simulate full lifecycle: create tournament → 3 players join → reveals → finalize → claims. Use Hardhat local network or Alfajores fork.

8.3 Frontend tests

Smoke tests for critical flows with Playwright or Cypress: connecting wallet, joining tournament, reveal, claim. Include mobile viewport tests.

9. Deployment, CI/CD and environment
9.1 Deployment flow

Smart contracts: Hardhat deploy script to Alfajores. Use environment variables for deployer private key and Infura/Alchemy if needed. Store deployed addresses in frontend/.env.production.

Frontend build: GitHub Actions build and deploy to Vercel/Netlify. Include a preview environment for demo testing.

9.2 CI pipeline tasks

Lint, run unit tests, compile contracts, run contract tests.

On main merge, run deploy script to Alfajores and update deployments.json artifact.

9.3 Keys and secrets

Never commit private keys. Use GitHub Actions secrets for deployer key. For hackathon demo use ephemeral testnet accounts with minimal funds.

10. Monitoring and observability

Track onchain txs via Blockscout or Etherscan equivalents for Celo.

Use Sentry for frontend errors and Slack webhook for critical deploy failures.

Provide a dashboard (even a simple one) showing active tournaments, pending tx count, and total staked.

11. Security checklist and recommendations

Use OpenZeppelin audited libraries for ERC-20 and ERC-721 functionality.

Use ReentrancyGuard and SafeERC20.

Validate all inputs and guard time windows.

Use pull over push pattern for payouts (winners claim) to avoid heavy single tx.

Reserve an emergency pause in TournamentFactory to halt new tournaments if a critical bug is found. Do not use for fund theft; document in README and limit use.

12. Gas optimisation techniques

Store minimal onchain data: keep heavy metadata offchain on IPFS.

Use uint32 or smaller integer types for durations and indices where possible.

Batch writes where possible; avoid storing arrays that grow unbounded. Use event logs for archival.

Prefer mapping for player lookups rather than iterating over arrays in finalize. Where iteration required, set maxPlayers cap to limit gas.

13. Data privacy and legal considerations

Do not collect PII. Use wallet addresses as identifiers.

In UI and README, state explicitly this is a skill game and not gambling. Avoid betting language.

Provide content explaining responsible use and testnet reminders in demo.

14. File and repo deliverables (what to include in GitHub)

contracts/ with source, migrations and unit tests.

frontend/ with React PWA, scripts for local dev and build.

deploy/ with Hardhat scripts and deployments.json for Alfajores addresses.

README.md with full demo steps, how to obtain test tokens, MiniPay deeplink examples, and a short troubleshooting guide.

demo/ with the 4-minute video, voiceover script and commands used.

.github/workflows/ CI files for test and deploy.

15. Sample UX microcopy and state hints (important for judges)

Transaction pending: "Transaction pending. Waiting for 1 confirmation. Tx #0x..."

Commit saved: "Your score is securely committed onchain. Reveal opens in X minutes."

Reveal success: "Score verified onchain. You placed X out of Y."

Claim success: "Prize sent to your wallet. View tx."

16. Example sequence diagram (textual)

User plays game locally → produces secret and score.

App computes commitHash.

App requests approve(entryFee) via MiniPay or WalletConnect.

User approves → contract allowed to pull tokens.

App calls join(commitHash) and contract calls transferFrom to escrow.

After reveal window, user calls reveal(secret, score).

After reveal window ends, finalize() computes winners.

Winners call claimPrize() which transfers token to winner and optionally mints ReputationNFT.

UI shows final TX links.

17. MVP scope for hackathon

Implement TournamentFactory and Tournament with join, reveal, finalize and claim.

Frontend PWA with MiniPay deeplink approval and join flow, show tx links.

Mint basic ReputationNFT on prize claim.

Provide README and demo video showcasing full lifecycle on Celo Alfajores.

18. Risks and mitigations

Cheating: commit-reveal reduces cheating. Use deterministic games where possible.

High gas: cap players and use claim pattern.

UX friction: MiniPay deeplinks reduce friction; provide WalletConnect fallback and clear instructions.

Name or legal issues: avoid gambling language. For production, consult legal counsel.

19. Next concrete steps I can produce now (pick any and I will generate immediately)

Full Solidity contracts (ready for Hardhat) with unit tests and deployment scripts.

React PWA scaffold with wallet integration and a single playable mini-game (memory or reaction) implementing the full commit/reveal flow.

README, demo script and CI pipeline YAML.

Which deliverable shall I generate first? I recommend starting with the Tournament solidity contracts + unit tests, because once the contracts are ready you can show real onchain interactions in your demo.