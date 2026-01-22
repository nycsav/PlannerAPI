# Deployment Checklist

Complete guide for deploying PlannerAPI to production.

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests passing locally
- [ ] No console errors or warnings
- [ ] TypeScript builds without errors: `npm run build`
- [ ] No hardcoded API keys or secrets
- [ ] `.env` files in `.gitignore`
- [ ] All feature branches merged to `main`

### 2. Environment Setup
- [ ] `.env` file configured with all required variables
- [ ] `functions/.env` configured with API keys
- [ ] Firebase project ID correct: `plannerapi-prod`
- [ ] Google Cloud project ID verified
- [ ] All API keys valid and tested

### 3. API Keys & Secrets
- [ ] Perplexity API key valid
- [ ] Anthropic API key valid
- [ ] Firebase Web API key configured
- [ ] Old API keys backed up (for rollback)
- [ ] New keys not committed to git

### 4. Firebase Configuration
- [ ] Firebase CLI authenticated: `firebase login`
- [ ] Project set: `firebase use plannerapi-prod`
- [ ] Firestore database initialized
- [ ] Firestore security rules reviewed
- [ ] Firebase indexes created: `firestore.indexes.json`
- [ ] Firebase hosting domain configured

### 5. Cloud Scheduler
- [ ] Cloud Scheduler API enabled
- [ ] `generateDiscoverCards` job exists
- [ ] Job scheduled for 6 AM ET: `0 6 * * *`
- [ ] Job status: ENABLED
- [ ] Manual trigger tested successfully

### 6. Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] CHANGELOG.md updated
- [ ] Comments in complex code sections

---

## Deployment Steps

### Step 1: Pre-Deployment Testing

```bash
# Verify environment
npm run build
npm run lint  # if configured

# Test locally
npm run dev

# Run basic feature tests
# (See TESTING-CHECKLIST.md)
```

### Step 2: Update Version

```bash
# Update package.json version
# e.g., 1.0.0 → 1.0.1

# Create git commit
git add .
git commit -m "release: version 1.0.1"
git push origin main
```

### Step 3: Deploy Frontend

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Expected output:
# ✔ Deploy complete!
# Hosting URL: https://plannerapi-prod.web.app
```

**Verify frontend:**
- [ ] https://plannerapi-prod.web.app loads
- [ ] No console errors
- [ ] All pages accessible
- [ ] Analytics events tracked

### Step 4: Deploy Cloud Functions

```bash
# Build TypeScript
cd functions
npm run build

# Deploy functions
npm run deploy

# Or explicitly:
firebase deploy --only functions

# Expected output:
# ✔ functions[generateDiscoverCards(us-central1)] ... deployed
# ✔ functions[chatSimple(us-central1)] ... deployed
```

**Verify functions:**
- [ ] All functions listed: `firebase functions:list`
- [ ] No errors in logs: `firebase functions:log`
- [ ] Manual function trigger works

### Step 5: Verify Deployment

```bash
# Check hosting status
firebase hosting:sites:list

# View function logs
firebase functions:log --only generateDiscoverCards

# Test API endpoints
curl "https://planners-backend-865025512785.us-central1.run.app/trending/topics?audience=CMO&limit=6"

# Check Cloud Scheduler
gcloud scheduler jobs describe generateDiscoverCards --location=us-central1 --project=plannerapi-prod
```

### Step 6: Monitor

**Firebase Console:**
1. Go to https://console.firebase.google.com/u/0/project/plannerapi-prod
2. Check:
   - ✅ Hosting showing recent deployment
   - ✅ Functions showing recent executions
   - ✅ Firestore has recent data
   - ✅ No critical errors

**Google Cloud Console:**
1. Go to https://console.cloud.google.com/functions
2. Check:
   - ✅ All functions showing green status
   - ✅ Cloud Scheduler job enabled
   - ✅ Recent execution logs successful

**Frontend:**
1. Visit https://plannerapi-prod.web.app
2. Verify:
   - ✅ Page loads without errors
   - ✅ Daily Intelligence cards display
   - ✅ Search functionality works
   - ✅ Analytics events tracked

---

## Rollback Procedure

If deployment has critical issues:

### Immediate Rollback (Last 5 Minutes)

```bash
# Revert hosting to previous version
firebase hosting:rollback

