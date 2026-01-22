# Hourly Briefings Update Strategy

**Date:** January 19, 2026
**Goal:** Keep intelligence briefings fresh and current by updating every hour
**Current:** 24-hour cache (updates once per day)
**Target:** 1-hour cache (updates hourly)

---

## Current Architecture

**File:** `/backend-integration/briefings-endpoint.ts`

**Current Cache Implementation:**
```typescript
const briefingsCache = new Map<string, BriefingsCache>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type BriefingsCache = {
  briefings: IntelligenceBriefing[];
  timestamp: number;
};

router.get('/briefings/latest', async (req, res) => {
  const audience = req.query.audience || 'CMO';
  const cached = briefingsCache.get(audience);
  const now = Date.now();

  // Return cached if less than 24 hours old
  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return res.json({ briefings: cached.briefings, cached: true });
  }

  // Generate new briefings via Perplexity API
  const briefings = await generateBriefings(audience);
  briefingsCache.set(audience, { briefings, timestamp: now });

  return res.json({ briefings, cached: false });
});
```

**Cost:** ~$0.50-1.00 per briefing generation (6 briefings × $0.08-0.17 per query)

---

## Strategy 1: Reduce Cache TTL to 1 Hour (Simplest)

**Change:** Modify `CACHE_TTL_MS` from 24 hours to 1 hour

**Implementation:**
```typescript
// briefings-endpoint.ts
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (was 24 hours)
```

**Pros:**
- ✅ Simplest solution (1 line change)
- ✅ Automatic hourly updates
- ✅ No additional infrastructure
- ✅ Works immediately

**Cons:**
- ❌ Increases API costs 24x (from 1 call/day to 24 calls/day per audience)
- ❌ First user after cache expires waits for generation
- ❌ No control over update timing

**Cost Impact:**
- Current: $1/day × 4 audiences = $4/day = $120/month
- Hourly: $1/hour × 24 hours × 4 audiences = $96/day = $2,880/month

**When to Use:** Testing, low traffic, or if budget allows $3K/month

---

## Strategy 2: Scheduled Cron Job (Recommended)

**Goal:** Pre-generate briefings every hour so users never wait

**Implementation:**

**A. Create Cron Endpoint:**
```typescript
// briefings-endpoint.ts
router.post('/briefings/regenerate', async (req, res) => {
  // Verify request is from Cloud Scheduler (auth token)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const audiences = ['CMO', 'VP Marketing', 'Brand Director', 'Growth Leader'];
  const results = [];

  for (const audience of audiences) {
    try {
      const briefings = await generateBriefings(audience);
      briefingsCache.set(audience, {
        briefings,
        timestamp: Date.now()
      });
      results.push({ audience, success: true, count: briefings.length });
    } catch (error) {
      results.push({ audience, success: false, error: error.message });
    }
  }

  return res.json({
    regenerated: true,
    timestamp: new Date().toISOString(),
    results
  });
});
```

**B. Set Up Google Cloud Scheduler:**
```bash
# Create Cloud Scheduler job (run hourly)
gcloud scheduler jobs create http briefings-hourly-update \
  --schedule="0 * * * *" \
  --uri="https://planners-backend-865025512785.us-central1.run.app/briefings/regenerate" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_SECRET_TOKEN" \
  --location=us-central1 \
  --description="Regenerate intelligence briefings every hour"
```

**C. Keep Cache TTL Long:**
```typescript
// briefings-endpoint.ts
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours (buffer in case cron fails)
```

**Pros:**
- ✅ Users get instant responses (no waiting)
- ✅ Predictable API costs
- ✅ Control over exact timing (e.g., :05 past each hour)
- ✅ Can skip non-business hours (save 50% cost)
- ✅ Monitoring and alerting built-in

**Cons:**
- ❌ Requires Cloud Scheduler setup
- ❌ Need to secure cron endpoint
- ❌ More infrastructure complexity

**Cost Impact:**
- $1/hour × 24 hours × 4 audiences = $96/day = $2,880/month
- With business hours only (8am-8pm): $48/day = $1,440/month

**When to Use:** Production deployments, user-facing applications

---

## Strategy 3: Hybrid - Reduce to 4 Hours + Smart Refresh

**Goal:** Balance freshness with cost

**Implementation:**
```typescript
// briefings-endpoint.ts
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

router.get('/briefings/latest', async (req, res) => {
  const audience = req.query.audience || 'CMO';
  const cached = briefingsCache.get(audience);
  const now = Date.now();

  // Return cached if less than 4 hours old
  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    return res.json({ briefings: cached.briefings, cached: true });
  }

  // If cache expired, return stale data immediately
  // but trigger async regeneration for next request
  if (cached) {
    // Return stale data (don't make user wait)
    res.json({ briefings: cached.briefings, cached: true, stale: true });

    // Regenerate in background (don't await)
    generateBriefings(audience).then(briefings => {
      briefingsCache.set(audience, { briefings, timestamp: Date.now() });
    }).catch(console.error);

    return;
  }

  // No cache at all (first request) - generate fresh
  const briefings = await generateBriefings(audience);
  briefingsCache.set(audience, { briefings, timestamp: now });
  return res.json({ briefings, cached: false });
});
```

