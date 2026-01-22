#!/bin/bash

#############################################################################
# Cloud Scheduler Verification Script
#
# This script verifies that Cloud Scheduler is set up correctly to trigger
# the generateDiscoverCards Cloud Function daily at 6 AM ET.
#
# Usage:
#   chmod +x verify-cloud-scheduler.sh
#   ./verify-cloud-scheduler.sh
#
#############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="plannerapi-prod"
REGION="us-central1"
JOB_NAME="generateDiscoverCards"
FUNCTION_URL="https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Cloud Scheduler Verification${NC}"
echo -e "${BLUE}============================================================${NC}\n"

# Check if gcloud is installed
echo -e "${YELLOW}[1/7] Checking if gcloud is installed...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}✗ gcloud not found. Install it: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi
echo -e "${GREEN}✓ gcloud is installed${NC}\n"

# Check if firebase is installed
echo -e "${YELLOW}[2/7] Checking if firebase CLI is installed...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}✗ firebase CLI not found. Install it: npm install -g firebase-tools${NC}"
    exit 1
fi
echo -e "${GREEN}✓ firebase CLI is installed${NC}\n"

# Check if authenticated
echo -e "${YELLOW}[3/7] Checking Google Cloud authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' | grep -q '@'; then
    echo -e "${RED}✗ Not authenticated to Google Cloud. Run: gcloud auth login${NC}"
    exit 1
fi
AUTH_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format='value(account)')
echo -e "${GREEN}✓ Authenticated as: $AUTH_ACCOUNT${NC}\n"

# Set project
echo -e "${YELLOW}[4/7] Setting Google Cloud project...${NC}"
gcloud config set project $PROJECT_ID --quiet > /dev/null 2>&1
echo -e "${GREEN}✓ Project set to: $PROJECT_ID${NC}\n"

# Enable Cloud Scheduler API
echo -e "${YELLOW}[5/7] Enabling Cloud Scheduler API...${NC}"
gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID --quiet > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Cloud Scheduler API enabled${NC}\n"

# Check if scheduler job exists
echo -e "${YELLOW}[6/7] Checking for Cloud Scheduler job: $JOB_NAME${NC}"
JOB_EXISTS=$(gcloud scheduler jobs list --location=$REGION --project=$PROJECT_ID --format='value(name)' | grep -c "^${JOB_NAME}$" || true)

if [ $JOB_EXISTS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Scheduler job does not exist. Creating it...${NC}"

    gcloud scheduler jobs create http $JOB_NAME \
        --schedule="0 6 * * *" \
        --time-zone="America/New_York" \
        --uri="$FUNCTION_URL" \
        --http-method=POST \
        --location=$REGION \
        --project=$PROJECT_ID \
        --quiet

    echo -e "${GREEN}✓ Scheduler job created successfully${NC}\n"
else
    echo -e "${GREEN}✓ Scheduler job exists${NC}\n"
fi

# Get job details
echo -e "${YELLOW}[7/7] Job Details:${NC}"
echo ""
gcloud scheduler jobs describe $JOB_NAME \
    --location=$REGION \
    --project=$PROJECT_ID \
    --format='table(
        name.basename(),
        schedule,
        timezone,
        state,
        lastAttemptTime,
        nextScheduledTime
    )'

echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}✓ Verification Complete${NC}"
echo -e "${BLUE}============================================================${NC}\n"

# Provide next steps
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Test manually: gcloud scheduler jobs run $JOB_NAME --location=$REGION"
echo "2. Check logs: firebase functions:log --only $JOB_NAME --since 10m"
echo "3. Verify cards in Firestore: discover_cards collection"
echo "4. Check frontend: https://plannerapi-prod.web.app"
echo ""
echo -e "${BLUE}For full details, see: CLOUD-SCHEDULER-VERIFICATION.md${NC}"
