# PlannerAPI Phase 1 Deployment Guide

**Implementation Date:** January 19, 2026
**Phase:** Dynamic Data & Real-Time Intelligence Integration
**Status:** Ready for Deployment

---

## What's Been Implemented

### Backend Endpoints (3 New Files)

1. **briefings-endpoint.ts** - Daily Intelligence Briefings
   - `GET /briefings/latest?audience={audience}&limit={limit}` - Returns cached briefings
   - `POST /briefings/generate` - Force regenerate briefings
   - 24-hour in-memory cache
   - Audience-personalized via Perplexity AI

2. **trending-endpoint.ts** - Trending Topics & Sample Queries
   - `GET /trending/topics?audience={audience}&limit={limit}` - Returns trending topics
   - 24-hour in-memory cache
   - Provides dynamic search placeholders and category chips

3. **chat-intel-endpoint.ts** - Enhanced with Dynamic Frameworks
   - Updated system prompt to generate context-specific frameworks
   - Added frameworks parsing logic
   - Audience personalization integrated
   - Returns 2-3 relevant strategic frameworks based on query topic

### Frontend Updates (3 Modified Components)

1. **App.tsx** - Dynamic Intelligence Briefings
   - Fetches briefings from backend on mount and when audience changes
   - Falls back to hardcoded briefings on error
   - Passes audience to chat-intel API calls
   - Includes frameworks from API in modal payload

2. **HeroSearch.tsx** - Dynamic Trending Topics & Placeholders
   - Fetches trending topics on mount
   - Dynamic search placeholders rotate every 3 seconds
   - Category chips show real trending indicators
   - Falls back to defaults on error

3. **ExecutiveStrategyChat.tsx** - Audience Personalization
   - Passes audience parameter to chat-intel API
   - Receives audience-tailored responses

### Integration File

- **server-integration-guide.ts** - Complete integration instructions for Cloud Run

---

## Deployment Steps

### Phase 1: Backend Deployment (Cloud Run)

#### Prerequisites
- Access to Google Cloud Run service: `planners-backend-865025512785.us-central1.run.app`
- Perplexity API key set in environment variables
- Node.js backend with Express already deployed

#### Step 1: Add Endpoint Files to Backend

Copy these 3 files to your Cloud Run backend codebase:

```bash
# From PlannerAPI-clean/backend-integration/
backend-integration/
  ├── briefings-endpoint.ts      (NEW)
  ├── trending-endpoint.ts       (NEW)
  └── chat-intel-endpoint.ts     (UPDATED - with frameworks)
```

#### Step 2: Integrate Routes in Main Server

Update your main server file (e.g., `index.ts` or `server.ts`):

```typescript
import express from 'express';
import cors from 'cors';

// Import endpoint routers
import chatIntelRouter from './chat-intel-endpoint';
import briefingsRouter from './briefings-endpoint';
import trendingRouter from './trending-endpoint';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://plannerapi-clean.web.app',
    'https://plannerapi-clean.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routers
app.use(chatIntelRouter);      // POST /chat-intel
app.use(briefingsRouter);       // GET /briefings/latest, POST /briefings/generate
app.use(trendingRouter);        // GET /trending/topics

// Start server
app.listen(PORT, () => {
  console.log(`PlannerAPI Backend running on port ${PORT}`);
});
```

#### Step 3: Verify Environment Variables

Ensure these are set in Cloud Run:

```bash
PPLX_API_KEY=your_perplexity_api_key_here
PPLX_MODEL_FAST=sonar
PORT=8080
NODE_ENV=production
```

Set via gcloud CLI:

```bash
gcloud run services update planners-backend \
  --update-env-vars PPLX_API_KEY=your_key_here,PPLX_MODEL_FAST=sonar \
  --region us-central1
```

#### Step 4: Deploy to Cloud Run

```bash
# Navigate to your backend directory
cd path/to/backend

# Deploy
gcloud run deploy planners-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars PPLX_API_KEY=your_key_here
```

#### Step 5: Test Backend Endpoints

After deployment, test each endpoint:

