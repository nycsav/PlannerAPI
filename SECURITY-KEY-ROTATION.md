# Security: API Key Rotation Guide

## ⚠️ Critical Issue: Exposed API Keys

Your project currently has **real API keys** in the `.env` files:

- ✗ `.env` contains Perplexity and Firebase credentials
- ✗ `functions/.env` contains Perplexity and Anthropic API keys
- ⚠️ These files are tracked in git history (even if .gitignore is set now)

**Action Required**: Rotate these keys immediately.

---

## 🔑 Keys to Rotate

| Key | Location | Provider | Priority |
|-----|----------|----------|----------|
| `PPLX_API_KEY` | `functions/.env` | Perplexity | **CRITICAL** |
| `ANTHROPIC_API_KEY` | `functions/.env` | Anthropic | **CRITICAL** |
| Firebase API Key | `.env` | Firebase | **HIGH** (Web key only) |

---

## Step-by-Step Rotation

### Phase 1: Generate New Perplexity API Key

**1. Go to Perplexity Settings:**
- Open https://www.perplexity.ai/settings/api
- Sign in if needed

**2. Create a New Key:**
- Click "Create New Key"
- Name it: `PlannerAPI-Production-2026-01`
- Copy the key (starts with `pplx-`)

**3. Keep Old Key Active for 24 Hours:**
- Don't delete the old key yet
- We'll revoke after deployment succeeds

**4. Update Firebase Config:**
```bash
firebase functions:config:set \
  pplx.api_key="NEW_PERPLEXITY_KEY_HERE"
```

**5. Deploy Cloud Functions:**
```bash
cd functions
npm run deploy
```

**6. Verify Deployment:**
```bash
firebase functions:log --only generateDiscoverCards --since 10m
```

Look for successful logs without errors.

**7. Test Manually:**
```bash
gcloud functions call generateDiscoverCards \
  --gen2 \
  --region us-central1 \
  --project plannerapi-prod
```

**8. Check Firestore:**
- Open Firebase Console → Firestore
- Check `discover_cards` collection
- Verify new cards were created today

**9. Revoke Old Key (After 24h):**
- Go to https://www.perplexity.ai/settings/api
- Delete old key

---

### Phase 2: Generate New Anthropic API Key

**1. Go to Anthropic Console:**
- Open https://console.anthropic.com/settings/keys
- Sign in with your Anthropic account

**2. Create a New Key:**
- Click "Create Key"
- Name it: `PlannerAPI-Claude-2026-01`
- Copy the key (starts with `sk-ant-`)

**3. Keep Old Key Active for 24 Hours:**
- Don't delete the old key yet

**4. Update Firebase Config:**
```bash
firebase functions:config:set \
  anthropic.api_key="NEW_ANTHROPIC_KEY_HERE"
```

**5. Deploy Cloud Functions:**
```bash
cd functions
npm run deploy
```

**6. Verify:**
```bash
firebase functions:log --only generateDiscoverCards --since 10m
```

**7. Revoke Old Key (After 24h):**
- Go to https://console.anthropic.com/settings/keys
- Click the trash icon next to old key

---

### Phase 3: Secure Firebase Credentials

**Note**: Firebase Web API Key is somewhat less sensitive than backend API keys (scope is limited by security rules), but should still be rotated.

**Option A: Regenerate Web API Key** (If needed)
- Go to Firebase Console → Project Settings → General
- Scroll down to find the API key
- Click the settings icon → "Regenerate"
- Update `VITE_FIREBASE_API_KEY` in `.env`

**Option B: Keep Firebase Key (Acceptable)**
- The Firebase Web API key is limited by Firestore security rules
- It can be public-ish (no read/write without auth)
- Only regenerate if you suspect compromise

---

### Phase 4: Secure .env Files from Git History

**After confirming new keys work**, remove old keys from git:

```bash
# Verify .gitignore has .env patterns
cat .gitignore | grep -E "\.env|functions/\.env"

# Should see:
# .env
# .env.local
# functions/.env
```

**If .env files were committed before:**

```bash
# Install git-filter-repo (one time)
brew install git-filter-repo

# Remove .env from all git history
git filter-repo --path .env --invert-paths
git filter-repo --path functions/.env --invert-paths

# Force push (use with caution!)
git push origin --force-with-lease main
```

**⚠️ Important**: `git filter-repo` rewrites history. Only do this if:
- Repository is private or not shared
- Or coordinate with team before force-pushing
- Or create a new clean repository

---

### Phase 5: Verify No Secrets in Git

```bash
# Check git history for API keys
git log --all -S "pplx-" --source --remotes

# Should return: (nothing)

git log --all -S "sk-ant-" --source --remotes

# Should return: (nothing)
```

---

## ✅ Verification Checklist

After rotation, verify everything works:

- [ ] New Perplexity key deployed to Firebase
- [ ] New Anthropic key deployed to Firebase
- [ ] Cloud Functions logs show no errors
- [ ] `generateDiscoverCards` ran successfully
- [ ] New cards appeared in Firestore `discover_cards`
- [ ] Frontend loads without API errors
- [ ] Old keys revoked at provider dashboards
- [ ] `.env` files removed from git history
- [ ] `git log` shows no exposed API keys

---

## 🚨 If Something Breaks

**Cloud Function fails after deployment:**

1. **Check logs:**
   ```bash
   firebase functions:log --only generateDiscoverCards --tail
   ```

2. **Rollback to old key** (if needed):
   ```bash
   firebase functions:config:set \
     pplx.api_key="OLD_KEY_HERE"
   cd functions && npm run deploy
   ```

3. **Keep old key active** until new key is confirmed working

4. **Contact API providers** if keys are rejected

---

## 📋 Local Development Setup

**For local development** (using Firebase emulator):

```bash
# 1. Create local .env file (never commit)
cp .env.example .env

# 2. Edit .env with your actual API keys
# .env is in .gitignore so it won't be committed

# 3. Start emulator
firebase emulators:start

# 4. Run functions locally
npm run serve
```

---

## 🔒 Future: Automated Key Rotation

Once keys are rotated, consider:

1. **GitHub Secrets** for CI/CD deployments
   - Store keys in GitHub → Settings → Secrets
   - Reference in deploy workflows

2. **Google Cloud Secret Manager**
   - Store keys in Secret Manager
   - Cloud Functions automatically inject at runtime
   - Audit all access

3. **Scheduled Rotation**
   - Rotate keys every 90 days
   - Use Google Cloud KMS for key management

---

## Questions?

If you need help at any step, check the relevant API provider docs:
- **Perplexity**: https://docs.perplexity.ai/
- **Anthropic**: https://docs.anthropic.com/
- **Firebase**: https://firebase.google.com/docs
