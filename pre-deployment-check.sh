#!/bin/bash

#############################################################################
# Pre-Deployment Check - PlannerAPI
#
# Runs essential checks before deploying to production.
# Run from project root: bash pre-deployment-check.sh
#
#############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="plannerapi-prod"
ERRORS=0

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}PlannerAPI Pre-Deployment Check${NC}"
echo -e "${BLUE}============================================================${NC}\n"

# 1. Node.js
echo -e "${YELLOW}[1/7] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    ((ERRORS++))
else
    NODE_VER=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VER${NC}"
fi
echo ""

# 2. Firebase CLI
echo -e "${YELLOW}[2/7] Checking Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}✗ Firebase CLI not found. Install: npm install -g firebase-tools${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ Firebase CLI installed${NC}"
fi
echo ""

# 3. Firebase login
echo -e "${YELLOW}[3/7] Checking Firebase authentication...${NC}"
if ! firebase projects:list 2>/dev/null | grep -q "$PROJECT_ID"; then
    echo -e "${YELLOW}⚠ Run: firebase login${NC}"
    echo -e "${YELLOW}  Then verify project: firebase use $PROJECT_ID${NC}"
else
    echo -e "${GREEN}✓ Firebase authenticated${NC}"
fi
echo ""

# 4. Functions build
echo -e "${YELLOW}[4/7] Building Cloud Functions...${NC}"
cd "$(dirname "$0")/functions"
if ! npm run build 2>/dev/null; then
    echo -e "${RED}✗ Functions build failed${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ Functions build succeeded${NC}"
fi
cd - > /dev/null
echo ""

# 5. Firebase config (notion, anthropic)
echo -e "${YELLOW}[5/7] Checking Firebase Functions config...${NC}"
CONFIG=$(firebase functions:config:get 2>/dev/null || echo "{}")
if echo "$CONFIG" | grep -q '"notion"'; then
    echo -e "${GREEN}✓ notion.api_key is set${NC}"
else
    echo -e "${YELLOW}⚠ notion.api_key not set. Run: firebase functions:config:set notion.api_key=\"YOUR_KEY\"${NC}"
fi
if echo "$CONFIG" | grep -q '"anthropic"'; then
    echo -e "${GREEN}✓ anthropic.api_key is set${NC}"
else
    echo -e "${YELLOW}⚠ anthropic.api_key not set. Run: firebase functions:config:set anthropic.api_key=\"YOUR_KEY\"${NC}"
fi
echo ""

# 6. Frontend build (optional)
echo -e "${YELLOW}[6/7] Checking frontend build...${NC}"
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    if npm run build 2>/dev/null; then
        echo -e "${GREEN}✓ Frontend build succeeded${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend build failed or skipped${NC}"
    fi
else
    echo -e "${YELLOW}⊘ Skipped (no frontend build script)${NC}"
fi
echo ""

# 7. Summary
echo -e "${YELLOW}[7/7] Summary${NC}"
echo -e "${BLUE}============================================================${NC}"
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ Pre-deployment check failed with $ERRORS error(s)${NC}"
    echo -e "${BLUE}============================================================${NC}\n"
    exit 1
else
    echo -e "${GREEN}✓ Pre-deployment check passed${NC}"
    echo -e "${BLUE}============================================================${NC}\n"
    echo "Deploy with:"
    echo "  firebase deploy --project $PROJECT_ID"
    echo ""
    echo "Or deploy only functions:"
    echo "  firebase deploy --only functions:generateDiscoverCards --project $PROJECT_ID"
    echo ""
    exit 0
fi