```bash
# 1. Health check
curl https://planners-backend-865025512785.us-central1.run.app/health

# Expected: {"status":"ok","timestamp":"2026-01-19T..."}

# 2. Briefings endpoint
curl "https://planners-backend-865025512785.us-central1.run.app/briefings/latest?audience=CMO&limit=6"

# Expected: {"briefings":[...],"cached":false,"generatedAt":"..."}

# 3. Trending topics
curl "https://planners-backend-865025512785.us-central1.run.app/trending/topics?audience=CMO&limit=6"

# Expected: {"topics":[{"label":"...","trending":true,"sampleQuery":"..."}],...}

# 4. Chat intel with frameworks
curl -X POST "https://planners-backend-865025512785.us-central1.run.app/chat-intel" \
  -H "Content-Type: application/json" \
  -d '{"query":"How are CMOs using AI to increase ROI?","audience":"CMO"}'

# Expected: {"signals":[...],"implications":[...],"actions":[...],"frameworks":[...]}
```

---

### Phase 2: Frontend Deployment (Firebase Hosting)

#### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured: `plannerapi-clean`
- Node.js and npm installed

#### Step 1: Install Dependencies (if needed)

```bash
cd /Users/savbanerjee/Projects/PlannerAPI-clean
npm install
```

#### Step 2: Build Frontend

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

#### Step 3: Test Locally (Optional)

```bash
npm run preview
```

Visit `http://localhost:4173` and verify:
- Briefings load dynamically
- Search placeholders rotate
- Category chips show trending indicators
- Chat queries return personalized responses

#### Step 4: Deploy to Firebase

```bash
firebase deploy --only hosting
```

Expected output:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/plannerapi-clean/overview
Hosting URL: https://plannerapi-clean.web.app
```

---

## Verification & Testing

### End-to-End Test Scenarios

#### Test 1: Dynamic Briefings
1. Open `https://plannerapi-clean.web.app`
2. Verify 6 briefing cards appear with today's date
3. Open DevTools → Network tab
4. Change audience in navbar (if selector visible)
5. Verify new briefings fetch (check Network tab for `/briefings/latest` call)
6. Disconnect internet → Verify fallback briefings still show

**Expected Behavior:**
- Briefings display within 2 seconds
- Dates are current (not hardcoded 14.01.2026)
- Fallback works when API unavailable

#### Test 2: Dynamic Search Placeholders
1. Focus on hero search input
2. Watch placeholders rotate every 3 seconds
3. Verify placeholders are context-specific
4. Check category chips below search
5. Verify some chips show trending indicators (TrendingUp icon)

**Expected Behavior:**
- Placeholders change automatically
- Categories reflect current market topics
- Trending indicators appear on relevant topics

#### Test 3: Context-Specific Frameworks
1. Enter a query: "How are CMOs using AI to increase ROI?"
2. Submit and wait for response
3. Scroll to "Strategic Frameworks" panel
4. Verify frameworks are specific to AI/ROI topic (not generic defaults)
5. Try a different query: "How to improve brand loyalty?"
6. Verify frameworks update to brand-related strategies

**Expected Behavior:**
- Frameworks change based on query context
- At least 2-3 frameworks per query
- Each framework has 3 actionable steps
- If API fails, defaults show (Digital Strategy, Media Strategy, CX Strategy)

#### Test 4: Audience Personalization
1. Submit query as CMO audience: "What's the ROI of AI marketing tools?"
2. Note the response language (board-level, budget-focused)
3. Change audience to "Growth Leader"
4. Submit same query again
5. Compare responses - should focus on tactics vs strategy

**Expected Behavior:**
- CMO responses: strategic, board-level implications, budget ROI
- Growth Leader responses: acquisition channels, conversion metrics
- Different audiences get different insights for same query

---

## Monitoring & Troubleshooting

### Check Backend Logs (Cloud Run)

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=planners-backend" \
  --limit 50 \
  --format json

# Filter for errors
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" \
  --limit 20
```

### Common Issues & Solutions

#### Issue: Briefings not loading (Network error)

**Symptoms:** Frontend shows fallback briefings, DevTools shows failed fetch

**Solutions:**
1. Check Cloud Run is deployed: `gcloud run services describe planners-backend --region us-central1`
2. Test endpoint directly: `curl https://planners-backend-865025512785.us-central1.run.app/health`
3. Verify CORS is configured (see server-integration-guide.ts)
4. Check Cloud Run logs for errors

#### Issue: "Service configuration error" response

