# API Usage Optimization Guide

**Last Updated:** January 20, 2026
**Purpose:** Minimize API costs while maintaining fresh, valuable content

---

## Current API Usage Breakdown

### 1. **Perplexity API Calls**

#### A. Real-Time User Queries
**Location:** HeroSearch.tsx, ExecutiveStrategyChat.tsx
**Endpoint:** `POST https://planners-backend-865025512785.us-central1.run.app/chat-intel`
**Frequency:** Every time a user searches or asks a question
**Cost Impact:** HIGH (user-triggered, unpredictable)

**Current Usage:**
- HeroSearch: When user types query and clicks "SEARCH"
- ExecutiveStrategyChat: When user submits chat query
- Category chips: When user clicks category (triggers intelligence modal)

**Monthly Estimate:**
- 100 users/month × 5 queries each = **500 Perplexity calls**
- Cost: 500 × $0.005 = **$2.50/month**

#### B. Scheduled Content Generation (DISABLED)
**Location:** `functions/src/generateDiscoverCards.ts`
**Schedule:** Daily at 6am ET (Cloud Scheduler)
**Status:** ⚠️ CODE EXISTS BUT NOT DEPLOYED
**Frequency:** 1x daily × 10 cards = 10 Perplexity calls/day

**If Enabled Monthly Cost:**
- 30 days × 10 calls = **300 Perplexity calls**
- Cost: 300 × $0.005 = **$1.50/month**

**Current Status:** Using static cards instead (no API costs)

#### C. Trending Topics (DISABLED)
**Location:** HeroSearch.tsx line 58-79 (fetchTrending)
**Endpoint:** `GET /trending/topics?audience=CMO&limit=6`
**Status:** Tries to fetch but fails gracefully, uses defaults
**Frequency:** Once per page load per user
**Current Cost:** $0 (endpoint not implemented)

#### D. Briefings Generation (DISABLED)
**Location:** App.tsx line 346-373 (fetchBriefings)
**Endpoint:** `GET /briefings/latest?audience=CMO&limit=6`
**Status:** Tries to fetch but uses fallback on error
**Frequency:** Once per page load, plus every time audience changes
**Current Cost:** $0 (using static fallback)

---

## Perplexity API Rate Limits & Pricing

### Rate Limits (Sonar Model)
- **Free Tier:** Not available for API
- **Standard Plan:** $20/month
  - 1,000 requests/month included
  - $0.005 per request after quota
  - Rate limit: 20 requests/minute
  - No daily/hourly limits

- **Pro Plan:** $200/month
  - 10,000 requests/month included
  - $0.005 per request after quota
  - Rate limit: 50 requests/minute

### Recommended Plan
For your usage (500-800 requests/month estimated):
- **Standard Plan ($20/month)** covers you with buffer
- Includes 1,000 requests/month
- Current usage: ~500-800/month (50-80% of quota)

---

## Optimal Refresh Frequencies

### Option 1: **Static Content Only** (Current) ✅ RECOMMENDED
**Cost:** $0/month for content, ~$2.50/month for user queries
**Freshness:** Manual updates when needed

**Pros:**
- Zero ongoing costs for content generation
- Instant page loads
- No API failures or rate limits
- Predictable costs

**Cons:**
- Content doesn't auto-update
- Requires manual curation

**Best For:** MVP stage, cost-conscious operation

---

### Option 2: **Weekly Content Refresh**
**Schedule:** Every Monday at 6am ET
**API Calls:** 10 cards × 1 day = 10 calls/week = **40 calls/month**
**Cost:** $0.20/month (within Standard Plan quota)

**Configuration:**
```typescript
// Cloud Scheduler cron expression
0 6 * * 1 America/New_York  // Every Monday at 6am ET
```

**Pros:**
- Fresh content weekly
- Minimal API costs
- Covers weekend news
- Still mostly within free quota

**Cons:**
- Content can be 6 days stale
- May miss mid-week breaking news

**Best For:** Budget-conscious with some freshness needs

---

### Option 3: **Bi-Weekly Content Refresh**
**Schedule:** Monday & Thursday at 6am ET
**API Calls:** 10 cards × 2 days = 20 calls/week = **80 calls/month**
**Cost:** $0.40/month (within Standard Plan quota)

