#!/bin/bash

# PlannerAPI Save and Deploy Script
# Run this before closing Terminal to save all your work

echo "🔍 Checking current directory..."
if [[ ! -f "package.json" ]] || [[ ! -f "firebase.json" ]]; then
    echo "❌ Error: Not in PlannerAPI-clean directory"
    echo "Please run: cd /Users/savbanerjee/Projects/PlannerAPI-clean"
    exit 1
fi

echo ""
echo "📝 Staging all changes..."
git add .

echo ""
echo "💾 Committing changes..."
COMMIT_MSG="${1:-Save work from $(date '+%Y-%m-%d %H:%M:%S')}"
git commit -m "$COMMIT_MSG"

echo ""
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Deploying to Firebase..."
    firebase deploy

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ All done! Your work is saved and deployed."
        echo "🌐 Live at: https://plannerapi-prod.web.app"
    else
        echo ""
        echo "❌ Deploy failed, but changes are committed locally"
    fi
else
    echo ""
    echo "❌ Build failed, please fix errors before deploying"
fi
