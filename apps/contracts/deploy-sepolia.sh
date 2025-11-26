#!/bin/bash

# LUDIMINT - Deploy to Celo Sepolia Testnet
# Usage: ./deploy-sepolia.sh

set -e

echo "🚀 LUDIMINT - Celo Sepolia Deployment"
echo "======================================"
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ ERROR: PRIVATE_KEY environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export PRIVATE_KEY=your_private_key_here"
    echo ""
    echo "Or run:"
    echo "  PRIVATE_KEY=your_key ./deploy-sepolia.sh"
    echo ""
    exit 1
fi

echo "✅ PRIVATE_KEY is set"
echo "📦 Compiling contracts..."
pnpm run compile

echo ""
echo "🌐 Deploying to Celo Sepolia..."
echo ""

# Deploy using Hardhat Ignition
pnpm run deploy:sepolia

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the contract addresses above"
echo "2. Update apps/web/.env.local with the addresses"
echo "3. Test the contracts on the block explorer"
echo ""