**Configuration:**
```typescript
// Cloud Scheduler cron expression
0 6 * * 1,4 America/New_York  // Mon & Thu at 6am ET
```

**Pros:**
- Content never more than 3 days old
- Covers beginning/mid-week cycles
- Still very affordable

**Cons:**
- Slightly higher costs
- May miss breaking Friday/weekend news

**Best For:** Balance of freshness and cost

---

### Option 4: **Daily Content Refresh**
**Schedule:** Every day at 6am ET
**API Calls:** 10 cards × 30 days = **300 calls/month**
**Cost:** $1.50/month (within Standard Plan quota)

**Configuration:**
```typescript
// Cloud Scheduler cron expression
0 6 * * * America/New_York  // Daily at 6am ET
```

**Pros:**
- Always fresh (24hr max staleness)
- Comprehensive news coverage
- Professional appearance
- Still within free quota

**Cons:**
- Higher API usage (30% of quota)
- More writes to Firestore
- Overkill for slow-moving industries

**Best For:** High-stakes, fast-moving markets

---

### Option 5: **Hourly Refresh** (NOT RECOMMENDED)
**Schedule:** Every hour
**API Calls:** 10 cards × 24 hours × 30 days = **7,200 calls/month**
**Cost:** ~$36/month (exceeds Standard Plan by 6,200 calls)

**Why NOT Recommended:**
- Marketing intelligence doesn't change hourly
- Massive API costs
- Exceeds rate limits
- Overkill for executive users

**Only Use If:** Breaking news platform with real-time requirements

---

## Recommended Strategy for PlannerAPI

### **Phase 1: Current State (Keep This)** ✅
- **Daily Intelligence:** Static curated cards (6 cards)
- **Briefings:** Static fallback cards (6 cards)
- **Trending Topics:** Static defaults (6 categories)
- **User Queries:** Live Perplexity calls (on-demand)

**Total Monthly Cost:** ~$2.50/month (user queries only)
**Freshness:** Manual updates as needed

---

### **Phase 2: Add Weekly Refresh (When Budget Allows)**
- **Daily Intelligence:** Weekly refresh (every Monday 6am ET)
- **Briefings:** Keep static (or weekly refresh)
- **Trending Topics:** Weekly refresh
- **User Queries:** Live Perplexity calls (on-demand)

**Total Monthly Cost:** ~$3.00/month
**Freshness:** Content updates weekly, user queries real-time

**Implementation:**
```bash
# Deploy Cloud Function
cd functions
npm run build
firebase deploy --only functions:generateDiscoverCards

# Create Cloud Scheduler job (weekly)
gcloud scheduler jobs create pubsub generate-intelligence-weekly \
  --schedule="0 6 * * 1" \
  --time-zone="America/New_York" \
  --topic="generate-intelligence" \
  --message-body='{"action":"generate"}' \
  --location="us-central1"
```

---

### **Phase 3: Scale to Daily (When Revenue Justifies)**
- **Daily Intelligence:** Daily refresh (every day 6am ET)
- **Briefings:** Daily refresh per audience type
- **Trending Topics:** Daily refresh
- **User Queries:** Live Perplexity calls (on-demand)

**Total Monthly Cost:** ~$5.00/month
**Freshness:** Content updates daily, user queries real-time

---

## API Usage Monitoring

### Check Current Usage
```bash
# Check Cloud Function logs
firebase functions:log --only generateDiscoverCards --lines 50

# Check how many cards were generated today
gcloud firestore documents list discover_cards \
  --filter="createdAt>=$(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S)" \
  --project=plannerapi-prod
```

### Monitor Perplexity Usage
1. Log into Perplexity Dashboard: https://www.perplexity.ai/settings/api
2. View "Usage" tab
3. Check current month's request count
4. Set up usage alerts at 800 requests (80% of quota)

### Set Budget Alerts
```bash
# Set Cloud Function budget alert
gcloud alpha billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="API Usage Alert" \
  --budget-amount=10 \
  --threshold-rule=percent=80
```

---

## Cost Comparison Matrix

