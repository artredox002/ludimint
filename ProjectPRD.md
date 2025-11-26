SkillStake — Product Requirements Document (PRD)
1. Project summary

SkillStake is a mobile-first, fully decentralised micro-tournament platform where users compete in short, skill-based challenges and earn small stablecoin rewards via MiniPay on the Celo network. Spectators can optionally create tiny side-pools to support or back challengers, creating social engagement without promoting gambling. The app emphasises trustless prize distribution, minimal friction for onboarding, and a strong mobile UX that runs as a Progressive Web App or React Native app that integrates with MiniPay deeplinks.

2. Purpose and objectives

Purpose: Deliver a compact, hackathon-ready, fully functional onchain application that demonstrates MiniPay payments, Solidity contract logic for staking and payouts, a mobile-friendly UX, and a clear path to mass adoption.

Primary objectives

Build a working MVP that demonstrates onchain staking, commit-reveal verification for results, and automated prize distribution.

Integrate MiniPay for wallet and payment flows so users can deposit and withdraw stablecoins with minimal friction.

Produce a 4-minute demo video and a well-documented GitHub repository to satisfy hackathon submission requirements.

Secondary objectives

Implement reputation badges as simple NFTs to encourage repeat engagement.

Design modular contracts to allow future addition of games, leaderboards, and side-pool mechanics.

3. Success metrics

Functional: Onchain entry, commit, reveal and payout each complete in testnet environment.

Adoption: 30 unique simulated user flows completed in demo scripts.

Performance: Each onchain action completes within acceptable testnet latencies and gas cost remains low.

Submission quality: GitHub repo with README, deploy script, tests, frontend, and a < 4 minute demo video.

Judges criteria alignment: Innovation, impact, technical depth, user experience, and documentation scored high by internal checklist.

4. Target users and personas

Casual mobile players

Age 16–35, smartphone users, low crypto knowledge.

Motivated by short play sessions and tiny rewards.

Community organisers and small content creators

Host mini-tournaments to engage audiences, require simple creation flows.

Spectators

Want to back or support players via tiny side-pools, drive social sharing.

Hackathon judges and developers

Evaluate technical soundness, onchain logic and MiniPay integration.

5. Key features (MVP)

Tournament creation

Player join with commit hash and entry fee

Reveal phase and result submission

Onchain prize distribution to winners

MiniPay deeplink for payment and wallet connection

Leaderboard and simple reputation badges (minted as lightweight NFTs)

Admin tools for dispute resolution during demo

Clear documentation and demo script

6. Feature detail and user flows
6.1 Tournament creation

Input fields: title, description, entry fee, max players, start time, commit window duration, reveal window duration, game type (memory, reaction, quiz), optional public side-pool flag.

On creation: deploy a Tournament contract instance or call a factory contract that registers the tournament metadata.

6.2 Player join

Flow: user opens tournament, taps Join, generates commit hash locally (hash of secret + score placeholder), initiates MiniPay deeplink payment for entry fee, calls contract join(commitHash).

Validation: UI prevents duplicate join, shows gas estimate and testnet transaction status.

6.3 Play and commit-reveal

Play occurs locally in the app. At commit time, the app produces a commit: keccak256(secret, score). User submits commit before commit window closes.

Reveal phase: user reveals secret and score. Contract matches keccak256(secret, score) to commit and records score.

6.4 Winner selection and payout

On finalize after reveal window, contract computes winner(s) per tournament rules (top score, tie-break rules), and transfers stablecoin prize to winners automatically.

Side-pool settlement: if present, settle spectator stakes per defined share rules onchain.

6.5 Reputation badges

Mint simple ERC-721-lite badges to winners. Badge metadata stored offchain (IPFS recommended) and token references emitted onchain.

6.6 MiniPay integration

Use MiniPay deeplinks to open wallet for entry fee payments and deposits. Provide fallback wallet connect flow for users without MiniPay.

On testnet, simulate deposit flows as necessary and document exact test steps in README.

7. Functional requirements (detailed)

FR-01: TournamentFactory contract must create Tournament instances with unique ID and record owner.

FR-02: Tournament contract must accept ERC-20 stablecoin transfers as entry fees.

FR-03: join(commitHash) must record participant and require entryFee transferred.

FR-04: reveal(secret, score) must validate commit and store score onchain.

FR-05: finalize() must distribute funds to winner(s) according to deterministic rules.

FR-06: Frontend must generate commits locally, never expose secrets.

FR-07: MiniPay deeplink flow must be demonstrated for entry fee payment.

FR-08: App must provide on-screen txn hashes and links to block explorer for transparency.

FR-09: README must include deploy commands, testnet addresses, and demo steps.

8. Non-functional requirements

NFR-01: Security: avoid storing user secrets on servers; secrets only used locally for commit-reveal.

NFR-02: Performance: frontend should be responsive on low-end mobile devices.

NFR-03: Availability: decentralised contracts must be deployable to Celo Alfajores testnet.

NFR-04: Cost: design to minimise number of onchain transactions per user to keep gas low.

NFR-05: Privacy: do not collect PII; optional display name only.

9. Technical architecture

Frontend: React (React Native or React PWA) built as a Progressive Web App for MiniPay compatibility.

Backend: None required for core flow. Optional static storage for fronted assets and NFTs metadata on IPFS.

