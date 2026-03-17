# signals.ensolabs.ai — Consolidated PRD v2.0

## Context

signals.ensolabs.ai is an AI-powered strategic intelligence platform for CMOs and marketing leaders, live at plannerapi-prod.web.app. Built over several months, the product delivers daily intelligence cards, real-time search, and signal scoring.

**Why this rewrite:** The AI tooling landscape has shifted dramatically since the original PRDs were written. Claude Agent SDK (v0.2.71), Perplexity Agent API, MCP protocol maturity, and Opus 4.6's agentic planning capabilities make much of the current architecture unnecessarily complex. This PRD consolidates 15+ scattered docs into a single source of truth and replaces outdated approaches with modern equivalents.

**Outcome:** A visually striking, mobile-first, real-time intelligence engine — modeled after Perplexity Discover — that generates interactive content with data visualizations, distributes branded visual cards across LinkedIn/Twitter/email, and drives all traffic back to the app where users can continue researching. Competitive with $20-40K/year agency analytics platforms at <$80/month operating cost.

---

## 1. Product Vision

**One-liner:** McKinsey-level daily intelligence for marketing leaders, delivered by AI agents, not analysts.

**Target users (validated):**
- Primary: Brand-side CMOs / VP Marketing at $50M-$500M companies
- Secondary: Agency owners, brand/performance leads, CX leaders
- Assumption: High context on marketing/AI, low patience for fluff, need to translate signals into budget/roadmap/team decisions

**Differentiators vs. competitors:**
| Us | Crayon ($20-40K/yr) | AlphaSense (Enterprise $$$) | The Rundown (Newsletter) |
|----|-----|-----|------|
| Tier 1 consulting + real-time micro signals | Competitor website tracking only | SEC filings, earnings transcripts | News aggregation, no analysis |
| "Your next move" actionable framing | Signal detection, no synthesis | Research-heavy, no daily cadence | Daily cadence, but generic |
| $5-15/month operating cost | $20-40K/year | Enterprise pricing | Ad-supported |
| Agent-powered interactive research | Static dashboard | Agent research (new) | Static newsletter |

---

## 2. Current State Assessment

### What's Live & Working
- Daily card generation (6 AM ET, Cloud Scheduler) — 10 cards/day
- HeroSearch with Perplexity instant results
- SignalDashboard with 7-day sparklines (sonar-reasoning-pro)
- IntelligenceModal with SignalInsight enrichment
- Dark/light theme with localStorage persistence
- Source logos with brand-specific fonts
- Firebase Auth (Google OAuth + email/password)

### What's Broken or Stubbed
- LinkedIn n8n workflow exists but is INACTIVE
- `chatIntelStream` SSE backend exists but frontend uses non-streaming `chatIntel` (35s spinner)
- Export/Share buttons in IntelligenceModal are non-functional stubs
- Notion popover requires `NOTION_TOKEN` not yet configured
- Notion DB ID mismatch in `generateDiscoverCards.ts:177`
- Missing `propSignals` dependency in `SignalDashboard.tsx:138`
- URL route changes don't reload briefs in `TestNewHomepage.tsx:82`
- No fetch timeouts on multiple Cloud Functions (can hang for 2 min)
- CORS headers duplicated 17 times across 9 files

### What Should Be Deleted
- `FUTURE_IDEAS.md` (unpriorized junk drawer)
- `POLISH-IMPROVEMENTS.md` (20 items, mostly not implemented)
- `DAILY-INTELLIGENCE-TESTING.md` (outdated acceptance criteria)
- `DISCOVER-FEED-IMPLEMENTATION.md` (already shipped)
- `DAILY-INTELLIGENCE-FINAL-SUMMARY.md` (historical, not actionable)
- `ONBOARDING-IMPROVEMENTS.md` (already shipped)
- All `.cursor_3/skills/` except `daily-intel-editor.md`
- Unused state in `HeroSearch.tsx` (`trendingPlaceholders`, `categories`)

---

## 3. Architecture Redesign

### Current (Over-Engineered)
```
Cloud Scheduler → generateDiscoverCards.ts
  → 4 Perplexity calls (1 per pillar)
  → 10 Claude Haiku calls (1 per card)
  → Firestore batch write
  → n8n webhook on failure

n8n LinkedIn workflow (INACTIVE):
  → getTopCardForPublishing
  → Perplexity research
  → Claude Sonnet draft
  → Email approval (sendAndWait)
  → LinkedIn API post
  → markLinkedInPosted
```

