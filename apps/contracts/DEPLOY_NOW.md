# 🚀 Deploy to Celo Sepolia - Quick Start

## ✅ Test Coverage Confirmed

**All contracts tested:**
- ✅ TournamentFactory: 5 tests passing
- ✅ Tournament: 17 tests passing  
- ✅ ReputationNFT: 3 tests passing
- ✅ Edge cases: 1 test passing

**Total: 26/26 tests passing** ✅

## 🚀 Deploy Now

### Option 1: Simple Deployment (Recommended)

```bash
cd apps/contracts

# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy
pnpm run deploy:sepolia:simple
```

### Option 2: Using Hardhat Ignition

```bash
cd apps/contracts

# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy
pnpm run deploy:sepolia
```

### Option 3: Using Deployment Script

```bash
cd apps/contracts
./deploy-sepolia.sh
```

## 📋 What Gets Deployed

1. **ReputationNFT** - ERC-721 for winner badges
2. **TournamentFactory** - Factory for creating tournaments

## ⚠️ Before Deploying

1. **Set PRIVATE_KEY**: `export PRIVATE_KEY=your_key`
2. **Get testnet funds**: https://faucet.celo.org/sepolia
3. **Check balance**: Make sure you have enough for gas

## 📝 After Deployment

1. **Copy contract addresses** from output
2. **Update frontend .env**:
   ```env
   NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
   NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x...
   NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
   NEXT_PUBLIC_EXPLORER_URL=https://celo-sepolia.blockscout.com
   NEXT_PUBLIC_CHAIN_ID=11142220
   ```
3. **Verify contracts** on block explorer (optional)
4. **Test** by creating a tournament

## 🔍 Network Info

- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220
- **RPC**: https://forno.celo-sepolia.celo-testnet.org
- **Explorer**: https://celo-sepolia.blockscout.com
- **Faucet**: https://faucet.celo.org/sepolia

---

**Ready to deploy!** Just set your PRIVATE_KEY and run the command! 🚀

