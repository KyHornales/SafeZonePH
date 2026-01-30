#!/bin/bash

# SafeZonePH - Vercel Deployment Quick Deploy Script
# This script helps you deploy to Vercel with all necessary checks

set -e

echo "🚀 SafeZonePH Vercel Deployment Helper"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found in root directory"
    exit 1
fi

# Check if api/index.py exists
if [ ! -f "api/index.py" ]; then
    echo "❌ api/index.py not found"
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found"
    exit 1
fi

echo "✅ All required files found"
echo ""

# Ask about environment variables
echo "📝 Environment Variables Checklist:"
echo "   Have you set these in Vercel Dashboard?"
echo "   - JWT_SECRET_KEY"
echo "   - DATABASE_URL"
echo ""
read -p "Are environment variables configured? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "ℹ️  Set environment variables at:"
    echo "   https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your deployment URL"
echo "2. Test the API: https://your-app.vercel.app/api/"
echo "3. Seed community tasks: curl -X POST https://your-app.vercel.app/api/seed-community-tasks"
echo "4. Test frontend registration and login"
echo ""
echo "🎉 Your SafeZonePH app is live!"
