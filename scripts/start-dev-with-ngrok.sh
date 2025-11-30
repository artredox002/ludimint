#!/bin/bash

# Script to start both Next.js dev server and ngrok tunnel
# This makes it easy to test in MiniPay

PORT=${1:-3000}

echo "🔧 Starting development server on port $PORT..."
echo ""

# Start the dev server in the background
cd apps/web && pnpm dev &
DEV_PID=$!

# Wait a bit for the server to start
sleep 5

echo "🚀 Starting ngrok tunnel..."
echo "📱 Copy the https URL below and use it in MiniPay Developer Settings > Load test page"
echo ""

# Start ngrok
ngrok http $PORT

# Cleanup on exit
trap "kill $DEV_PID 2>/dev/null" EXIT

