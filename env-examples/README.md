# Environment Variables Setup Guide

This directory contains example environment variable files for the LUDIMINT project.

## Files

1. **web.env.example** - For the Next.js frontend application (`apps/web/`)
2. **contracts.env.example** - For smart contract deployment (`apps/contracts/`)
3. **root.env.example** - For root-level configuration (optional)

## Setup Instructions

### For Web Application

1. Copy `web.env.example` to `apps/web/.env.local`:
   ```bash
   cp env-examples/web.env.example apps/web/.env.local
   ```

2. Edit `apps/web/.env.local` and fill in your values:
   - Update contract addresses if deploying to a new network
   - Add your WalletConnect Project ID
   - Adjust network configuration if needed

### For Contract Deployment

1. Copy `contracts.env.example` to `apps/contracts/.env`:
   ```bash
   cp env-examples/contracts.env.example apps/contracts/.env
   ```

2. Edit `apps/contracts/.env` and fill in your values:
   - Add your private key (without 0x prefix)
   - Add your CeloScan API key for contract verification
   - Configure other optional settings

### For Root Configuration (Optional)

1. Copy `root.env.example` to `.env`:
   ```bash
   cp env-examples/root.env.example .env
   ```

2. Edit `.env` and configure global settings if needed

## Important Security Notes

⚠️ **NEVER commit `.env` or `.env.local` files to version control!**

- These files contain sensitive information (private keys, API keys)
- Make sure `.env*` is in your `.gitignore` file
- Use `.env.example` files as templates only

## Quick Start

For a quick start with Celo Mainnet:

1. **Web app** - Copy `web.env.example` to `apps/web/.env.local` (addresses are already set for mainnet)
2. **Contracts** - Copy `contracts.env.example` to `apps/contracts/.env` and add your private key

That's it! The web app is configured for Celo Mainnet with production contract addresses.