Blockchain: Celo network (Alfajores testnet for demo), Solidity smart contracts.

Payments: MiniPay deeplinks and cUSD or test stable token ERC-20.

Tooling: Hardhat for contract compilation, testing and deployment; Ethers.js or web3.js for frontend contract calls.

Storage: IPFS for NFT metadata; metadata served via public gateway in README.

10. Smart contract specification (summary)

Contracts:

TournamentFactory: createTournament(params) returns address.

Tournament: constructor(params: tokenAddr, entryFee, maxPlayers, commitEndsAt, revealEndsAt, owner).

Reputation: simple ERC-721 contract to mint winners badges.

SidePool (optional): record spectator stakes and settle on finalize.

Tournament contract functions:

join(bytes32 commitHash)

reveal(string secret, uint score)

finalize()

claimPrize() if needed for gas optimisation

emergencyWithdraw() owner-only for hackathon dispute support

Security considerations:

Use require checks for time windows.

Protect against replay attacks and duplicate commits.

Use safe ERC20 transfer patterns.

Avoid storing sensitive strings onchain.

11. MiniPay integration notes

Use MiniPay deeplinks to request payment from user wallet. Demonstrate with testnet endpoints where available.

Provide a deeplink flow to prefill payment amount and recipient (tournament contract or a system escrow).

For hackathon demo, simulate or use Alfajores mini-pay compatible test tokens and show successful txs in explorer.

12. UX and UI guidelines

Minimal, mobile-first screens: Home, Browse Tournaments, Create Tournament, Tournament Detail, Play Screen, Leaderboard, Profile.

Clear on-screen timing: show commit and reveal timers.

Show transaction status and block explorer links on join, reveal and finalize steps.

Accessibility: large tappable targets, legible fonts, monochrome colour scheme options.

13. Data model (high level)

Tournament: id, owner, entryFee, tokenAddr, maxPlayers, players[], commits[], scores[], status, metadataURI

Player: address, profileName, badges[]

Reputation badge: tokenId, metadataURI, owner

14. Testing and quality assurance

Unit tests for contracts: join, reveal, finalize, edge cases, reentrancy, gas usage.

Integration tests: Full lifecycle for a tournament from creation to payout on testnet.

Frontend tests: smoke tests for key flows, commit/reveal local generation.

Manual QA checklist for demo: create tournament, 3 players join, all reveal, finalize, show payouts and NFT mint.

15. Security and threat model

Threat: cheating by revealing false scores. Mitigation: commit-reveal pattern with local evidence capture, optional offchain proof for complex games.

Threat: token loss due to bugs. Mitigation: limit testnet funds, add emergencyWithdraw with owner-only and clear README explanation.

Threat: front-end secret leakage. Mitigation: secrets stored only in ephemeral memory and not transmitted to any server.

16. Privacy and legal considerations

Do not enable or encourage gambling. Emphasise skill-based competition in README, rules, and UI text.

Do not collect personal data. Use wallet addresses as primary identifiers.

Document compliance stance in README for judges.

17. Roadmap and milestones (hackathon-focused)

Day 0: Prepare repo skeleton and Hardhat config

Day 1: Implement TournamentFactory and Tournament contracts plus unit tests

Day 2: Build React PWA skeleton and commit/reveal local logic

Day 3: Integrate contract calls into frontend and demonstrate join/reveal flows

Day 4: Implement MiniPay deeplink demo flow and reputation NFT minting

Day 5: Polish UI, record demo video, write README and deployment guide

Day 6: Final testing, prepare submission, compress demo video and submit

18. Deliverables

GitHub repo: contracts, frontend, deploy scripts, tests

Deployed contract addresses on Celo Alfajores testnet

Demo video, 4 minutes max

README with step-by-step run instructions, test scripts, and proof of MiniPay integration

Short architecture document and smart contract API reference

19. Acceptance criteria for hackathon submission

App runs on mobile and demonstrates the tournament lifecycle end-to-end on Celo testnet or clearly simulates MiniPay flows.

Demo video shows MiniPay interaction or deeplink flows.

GitHub repo has working contracts, tests, and deploy instructions.

Documentation explains how to reproduce the demo locally and highlights security considerations.

Project aligns with hackathon judging criteria: innovation, impact, technical depth, user experience, documentation.

20. Demo recording script (4 minutes)

0:00–0:20 Intro: Project name and one sentence description.

0:20–1:00 Show tournament creation, settings, and deploy link or factory record.

1:00–2:00 Join flow: show MiniPay deeplink, local commit generation, transaction on explorer.

2:00–2:40 Play flow: local gameplay with commit made earlier, then reveal.

2:40–3:20 Finalization: show finalize transaction, payouts distributed, and NFT badge minted.

3:20–4:00 Technical peek: show contract code file, README steps, and invite judges to run repo.

21. Appendix: quick dev checklist

 Initialise Hardhat project for Celo and Alfajores

 Implement and test TournamentFactory and Tournament contracts

 Implement Reputation ERC-721-lite contract

 Frontend PWA with commit/reveal logic and transaction tracking

 MiniPay deeplink demo page and README instructions

 Deploy to Alfajores, capture tx hashes and addresses

 Record and edit demo video, compress to acceptable size

 Prepare submission package and checklist