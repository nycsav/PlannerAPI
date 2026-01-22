# PlannerAPI Phase 1 Testing Guide

**Testing Date:** January 19, 2026
**Dev Server:** http://localhost:5173
**Status:** ⚠️ Backend NOT deployed yet - Testing with fallbacks

---

## Important: Current Testing State

### ✅ What Works NOW (Local Testing)
- Frontend code changes are complete
- Fallback data displays correctly
- UI components render properly
- No breaking changes to existing features

### ⚠️ What Won't Work Yet
- API calls will fail (backend endpoints not deployed)
- Dynamic briefings will fallback to hardcoded data
- Trending topics will use defaults
- Frameworks will use defaults
- **This is expected and by design!**

### 🎯 Testing Strategy
1. **Phase 1 (NOW):** Test frontend with fallbacks - verify no breaks
2. **Phase 2 (After backend deploy):** Test dynamic data integration
3. **Phase 3 (After frontend deploy):** End-to-end production testing

---

## Phase 1: Local Frontend Testing (Do This Now)

### Test 1: App Loads Without Errors

**What to test:** Basic app functionality with fallback data

**Steps:**
1. Open http://localhost:5173 in your browser
2. Open DevTools (Cmd+Option+I on Mac, F12 on Windows)
3. Go to Console tab
4. Refresh the page

**What to look for:**
- ✅ Page loads successfully
- ✅ 6 briefing cards display
- ⚠️ Console shows failed API calls (expected - backend not deployed)
- ✅ Console shows "Failed to fetch briefings, using fallback" (this is good!)
- ✅ No JavaScript errors besides network failures

**Expected Console Output:**
```
Failed to fetch briefings, using fallback: TypeError: Failed to fetch
Failed to fetch trending topics, using defaults: TypeError: Failed to fetch
```

**Screenshot what you see:**
- Main page with briefing cards
- Console errors (showing fallbacks working)

---

### Test 2: Briefing Cards Display Correctly

**What to test:** Fallback briefings render properly

**Steps:**
1. Scroll to "Executive Intelligence Briefings" section
2. Count the briefing cards (should be 6)
3. Check the first card details

**What to verify:**
- ✅ Card 1 (large, left side):
  - ID: LOG-104
  - Date: 14.01.2026 (fallback data - will be dynamic after deployment)
  - Title: "Post-Cookie Attribution: $4.2B Market Shift"
  - Theme tag: "AI Strategy"
  - Three action buttons visible

- ✅ Cards 2-6 display in grid layout
- ✅ All cards have proper styling (no broken layouts)
- ✅ Hover effects work on cards

**Take a screenshot** of the briefings section.

---

### Test 3: Hero Search Placeholders

**What to test:** Search placeholders rotate with fallback data

