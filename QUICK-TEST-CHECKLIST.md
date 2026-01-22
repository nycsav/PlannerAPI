# Quick Test Checklist - Do This Right Now!

**Dev Server:** http://localhost:5173
**Time Required:** 5-10 minutes
**Status:** ⚠️ Backend NOT deployed - Testing with fallbacks

---

## ✅ Test #1: Open the App (30 seconds)

**Action:** Open http://localhost:5173 in Chrome/Firefox

**What You Should See:**
- ✅ Page loads successfully
- ✅ Large hero section with search bar
- ✅ 6 briefing cards in grid layout below

**What to Check in DevTools (Cmd+Option+I):**
1. Go to **Console** tab
2. You SHOULD see these errors (this is expected!):
   ```
   Failed to fetch briefings, using fallback
   Failed to fetch trending topics, using defaults
   ```
3. You should NOT see any other JavaScript errors

**✅ PASS if:** Page loads, briefings show, only expected fetch errors
**❌ FAIL if:** Blank page, JavaScript errors, or page crash

---

## ✅ Test #2: Check Briefing Cards (1 minute)

**Action:** Scroll to "Executive Intelligence Briefings" section

**What to Verify:**
1. Count the cards - should be exactly **6 cards**
2. Check the first (large) card:
   - ID badge: **LOG-104**
   - Date: **14.01.2026** (this is fallback data - will change after deployment)
   - Title: "Post-Cookie Attribution: $4.2B Market Shift"
   - Theme tag: **AI Strategy** (colored chip at top)

3. Hover over cards - should see subtle hover effect

**✅ PASS if:** 6 cards display with correct data
**❌ FAIL if:** Missing cards, broken layout, or no data

---

## ✅ Test #3: Search Placeholders Rotate (15 seconds)

**Action:** Click on the hero search input (DON'T TYPE)

**What to Do:**
1. Watch the placeholder text
2. Count to 10 slowly
3. Placeholder should change 3 times

**Expected Placeholders (rotating):**
- "What's driving the $4.2B shift in attribution spend?"
- "How are competitors using AI to increase retention 23%?"
- "Show me retail media ROI benchmarks for 2026"
- ...etc (6 total)

**✅ PASS if:** Placeholder changes every ~3 seconds
**❌ FAIL if:** Placeholder stays static or doesn't rotate

---

## ✅ Test #4: Category Chips Display (30 seconds)

**Action:** Look below the search bar

**What to Check:**
1. You should see **6 category chips**:
   - AI Strategy (with trending arrow icon ↗)
   - Market Trends (with trending arrow icon ↗)
   - Brand Intelligence
   - Revenue Growth (with trending arrow icon ↗)
   - Competitive Analysis
   - Customer Retention

2. Some chips have the TrendingUp icon (small arrow)
3. Chips are white with border, hover changes color

**✅ PASS if:** 6 chips visible with trending indicators
**❌ FAIL if:** Chips missing or no trending icons

---

## ✅ Test #5: Click a Briefing Card (1 minute)

**Action:** Click "Read Analysis" on any briefing card

**What Should Happen:**
1. Modal opens with intelligence brief
2. Right side shows "Strategic Frameworks" panel
3. You see 3 default frameworks:
   - Digital Strategy
   - Media Strategy
   - CX Strategy

4. Each framework has 3 action items

**Why defaults?** Backend not deployed yet, so modal uses fallback frameworks

**✅ PASS if:** Modal opens, frameworks display, no errors
**❌ FAIL if:** Modal doesn't open or crashes

---

## ✅ Test #6: Try Chat Query (1 minute)

**Action:** Type in hero search and press Enter (or click SEARCH)

**What to Type:** "How are CMOs using AI?"

**What Should Happen:**
1. Page scrolls to "Executive Strategy Chat" section
2. Loading spinner appears
3. ⚠️ Error message appears: "Unable to connect to intelligence service"

**Why error?** Backend not deployed yet - this is EXPECTED!

**What to Check in DevTools:**
1. Open **Network** tab
2. Look for POST to `/chat-intel`
3. Click on it and check **Payload** tab
4. Should see:
   ```json
   {
     "query": "How are CMOs using AI?",
     "audience": "CMO"
   }
   ```

**✅ PASS if:** Request sent with audience parameter (even though it fails)
**❌ FAIL if:** No network request or missing audience field

---

## ✅ Test #7: Build Check (30 seconds)

**Action:** Run build command in terminal

**Command:**
```bash
cd /Users/savbanerjee/Projects/PlannerAPI-clean
npm run build
```

**Expected Output:**
```
✓ built in 3524ms
dist/index.html                   0.46 kB │ gzip: 0.30 kB
dist/assets/index-abc123.js     342.76 kB │ gzip: 110.23 kB
...
```

**✅ PASS if:** Build completes with no errors
**❌ FAIL if:** TypeScript errors or build failures

---

## 📊 Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. App loads | ⬜ | Page displays without crashes |
| 2. Briefing cards | ⬜ | 6 cards with correct data |
| 3. Placeholders rotate | ⬜ | Changes every 3 seconds |
| 4. Category chips | ⬜ | 6 chips with trending icons |
| 5. Modal opens | ⬜ | Frameworks panel shows defaults |
| 6. Chat query | ⬜ | Request includes audience param |
| 7. Build succeeds | ⬜ | No TypeScript errors |

---

## What's Next?

### If All Tests PASS ✅
**You're ready for deployment!**

**Next Steps:**
1. Deploy backend to Cloud Run (see DEPLOYMENT-GUIDE.md)
2. Test backend endpoints with curl
3. Deploy frontend to Firebase
4. Test full integration (dynamic data)

### If Any Tests FAIL ❌
**Let me know which test failed and I'll help debug!**

Common issues:
- Blank page → Check console for errors
- No briefings → Check App.tsx loaded correctly
- No rotation → Check HeroSearch component
- Build errors → Check TypeScript errors

---

## Current State Summary

**What's Working:**
- ✅ Frontend code changes complete
- ✅ Fallback data displays correctly
- ✅ No breaking changes
- ✅ Graceful error handling

**What's NOT Working (Expected):**
- ⚠️ API calls fail (backend not deployed)
- ⚠️ Briefings show hardcoded dates
- ⚠️ Trending topics use defaults
- ⚠️ Frameworks use defaults

**This is by design!** Once backend is deployed, dynamic data will replace fallbacks.

---

## Ready to Test?

1. **Open:** http://localhost:5173
2. **Follow:** Tests 1-7 above (10 minutes)
3. **Check:** Each ✅ PASS condition
4. **Report back:** Which tests passed/failed

**Start with Test #1** and work through sequentially!
