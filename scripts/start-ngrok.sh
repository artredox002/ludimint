#!/bin/bash

# Script to start ngrok tunnel for MiniPay testing
# This will expose your local development server to the internet

PORT=${1:-3000}

echo "🚀 Starting ngrok tunnel on port $PORT..."
echo "📱 Use the https URL in MiniPay Developer Settings > Load test page"
echo "⚠️  Note: Free tier may show a warning page - tap 'Visit Site' to continue"
echo ""

# Start ngrok with request header to bypass warning page
ngrok http $PORT --request-header-add="ngrok-skip-browser-warning:true"

