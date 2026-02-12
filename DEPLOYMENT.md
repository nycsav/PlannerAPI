# Deployment Guide - PlannerAPI

> Step-by-step guide for deploying PlannerAPI to production

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js 18+** installed locally
- **Firebase CLI** installed: `npm install -g firebase-tools`
- **Firebase project** created (production: `plannerapi-prod`)
- **API keys** for:
  - Perplexity AI: https://www.perplexity.ai/settings/api
  - Anthropic Claude: https://console.anthropic.com/settings/keys
  - Notion API: https://www.notion.so/my-integrations
- **Notion workspace** with Research Inbox database configured

---

## Setup Steps

### 1. Firebase Project Setup

Login to Firebase CLI:

```bash
firebase login
```

Initialize Firebase in project directory (if not already done):

```bash
cd ~/Projects/PlannerAPI-clean
firebase init
```

**Select services:**
- ✅ Firestore (database rules & indexes)
- ✅ Functions (Cloud Functions for backend)
- ✅ Hosting (static site deployment)

**Configuration:**
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Functions directory: `functions/`
- Public directory: `dist/`
- Build command: `npm run build`

---

### 2. Environment Variables

#### Frontend Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:

```bash
# Firebase Configuration (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=plannerapi-prod
VITE_FIREBASE_SENDER_ID=865025512785
VITE_FIREBASE_APP_ID=1:865025512785:web:...

# Perplexity API (client-side, optional)
VITE_PPLX_API_KEY=pplx-...
VITE_PPLX_MODEL_FAST=sonar

# Google Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Notion Integration
NOTION_API_TOKEN=secret_...
NOTION_DATABASE_ID=2fa0bdffe59e8075a696000b88058c9e

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### Cloud Functions Secrets

Set environment variables for Cloud Functions:

```bash
firebase functions:config:set \
  pplx.api_key="YOUR_PERPLEXITY_API_KEY" \
  anthropic.api_key="YOUR_ANTHROPIC_API_KEY"
```

Verify configuration:

```bash
firebase functions:config:get
```

---

### 3. Firestore Rules & Indexes

Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Deploy Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

**⏱️ Wait 2-3 minutes for indexes to build** before querying Firestore.

Check index status in Firebase Console:
- Navigate to: Firestore Database → Indexes
- Ensure all indexes show "Enabled" (not "Building")

---

### 4. Install Dependencies

Install frontend dependencies:

```bash
npm install
```

Install Cloud Functions dependencies:

```bash
cd functions
npm install
cd ..
```

---

### 5. Build Frontend

Build the production-ready React app:

```bash
npm run build
```

This creates the `dist/` directory with optimized static files.

**Verify build output:**

```bash
ls -lh dist/
# Should see: index.html, assets/, favicon, etc.
```

---

### 6. Deploy Cloud Functions

Deploy all Cloud Functions:

```bash
cd functions
npm run deploy
```

Or deploy specific functions:

```bash
firebase deploy --only functions:generateDiscoverCards
firebase deploy --only functions:chat-intel
firebase deploy --only functions:chatSimple
```

**Deployed functions:**
- `generateDiscoverCards` - Daily intelligence card generator (scheduled)
- `chat-intel` - Real-time Perplexity search for Strategy Chat
- `chatSimple` - Follow-up questions in intelligence modals

---

### 7. Deploy Frontend (Firebase Hosting)

Deploy the built frontend to Firebase Hosting:

```bash
firebase deploy --only hosting
```

**Live URL:** https://plannerapi-prod.web.app

---

### 8. Cloud Scheduler (Daily Intelligence)

Set up Cloud Scheduler to trigger `generateDiscoverCards` daily at 6 AM ET.

**Check existing scheduler job:**

```bash
gcloud scheduler jobs list --location=us-central1 --project=plannerapi-prod
```

**Create scheduler job** (if not exists):

```bash
gcloud scheduler jobs create http generate-daily-intelligence \
  --location=us-central1 \
  --schedule="0 6 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards" \
  --http-method=POST \
  --oidc-service-account-email=plannerapi-prod@appspot.gserviceaccount.com \
  --description="Generate daily intelligence cards at 6 AM ET"
