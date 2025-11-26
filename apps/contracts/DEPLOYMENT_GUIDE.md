# Deployment Guide - Celo Sepolia Testnet

## ✅ Pre-Deployment Checklist

- [x] All contracts compiled successfully
- [x] All tests passing (26/26)
- [x] Deployment scripts ready
- [ ] PRIVATE_KEY set
- [ ] Sufficient testnet funds

## 📋 Test Coverage Summary

**All contracts fully tested:**
- ✅ TournamentFactory (5 tests)
- ✅ Tournament (17 tests)  
- ✅ ReputationNFT (3 tests)
- ✅ Edge cases & security (1 test)

**Total: 26 passing tests**

## 🚀 Deployment Steps

### 1. Set Environment Variables

```bash
export PRIVATE_KEY=your_private_key_here
export CELOSCAN_API_KEY=your_celoscan_api_key  # Optional, for verification
```

### 2. Get Testnet Funds

If you need testnet tokens:
- Celo Sepolia Faucet: https://faucet.celo.org/sepolia
- Or use: https://faucet.celo.org/

### 3. Deploy to Celo Sepolia

```bash
cd apps/contracts
pnpm run deploy:sepolia
```

Or with inline key:
```bash
PRIVATE_KEY=your_key pnpm run deploy:sepolia
```

### 4. Deployment Output

After deployment, you'll see:
- ReputationNFT contract address
- TournamentFactory contract address

### 5. Update Frontend Environment

Update `apps/web/.env.local` or `.env`:

```env
NEXT_PUBLIC_REPUTATION_NFT_ADDRESS=0x...
NEXT_PUBLIC_TOURNAMENT_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_CELO_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
NEXT_PUBLIC_EXPLORER_URL=https://celo-sepolia.blockscout.com
NEXT_PUBLIC_CHAIN_ID=11142220
```

### 6. Verify Contracts (Optional)

```bash
pnpm run verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📝 Deployment Details

### Contracts to Deploy

1. **ReputationNFT**
   - Name: "LUDIMINT Reputation Badges"
   - Symbol: "LUDI"
   - Base URI: "https://ipfs.io/ipfs/"

2. **TournamentFactory**
   - Owner: Deployer address

### Network Configuration

- **Network**: Celo Sepolia
- **Chain ID**: 11142220
- **RPC URL**: https://forno.celo-sepolia.celo-testnet.org
- **Explorer**: https://celo-sepolia.blockscout.com

## 🔍 Post-Deployment

1. **Verify Contracts** on block explorer
2. **Test Contract Functions** using block explorer or frontend
3. **Create Test Tournament** to verify end-to-end flow
4. **Update Frontend** with contract addresses

## ⚠️ Important Notes

- **Never commit PRIVATE_KEY** to git
- **Use testnet funds only** for Sepolia
- **Save deployment addresses** for reference
- **Test thoroughly** before mainnet deployment

## 🆘 Troubleshooting

### "Insufficient funds"
- Get testnet tokens from faucet

### "Nonce too high"
- Wait a few seconds and retry

### "Contract verification failed"
- Check constructor arguments match
- Verify network and compiler settings

## 📊 Expected Gas Costs

- ReputationNFT deployment: ~2-3M gas
- TournamentFactory deployment: ~1-2M gas
- Total: ~3-5M gas (very low on Celo)

---

**Ready to deploy!** 🚀

