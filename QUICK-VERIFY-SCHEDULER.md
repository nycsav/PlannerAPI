# Quick Cloud Scheduler Verification

**Run these commands in order to verify Cloud Scheduler is working:**

---

## 1️⃣ Set Project & Authenticate

```bash
gcloud auth login
gcloud config set project plannerapi-prod
```

---

## 2️⃣ Check if Job Exists

```bash
gcloud scheduler jobs list --location=us-central1 --project=plannerapi-prod
```

**Expected output:**
```
ID                      LOCATION     SCHEDULE    TIMEZONE
generateDiscoverCards   us-central1  0 6 * * *   America/New_York
```

If nothing shows, go to Step 3.

---

## 3️⃣ Create Job (If Needed)

```bash
gcloud scheduler jobs create http generateDiscoverCards \
  --schedule="0 6 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards" \
  --http-method=POST \
  --location=us-central1 \
  --project=plannerapi-prod
```

---

## 4️⃣ Test Job Manually

```bash
gcloud scheduler jobs run generateDiscoverCards \
  --location=us-central1 \
  --project=plannerapi-prod
```

---

## 5️⃣ Check Logs

```bash
firebase functions:log --only generateDiscoverCards --since 10m
```

**Should see:**
```
✓ Generated 10 discover cards successfully
✓ All cards stored in Firestore
```

---

## 6️⃣ Verify Firestore

Go to: https://console.firebase.google.com/u/0/project/plannerapi-prod/firestore/data/discover_cards

**Should see:**
- 10 documents
- Created today
- Fields: `pillar`, `title`, `summary`, `keySignals`, `publishedAt`

---

## 7️⃣ Check Frontend

Go to: https://plannerapi-prod.web.app

**Should see:**
- Daily Intelligence section with 10 cards
- Pillar filter (AI Strategy, Brand Performance, Competitive Intel, Media Trends)
- Card click shows full brief

---

## ✅ All Good?

Your Cloud Scheduler is configured correctly! Daily cards will generate at 6 AM ET.

---

## ❌ Something Wrong?

1. **Job doesn't exist:** Run Step 3
2. **Manual test fails:** Check logs in Step 5
3. **No cards in Firestore:** Check function logs for errors
4. **Frontend shows nothing:** Clear browser cache and refresh
5. **Get "403 Forbidden":** Cloud Scheduler service account needs access to function

For detailed help, see: `CLOUD-SCHEDULER-VERIFICATION.md`