# Verify rollback
open https://plannerapi-prod.web.app
```

### Full Rollback (Git History)

```bash
# Revert to last known good commit
git revert HEAD
git push origin main

# Redeploy previous version
firebase deploy --only hosting,functions
```

### Rollback API Keys

If API keys were compromised:

```bash
# Revert to backup keys
firebase functions:config:set \
  pplx.api_key="BACKUP_PERPLEXITY_KEY" \
  anthropic.api_key="BACKUP_ANTHROPIC_KEY"

# Redeploy
cd functions && npm run deploy
```

---

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs hourly
- [ ] Check analytics for unusual patterns
- [ ] Test all major user flows
- [ ] Verify Cloud Scheduler ran at 6 AM ET
- [ ] Check Firestore for new cards

### Week 1
- [ ] Monitor performance metrics
- [ ] Review analytics data
- [ ] Check API quota usage
- [ ] Verify cost estimates
- [ ] Gather user feedback

### Ongoing
- [ ] Set up monitoring alerts (optional)
- [ ] Review error logs weekly
- [ ] Check API usage patterns
- [ ] Plan next feature release

---

## Deployment Troubleshooting

### Firebase Hosting Not Updating

```bash
# Clear cache and redeploy
firebase hosting:disable
firebase deploy --only hosting
firebase hosting:enable
```

### Cloud Function Not Executing

```bash
# Check function exists
firebase functions:list

# View full logs
firebase functions:log --only generateDiscoverCards

# Redeploy specific function
firebase deploy --only functions:generateDiscoverCards
```

### Cloud Scheduler Job Not Running

```bash
# Verify job exists and is enabled
gcloud scheduler jobs describe generateDiscoverCards \
  --location=us-central1 \
  --project=plannerapi-prod

# Manually trigger
gcloud scheduler jobs run generateDiscoverCards \
  --location=us-central1 \
  --project=plannerapi-prod

# Check function logs
gcloud functions logs read generateDiscoverCards --region us-central1
```

### API Keys Not Working

```bash
# Verify keys are set
firebase functions:config:get

# Test key directly
curl https://api.perplexity.ai/models \
  -H "Authorization: Bearer $PPLX_API_KEY"

# Update keys if needed
firebase functions:config:set \
  pplx.api_key="NEW_KEY"
cd functions && npm run deploy
```

---

## Environment Variables by Deployment

### Development
```
VITE_FIREBASE_API_KEY=dev-key
VITE_FIREBASE_PROJECT_ID=plannerapi-dev
VITE_CLOUD_RUN_URL=http://localhost:8080
```

### Staging
```
VITE_FIREBASE_API_KEY=staging-key
VITE_FIREBASE_PROJECT_ID=plannerapi-staging
VITE_CLOUD_RUN_URL=https://staging-backend.cloudrun.app
```

### Production
```
VITE_FIREBASE_API_KEY=prod-key
VITE_FIREBASE_PROJECT_ID=plannerapi-prod
VITE_CLOUD_RUN_URL=https://planners-backend-865025512785.us-central1.run.app
```

---

## Deployment Frequency

- **Hotfixes**: Deploy immediately
- **Bug fixes**: Deploy on Friday after testing
- **Features**: Deploy weekly on Tuesday
- **Major releases**: Plan 1-2 weeks in advance

---

## Support

For deployment issues:
1. Check logs: `firebase functions:log`
2. Review this checklist
3. See: [RUNBOOK.md](RUNBOOK.md) for common problems
4. Check Firebase status: https://status.firebase.google.com/

---

## Deployment History

Keep a log of deployments for reference:

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2026-01-22 | 1.0.0 | Initial launch | ✅ Success |
| ... | ... | ... | ... |