**Steps:**
1. Scroll to top of page
2. Click on the search input (don't type anything)
3. Watch the placeholder text for 10 seconds
4. Count how many times it changes

**What to verify:**
- ✅ Placeholder text rotates every 3 seconds
- ✅ You should see at least 3 different placeholders:
  - "What's driving the $4.2B shift in attribution spend?"
  - "How are competitors using AI to increase retention 23%?"
  - "Show me retail media ROI benchmarks for 2026"
  - etc.

- ⚠️ These are DEFAULT placeholders (not from API - backend not deployed yet)
- ✅ Rotation happens smoothly without errors

---

### Test 4: Category Chips Display

**What to test:** Category chips render with trending indicators

**Steps:**
1. Scroll to hero search area
2. Look below the search bar
3. Find the category chips (rounded buttons)

**What to verify:**
- ✅ 6 category chips displayed:
  - "AI Strategy" (with trending icon)
  - "Market Trends" (with trending icon)
  - "Brand Intelligence"
  - "Revenue Growth" (with trending icon)
  - "Competitive Analysis"
  - "Customer Retention"

- ✅ Some chips have TrendingUp icon (small arrow)
- ✅ Chips are clickable
- ⚠️ These are DEFAULT categories (will be dynamic after deployment)

**Take a screenshot** of the category chips.

---

### Test 5: Audience Selector (If Available)

**What to test:** Audience switching triggers re-fetch attempts

**Steps:**
1. Look for audience selector in navbar (if visible)
2. Open DevTools Network tab
3. Select a different audience (e.g., CMO → VP Marketing)
4. Watch Console and Network tabs

**What to verify:**
- ✅ Selecting new audience triggers fetch attempts
- ⚠️ Network tab shows failed requests to:
  - `/briefings/latest?audience=VP+Marketing&limit=6`
  - `/trending/topics?audience=VP+Marketing&limit=6`
- ✅ Console shows fallback messages
- ✅ Page doesn't crash or show errors
- ✅ Briefings still display (using fallback data)

**Expected:** Everything works, just using fallback data instead of API data.

---

### Test 6: Chat Interface

**What to test:** Chat query sends audience parameter (will fail, but check request)

**Steps:**
1. Scroll to "Executive Strategy Chat" section (or click search to activate)
2. Open DevTools Network tab
3. Enter query: "How are CMOs using AI?"
4. Click submit
5. Check Network tab for the POST request to `/chat-intel`

**What to verify:**
- ⚠️ Request will fail (backend not deployed)
- ✅ Check Request Payload includes:
  ```json
  {
    "query": "How are CMOs using AI?",
    "audience": "CMO"
  }
  ```
- ✅ Error message displays gracefully
- ✅ No page crash

---

### Test 7: Code Quality Check

**What to test:** No TypeScript errors, clean build

**Steps:**
1. Open terminal
2. Run: `npm run build`
3. Check for errors

**What to verify:**
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ Output shows: `dist/index.html ... ✓ built in XXXms`

---

## Phase 2: Backend Deployment & Testing

### Prerequisites
- Cloud Run access
- Perplexity API key
- Backend repository access

### Deploy Backend

**Steps:**
1. Copy endpoint files to your backend:
   ```bash
   cp backend-integration/briefings-endpoint.ts YOUR_BACKEND/routes/
   cp backend-integration/trending-endpoint.ts YOUR_BACKEND/routes/
   cp backend-integration/chat-intel-endpoint.ts YOUR_BACKEND/routes/
   ```

2. Update your backend server file with router imports (see server-integration-guide.ts)

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy planners-backend \
     --source . \
     --region us-central1 \
     --set-env-vars PPLX_API_KEY=your_key_here
   ```

### Test Backend Endpoints

**Test each endpoint individually:**

```bash
# Test 1: Health check
curl https://planners-backend-865025512785.us-central1.run.app/health

# Expected: {"status":"ok","timestamp":"..."}

# Test 2: Briefings endpoint
curl "https://planners-backend-865025512785.us-central1.run.app/briefings/latest?audience=CMO&limit=6"

# Expected: {"briefings":[...],"cached":false,"generatedAt":"..."}

# Test 3: Trending topics
curl "https://planners-backend-865025512785.us-central1.run.app/trending/topics?audience=CMO&limit=6"

# Expected: {"topics":[...],"cached":false,"generatedAt":"..."}

# Test 4: Chat intel with frameworks
curl -X POST "https://planners-backend-865025512785.us-central1.run.app/chat-intel" \
  -H "Content-Type: application/json" \
  -d '{"query":"How are CMOs using AI to increase ROI?","audience":"CMO"}'

# Expected: {"signals":[...],"implications":[...],"actions":[...],"frameworks":[...]}
```

**What to verify:**
- ✅ All 4 endpoints return 200 status
- ✅ Briefings have current date (not 14.01.2026)
- ✅ Trending topics are market-relevant
- ✅ Chat response includes frameworks array
- ✅ Second call to same endpoint returns `"cached": true`

---

## Phase 3: Full Integration Testing (After Both Deployed)

### Test 1: Dynamic Briefings

**Steps:**
1. Open production URL or localhost (with backend running)
2. Open DevTools Network tab
3. Refresh page
4. Check Network request to `/briefings/latest`

**What to verify:**
- ✅ Request succeeds (200 status)
- ✅ Response includes 6 briefings
- ✅ Briefings have TODAY'S date
- ✅ Briefing titles are specific with metrics
- ✅ No console errors about "using fallback"

**Compare to hardcoded:**
- ❌ OLD: Date is always "14.01.2026"
- ✅ NEW: Date is current (e.g., "19.01.2026")

---

### Test 2: Trending Topics Integration

**Steps:**
1. Refresh page
2. Watch search placeholder for 10 seconds
3. Check DevTools Network tab for `/trending/topics`

**What to verify:**
- ✅ Request succeeds (200 status)
- ✅ Placeholders are different from defaults
- ✅ Placeholders are market-relevant (mention real trends)
- ✅ Category chips match trending topics from API

**Example real placeholder:**
- "How are Fortune 500 CMOs using AI agents in 2026?"
- "What's the ROI of retail media networks vs traditional advertising?"

---

### Test 3: Context-Specific Frameworks

**Steps:**
1. Enter query: "How to improve customer retention?"
2. Wait for response
3. Scroll to "Strategic Frameworks" panel on right

**What to verify:**
- ✅ Frameworks are retention-specific:
  - "Customer Retention Strategy"
  - "Loyalty Program Design"
  - "CX Optimization"
- ❌ NOT generic defaults (Digital Strategy, Media Strategy, CX Strategy)
- ✅ Each framework has 3 specific action items
- ✅ Action items mention retention, loyalty, churn

**Compare with different query:**
1. Enter query: "How to optimize paid media campaigns?"
2. Check frameworks
3. Should be media-specific:
   - "Media Strategy"
   - "Performance Marketing"
   - "Campaign Optimization"

---

### Test 4: Audience Personalization

**Steps:**
1. Set audience to "CMO"
2. Submit query: "What's the ROI of AI marketing tools?"
3. Note the response language
4. Change audience to "Growth Leader"
5. Submit SAME query
6. Compare responses

**What to verify (CMO response):**
- ✅ Mentions: board-level, strategic positioning, budget allocation
- ✅ Implications focus on executive concerns
- ✅ Language is high-level

**What to verify (Growth Leader response):**
- ✅ Mentions: acquisition channels, conversion rates, retention tactics
- ✅ Implications focus on tactical execution
- ✅ Language is more operational

---

### Test 5: Caching Behavior

**Steps:**
1. Refresh page (first load)
2. Check Network request to `/briefings/latest`
3. Note: `"cached": false` in response
4. Refresh page again immediately
5. Check Network request again

**What to verify:**
- ✅ First request: `"cached": false` (generated fresh)
- ✅ Second request: `"cached": true` (served from cache)
- ✅ Response time: <100ms for cached vs 2-5s for fresh
- ✅ Same data returned (not re-generated)

---

### Test 6: Error Recovery

**Steps:**
1. Disconnect from internet
2. Refresh page
3. Check what displays

**What to verify:**
- ✅ Page still loads
- ✅ Fallback briefings display (hardcoded data)
- ✅ Search placeholders use defaults
- ✅ Category chips use defaults
- ✅ No blank screens or crashes
- ✅ Console shows fallback messages (not uncaught errors)

**Reconnect internet:**
- ✅ Refresh page
- ✅ Dynamic data loads again
- ✅ Everything works normally

---

## Test Results Checklist

### Phase 1 (Local Frontend - Do Now)
- [ ] App loads without crashes
- [ ] 6 briefing cards display
- [ ] Search placeholders rotate every 3 seconds
- [ ] Category chips render with trending icons
- [ ] Audience selector triggers fetch attempts
- [ ] Chat request includes audience parameter
- [ ] Build completes without errors
- [ ] Console shows expected fallback messages

### Phase 2 (Backend - After Deploy)
- [ ] Health endpoint returns 200
- [ ] Briefings endpoint returns 6 items with current date
- [ ] Trending endpoint returns 6 topics
- [ ] Chat-intel returns frameworks array
- [ ] Cached requests return `"cached": true`

### Phase 3 (Full Integration - After Both Deploy)
- [ ] Briefings show current date (not hardcoded)
- [ ] Search placeholders are market-relevant
- [ ] Frameworks change based on query context
- [ ] CMO vs Growth Leader responses differ
- [ ] Caching works (fast second requests)
- [ ] Error recovery shows fallbacks

---

## Troubleshooting

### Issue: "Failed to fetch" errors in console

**Expected:** This is normal if backend isn't deployed yet
**Action:** Check fallbacks are working (briefings still display)
**Fix:** Deploy backend to Cloud Run

### Issue: Briefings always show 14.01.2026

**Expected:** This means using fallback data
**Action:** Check Network tab - is `/briefings/latest` request succeeding?
**Fix:** Ensure backend is deployed and accessible

### Issue: Search placeholders don't change

**Expected:** Check if they're rotating every 3 seconds
**Action:** Open console - are there JS errors?
**Fix:** Refresh page, check useEffect dependencies

### Issue: Frameworks always the same 3

**Expected:** Means API not returning frameworks or parsing failed
**Action:** Check `/chat-intel` response - does it include `frameworks` array?
**Fix:** Verify chat-intel-endpoint.ts is updated version

---

## Next Steps After Testing

1. ✅ Complete Phase 1 testing (do this now)
2. ⏳ Deploy backend to Cloud Run
3. ⏳ Complete Phase 2 testing (verify endpoints)
4. ⏳ Deploy frontend to Firebase
5. ⏳ Complete Phase 3 testing (full integration)
6. 🎉 Launch to users!

---

**Current Step:** Phase 1 - Local Frontend Testing
**Action Required:** Test items in Phase 1 checklist above

Open http://localhost:5173 and start testing!
