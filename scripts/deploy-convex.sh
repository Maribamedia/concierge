#!/bin/bash

# Convex Deployment Script
# Run this script locally on your machine after cloning the repository

set -e

echo "==================================="
echo "Concierge V2 - Convex Deployment"
echo "==================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Warning: Node.js v20 or higher is recommended (you have v$NODE_VERSION)"
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo "Step 1: Installing dependencies..."
pnpm install || npm install

echo ""
echo "Step 2: Deploying to Convex..."
echo "This will open a browser window for authentication if you're not logged in."
echo ""

# Deploy to Convex
if [ -n "$CONVEX_DEPLOY_KEY" ]; then
    echo "Using CONVEX_DEPLOY_KEY for deployment..."
    pnpm exec convex deploy --yes
else
    echo "No CONVEX_DEPLOY_KEY found. Using interactive authentication..."
    pnpm exec convex deploy
fi

echo ""
echo "Step 3: Verifying deployment..."

# Check if _generated directory exists
if [ ! -d "convex/_generated" ]; then
    echo "Error: TypeScript types were not generated"
    echo "Please check the Convex dashboard for deployment errors"
    exit 1
fi

echo "✓ TypeScript types generated successfully"

# Get the Convex URL
CONVEX_URL=$(grep "prodUrl" convex.json | cut -d'"' -f4)
if [ -n "$CONVEX_URL" ]; then
    echo "✓ Convex deployment URL: $CONVEX_URL"
    
    # Update .env.local
    if grep -q "NEXT_PUBLIC_CONVEX_URL=" .env.local 2>/dev/null; then
        sed -i.bak "s|NEXT_PUBLIC_CONVEX_URL=.*|NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL|" .env.local
        echo "✓ Updated NEXT_PUBLIC_CONVEX_URL in .env.local"
    else
        echo "NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL" >> .env.local
        echo "✓ Added NEXT_PUBLIC_CONVEX_URL to .env.local"
    fi
fi

echo ""
echo "Step 4: Building application..."
pnpm build

echo ""
echo "==================================="
echo "✓ Deployment Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Review the deployment in Convex dashboard"
echo "2. Test the application: pnpm dev"
echo "3. Run comprehensive tests (see PRODUCTION_DEPLOYMENT_TESTING_REPORT.md)"
echo ""
echo "Deployment URL: $CONVEX_URL"
echo ""
