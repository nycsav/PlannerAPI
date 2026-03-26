# PlannerAPI (signal2noise) — Session Progress Log

**Live site**: https://signals.ensolabs.ai
**Firebase project**: plannerapi-prod
**Repo**: https://github.com/nycsav/PlannerAPI
**Branch**: `frontend-redesign`

---

## Session: March 2026 — Visual Layer, Dark Mode, Source Intelligence, LinkedIn Engine

### Frontend Changes

#### Dark / Light Mode System
- **`contexts/ThemeContext.tsx`** — New ThemeProvider with localStorage persistence. Default: dark mode.
- **`index.css`** — Full CSS variable system: `:root` = light (cream `#F8F6F0`), `html.dark` = dark (`#0d1321`). Key vars: `--bg`, `--bg-card`, `--bg-input`, `--text`, `--muted`, `--orange`, `--border`, `--nav-link`, `--border-subtle`, `--border-light`, `--overlay-hover`.
- **`components/ThemeToggle.tsx`** — 32px Sun/Moon icon button, wired to ThemeContext.
- All homepage components converted from hardcoded colors → CSS variables.

#### Source Intelligence Section (`components/SourceLogosMinimal.tsx`) — Complete Rewrite
- Added **Board of Innovation** as Tier-1 source.
- Brand-specific fonts for each company:
  - McKinsey / Bain → Libre Baskerville (serif, 700)
  - Forrester / Google AI → Barlow (600)
  - BCG → Inter 800, tracking +0.06em
  - Deloitte → Inter 500
  - Board of Innovation → Space Grotesk 600
  - Gartner / Meta → Inter with negative tracking
- **Clickable pills** — each pill fetches live Notion reports via `getSourceReports` Firebase Function.
- Popover panel shows: source name in brand font/color, last 5 reports with title + key stat + date, "View all in Notion" link.
- Click-outside + Escape key close. In-memory fetch cache (one Map per session).
- Performance fixes: `handleSourceClick` uses stable `useCallback([])` via `popoverStateRef`; hover state localized to each `SourcePill` component; `tier1Sources`/`tier2Sources` hoisted outside component.
- Google Fonts updated to include Libre Baskerville, Space Grotesk, Barlow.

#### Signal Dashboard (`components/SignalDashboard.tsx`) — New Component
- Live signal scoring table with Recharts sparklines (7-day trend lines).
- Score bars (0–100) with color-coded momentum badges (rising / falling / stable).
- Powered by `getSignalScores` Firebase Function (sonar-reasoning-pro).

#### Intelligence Modal (`components/IntelligenceModal.tsx`) — Enrichment Layer
- Background-fetches `getSignalInsight` on brief open.
- Shows `SignalInsight` panel: signal_score bar, signal_type badge, why_it_matters, affected_brands, data_point, linkedin_hook.
- `IntelligencePayload` type extended with `insight?: SignalInsight` and `images?: any[]`.
- SSE streaming preview: shows live Perplexity token stream before full brief loads.

#### Homepage Components
- **`components/homepage/HeroSection.tsx`** — Fixed: ASK button no longer disabled when query is empty (uses placeholder fallback).
- **`components/homepage/Navbar.tsx`** — ThemeToggle integrated.
- Deleted legacy/unused components: `ExperimentSection`, `FeaturedSection`, `FloatingActionButton`, `Hero`, `MarketPulse`, `MethodologyGuide`, `ResponsePreview`, `SignalTelemetry`, `SignalTicker`, `ThreadSidebar`, `TodaySignals`.

---

### Backend Changes (Firebase Cloud Functions — `functions/src/`)

#### New Function: `getSourceReports` (`functions/src/notion-endpoints.ts`)
- `POST /getSourceReports` — accepts `{ source: string }`, queries Notion "PlannerAPI Research Inbox" DB, returns last 5 reports filtered by Source property.
- Returns: `{ reports: NotionReport[], notionDbUrl: string }`.
- Graceful fallback: returns `{ reports: [], notionDbUrl }` if `NOTION_TOKEN` env var is not set.
- Input validation: type + length check on `source` before Notion API call.
- **Setup required**: Add `NOTION_TOKEN=secret_xxx` to `functions/.env`. Create integration at https://www.notion.so/my-integrations and share "PlannerAPI Research Inbox" DB with it.

#### New Functions: Signal Intelligence
- **`getSignalScores`** — Top 5 marketing signals with 7-day sparkline data (sonar-reasoning-pro).
- **`getSignalInsight`** — Enriched modal data for a single brief: signal_score, signal_type, why_it_matters, affected_brands, data_point, visual_metaphor, linkedin_hook (sonar-pro JSON mode).

#### New Function: `perplexitySearchInstant`
- Fast instant search (358ms) using Perplexity rawSearch API.
- Returns: `{ results: Array<{ title, url, snippet, date, og_image, favicon, domain, related_questions }>, query }`.

#### SSE Streaming: `chatIntelStream`
- Firebase Function that streams Perplexity tokens via Server-Sent Events.
- Frontend uses `fetch` + `ReadableStream` to show live text as it arrives.

#### Performance: `chat-intel.ts`
- `PPLX_MODEL_FAST` default changed from `sonar-pro` → `sonar` (~1.43s vs 1.55s).
- `generateDiscoverCards.ts`: `search_recency_filter` changed from `'week'` → `'day'` for fresher content.