**Pros:**
- ✅ Users never wait (return stale data, refresh in background)
- ✅ Lower costs (6 updates/day vs. 24)
- ✅ No additional infrastructure
- ✅ Freshness: 4 hours max age

**Cons:**
- ❌ Briefings can be up to 4 hours old
- ❌ Users might see same content for several requests
- ❌ Unpredictable refresh timing (depends on traffic)

**Cost Impact:**
- $1 × 6 updates/day × 4 audiences = $24/day = $720/month

**When to Use:** Limited budget, acceptable 4-hour freshness

---

## Strategy 4: Incremental Updates (Advanced)

**Goal:** Update only changed/new briefings, not all 6

**Implementation:**
```typescript
// Track which briefings have been updated recently
const briefingLastUpdated = new Map<string, number>();

async function generateIncrementalBriefings(audience: string) {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Get current cached briefings
  const cached = briefingsCache.get(audience);
  if (!cached) {
    // No cache, generate all
    return await generateAllBriefings(audience);
  }

  // Determine which briefings need refresh (oldest 2)
  const sorted = cached.briefings.sort((a, b) => {
    const aUpdated = briefingLastUpdated.get(a.id) || 0;
    const bUpdated = briefingLastUpdated.get(b.id) || 0;
    return aUpdated - bUpdated;
  });

  // Regenerate oldest 2 briefings
  const toRegenerate = sorted.slice(0, 2);
  const newBriefings = await Promise.all(
    toRegenerate.map(b => generateSingleBriefing(audience, b.theme))
  );

  // Replace old with new
  const updated = cached.briefings.map(b => {
    const newVersion = newBriefings.find(nb => nb.theme === b.theme);
    if (newVersion) {
      briefingLastUpdated.set(newVersion.id, now);
      return newVersion;
    }
    return b;
  });

  return updated;
}
```

**Pros:**
- ✅ Reduces API costs by 66% (refresh 2/6 instead of 6/6)
- ✅ Always have mix of fresh and recent content
- ✅ Smoother updates (not everything changes at once)

**Cons:**
- ❌ More complex logic
- ❌ Some briefings can be 3-6 hours old
- ❌ Tracking overhead

**Cost Impact:**
- $0.33/update × 24 updates/day × 4 audiences = $32/day = $960/month

**When to Use:** High-traffic production, cost-sensitive, acceptable staggered updates

---

## Recommended Implementation Plan

**Phase 1: Testing (This Week)**
Use **Strategy 1** (1-hour cache) for testing the feature:
```typescript
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
```

**Why:** Simplest to test, validates the feature works, acceptable cost for short-term testing

---

**Phase 2: Production (Next Week)**
Switch to **Strategy 2** (Cron Job) for production:

**Steps:**
1. Add `/briefings/regenerate` endpoint with auth
2. Set up Cloud Scheduler job (hourly, :05 past hour)
3. Configure business hours only (8am-8pm) to save 50%
4. Set cache TTL to 2 hours (buffer)
5. Add monitoring/alerting for failed regenerations

**Cost:** $48/day = $1,440/month (business hours only)

---

**Phase 3: Optimization (Month 2)**
If costs too high, implement **Strategy 4** (Incremental):
- Refresh 2 oldest briefings every hour
- Rotate through all 6 over 3 hours
- Reduces costs to $960/month

---

## Implementation Code

### Strategy 2: Full Implementation

**1. Update briefings-endpoint.ts:**
```typescript
import express from 'express';
const router = express.Router();

// Cache configuration
const briefingsCache = new Map<string, BriefingsCache>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours buffer

// Cron endpoint (called by Cloud Scheduler)
router.post('/briefings/regenerate', async (req, res) => {
  // Verify request is from Cloud Scheduler
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    console.error('Unauthorized regeneration attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Cron] Starting hourly briefings regeneration');
  const startTime = Date.now();
  const audiences = ['CMO', 'VP Marketing', 'Brand Director', 'Growth Leader'];
  const results = [];

  for (const audience of audiences) {
    try {
      console.log(`[Cron] Regenerating briefings for: ${audience}`);
      const briefings = await generateBriefings(audience, 6);

      briefingsCache.set(audience, {
        briefings,
        timestamp: Date.now()
      });

      results.push({
        audience,
        success: true,
        count: briefings.length,
        duration: Date.now() - startTime
      });

      console.log(`[Cron] ✓ ${audience}: ${briefings.length} briefings`);
    } catch (error) {
      console.error(`[Cron] ✗ ${audience} failed:`, error);
      results.push({
        audience,
        success: false,
        error: error.message
      });
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log(`[Cron] Completed in ${totalDuration}ms`);

  return res.json({
    success: true,
    regenerated: true,
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    results
  });
});

// User-facing endpoint (serves from cache)
router.get('/briefings/latest', async (req, res) => {
  const audience = req.query.audience || 'CMO';
  const limit = parseInt(req.query.limit as string) || 6;

  const cached = briefingsCache.get(audience);
  const now = Date.now();

  // Return cached if available and fresh
  if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
    const age = Math.floor((now - cached.timestamp) / 1000 / 60); // minutes
    return res.json({
      briefings: cached.briefings.slice(0, limit),
      cached: true,
      age: `${age} minutes old`
    });
  }

  // Cache miss or expired - generate (shouldn't happen with cron)
  console.warn(`[Cache Miss] Generating briefings for ${audience} (cron may have failed)`);
  const briefings = await generateBriefings(audience, limit);
  briefingsCache.set(audience, { briefings, timestamp: now });

  return res.json({ briefings, cached: false });
});

export default router;
```

