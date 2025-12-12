#!/bin/bash

# LUDIMINT - Environment Variables Setup Script
# This script copies .env.example files to their proper locations

set -e

echo "🚀 LUDIMINT - Environment Variables Setup"
echo "=========================================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "Project root: $PROJECT_ROOT"
echo ""

# Copy web .env.example
if [ -f "$SCRIPT_DIR/web.env.example" ]; then
    echo "📝 Copying web.env.example to apps/web/.env.local..."
    cp "$SCRIPT_DIR/web.env.example" "$PROJECT_ROOT/apps/web/.env.local"
    echo "✅ Created apps/web/.env.local"
    echo "   ⚠️  Remember to update NEXT_PUBLIC_WC_PROJECT_ID and contract addresses if needed"
    echo ""
else
    echo "❌ web.env.example not found!"
fi

# Copy contracts .env.example
if [ -f "$SCRIPT_DIR/contracts.env.example" ]; then
    echo "📝 Copying contracts.env.example to apps/contracts/.env..."
    cp "$SCRIPT_DIR/contracts.env.example" "$PROJECT_ROOT/apps/contracts/.env"
    echo "✅ Created apps/contracts/.env"
    echo "   ⚠️  Remember to add your PRIVATE_KEY and CELOSCAN_API_KEY"
    echo ""
else
    echo "❌ contracts.env.example not found!"
fi

# Copy root .env.example (optional)
if [ -f "$SCRIPT_DIR/root.env.example" ]; then
    read -p "Create root .env file? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp "$SCRIPT_DIR/root.env.example" "$PROJECT_ROOT/.env"
        echo "✅ Created .env in project root"
    fi
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit apps/web/.env.local:"
echo "   - Add your WalletConnect Project ID"
echo "   - Update contract addresses if deploying to a new network"
echo ""
echo "2. Edit apps/contracts/.env:"
echo "   - Add your PRIVATE_KEY (without 0x prefix)"
echo "   - Add your CELOSCAN_API_KEY (optional but recommended)"
echo ""
echo "3. Verify .gitignore includes .env files:"
echo "   - apps/web/.env.local"
echo "   - apps/contracts/.env"
echo "   - .env"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   Never commit .env or .env.local files to version control!"
echo "   They contain sensitive information (private keys, API keys)."
echo ""