#### Endpoint Registry: `src/config/api.ts`
All endpoints centralized. New entries:
- `getSourceReports` — Notion source popover
- `getSignalScores` — Signal dashboard sparklines
- `getSignalInsight` — Modal enrichment
- `perplexitySearchInstant` — Fast hero search
- `chatIntelStream` — SSE streaming brief

---

## Session: March 25, 2026 — Perplexity Agent API Integration

### Perplexity Agent API (`/v1/agent`) — Deep Research

**What:** Integrated the new Perplexity Agent API for multi-step agentic research. This enables 10-step reasoning loops with `web_search` + `fetch_url` tools, producing comprehensive competitive intelligence briefs.

#### Backend Changes

**`functions/src/perplexityClient.ts`** — Added Mode 4:
- `agentApiCall()` — non-streaming Agent API with preset support, custom functions, retry logic
- `agentApiStream()` — streaming variant returning raw SSE Response for piping

**`functions/src/deep-research.ts`** — New file, two Firebase Functions:
- `deepResearch` — Non-streaming endpoint, returns structured deep research payload
- `deepResearchStream` — SSE streaming endpoint with real-time token delivery
- 300s timeout, 512MB memory allocation for deep research workloads
- Structured response parsing: Executive Summary, Deep Signals (5-7), Competitive Landscape, Implications, 30-Day Action Plan
- 4 presets: fast-search, pro-search, deep-research, advanced-deep-research
- Multi-turn follow-up support via `previous_response_id`

**`functions/src/index.ts`** — Added exports: `deepResearch`, `deepResearchStream`

#### Frontend Changes

**`src/config/api.ts`** — Added endpoints:
- `deepResearch` → `${cloudFunctions}/deepResearch`
- `deepResearchStream` → `${cloudFunctions}/deepResearchStream`

**`components/IntelligenceModal.tsx`** — Deep Research UI:
- "Deep Research" button in modal toolbar (Microscope icon, orange accent)
- Loading state with animated spinner
- Live SSE streaming with typing cursor while researching
- Structured results panel: Executive Summary, Deep Signals cards with momentum badges + impact scores + "Your Move" actions, Competitive Landscape, 30-Day Action Plan with numbered steps, Source citations
- Auto-reset when switching between cards

#### PRD Updated
- `docs/PRD.md` — Added Phase 2.5: Perplexity Agent API Integration section with architecture, presets, and cost analysis

---

### n8n LinkedIn Daily Engine — v3

**Workflow ID**: `FzmX8ySSOeCti3o5`
**Name**: LinkedIn Daily Engine v3 — Images + REGEN (PRODUCTION)
**Status**: Deployed (activate in n8n dashboard to go live)

#### What's new in v3 (vs v2)
1. **Perplexity image fetch** — Code node calls Perplexity API directly with `return_images: true` + `search_recency_filter: 'day'`. Picks best jpg/png/webp image URL.
2. **Structured `key_stat` field** — LLM output schema includes `key_stat` (the core data point). Used in email preview and LinkedIn post.
3. **Email approval with image preview** — Two-button email (Approve & Post / Regenerate Draft). Shows image `<img>` tag and `key_stat` callout with orange border.
4. **REGEN sub-flow** — On "Regenerate Draft": Claude Sonnet 4.6 (temp 0.7) rewrites the post with a fresh hook/angle → new email → REGEN Switch → post or stop. (1-regen limit; n8n DAGs can't loop.)
5. **Rich link preview on LinkedIn** — `originalUrl` added to LinkedIn `additionalFields` so LinkedIn auto-generates OG image card from signals.ensolabs.ai.

#### Node map (16 nodes)
`Schedule Trigger` → `Get Top Card` → `Research with Perplexity v2` → `Build Brief URL` → `Write LinkedIn Post` → `Structured Output Parser` → `Anthropic Chat Model` → `Email for Approval` → `Switch` → `[Post to LinkedIn + Mark Card as Posted]` OR `[Regenerate Draft → Regen Output Parser → Regen Email → Regen Switch → Post or Stop]`

---

### Pending / Next Steps

| Task | Status | Notes |
|------|--------|-------|
| Add `NOTION_TOKEN` to `functions/.env` | **Required** | Create at notion.so/my-integrations, share DB with integration |
| Activate n8n LinkedIn workflow | **Required** | Toggle active in n8n dashboard |
| Phase 2: Branded image card | Future | Use htmlcsstoimage.com to generate 1200×630 stat card from `key_stat` |
| Phase 2: LinkedIn image upload | Future | LinkedIn UGC Posts API multi-step upload (requires `HCTI_API_KEY`) |
| Phase 2: Embeddings deduplication | Future | `pplx-embed-v1-0.6b` ($0.004/1M) cosine similarity check before posting |
| CORS helper in `functions/src/` | Tech debt | 17 copies of same 3-line CORS block across 9 files — extract to shared helper |

---

### Deploy Commands

```bash
# Frontend
npm run build && firebase deploy --only hosting

# Backend (all functions)
firebase deploy --only functions

# Backend (single function)
firebase deploy --only functions:getSourceReports
```
