# signal2noise Pipeline Repair — March 2026

**Date:** 2026-03-01
**Scope:** Full CTO-level repair of the signal2noise content pipeline, backend endpoints, and frontend

---

## Summary

Five-phase repair session restoring the signal2noise pipeline from a broken Notion-dependent state to a fully operational Perplexity-first daily intelligence system. All 7 pillar cards now generate daily, images and citations are attached, and all 4 backend endpoints return 200.

---

## Phase 1 — Secrets Migration (functions.config → GCP Secret Manager)

**Problem:** `generateDiscoverCards.ts` used deprecated `functions.config()` to read API keys. Notion token was invalid (401 on every run).

**Fix:**
- Migrated all secrets to GCP Secret Manager
- Secrets created: `NOTION_API_KEY`, `PPLX_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`
- Updated function to use `defineSecret` from `firebase-functions/params`
- Added lazy client initialization (`_anthropic`, `_notion` getters) — secrets only available at runtime
- Service account: `plannerapi-prod@appspot.gserviceaccount.com` granted `secretAccessor` on all 4

```typescript
// Pattern used
const NOTION_API_KEY = defineSecret('NOTION_API_KEY');
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const PPLX_API_KEY = defineSecret('PPLX_API_KEY');

export const generateDiscoverCards = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB', secrets: [NOTION_API_KEY, ANTHROPIC_API_KEY, PPLX_API_KEY] })
```

---

## Phase 2 — Cloud Function Rebuild (Perplexity-first)

**Problem:** Function was Notion-dependent. Notion DB had 0 Triaged items meeting the filter criteria; all 26 usable records were already "Published" with no Source Tier set.

**Fix:** Complete rewrite of `functions/src/generateDiscoverCards.ts`:

- **7 pillars:** `ai_strategy`, `brand_performance`, `competitive_intel`, `media_trends`, `platform_innovation`, `measurement_analytics`, `content_strategy`
- **Primary source:** Perplexity `sonar-pro` with `return_images: true`, `search_recency_filter: 'week'`
- **Synthesis:** Claude `claude-sonnet-4-5` converts Perplexity research into structured cards
- **Notion:** Kept as optional secondary (processes `Triaged` items only, non-blocking, marks as `Published` after use)
- **Dead man's switch:** If `allCards.length === 0`, POSTs to n8n webhook `signal2noise-failure-alert`
- **Schedule:** Daily at 7am ET via Cloud Scheduler (`0 7 * * *`)

**Result:** 7/7 pillars succeed. Cards include 5 images and 6–9 citations each. ~22s execution time.

**Critical deploy note:** Firebase deploy packages existing compiled `lib/` JS — does NOT auto-build TypeScript. Always run `npm run build` in `/functions` before `firebase deploy`.

```bash
cd functions && npm run build && cd .. && firebase deploy --only functions --project plannerapi-prod
```

---

## Phase 3 — Backend Endpoint Fixes (Cloud Run)

**Problem:** `/trending/topics` returned 404 (missing route). `/generate-carousel` returned 500 (`libnss3.so not found`).

**Fixes to `/Users/savbanerjee/Projects/planners-backend/index.js`:**

1. Added `/trending/topics` GET route — queries Perplexity for top 5 topics for audience, returns hardcoded fallback array on any failure (never 404/500)
2. Added `puppeteer-core` and `@sparticuz/chromium` to `package.json`
3. Updated puppeteer launch to use system Chromium: `process.env.CHROMIUM_PATH || "/usr/bin/chromium"`

**Created `Dockerfile`** using `node:20-slim` + system Chromium + NSS libs:
```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y chromium libatk-bridge2.0-0 libgtk-3-0 \
    libx11-xcb1 libnss3 libxss1 libasound2 libxrandr2 libgbm1 \
    && rm -rf /var/lib/apt/lists/*
```

**Deploy command (required `--clear-base-image` for Dockerfile-based builds):**
```bash
gcloud run deploy planners-backend \
  --source . \
  --project plannerapi-prod \
  --region us-central1 \
  --clear-base-image
```

**Note:** After Dockerfile deploy, Cloud Run service URL changed from `865025512785` to `9036060950`. Frontend `src/config/api.ts` and `.env` already reference `9036060950` — no frontend change needed.

---

## Phase 4 — Failure Alerting (n8n)

- Created n8n workflow "signal2noise Pipeline Failure Alert" (ID: `QCbwEqspRUAC4wAh`)
- Webhook path: `signal2noise-failure-alert`
- Production URL: `https://r16-sav.app.n8n.cloud/webhook/signal2noise-failure-alert`
- Gmail node sends alert to: `sav@ensolabs.ai`
- **Status:** Requires Gmail OAuth authorization in n8n UI to activate

Dead man's switch code in `generateDiscoverCards.ts`:
```typescript
if (allCards.length === 0) {
  await fetch(ALERT_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ timestamp, successCount: 0, failedPillars, error }),
  });
}
```

---

## Phase 5 — Frontend Fixes

**Files changed:** `src/App.tsx`, `src/components/RecentSignalsTab.tsx`

### App.tsx
- Changed `limit(9)` → `limit(50)` on Firestore query
- Added `console.log` on card fetch count
- Added trending topics fetch (silent failure — search never blocked)
- Fixed `images` and `citations` mapping from Firestore data

### RecentSignalsTab.tsx
- Fixed `SignalCard.images` type: `string[]` → `Array<{ image_url: string; origin_url?: string; title?: string }>`
- `CardThumbnail` now extracts `firstImage.image_url` (Perplexity returns objects, not strings)
- Added `ExpandedCard` modal with signals, moves, citations, copy link
- Updated `PILLAR_COLORS` to brand spec
- Updated `PILLAR_GRADIENTS` to vivid spec (shown on cards when image fails to load)
- Fixed gradient placeholder height: `h-[80px]` → `h-[120px]` (matches image container)

### New components added
- `src/components/AudienceGrid.tsx` — 4-card 2×2 grid (Agency Strategists, Research Teams, Independent Consultants, Agency Leadership). No emojis, amber left border, amber subtitle.
- `src/components/HeroSection.tsx` — Added Perplexity search bar with `SearchModal`. Trending topic chips auto-fill the input.

---

## Firestore images field structure (confirmed)

```json
[
  {
    "image_url": "https://example.com/image.jpg",
    "origin_url": "https://example.com/article",
    "height": 630,
    "width": 1200,
    "title": "Article title"
  }
]
```

Field path: `data.images[0].image_url` — NOT `data.images[0]` directly.

---

## Key file locations

| File | Purpose |
|------|---------|
| `functions/src/generateDiscoverCards.ts` | Daily card generation (Perplexity → Claude → Firestore) |
| `src/components/HeroSection.tsx` | Hero + search bar + SearchModal |
| `src/components/RecentSignalsTab.tsx` | Cards grid + ExpandedCard modal |
| `src/components/AudienceGrid.tsx` | Who it's for section |
| `src/config/api.ts` | All backend URLs |
| `/Users/savbanerjee/Projects/planners-backend/index.js` | Cloud Run backend |
| `/Users/savbanerjee/Projects/planners-backend/Dockerfile` | Dockerfile for Cloud Run |

---

## GCP project

- **Firebase project:** `plannerapi-prod`
- **Cloud Run service:** `planners-backend-9036060950.us-central1.run.app`
- **Cloud Functions service account:** `plannerapi-prod@appspot.gserviceaccount.com`
- **Frontend:** `signals.ensolabs.ai` → Firebase Hosting (plannerapi-prod)
