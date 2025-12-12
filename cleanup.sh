#!/bin/bash

# LUDIMINT - Project Cleanup Script
# Removes unnecessary files before pushing to GitHub

set -e

echo "🧹 LUDIMINT - Project Cleanup"
echo "=============================="
echo ""

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

# Counter for removed files
REMOVED_COUNT=0

# Function to safely remove files/directories
remove_if_exists() {
    if [ -e "$1" ] || [ -d "$1" ]; then
        echo "  Removing: $1"
        rm -rf "$1"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
    fi
}

echo "📁 Removing build artifacts and cache files..."
remove_if_exists ".next"
remove_if_exists "apps/web/.next"
remove_if_exists ".turbo"
remove_if_exists "apps/web/.turbo"
remove_if_exists "dist"
remove_if_exists "build"
remove_if_exists "coverage"
remove_if_exists ".nyc_output"

echo ""
echo "📝 Removing TypeScript build info files..."
find . -name "*.tsbuildinfo" -type f -not -path "./node_modules/*" -exec rm -f {} \;

echo ""
echo "🔐 Removing environment files (should use .env.example instead)..."
remove_if_exists ".env"
remove_if_exists ".env.local"
remove_if_exists "apps/web/.env"
remove_if_exists "apps/web/.env.local"
remove_if_exists "apps/contracts/.env"
remove_if_exists "apps/contracts/.env.local"

echo ""
echo "🗑️  Removing OS-specific files..."
find . -name ".DS_Store" -type f -not -path "./node_modules/*" -exec rm -f {} \;
find . -name "Thumbs.db" -type f -not -path "./node_modules/*" -exec rm -f {} \;
find . -name "*.swp" -type f -not -path "./node_modules/*" -exec rm -f {} \;
find . -name "*.swo" -type f -not -path "./node_modules/*" -exec rm -f {} \;
find . -name "*~" -type f -not -path "./node_modules/*" -exec rm -f {} \;

echo ""
echo "📋 Removing log files..."
find . -name "*.log" -type f -not -path "./node_modules/*" -exec rm -f {} \;

echo ""
echo "🔧 Removing Hardhat artifacts and cache..."
remove_if_exists "apps/contracts/artifacts"
remove_if_exists "apps/contracts/cache"
remove_if_exists "apps/contracts/typechain-types"

echo ""
echo "📦 Checking for node_modules (should be in .gitignore)..."
if [ -d "node_modules" ]; then
    echo "  ⚠️  node_modules/ exists (should be ignored by git)"
    echo "  💡 Run 'git check-ignore node_modules' to verify it's ignored"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cleanup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   Removed $REMOVED_COUNT items"
echo ""
echo "📝 Next Steps:"
echo "   1. Review changes: git status"
echo "   2. Verify .env files are not tracked: git status | grep .env"
echo "   3. Stage your changes: git add ."
echo "   4. Commit: git commit -m 'chore: clean project files'"
echo "   5. Push: git push"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Make sure .env files are in .gitignore"
echo "   - Never commit sensitive information (private keys, API keys)"
echo "   - Use env-examples/ for template files"
echo ""

