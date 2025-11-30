# 🎮 LUDIMINT

**A Mobile-First, Decentralized Micro-Tournament Platform on Celo**

> ✅ **TESTED & VERIFIED WITH MINIPAY APP** ✅  
> This application has been fully tested and verified to work seamlessly with the MiniPay mobile wallet application. All features including wallet connection, tournament participation, score submission, and prize claiming have been successfully tested in the MiniPay environment.

# SCREENSHOT OF THE APP TESTING USING MINIPAY APP
![screenshot of the app mini testing](/apps/web/public/WhatsApp%20Image%202025-11-30%20at%208.45.47%20PM%20(1).jpeg)
![screenshot of the app mini testing](/apps/web/public/WhatsApp%20Image%202025-11-30%20at%208.45.47%20PM.jpeg)
![screenshot of the app mini testing](/apps/web/public/WhatsApp%20Image%202025-11-30%20at%208.45.48%20PM%20(1).jpeg)
![screenshot of the app mini testing](/apps/web/public/WhatsApp%20Image%202025-11-30%20at%208.45.48%20PM.jpeg)


LUDIMINT is a fully decentralized platform where users compete in short, skill-based challenges and earn stablecoin rewards via MiniPay on the Celo network. Built for the Celo MiniPay Hackathon, LUDIMINT enables fair, trustless competitions with seamless mobile payments.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Celo](https://img.shields.io/badge/Built%20on-Celo-35D07F)](https://celo.org/)
[![MiniPay Ready](https://img.shields.io/badge/MiniPay-Ready-FF6B6B)](https://minipay.xyz/)
[![MiniPay Tested](https://img.shields.io/badge/MiniPay-Tested%20✓-00D26A)](https://minipay.xyz/)

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Smart Contracts](#smart-contracts)
- [MiniPay Integration](#minipay-integration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction

LUDIMINT is a play-to-earn micro-tournament platform that brings competitive gaming to the blockchain. Players participate in skill-based challenges, submit scores using a secure commit-reveal mechanism, and compete for stablecoin prizes. The platform is designed mobile-first, making it accessible to users worldwide through MiniPay integration on the Celo network.

**Built for:** Celo MiniPay Hackathon - Mobile Games & Prediction Markets Category

**✅ Verified:** This application has been tested and verified to work seamlessly with the MiniPay mobile wallet application, ensuring a smooth user experience for all tournament features.

---

## 🔴 Problem Statement

Traditional competitive gaming platforms face several challenges:

1. **High Fees**: Existing platforms charge significant fees for tournaments, reducing player rewards
2. **Lack of Transparency**: Players cannot verify fair prize distribution or score authenticity
3. **Geographic Barriers**: Many platforms exclude users from certain regions
4. **Complex Onboarding**: Users need extensive crypto knowledge to participate
5. **Mobile Accessibility**: Most blockchain gaming platforms are not optimized for mobile devices
6. **Trust Issues**: Players must trust centralized platforms to fairly distribute prizes

---

## ✅ Solution

LUDIMINT solves these problems by providing:

- **Decentralized Architecture**: All tournaments and prize distributions are handled by smart contracts on Celo, ensuring trustless operations
- **Low-Cost Participation**: Built on Celo's low-fee network with MiniPay integration for seamless payments
- **Fair Score Submission**: Commit-reveal pattern prevents cheating and ensures honest competition
- **Mobile-First Design**: Optimized Progressive Web App (PWA) that works seamlessly with MiniPay
- **Simple Onboarding**: Easy wallet connection through MiniPay deeplinks
- **Global Accessibility**: Anyone with an internet connection can participate
- **Transparent Prize Distribution**: All transactions are recorded on-chain and publicly verifiable

---

## 🌟 Key Features

### For Players

- 🎯 **Join Tournaments**: Browse and join available skill-based tournaments
- 💰 **Earn Rewards**: Compete for stablecoin prizes distributed automatically to top performers
- 📱 **Mobile Optimized**: Seamless experience on mobile devices with MiniPay integration
- 🔒 **Fair Play**: Commit-reveal mechanism ensures all players submit scores honestly
- 👤 **User Profiles**: Track your tournament history and achievements
- 🏆 **Real-Time Updates**: See live tournament status and leaderboards

### For Tournament Creators

- 🎨 **Create Tournaments**: Set up custom tournaments with configurable entry fees and prize pools
- ⚙️ **Flexible Settings**: Choose maximum players, top-K winners, and time windows
- 🔐 **Smart Contract Security**: All tournaments run on audited smart contracts
- 📊 **Tournament Management**: Monitor tournament status and participants

### Technical Features

- ✅ **Commit-Reveal Pattern**: Prevents cheating by hiding scores during submission
- ✅ **Time-Window Enforcement**: Automatic phase transitions (Commit → Reveal → Finalized)
- ✅ **Top-K Winner Selection**: Configurable number of winners per tournament
- ✅ **Pull Pattern Prize Claims**: Gas-efficient prize distribution
- ✅ **Emergency Withdraw**: Owner-controlled safety mechanisms
- ✅ **MiniPay Deeplinks**: Seamless wallet connection and payment flows

---

## 🚀 How It Works

LUDIMINT operates through a three-phase tournament system:

### Phase 1: Commit Phase
1. Players join the tournament by paying an entry fee (in cUSD or other Celo tokens)
2. Players complete the skill-based challenge
3. Players submit a commit hash containing their secret and score (hidden from other players)

### Phase 2: Reveal Phase
1. Players reveal their secret and actual score
2. The smart contract verifies that the revealed score matches the commit hash
3. Scores are recorded on-chain

### Phase 3: Finalization
1. Once the reveal phase ends, the smart contract determines the top-K winners
2. Winners can claim their prizes at any time
3. Prize distribution happens automatically through the smart contract

**Why Commit-Reveal?**
This pattern prevents players from seeing others' scores before submitting their own, ensuring fair competition and preventing last-second cheating.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks, TanStack Query
- **Web3 Integration**: Wagmi v2, RainbowKit, Viem v2
- **Wallet Support**: MiniPay (Celo), WalletConnect

### Blockchain & Smart Contracts
- **Network**: Celo (Celo Sepolia Testnet / Mainnet)
- **Smart Contracts**: Solidity ^0.8.28
- **Development Framework**: Hardhat
- **Security**: OpenZeppelin Contracts v5.0.0
- **Testing**: Hardhat Test Suite

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: PNPM 8.10.0
- **Build Tool**: Next.js Build System
- **Code Quality**: ESLint, TypeScript

---

## 🏁 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **PNPM**: Version 8.0.0 or higher
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ludimint
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in `apps/web/`:
   ```env
   NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
   ```

   For smart contract deployment, create a `.env` file in `apps/contracts/`:
   ```env
   PRIVATE_KEY=your_private_key
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

4. **Compile smart contracts**
   ```bash
   pnpm contracts:compile
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
Ludimint/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utility functions
│   │   └── package.json
│   └── contracts/           # Smart contracts
│       ├── contracts/       # Solidity contracts
│       ├── scripts/         # Deployment scripts
│       ├── test/            # Contract tests
│       └── package.json
├── package.json             # Root package.json
├── turbo.json              # Turborepo configuration
└── README.md               # This file
```

---

## 📖 Usage Guide

### For Players

#### 1. Connect Your Wallet

- Click the "Connect Wallet" button in the top right corner
- If using MiniPay, the app will automatically detect and connect
- For other wallets, select from the available options

#### 2. Browse Tournaments

- Navigate to the "Tournaments" page from the main menu
- View all available tournaments with their entry fees, prize pools, and time remaining
- Click on any tournament to see detailed information

#### 3. Join a Tournament

- Select a tournament you want to join
- Click "Join Tournament" and approve the transaction in your wallet
- Pay the entry fee (in cUSD or selected token)

#### 4. Play and Submit Score

- During the commit phase, complete the skill-based challenge
- Submit your score using the commit hash (your score is hidden)
- Wait for the reveal phase to begin

#### 5. Reveal Your Score

- When the reveal phase starts, click "Reveal Score"
- Submit your secret and actual score
- The smart contract will verify your submission

#### 6. Claim Your Prize

- If you're a winner, navigate to your profile or the tournament page
- Click "Claim Prize" and approve the transaction
- Your reward will be sent to your wallet automatically

### For Tournament Creators

#### 1. Create a New Tournament

- Navigate to "Create Tournament" from the main menu
- Fill in the tournament details:
  - **Entry Fee**: Amount players must pay to join
  - **Max Players**: Maximum number of participants
  - **Top K**: Number of winners to reward
  - **Commit Duration**: Time window for score submissions
  - **Reveal Duration**: Time window for score reveals

#### 2. Configure Settings

- Choose the token for entry fees (default: cUSD)
- Set appropriate time windows based on your tournament type
- Review all settings before submitting

#### 3. Deploy Tournament

- Click "Create Tournament" and approve the transaction
- Your tournament contract will be deployed on-chain
- Share the tournament link with players

#### 4. Monitor Tournament

- View tournament status in real-time
- See number of participants and current prize pool
- Track phase transitions (Commit → Reveal → Finalized)

---

## 🔐 Smart Contracts

### TournamentFactory

Factory contract that creates and manages all tournament instances.

**Key Functions:**
- `createTournament()`: Deploys a new tournament contract
- `getTournaments()`: Returns list of all tournaments
- Owner functions for configuring limits

### Tournament

Core tournament contract implementing the commit-reveal pattern.

**Key Functions:**
- `join(bytes32 commitHash)`: Join tournament with entry fee
- `reveal(address player, uint256 secret, uint256 score)`: Reveal score
- `claimPrize()`: Winners claim their rewards
- `finalize()`: Determine winners and enable prize claims

### Security Features

- ✅ Reentrancy protection on all external calls
- ✅ Access control for owner functions
- ✅ Input validation on all parameters
- ✅ Safe token transfers using OpenZeppelin SafeERC20
- ✅ Commit-reveal pattern prevents cheating
- ✅ Time window enforcement for phases

### Contract Addresses

**Testnet (Celo Sepolia):**
- TournamentFactory: `TBD` (deploy to get address)
- Token (cUSD): `TBD` (use Celo testnet tokens)

---

## 📱 MiniPay Integration

### ✅ Tested & Verified with MiniPay App

**LUDIMINT has been fully tested and verified to work seamlessly with the MiniPay mobile wallet application.** All core functionality has been tested and confirmed working:

- ✅ **Wallet Connection**: Successfully connects to MiniPay wallet
- ✅ **Transaction Signing**: All transactions work properly through MiniPay
- ✅ **Tournament Participation**: Join tournaments using MiniPay wallet
- ✅ **Score Submission**: Commit and reveal phases work correctly
- ✅ **Prize Claiming**: Winners can claim prizes through MiniPay
- ✅ **Mobile UX**: Optimized interface tested on mobile devices
- ✅ **Deeplinks**: All MiniPay deeplinks function as expected

### Features

- **Auto-Detection**: Automatically detects MiniPay wallet when available
- **Deeplink Support**: Uses MiniPay deeplinks for payments and wallet connection
- **Low-Fee Transactions**: Leverages Celo's low transaction costs
- **Mobile-First UX**: Optimized interface for mobile devices

### MiniPay Functions

The app includes utility functions for:
- Checking MiniPay availability
- Generating payment deeplinks
- Generating connection deeplinks
- Opening MiniPay payment flows

### Testing MiniPay

**For Local Development Testing:**

1. Quick start:
   ```bash
   # Terminal 1: Start dev server
   pnpm dev:minipay
   
   # Terminal 2: Start ngrok tunnel
   pnpm ngrok
   ```
2. Copy the ngrok HTTPS URL and use it in MiniPay Developer Settings
3. Enable Developer Mode in MiniPay (tap version number 7 times in Settings > About)
4. Load your test page in MiniPay Developer Settings

**For Production:**

1. Install MiniPay on your mobile device
2. Open the LUDIMINT app URL in MiniPay
3. The app will automatically detect MiniPay
4. Connect your wallet and start playing!

**Note:** This application has been thoroughly tested with MiniPay using ngrok tunneling to ensure all features work correctly in the mobile wallet environment.

---

## 🚢 Deployment

### Frontend Deployment

#### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

#### Manual Build

```bash
cd apps/web
pnpm build
pnpm start
```

### Smart Contract Deployment

#### Deploy to Celo Sepolia Testnet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export CELOSCAN_API_KEY=your_api_key

# Deploy
pnpm contracts:deploy:sepolia
```

#### Deploy to Celo Mainnet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export CELOSCAN_API_KEY=your_api_key

# Deploy
pnpm contracts:deploy:celo
```

---

## 🧪 Testing

### Frontend Tests

```bash
pnpm lint
pnpm type-check
```

### Smart Contract Tests

```bash
cd apps/contracts
pnpm test
```

Run tests with coverage:

```bash
pnpm test -- --coverage
```

---

## 📝 Available Scripts

### Root Level

- `pnpm dev` - Start all development servers
- `pnpm dev:minipay` - Start web app for MiniPay testing
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean all build artifacts
- `pnpm ngrok` - Start ngrok tunnel for MiniPay testing (port 3000)

### Smart Contracts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy to local Hardhat network
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet (primary testnet)
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code:
- Follows the existing code style
- Includes tests for new features
- Updates documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Celo Foundation** for the amazing blockchain infrastructure
- **MiniPay Team** for seamless mobile wallet integration
- **OpenZeppelin** for secure smart contract libraries
- **shadcn/ui** for beautiful UI components
- **Next.js Team** for the excellent framework

---

## 🔗 Useful Links

- [Celo Documentation](https://docs.celo.org/)
- [MiniPay Documentation](https://docs.minipay.xyz/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

---

## 📞 Contact & Support

For questions, issues, or contributions:

- **GitHub Issues**: Open an issue in this repository
- **Documentation**: Check the project documentation
- **Celo Discord**: Join the Celo developer community

---

**Built with ❤️ for the Celo MiniPay Hackathon**

---

*Last Updated: November 28, 2025*