**2. Add to .env:**
```
CRON_SECRET=your-secure-random-token-here
```

**3. Deploy:**
```bash
gcloud run deploy planners-backend --source .
```

**4. Set Up Cloud Scheduler:**
```bash
# Create service account for Cloud Scheduler
gcloud iam service-accounts create briefings-cron \
  --display-name="Briefings Hourly Cron"

# Create the scheduled job
gcloud scheduler jobs create http briefings-hourly-regen \
  --schedule="5 * * * *" \
  --uri="https://planners-backend-865025512785.us-central1.run.app/briefings/regenerate" \
  --http-method=POST \
  --headers="Authorization=Bearer ${CRON_SECRET}" \
  --location=us-central1 \
  --description="Regenerate intelligence briefings hourly at :05" \
  --time-zone="America/New_York"

# For business hours only (8am-8pm):
gcloud scheduler jobs create http briefings-business-hours \
  --schedule="5 8-20 * * *" \
  --uri="https://planners-backend-865025512785.us-central1.run.app/briefings/regenerate" \
  --http-method=POST \
  --headers="Authorization=Bearer ${CRON_SECRET}" \
  --location=us-central1 \
  --description="Regenerate briefings (business hours)" \
  --time-zone="America/New_York"
```

**5. Test Manually:**
```bash
curl -X POST \
  "https://planners-backend-865025512785.us-central1.run.app/briefings/regenerate" \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**6. Monitor:**
```bash
# View cron job logs
gcloud scheduler jobs describe briefings-hourly-regen --location=us-central1

# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=planners-backend" --limit=50 --format=json
```

---

## Monitoring & Alerting

**Set up alerts for:**
1. Cron job failures
2. API error rates
3. Cache misses (indicates cron not working)
4. Response time degradation

**Google Cloud Monitoring:**
```bash
# Create alert for failed cron jobs
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="Briefings Cron Failures" \
  --condition-display-name="Cron job failed" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s \
  --aggregation-alignment-period=60s
```

---

## Cost Analysis

| Strategy | Updates/Day | Cost/Day | Cost/Month | Freshness |
|----------|------------|----------|------------|-----------|
| **24-hour** (current) | 1 | $4 | $120 | 24 hours |
| **1-hour** (simple) | 24 | $96 | $2,880 | 1 hour |
| **Cron (24/7)** | 24 | $96 | $2,880 | 1 hour |
| **Cron (business)** | 12 | $48 | $1,440 | 1 hour* |
| **4-hour** (hybrid) | 6 | $24 | $720 | 4 hours |
| **Incremental** | 24 | $32 | $960 | 1-3 hours |

*Business hours only, may be stale overnight

---

## Testing

**After Implementation:**

1. **Verify Cron Works:**
   ```bash
   # Trigger manually
   curl -X POST https://...run.app/briefings/regenerate \
     -H "Authorization: Bearer ${CRON_SECRET}"

   # Check response
   # Should return: {"success": true, "results": [...]}
   ```

2. **Check Frontend:**
   - Open http://localhost:3000
   - Briefings should load instantly (from cache)
   - Check browser network tab: response should show `"cached": true`

3. **Wait 1 Hour:**
   - Cron should run automatically
   - Check Cloud Scheduler logs
   - Refresh homepage, should see new briefings

4. **Monitor Costs:**
   - Google Cloud Console → Billing
   - Track API usage (should be predictable)

---

## Rollback Plan

If costs too high or issues arise:

**Quick Fix:** Increase cache TTL back to 24 hours
```typescript
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // back to 24 hours
```

**Disable Cron:**
```bash
gcloud scheduler jobs pause briefings-hourly-regen --location=us-central1
```

---

## Summary Recommendation

**For Testing (Now):**
- Use **1-hour cache** (simplest)
- Monitor costs for 1 week
- Validate feature works

**For Production (Soon):**
- Implement **Cron job** (business hours)
- $1,440/month cost
- Best user experience
- Predictable updates

**Questions?** Start with 1-hour cache for testing, then implement cron when ready for production.