```

**Test scheduler job manually:**

```bash
gcloud scheduler jobs run generate-daily-intelligence \
  --location=us-central1 \
  --project=plannerapi-prod
```

**View scheduler logs:**

```bash
gcloud functions logs read generateDiscoverCards \
  --region us-central1 \
  --limit 50
```

For detailed troubleshooting, see: [CLOUD-SCHEDULER-VERIFICATION.md](CLOUD-SCHEDULER-VERIFICATION.md)

---

### 9. Notion Automation (n8n)

**Option A: Self-Hosted n8n**

1. Install n8n:
   ```bash
   npm install -g n8n
   ```

2. Start n8n:
   ```bash
   n8n start
   ```

3. Create workflow:
   - Trigger: Notion Database → New Entry
   - Action: HTTP Request → Call Claude API
   - Action: Firestore → Write to `premium_briefs` collection

4. Set environment variables in n8n:
   - `NOTION_API_TOKEN`
   - `NOTION_DATABASE_ID`
   - `ANTHROPIC_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`

**Option B: n8n Cloud**

1. Sign up: https://n8n.io/cloud
2. Import workflow from `docs/n8n-workflows/notion-to-firestore.json` (if available)
3. Configure credentials in n8n Cloud dashboard

---

### 10. Verify Deployment

#### Frontend Checks

1. Visit: https://plannerapi-prod.web.app
2. Verify components load:
   - ✅ Hero section with search
   - ✅ Premium Intelligence Library
   - ✅ Daily Intelligence feed (10 cards)
3. Test authentication:
   - ✅ Google OAuth login
   - ✅ Email/password signup
4. Test modals:
   - ✅ Click intelligence card → modal opens
   - ✅ "Ask Follow-Up" button works

#### Backend Checks

Test Cloud Functions directly:

```bash
# Test chat-intel endpoint
curl -X POST "https://us-central1-plannerapi-prod.cloudfunctions.net/chat-intel" \
  -H "Content-Type: application/json" \
  -d '{"query":"AI marketing strategy","audience":"CMO"}'

# Test chatSimple endpoint
curl -X POST "https://us-central1-plannerapi-prod.cloudfunctions.net/chatSimple" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is AEO?","cardContext":"Search optimization is evolving"}'
```

#### Firestore Checks

1. Open Firebase Console → Firestore Database
2. Verify collections exist:
   - ✅ `premium_briefs`
   - ✅ `discover_cards`
   - ✅ `analytics_events`
   - ✅ `users`
3. Check data freshness:
   - `discover_cards` should have 10 documents from today (6 AM ET run)
   - `premium_briefs` should have tier 1-3 sources

#### Cloud Scheduler Checks

```bash
# View recent executions
gcloud scheduler jobs describe generate-daily-intelligence \
  --location=us-central1 \
  --project=plannerapi-prod

# Check logs for errors
gcloud functions logs read generateDiscoverCards \
  --region us-central1 \
  --limit 50 \
  --project=plannerapi-prod