### Proposed (Agent-Powered)
```
Cloud Scheduler → Single Claude Agent SDK invocation
  → Agent calls Perplexity Search API (1 call, all pillars)
  → Agent structures into 10 cards (JSON structured output)
  → Agent deduplicates in-context (last 7 days titles passed in)
  → Agent writes to Firestore
  → Agent picks top card → drafts per-platform posts
  → Posts to approval queue (Slack or simple web UI)
  → On approval → publishes to LinkedIn + Twitter/X + queues email

Alternative (simpler, recommended for Phase 1):
  Cloud Scheduler → Firebase Function
    → 1 Perplexity sonar-pro call (all pillars, search_recency_filter: 'day')
    → 1 Claude Sonnet 4.6 call (structured output: 10 cards JSON array)
    → Firestore batch write
    → Separate scheduled function: pick top card → draft posts → Slack approval
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Card generation | 1 Perplexity + 1 Claude (structured output) | Replaces 4+10 calls. Claude 4.6 structured output validates JSON schema natively |
| LinkedIn/Twitter posting | Firebase Function + Slack approval | Replaces fragile n8n workflow that can't loop. Simpler, more reliable |
| Chat intelligence | SSE streaming via `chatIntelStream` | Backend already exists. Just wire frontend. Eliminates 35s spinner |
| Conversation threads | Firestore `chat_threads` collection | Each thread stores messages + context. Modal becomes conversational |
| Signal drill-down | onClick handler on SignalDashboard rows | Opens IntelligenceModal with signal topic pre-loaded |
| Email digest | SendGrid free tier (100/day) | Sufficient for early subscribers. Upgrade to Essentials ($19.95/mo) at scale |
| Image generation | Perplexity `return_images: true` + og_image display | Already supported in API. Just render in card UI |
| Deduplication | In-context (pass last 7 days titles to Claude) | Simpler than embeddings. Free. Works well with Claude's context window |
| CopilotKit | Remove, replace with native Claude tool use | CopilotKit adds dependency complexity. Agent SDK is more capable |

---

## 4. Feature Roadmap

### Phase 1: Fix & Ship (Week 1) — $0 additional cost

**Bug Fixes:**
1. Fix Notion DB ID mismatch (`generateDiscoverCards.ts:177`)
2. Fix Notion DB URL (`notion-endpoints.ts:15`)
3. Add `propSignals` to useEffect dependency (`SignalDashboard.tsx:138`)
4. Fix URL route change detection (`TestNewHomepage.tsx:82`)
5. Add `AbortSignal.timeout(30000)` to all fetch calls (4+ files)
6. Extract shared CORS utility (`functions/src/utils/cors.ts`)
7. Fix SSE buffer flush on stream end (`chat-intel.ts:490-514`)
8. Move hardcoded webhook URL to env var (`generateDiscoverCards.ts:15-16`)
9. Fix CopilotKit referer domain to `signals.ensolabs.ai`

**Quick Wins:**
10. Wire `chatIntelStream` SSE to IntelligenceModal frontend (streaming responses)
11. Add `NOTION_TOKEN` to `functions/.env` → live source popovers
12. Activate n8n LinkedIn workflow (toggle in dashboard while we build replacement)
13. Display `og_image` from Perplexity results in DailyIntelligence cards
14. Make SignalDashboard rows clickable → open IntelligenceModal with topic

**Files Modified:**
- `functions/src/generateDiscoverCards.ts`
- `functions/src/notion-endpoints.ts`
- `functions/src/chat-intel.ts`
- `functions/src/utils/cors.ts` (new — shared CORS helper)
- `components/SignalDashboard.tsx`
- `components/IntelligenceModal.tsx`
- `components/DailyIntelligence.tsx`
- `TestNewHomepage.tsx`

### Phase 2: Intelligence Engine Rebuild (Weeks 2-3) — ~$3-8/month additional

**Card Generation Simplification:**
1. Replace 4 Perplexity + 10 Claude calls with 1+1 architecture
2. Use Claude Sonnet 4.6 structured output for card JSON schema
3. Pass last 7 days of card titles for in-context deduplication
4. Add `return_images: true` to Perplexity call → store image URLs in cards
5. Add live source links and citation URLs to every card

**Conversation Threads:**
6. Create `chat_threads` Firestore collection
7. Refactor IntelligenceModal to maintain conversation state
8. Each follow-up preserves full thread context
9. Store thread history for returning users

**Interactive Dashboard:**
10. Add onClick drill-down to SignalDashboard rows
11. Add hover tooltips with signal context
12. Add time-range selector (7d / 30d / 90d)
13. Add natural language query bar: "Show me AI adoption signals"

**Files Modified:**
- `functions/src/generateDiscoverCards.ts` (major rewrite)
- `functions/src/types.ts` (add ChatThread type)
- `functions/src/chat-intel.ts` (thread support)
- `components/IntelligenceModal.tsx` (conversation UI)
- `components/SignalDashboard.tsx` (interactive)
- New: `functions/src/chat-threads.ts`

### Phase 3: Multi-Platform Distribution (Weeks 3-4) — ~$20-45/month additional

**Replace n8n LinkedIn workflow:**
1. New Firebase Function: `distributeTopSignal`
   - Picks highest-priority unposted card
   - Calls Claude Sonnet 4.6 to draft platform-specific posts:
     - LinkedIn: 200-400 words, professional tone, OG link preview
     - Twitter/X: 3-5 tweet thread, lead with key_stat
     - Email: HTML template, top 3 cards, key stat callout
   - Stores drafts in `distribution_queue` collection
   - Sends Slack notification with approve/reject/regen buttons

2. Slack approval bot (via Slack MCP or Slack API):
   - Shows post previews per platform
   - "Approve All" / "Approve LinkedIn Only" / "Regenerate" buttons
   - On approve → publishes via respective APIs

3. LinkedIn API integration (direct, no n8n)
4. Twitter/X API integration (pay-per-use tier)
5. SendGrid email digest (7 AM ET, top 3 cards)
6. Branded image generation via htmlcsstoimage ($0.01/image)

**Files Modified/Created:**
- `functions/src/distributeTopSignal.ts` (new)
- `functions/src/slack-approval.ts` (new)
- `functions/src/email-digest.ts` (new)
- `functions/src/linkedin-api.ts` (new, replaces n8n)
- `functions/src/twitter-api.ts` (new)

### Phase 4: Agent Intelligence Layer (Weeks 5-8) — ~$10-30/month additional

**Monitoring Agents:**
1. "Watch this signal" — user sets up a monitor on any topic
2. Agent checks daily via Perplexity → alerts if score changes >15%
3. Push notification or email alert with context

**Playbook Generation:**
4. "Build me a 30-60-90 plan from these 3 signals"
5. Claude Agent SDK invocation with research tools
6. Returns structured playbook with timeline, actions, metrics

**Smart Synthesis:**
7. Weekly auto-generated "This Week in Signals" summary
8. Cross-pillar trend detection ("AI strategy + media trends converging on...")
9. Comparative analysis: "How does this signal differ from last month?"

**Research Loops:**
10. User asks deep question → agent spends 2-5 minutes researching
11. Multiple Perplexity calls + Claude synthesis
12. Returns 3 angles with full citations and images

---

## 5. Cost Analysis

### Current Monthly Costs
| Item | Cost | Notes |
|------|------|-------|
| Perplexity API (4 calls/day × 30) | ~$1.50 | sonar-pro, 120 calls/month |
| Claude API (10 Haiku calls/day × 30) | ~$0.50 | With prompt caching |
| Firebase (Hosting + Functions + Firestore) | ~$0-2 | Within free tier mostly |
| **Total Current** | **~$2-4/month** | |

### Phase 1: Fix & Ship — $0 additional
No new services. Just bug fixes and wiring existing backend to frontend.

| Item | Cost | Notes |
|------|------|-------|
| Same Perplexity usage | ~$1.50 | No change |
| Same Claude usage | ~$0.50 | No change |
| Firebase | ~$0-2 | No change |
| **Total Phase 1** | **~$2-4/month** | Same as current |

### Phase 2: Intelligence Engine Rebuild — ~$3-8/month additional

| Item | Cost | Notes |
|------|------|-------|
| Perplexity API (1 call/day instead of 4) | ~$0.50 | 75% reduction |
| Claude Sonnet 4.6 (1 structured call/day) | ~$1-2 | Sonnet @ $3/$15 per 1M tokens. ~2K input + 4K output per call |
| Claude streaming (chat threads, ~50 queries/day) | ~$2-5 | Sonnet for chat, ~500 tokens avg per query |
| Perplexity (signal insight + instant search) | ~$1-2 | Same as current |
| Firebase | ~$0-2 | Slightly more Firestore writes for threads |
| **Total Phase 2** | **~$5-12/month** | Net increase: ~$3-8/month |

### Phase 3: Multi-Platform Distribution — ~$20-45/month additional

| Item | Cost | Notes |
|------|------|-------|
| Claude (post drafting, 1 call/day for all platforms) | ~$1-2 | Sonnet structured output |
| LinkedIn API | $0 | Free tier: Share API for personal posting |
| Twitter/X API | ~$0-5 | Pay-per-use: write-only for posting. Minimal volume |
| SendGrid | $0-19.95 | Free: 100 emails/day. Essentials $19.95/mo at 50K/month |
| htmlcsstoimage | ~$0-10 | Free: 50 images/mo. $0.01/image overage. ~30 images/mo = free |
| Slack API | $0 | Free for bot posting |
| **Total Phase 3** | **~$1-37/month** | Depends on subscriber count. Free tier covers early stage |

### Phase 4: Agent Intelligence Layer — ~$10-30/month additional

| Item | Cost | Notes |
|------|------|-------|
| Claude Agent SDK (monitoring agents, ~10 checks/day) | ~$3-8 | Sonnet with tool use |
| Claude Agent SDK (playbook gen, ~5/week) | ~$5-15 | Opus for complex synthesis, Sonnet for simple |
| Perplexity (research loops, ~20 queries/day) | ~$2-7 | sonar-pro with multi-step |
| **Total Phase 4** | **~$10-30/month** | |

### Total Cost Projection

| Phase | Monthly Cost | Cumulative |
|-------|-------------|------------|
| Current | $2-4 | $2-4 |
| Phase 1 (Week 1) | $2-4 | $2-4 |
| Phase 2 (Weeks 2-3) | $5-12 | $5-12 |
| Phase 3 (Weeks 3-4) | $6-49 | $6-49 |
| Phase 4 (Weeks 5-8) | $16-79 | $16-79 |

**Worst case at full scale: ~$79/month**
**Realistic early stage (< 100 users): ~$15-25/month**

### One-Time Setup Costs
| Item | Cost | Notes |
|------|------|-------|
| Twitter/X API access | $0 | Free tier for write-only |
| LinkedIn OAuth app | $0 | Free developer access |
| SendGrid account | $0 | Free tier |
| htmlcsstoimage account | $0 | Free tier (50 images/mo) |
| Slack app creation | $0 | Free |
| **Total Setup** | **$0** | All services have free tiers |

---

## 6. Content Distribution Strategy

### Daily Cadence (Automated)

| Time (ET) | Action | Platform |
|-----------|--------|----------|
| 6:00 AM | Generate 10 intelligence cards | Firestore (in-app) |
| 6:05 AM | Pick top card, draft multi-platform posts | Internal queue |
| 6:10 AM | Send approval to Slack | Slack bot |
| 7:00 AM | Email digest (top 3 cards) | SendGrid |
| 8:00 AM | LinkedIn post (on approval) | LinkedIn API |
| 8:15 AM | Twitter/X thread (on approval) | Twitter API |
| 8:30 AM | Slack team notification | Slack API |

### Post Formats by Platform

**LinkedIn (200-400 words):**
- Hook: Key stat from Tier 1 source
- Body: Macro anchor + micro signal + tension + implication
- CTA: "Your next move:" + link to full brief on signals.ensolabs.ai
- No emojis, no hashtag spam (max 3-5)

**Twitter/X (3-5 tweet thread):**
- Tweet 1: Key stat hook (max 280 chars)
- Tweet 2-3: Signals + tension
- Tweet 4: "Your next move" + app link
- Tweet 5: "Full brief + 9 more signals: [link]"

**Email Digest:**
- Subject: "[Signal] {Top card title}"
- Body: Top 3 cards with title, summary, key stat, source
- CTA per card: "Read full brief"
- Footer: "10 signals generated today. See all at signals.ensolabs.ai"

**Slack:**
- Single message per day, threaded replies for each card
- Format: **[Pillar]** Title — Summary (2 sentences) — Source
- Button: "Open in app"

---

## 7. Metrics & Success Criteria

### Phase 1 Success (Week 1)
- [ ] All 4 critical bugs fixed
- [ ] Streaming responses visible in IntelligenceModal (< 2s to first token)
- [ ] SignalDashboard rows clickable
- [ ] Images displayed in at least 60% of cards
- [ ] LinkedIn posting active (via n8n, temporary)

### Phase 2 Success (Week 3)
- [ ] Card generation: 1 Perplexity + 1 Claude call (down from 14)
- [ ] API cost reduced to ~$5-12/month
- [ ] Conversation threads persist across modal sessions
- [ ] Dashboard supports drill-down and time-range selection
- [ ] Live source links on every card

### Phase 3 Success (Week 4)
- [ ] Daily posts to LinkedIn + Twitter/X (with approval)
- [ ] Email digest sending to opt-in list
- [ ] Slack notifications functional
- [ ] Branded image cards on LinkedIn posts
- [ ] n8n workflow fully replaced and deactivated

### Phase 4 Success (Week 8)
- [ ] At least 3 signal monitors active per user
- [ ] Playbook generation returns structured 30-60-90 plan
- [ ] Weekly synthesis email auto-generated
- [ ] Research loops return 3+ angles with citations in < 3 minutes

---

## 8. Files to Delete (Cleanup)

```
DELETE:
  docs/FUTURE_IDEAS.md
  docs/sessions/POLISH-IMPROVEMENTS.md
  docs/sessions/DAILY-INTELLIGENCE-TESTING.md
  docs/sessions/DISCOVER-FEED-IMPLEMENTATION.md
  docs/sessions/DAILY-INTELLIGENCE-FINAL-SUMMARY.md
  docs/sessions/ONBOARDING-IMPROVEMENTS.md
  .cursor_3/skills/* (except daily-intel-editor.md)

KEEP (excellent, no changes needed):
  docs/EDITORIAL_VOICE.md
  docs/DAILY_INTEL_FRAMEWORK.md
  docs/CHANGELOG.md
  DEPLOYMENT.md

REWRITE:
  CLAUDE.md → update to reflect new architecture
  ARCHITECTURE.md → update to reflect agent-powered system
  README.md → update product description
```

---

## 9. Verification Plan

### After Phase 1:
1. `firebase deploy --only functions` → verify no errors
2. Open signals.ensolabs.ai → click any card → verify streaming (tokens appear progressively)
3. Navigate to `/brief/:cardId` URL → verify correct card loads
4. Click SignalDashboard row → verify modal opens with topic
5. Check Firestore `discover_cards` → verify no duplicate Notion DB ID errors in logs
6. Check LinkedIn → verify post published (n8n workflow active)

### After Phase 2:
1. Check Cloud Function logs → verify only 2 API calls per daily generation
2. Open IntelligenceModal → ask follow-up → ask another → verify thread context maintained
3. Click SignalDashboard row → verify drill-down loads
4. Check cards → verify images and live links displayed

### After Phase 3:
1. Check Slack → verify approval message received at ~6:10 AM
2. Approve → check LinkedIn, Twitter/X → verify posts published
3. Check email inbox (test subscriber) → verify digest at 7 AM
4. Verify n8n workflow deactivated, replaced by Firebase Functions

### After Phase 4:
1. Set up signal monitor → wait 24h → verify alert received
2. Request playbook → verify structured 30-60-90 plan returned
3. Check weekly synthesis → verify cross-pillar trends detected

---

## Sources (Grounding Research)

- [Perplexity Agent API](https://thenewstack.io/perplexity-agent-api/) — managed runtime with orchestration + multi-model routing
- [Perplexity March 2026 Features](https://www.datastudios.org/post/perplexity-new-features-and-use-cases-in-march-2026) — Skills, structured outputs, finance-grade outputs
- [Perplexity Sonar API Pricing](https://docs.perplexity.ai/docs/getting-started/pricing) — $3/$15 per 1M tokens (sonar-pro)
- [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) — v0.2.71, production agent runtime
- [Claude Structured Outputs from Agents](https://platform.claude.com/docs/en/agent-sdk/structured-outputs) — validated JSON from agent loops
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — Opus $5/$25, Sonnet $3/$15, Haiku $1/$5
- [Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6) — agentic planning, 1M context, computer use
- [n8n as MCP Hub](https://www.infralovers.com/blog/2026-03-09-n8n-agentic-mcp-hub/) — consume + expose MCP tools
- [AlphaSense](https://www.alpha-sense.com/) — multi-agent research, executive reports
- [Crayon CI Platform](https://www.autobound.ai/blog/top-15-competitive-intelligence-tools-2026) — real-time competitor tracking, $20-40K/yr
- [Improvado Marketing Intelligence](https://improvado.io/blog/marketing-intelligence-tools) — AI Agent for natural language analytics
- [The Rundown AI](https://zapier.com/blog/best-ai-newsletters/) — 2M+ subscribers, daily AI briefing
- [SendGrid Pricing](https://sendgrid.com/en-us/pricing) — Free 100/day, Essentials $19.95/mo
- [Firebase Pricing](https://firebase.google.com/pricing) — Free tier: 2M invocations, 50K reads/day
- [LinkedIn API](https://developer.linkedin.com/product-catalog) — Free Share API for personal posting
- [Twitter/X API Pay-Per-Use](https://devcommunity.x.com/t/announcing-the-launch-of-x-api-pay-per-use-pricing/256476) — Write access, pay per use
- [htmlcsstoimage](https://htmlcsstoimage.com/pricing) — Free 50/mo, $0.01/image overage
- [Recharts](https://github.com/recharts/recharts) — 3.6M weekly downloads, React-native charts
- [Perplexity Discover Feed](https://www.perplexity.ai/discover) — personalized topic cards, "For You" feed
- [Dark Glassmorphism UI Trend 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) — frosted glass, blur, depth
- [LinkedIn Infographic Formats 2026](https://infographicsdesigners.co.uk/best-infographic-formats-for-linkedin-in-2026/) — carousel, step-by-step, stat cards
- [Visme Data Visualizations 2026](https://visme.co/blog/best-data-visualizations/) — interactive charts, maps, data stories
- [Perplexity Pages](https://www.perplexity.ai/hub/blog/perplexity-pages) — shareable AI-generated research pages

---

## 10. Visual Design System & UX Overhaul

### Design Philosophy: "Dark Intelligence"

Benchmark: Perplexity Discover meets Bloomberg Terminal meets Apple Liquid Glass.

The app should feel like opening a premium intelligence terminal — dark, fast, data-rich, visually striking. Every element should make a CMO want to screenshot and share it.

### Design Principles
1. **Data-first**: Every card shows a number, chart, or visual before text
2. **Scannable**: A user should grasp the day's top 3 signals in < 10 seconds
3. **Shareable**: Every card should look good as a screenshot on LinkedIn
4. **Mobile-native**: Designed for iPhone/iPad first, scales up to desktop
5. **Alive**: Animations, live indicators, streaming text, pulsing scores

### Visual Language

**Color System (Dark Mode Primary):**
- Background: Deep navy gradient (`#0A0F1C` → `#0d1321`)
- Cards: Glassmorphism — `backdrop-blur-xl`, `bg-white/5`, `border border-white/10`
- Accent: Signal Orange `#E67E22` (CTAs, highlights, scores)
- Pillar colors: Purple (AI), Blue (Brand), Orange (Competitive), Emerald (Media)
- Data positive: `#22C55E` (green), Data negative: `#EF4444` (red)
- Text: `#F5F5F5` primary, `#94A3B8` secondary (slate-400)

**Typography:**
- Headlines: Outfit 700 (bold, modern)
- Card titles: Playfair Display 600 (editorial authority)
- Data/scores: IBM Plex Mono 500 (precision, technical)
- Body: Inter 400 (readability)
- Key stats: Outfit 800, 2.5rem+ (hero numbers that pop)

**Glassmorphism Implementation (Tailwind):**
```
Card: backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl
Hover: bg-white/8 border-white/20 scale-[1.02] transition-all duration-300
Active modal: backdrop-blur-2xl bg-black/60
Stat callout: bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500
```

### Mobile-First Responsive Breakpoints
- **Mobile** (< 640px): Single column, full-width cards, bottom nav, swipeable
- **Tablet** (640-1024px): 2-column grid, side panel for modal
- **Desktop** (> 1024px): 3-column masonry, sticky sidebar, full dashboard

### Component Redesign Targets

**1. Landing/Feed Page (Perplexity Discover-style)**
- Top: Sticky search bar with glassmorphism (always accessible)
- "For You" / "AI Strategy" / "Brand" / "Competitive" / "Media" tab pills
- Cards: Full-bleed images with gradient overlay, key stat in large type
- Each card shows: Hero image → Key stat (large) → Title → 2-line summary → Source pill → Pillar tag
- Infinite scroll with skeleton loading
- Pull-to-refresh on mobile
- Live "just updated" pulse indicator on fresh cards

**2. Intelligence Card (Visual-First)**
- Hero: OG image from source (full width, 200px height, gradient fade to card bg)
- Key stat: Large number/percentage in Outfit 800, orange accent
- Mini sparkline next to key stat (7-day trend, inline)
- Title: Playfair Display, 2 lines max
- Summary: 2 sentences, Inter 400
- Source pill: Favicon + name + tier badge
- Bottom bar: "Read more" → opens streaming modal
- Share icon: Generates branded image card (htmlcsstoimage) for social sharing

**3. Signal Dashboard (Bloomberg-inspired)**
- Full-width responsive table with glassmorphism rows
- Columns: Rank | Signal | Score (animated bar fill) | Δ (color-coded) | Momentum | 7d Sparkline
- Click any row → slides open a detail panel (no full modal for quick scanning)
- Hover: Row highlights with glow effect
- Mobile: Horizontal scroll or card-based layout
- Header: "Live Signals" with pulsing green dot
- Auto-refresh every 5 minutes (lightweight Firestore listener)

**4. Intelligence Modal (Streaming Research Interface)**
- Full-screen overlay with `backdrop-blur-2xl`
- Hero image + gradient at top
- Key stat callout box (orange left border, large number)
- Streaming text response (token-by-token, like Claude.com)
- Inline data visualizations:
  - Bar chart: Comparing related metrics
  - Trend line: Signal score over time
  - Donut chart: Source distribution
- Follow-up suggestions as glassmorphism pills
- Conversation thread below (ChatGPT-style, persisted)
- Sidebar: Related signals, affected brands with logos, source links
- Share button: Generates branded card + copies app link

**5. Data Visualizations (Recharts + Custom)**

Every card type gets a visualization:
- `brief`: Mini sparkline + key stat number
- `hot_take`: Sentiment gauge (bull/bear meter)
- `datapulse`: Horizontal bar chart (ranked list)
- Dashboard: Area charts, bar comparisons, donut breakdowns

Chart styling:
```
Colors: Match pillar (purple/blue/orange/emerald) with gradient fills
Background: Transparent (sits on glassmorphism card)
Grid: Subtle `stroke="#ffffff10"` lines
Labels: IBM Plex Mono, `#94A3B8`
Tooltips: Glassmorphism popup with `backdrop-blur-md`
Animations: 800ms ease-out entry, smooth hover transitions
```

Specific visualizations to build:
- **Signal Momentum Chart**: Area chart showing 30-day trend for a signal topic
- **Source Tier Donut**: Shows distribution of Tier 1/2/3 sources in today's cards
- **Pillar Heatmap**: 4×7 grid (pillars × days) showing signal intensity
- **Key Stat Comparison**: Horizontal bar comparing this week vs last week
- **Brand Impact Scatter**: X=relevance, Y=urgency, size=source tier

---

## 11. Branded Visual Cards for Social Distribution

### LinkedIn/Twitter Visual Cards (htmlcsstoimage)

Every LinkedIn and Twitter post gets an auto-generated branded image card (1200×630px for LinkedIn, 1200×675px for Twitter).

**Card Template Design:**
```
┌──────────────────────────────────────────┐
│  [Dark gradient background #0A0F1C]      │
│                                          │
│  ┌─ Orange accent bar (4px left) ──────┐ │
│  │                                      │ │
│  │  "89%"          ← Key stat, 72pt    │ │
│  │  of CMOs lack   ← Subtitle, 24pt   │ │
│  │  AI attribution ← Subtitle cont.   │ │
│  │  strategy        │ │
│  │                                      │ │
│  │  ● AI Strategy   ← Pillar pill      │ │
│  │  McKinsey, 2026  ← Source + year    │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                          │
│  signals.ensolabs.ai    [logo]           │
│  ─────────────────────────────           │
│  Your next move: Read the full brief →   │
└──────────────────────────────────────────┘
```

**HTML/CSS Template (for htmlcsstoimage API):**
- Dark background with subtle noise texture
- Large key stat in Outfit 800 with orange glow
- Pillar color accent bar on left
- Source attribution + tier badge
- signals.ensolabs.ai branding + logo bottom right
- "Your next move" CTA at bottom
- Template stored as HTML string in Firebase Function

**Per-Platform Variations:**
- LinkedIn: 1200×630px, include "Read the full brief at signals.ensolabs.ai"
- Twitter/X: 1200×675px, include thread number "1/5"
- Email: 600×315px, smaller for inbox rendering
- Instagram (future): 1080×1080px square format

**Cost:** $0 (free tier: 50 images/month, we need ~30/month)

---

## 12. LinkedIn → App Funnel (Growth Loop)

### The Loop
```
LinkedIn post (with branded image card)
  → User clicks "Read full brief" link
  → Lands on signals.ensolabs.ai/brief/:cardId
  → Sees: Full brief + data visualization + streaming follow-ups
  → Prompt: "Ask a follow-up question" (requires free signup)
  → Signs up → gets personalized feed + email digest
  → Shares card from app → generates new LinkedIn post
  → Loop repeats
```

### Landing Page Optimization for LinkedIn Traffic
- `/brief/:cardId` must be a shareable, SEO-friendly page (not just a modal)
- OG meta tags: title, description, image (branded card), url
- Above the fold: Hero image + key stat + title + "Continue reading" CTA
- Below fold: Full brief + data viz + related signals
- Sticky bottom bar: "Get daily intelligence — Sign up free"
- Mobile-optimized (LinkedIn mobile traffic is 60%+)

### OG Meta Tags (per brief page)
```html
<meta property="og:title" content="{card.title}" />
<meta property="og:description" content="{card.summary}" />
<meta property="og:image" content="{branded_card_image_url}" />
<meta property="og:url" content="https://signals.ensolabs.ai/brief/{cardId}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

---

## 13. Real-Time Intelligence Engine (Perplexity Discover Model)

### What Makes This a "Real-Time Intelligence Engine"

The goal is to match Perplexity Discover's feel: a living, breathing feed of intelligence that updates throughout the day, not just a static 6 AM dump.

**Real-time elements:**
1. **Breaking signals**: Hourly lightweight check (1 Perplexity call/hour during business hours, 8 AM-6 PM ET = 10 calls/day, ~$0.50/day) for high-priority breaking news. If score > 85, inject into feed immediately with "BREAKING" badge.

2. **Live Firestore listeners**: Frontend subscribes to `discover_cards` collection with `onSnapshot`. New cards appear without page refresh, with slide-in animation.

3. **Streaming everything**: Every AI response streams token-by-token. No loading spinners. Ever.

4. **Signal score auto-refresh**: Dashboard refreshes scores every 5 minutes via lightweight Firestore read (not a new API call — scores are cached in Firestore with 1-hour TTL).

5. **"Just now" / "2 min ago" timestamps**: Relative time displays create urgency and freshness.

6. **Personalized "For You" feed**: After 3+ sessions, the feed reranks based on which pillars and topics the user clicks most (simple Firestore counter, no ML needed).

### Cost of Real-Time Layer
| Item | Cost | Notes |
|------|------|-------|
| Hourly breaking signal check (10 calls/day) | ~$15/month | Perplexity sonar @ $1/1M tokens, ~1.5K tokens per check |
| Firestore onSnapshot listeners | ~$0-1 | Within free tier reads |
| **Total real-time addition** | **~$15-16/month** | |

### Updated Total Cost Projection (All Phases)

| Phase | Monthly Cost | Cumulative |
|-------|-------------|------------|
| Current | $2-4 | $2-4 |
| Phase 1: Fix & Ship | $2-4 | $2-4 |
| Phase 2: Engine + Visuals | $5-12 | $5-12 |
| Phase 2.5: Real-time layer | $20-28 | $20-28 |
| Phase 3: Distribution + Images | $21-65 | $21-65 |
| Phase 4: Agent layer | $31-95 | $31-95 |

**Realistic early stage with real-time (< 100 users): ~$30-45/month**
**Full scale all features: ~$95/month**
**Still 99.7% cheaper than Crayon ($20-40K/year)**