**Symptoms:** API returns 500 error with "configuration error"

**Solutions:**
1. Verify PPLX_API_KEY is set: `gcloud run services describe planners-backend --region us-central1 --format="value(spec.template.spec.containers[0].env)"`
2. Test Perplexity API key manually
3. Redeploy with correct env vars

#### Issue: Frameworks always showing defaults

**Symptoms:** Every query shows same 3 frameworks (Digital, Media, CX Strategy)

**Solutions:**
1. Check backend response includes frameworks field: `curl -X POST ... | jq .frameworks`
2. Verify chat-intel-endpoint.ts is updated version (with frameworks parsing)
3. Check system prompt includes frameworks section
4. Review Cloud Run logs for parsing errors

#### Issue: Placeholders not rotating

**Symptoms:** Search input shows same placeholder continuously

**Solutions:**
1. Check trending endpoint: `curl https://...us-central1.run.app/trending/topics?audience=CMO&limit=6`
2. Verify HeroSearch component fetches on mount (check DevTools Network tab)
3. Check browser console for errors
4. Fallback should still work (DEFAULT_PLACEHOLDERS)

---

## Performance & Cost Monitoring

### Expected API Usage

**Daily Perplexity API Calls (per audience type):**
- Briefings: 1 call every 24 hours (6 briefings generated)
- Trending: 1 call every 24 hours (6 topics generated)
- Chat queries: User-dependent (estimate 10-50 calls/day during testing)

**Cost Estimate:**
- Perplexity Sonar model: ~$0.01 per request
- Expected daily cost: $2-5 during active use
- Monthly estimate: $60-150

**Caching Benefits:**
- 24-hour cache reduces API calls by ~95% for briefings/trending
- Single cache miss per audience per day
- Subsequent requests served from memory (free)

### Performance Metrics

**Target Response Times:**
- `/briefings/latest` (cached): <100ms
- `/briefings/latest` (cache miss): 2-5 seconds
- `/trending/topics` (cached): <100ms
- `/trending/topics` (cache miss): 2-4 seconds
- `/chat-intel`: 3-6 seconds (Perplexity API latency)

**Frontend Load Times:**
- Initial page load: <2 seconds
- Briefings fetch: <500ms (cached) or 3-5s (fresh)
- Hero search ready: <1 second

---

## Rollback Plan

If critical issues occur after deployment:

### Backend Rollback

```bash
# List recent revisions
gcloud run revisions list --service planners-backend --region us-central1

# Rollback to previous revision
gcloud run services update-traffic planners-backend \
  --to-revisions=planners-backend-00042-abc=100 \
  --region us-central1
```

### Frontend Rollback

```bash
# List recent Firebase deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

---

## Next Steps (Phase 2)

After Phase 1 is stable:

1. **User Authentication (Week 3)**
   - Firebase Auth setup
   - Google OAuth integration
   - User profile management

2. **Conversation Persistence (Week 3-4)**
   - Firestore schema implementation
   - Save/load conversations
   - Bookmark briefings

3. **Export Features (Week 4)**
   - Copy to clipboard (markdown)
   - PDF download
   - Email reports

---

## Support & Contact

**Deployment Issues:**
- Check Cloud Run logs first
- Review this guide's troubleshooting section
- Test endpoints individually with curl

**API Cost Concerns:**
- Monitor Perplexity API usage in dashboard
- Caching is working if "cached: true" in responses
- Expected cost: <$5/day during active development

**Feature Requests:**
- Document in GitHub issues
- Reference this deployment guide for context

---

**Deployment Checklist:**

Backend:
- [ ] Copy 3 endpoint files to backend
- [ ] Update main server with router imports
- [ ] Verify env vars set
- [ ] Deploy to Cloud Run
- [ ] Test all 4 endpoints with curl
- [ ] Check logs for errors

Frontend:
- [ ] Run `npm run build`
- [ ] Test locally with `npm run preview`
- [ ] Deploy with `firebase deploy --only hosting`
- [ ] Test all 4 scenarios above
- [ ] Monitor browser console for errors

Post-Deployment:
- [ ] Monitor Cloud Run metrics
- [ ] Check Perplexity API usage
- [ ] Collect user feedback
- [ ] Plan Phase 2 features

---

**End of Deployment Guide**

*Last Updated: January 19, 2026*