```

---

## Troubleshooting

### Issue: Daily cards not generating

**Symptoms:**
- `discover_cards` collection is empty or outdated
- Cloud Scheduler job shows "Failed" status

**Solutions:**

1. Check Cloud Scheduler job exists:
   ```bash
   gcloud scheduler jobs list --location=us-central1 --project=plannerapi-prod
   ```

2. Check Cloud Function logs:
   ```bash
   gcloud functions logs read generateDiscoverCards --region us-central1 --limit 50
   ```

3. Verify API keys are set:
   ```bash
   firebase functions:config:get
   ```

4. Manually trigger function:
   ```bash
   gcloud scheduler jobs run generate-daily-intelligence --location=us-central1
   ```

See: [CLOUD-SCHEDULER-VERIFICATION.md](CLOUD-SCHEDULER-VERIFICATION.md)

---

### Issue: API calls timing out

**Symptoms:**
- Frontend shows "Request timeout" errors
- Cloud Functions logs show timeout errors

**Solutions:**

1. Increase Cloud Function timeout (default: 60s):
   ```javascript
   // In functions/src/index.ts
   export const chatIntel = functions
     .runWith({ timeoutSeconds: 120 })
     .https.onRequest(...)
   ```

2. Check Perplexity API status: https://status.perplexity.ai/
3. Check Anthropic API status: https://status.anthropic.com/
4. Verify API keys are valid

---

### Issue: Firestore permission errors

**Symptoms:**
- Frontend shows "Permission denied" errors
- Console logs show "Missing or insufficient permissions"

**Solutions:**

1. Check Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verify user is authenticated (for protected collections)

3. Check collection-level permissions in Firebase Console:
   - Firestore Database → Rules

4. Test rules in Firebase Console:
   - Firestore Database → Rules → Rules Playground

---

### Issue: Build failures

**Symptoms:**
- `npm run build` fails with TypeScript errors
- Missing dependencies

**Solutions:**

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

3. Update dependencies:
   ```bash
   npm update
   ```

---

### Issue: Environment variables not loading

**Symptoms:**
- `undefined` values for API keys in console
- "Invalid API key" errors

**Solutions:**

1. Verify `.env` file exists in project root:
   ```bash
   cat .env
   ```

2. Ensure variables are prefixed with `VITE_` (for frontend):
   ```bash
   VITE_FIREBASE_API_KEY=...  # ✅ Correct
   FIREBASE_API_KEY=...       # ❌ Wrong (won't be exposed)
   ```

3. Restart dev server after changing `.env`:
   ```bash
   npm run dev
   ```

---

## Rollback Strategy

If deployment fails or introduces bugs:

### Rollback Frontend (Hosting)

```bash
# List recent deployments
firebase hosting:clone plannerapi-prod:live plannerapi-prod:PREVIOUS_VERSION

# View deployment history
firebase hosting:channel:list

# Rollback to previous version (manual via Firebase Console)
# Navigate to: Hosting → Release history → Select version → "Rollback"
```

### Rollback Cloud Functions

```bash
# Redeploy previous version from git
git checkout <previous-commit-hash>
cd functions
npm run deploy
```

Or manually in Firebase Console:
- Navigate to: Functions → Select function → Version history → "Rollback"

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Verify `discover_cards` updated at 6 AM ET
- [ ] Check Cloud Scheduler execution logs
- [ ] Monitor API costs (Perplexity + Claude usage)

### Weekly Checks

- [ ] Review Firestore usage (storage + reads/writes)
- [ ] Check user engagement metrics (GA4)
- [ ] Audit `premium_briefs` for quality and diversity

### Monthly Checks

- [ ] Rotate API keys (see: [SECURITY-KEY-ROTATION.md](SECURITY-KEY-ROTATION.md))
- [ ] Review and optimize Firestore indexes
- [ ] Update dependencies: `npm update`

---

## Production URLs

- **Frontend:** https://plannerapi-prod.web.app
- **Firebase Console:** https://console.firebase.google.com/project/plannerapi-prod
- **Cloud Functions:**
  - `generateDiscoverCards`: https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards
  - `chat-intel`: https://us-central1-plannerapi-prod.cloudfunctions.net/chat-intel
  - `chatSimple`: https://us-central1-plannerapi-prod.cloudfunctions.net/chatSimple

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow
- [API-USAGE-OPTIMIZATION.md](API-USAGE-OPTIMIZATION.md) - Cost optimization strategies
- [SECURITY-KEY-ROTATION.md](SECURITY-KEY-ROTATION.md) - API key rotation procedures
- [CLOUD-SCHEDULER-VERIFICATION.md](CLOUD-SCHEDULER-VERIFICATION.md) - Scheduler troubleshooting
- [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md) - Manual testing guide

---

**Last Updated:** February 12, 2026
**Maintainer:** Sav Banerjee