| Refresh Strategy | API Calls/Month | Monthly Cost | Content Freshness | Recommended |
|-----------------|----------------|--------------|-------------------|-------------|
| **Static Only** | 0 (content) + 500 (queries) | **$2.50** | Manual updates | ✅ MVP |
| **Weekly** | 40 (content) + 500 (queries) | **$3.00** | 7 days max | ✅ Budget |
| **Bi-Weekly** | 80 (content) + 500 (queries) | **$3.40** | 3 days max | ✅ Balanced |
| **Daily** | 300 (content) + 500 (queries) | **$5.00** | 24 hours max | ✅ Premium |
| **Hourly** | 7,200 (content) + 500 (queries) | **$36.00** | 1 hour max | ❌ Overkill |

---

## Optimization Tips

### 1. **Cache Perplexity Responses**
Store Perplexity API responses in Firestore with TTL:
```typescript
// Cache for 6 hours
const cacheKey = `perplexity_${query_hash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fresh call
const response = await perplexity.search(query);
await redis.setex(cacheKey, 21600, JSON.stringify(response)); // 6hr TTL
```

**Savings:** 50-70% reduction in duplicate queries

### 2. **Deduplicate User Queries**
Track popular queries and return cached results:
```typescript
// If query asked in last 1 hour, return cached
const recentQuery = await db.collection('query_cache')
  .where('query', '==', normalizedQuery)
  .where('createdAt', '>', oneHourAgo)
  .limit(1)
  .get();

if (!recentQuery.empty) {
  return recentQuery.docs[0].data();
}
```

**Savings:** 30-40% reduction for common queries like "AI marketing trends"

### 3. **Reduce Card Count**
Generate fewer cards per run:
```typescript
// Current: 10 cards (3+3+2+2)
// Optimized: 6 cards (2+2+1+1)
const PILLARS = [
  { id: 'ai_strategy', cardCount: 2 },      // Was 3
  { id: 'brand_performance', cardCount: 2 }, // Was 3
  { id: 'competitive_intel', cardCount: 1 }, // Was 2
  { id: 'media_trends', cardCount: 1 }       // Was 2
];
```

**Savings:** 40% reduction in scheduled API calls

### 4. **Implement Request Throttling**
Limit users to X queries per hour:
```typescript
// Rate limit: 10 queries/hour per user
const userQueries = await redis.get(`rate_limit:${userId}`);
if (userQueries >= 10) {
  throw new Error('Rate limit exceeded. Try again in 1 hour.');
}
```

**Savings:** Prevents abuse, controls costs

---

## Recommended Immediate Actions

1. **Keep current static content** (no changes needed)
2. **Monitor user query volume** for 30 days
3. **Set up Perplexity usage alerts** at 800 requests/month
4. **Decide on refresh frequency** based on budget:
   - < $5/mo budget → Keep static
   - $5-10/mo budget → Weekly refresh
   - $10-20/mo budget → Daily refresh

5. **Implement query caching** when user volume increases

---

## Questions to Consider

1. **How often does your industry news change?**
   - Fast-moving (tech, finance) → Daily refresh
   - Moderate (marketing, B2B) → Weekly refresh
   - Slow-moving (industrial, education) → Static with manual updates

2. **What's your content quality bar?**
   - High (Fortune 500 clients) → Daily refresh with human review
   - Medium (SMB clients) → Weekly automated refresh
   - Flexible (MVP stage) → Static with good curation

3. **What's your monthly budget for content?**
   - < $5 → Static only
   - $5-10 → Weekly refresh
   - $10-20 → Daily refresh
   - $20+ → Consider Pro plan + hourly refresh

4. **How many users do you expect?**
   - < 100/month → Static is fine
   - 100-500/month → Weekly refresh recommended
   - 500-1000/month → Daily refresh recommended
   - 1000+/month → Daily + query caching required

---

## Summary Recommendation

**For PlannerAPI at current stage:**

✅ **Keep static content for now** (Daily Intelligence, Briefings)
✅ **Allow real-time user queries** (HeroSearch, ExecutiveStrategyChat)
⏳ **Add weekly refresh** when you reach 100 active users
⏳ **Upgrade to daily refresh** when you raise funding or hit revenue goals

**Current optimal setup:** $2.50/month for user queries, $0 for scheduled content

This gives you professional, high-quality content with minimal costs while you validate product-market fit.

---

**Need Help Implementing?**

Let me know which refresh frequency you want, and I'll:
1. Set up the Cloud Scheduler cron job
2. Deploy the Cloud Function
3. Configure Firestore indexes
4. Set up monitoring and alerts
