# CLAUDE.md – Project Instructions for PlannerAPI

## 0. Purpose

This document tells Claude Code how to work on the PlannerAPI project.

PlannerAPI is a browser-based intelligence tool for CMOs, agency owners, senior marketers, and CX leaders. It surfaces Daily Intelligence, structured briefings, and playbooks about AI, marketing, and media using Perplexity + Claude + Firestore.

**Core systems:**
- **Daily Intelligence:** Cloud Function (`functions/src/generateDiscoverCards.ts`) + Frontend (`components/DailyIntelligence.tsx`)
- **Strategy Chat:** Real-time Perplexity-powered Q&A (`HeroSearch.tsx`, `ExecutiveStrategyChat.tsx`)
- **LinkedIn Publishing Engine:** n8n workflow → Claude → LinkedIn + in-app briefs

Always prioritize correctness, editorial quality, and cost efficiency over cleverness.

---

## 1. Tech Stack & Key Files

### Frontend
- React, TypeScript, Tailwind, Firebase Hosting
- `App.tsx`
- `components/DailyIntelligence.tsx`
- `components/IntelligenceModal.tsx`
- `components/HeroSearch.tsx`
- `components/ExecutiveStrategyChat.tsx`

### Backend
- Cloud Functions (Node.js 20): `functions/src/*.ts`
- Daily Intelligence generator: `functions/src/generateDiscoverCards.ts`
- Types: `functions/src/types.ts`

### Firestore Collections
- `discover_cards` – Daily Intelligence cards (legacy name, do not rename)
- `briefs` – Future: saved Strategy Chat briefs
- `linked_briefs` – Future: briefs published to LinkedIn with backlinks

### Documentation You MUST Respect
- `API-USAGE-OPTIMIZATION.md` – API cost constraints and schedules
- `DAILY-INTELLIGENCE-FINAL-SUMMARY.md` – Current implementation shape
- `DISCOVER-FEED-IMPLEMENTATION.md` – Schema, scheduling, Firestore details
- `DAILY-INTELLIGENCE-TESTING.md` – Testing checklist and verification
- `POLISH-IMPROVEMENTS.md` – UI polish and accessibility requirements
- `ONBOARDING-IMPROVEMENTS.md` – UX flows and user state management
- `docs/DAILY_INTEL_FRAMEWORK.md` – Content architecture and source tiers
- `docs/EDITORIAL_VOICE.md` – Voice, tone, and framing rules
- `docs/FEED_LAYOUT_INSPIRATION.md` – UI/UX patterns for future feeds
- `docs/FUTURE_IDEAS.md` – Parking lot for experiments
- `DESIGN-SYSTEM.md` – Visual design, typography, colors, accessibility, UX principles

Never propose hourly or high-frequency polling that contradicts `API-USAGE-OPTIMIZATION.md`.

---

## 2. Target Audiences

All content, briefs, and features must be designed for:

| Audience | What They Need | Example Question |
|----------|----------------|------------------|
| CMO / VP Marketing | Budget, roadmap, org decisions | "Should I invest in AI attribution this quarter?" |
| Agency Owner | Client delivery, competitive positioning, tool fluency | "How do I position AI services to my clients?" |
| Brand / Performance Lead | Campaign ROI, media optimization | "Is my SEO strategy at risk from AI Overviews?" |
| CX Leader | Customer journey, AI experience design | "Where should AI touch the customer journey?" |

Assume:
- High context on marketing and AI
- Low patience for fluff
- Need to translate noise into budget, roadmap, and team decisions

---

## 3. Content Refresh Cadence

| Content Type | Refresh | Models | Trigger |
|--------------|---------|--------|---------|
| Daily Intelligence cards | Daily at 6:00 AM ET | Perplexity `sonar-pro` + Claude Haiku | Cloud Scheduler |
| Strategy Chat / Hero Search | Real-time (every query) | Perplexity `sonar-pro` | User action |
| Ask Follow-Up | Real-time (on click) | Perplexity `sonar-pro` + card context | User action |
| Data Pulse (top lists) | Weekly or monthly | Perplexity `sonar-pro` + manual curation | Manual or n8n |
| LinkedIn briefs | Editorial schedule (daily/weekly) | Perplexity + Claude Sonnet/Haiku | n8n workflow |

**Cost target:** ~$2–5/month total (well within Perplexity Standard Plan).

---

## 4. Daily Intelligence – Editorial Architecture

When working on these files:
- `functions/src/generateDiscoverCards.ts`
- `functions/src/types.ts`
- `components/DailyIntelligence.tsx`
- `components/IntelligenceModal.tsx`

You MUST follow the framework defined in:
- `docs/DAILY_INTEL_FRAMEWORK.md`
- `docs/EDITORIAL_VOICE.md`

### Core Principles

**Macro + Micro Architecture:**
- Macro context: Tier 1 consulting/platform research (McKinsey, Gartner, Google, Anthropic)
- Micro signal: Real-time development from the last 24 hours (Digiday, Ad Age, platform changelogs)
- Every card should combine both when possible.

**Four Pillars (fixed):**
1. `ai_strategy` – CMO adoption, AI operating models, enterprise tools, governance (Purple)
2. `brand_performance` – Brand equity, attribution, measurement, creative effectiveness (Blue)
3. `competitive_intel` – Market share shifts, agency moves, holding company strategy (Orange)
4. `media_trends` – Platform changes, channel mixes, retail media, programmatic, CTV (Emerald)

**Card Types:**
- `brief` – Standard intelligence card (~80% of content)
- `hot_take` – Sharper, more opinionated take (~20% of content)
- `datapulse` – Weekly/monthly ranked lists (top podcasts, top ads, etc.)

---

## 5. Editorial Voice & Tone

Use the **PlannerAPI editorial voice** defined in `docs/EDITORIAL_VOICE.md`.

In short:
- **Analytical:** Lead with data, not opinion
- **Pragmatic:** Every insight should lead to "what to do Monday"
- **Concise:** 2–3 sentences per section max
- **Direct:** Name winners/losers and tradeoffs
- **Credible:** Cite recognizable sources (McKinsey, Gartner, Google) when used

**Signature Framing Patterns:**
- Tension: "The 94% Problem:", "Two Camps Are Emerging:", "The Window Is Closing On…"
- Implication: "What this means for CMOs is…", "For media planners, the risk is…"
- Action: "Your Monday move:", "Start here:", "The 3-step audit:"

**Absolute Prohibitions:**
- No emojis
- No hype phrases ("revolutionary", "game-changing", "paradigm shift")
- No vague recommendations ("consider evaluating")

If instructions in the chat conflict with `docs/EDITORIAL_VOICE.md`, follow the doc and warn the user.

---

## 6. LinkedIn Publishing Engine

PlannerAPI uses an n8n workflow to publish intelligence to LinkedIn and drive traffic back to the app.

**Flow:**
1. Perplexity (research) → Claude (draft/refine) → n8n
2. n8n writes brief to Firestore (`linked_briefs` collection)
3. n8n publishes to LinkedIn with CTA: "📊 Full brief: [appUrl]"
4. App displays the brief at `/briefs/:slug`

**LinkedIn Post Structure:**
- Hook: Strong data point (e.g., "67% of CMOs say AI attribution is their #1 blind spot")
- Body: Layer 2–3 data sources + synthesis + implication (200–400 words)
- CTA: Tactical Monday move + link to full brief

**Deduplication:** See Section 11.

---

## 7. Playbook Library Themes

Future playbooks to reference and build toward:

1. **AEO/GEO Readiness Check** – How search is shifting from SEO to Answer Engine Optimization and Generative Engine Optimization
2. **Workflows vs Agents: Where to Start** – Clarifying when to automate vs when to deploy agentic AI
3. **Enterprise AI, De-Jargonized** – What "enterprise AI" actually means (governance, security, measurable outcomes)
4. **Leadership Brief: What Should Organizational Leaders Think About?** – Anchored to Anthropic Economic Index (Jan 2026)
5. **AI Upskilling Tracks for Brand + Agency Teams** – Role-specific training for CMO, creative, media, agency teams

Each playbook maps to Daily Intelligence pillars and can be introduced via cards and LinkedIn posts.

---

## 8. Claude Skills

This project uses Claude Skills to enforce editorial consistency.

- **Skill name:** `daily-intel-editor`
- **Location:** `skills/daily-intel-editor.md`

When the user mentions:
- "Daily Intelligence"
- "AI Intelligencer"
- "Discover cards" / "Intelligence cards"
- "LinkedIn post" (in context of PlannerAPI content)
- "Brief" or "Playbook"

Then:
- Load/apply the `daily-intel-editor` Skill
- Use its rules for prompts, content shaping, JSON schema, voice/tone

---

## 9. When Editing the Daily Intelligence Cloud Function

**File:** `functions/src/generateDiscoverCards.ts`

When asked to modify this:

1. **Plan first, then implement**
   - Step 1: Read all relevant docs (see Section 1)
   - Step 2: Propose a numbered plan (files, schema impact, API call changes)
   - Step 3: Wait for user approval

2. **Use the IntelligenceCard schema from `docs/DAILY_INTEL_FRAMEWORK.md`**

3. **Use Perplexity only within the specified budget**
   - 10 content calls/day by default
   - Use `sonar-pro` with `search_recency_filter: 'day'`

4. **Always return valid JSON from Perplexity & Claude**
   - If Perplexity returns malformed JSON, use Claude Haiku to extract/normalize

5. **Run deduplication checks before storing** (see Section 11)

---

## 10. Safe Operations

- Never commit API keys or secrets to the repo
- Respect existing environment variables: `PPLX_API_KEY`, `ANTHROPIC_API_KEY`
- When adding new configuration, use `.env` / `functions/.env` and document keys in comments

---

## 11. Content Deduplication

When generating new Daily Intelligence cards or LinkedIn briefs, **automatically prevent duplicates**:

### For Daily Intelligence Cards (in `generateDiscoverCards.ts`)

Before writing to Firestore, check for duplicates by:

1. **Source + URL check (strongest)**
   - Query `discover_cards` for same `source` + `sourceUrl` within last 30 days
   - If found → skip inserting, log "Duplicate prevented: same source URL"

2. **Title similarity check**
   - Query cards from the same `pillar` in last 7–14 days
   - Normalize titles (lowercase, strip punctuation/numbers)
   - If similarity > 90% → skip inserting, log "Duplicate prevented: similar title"

3. **Content hash (optional, for extra safety)**
   - Compute hash of `summary + signals.join()`
   - Store as `contentHash` field
   - If hash matches existing card in last 30 days → skip

### For LinkedIn Posts (in n8n workflow)

1. **Generate a `dedupeKey`**
   - Hash of `title + sourceUrl` or `date + main stat + primary source`

2. **Check before posting**
   - Query `linked_briefs` collection for `dedupeKey`
   - If found → stop workflow or update existing brief instead of posting again

3. **Store metadata after posting**
   - Write `linkedinPostId`, `linkedinPermalink`, and `dedupeKey` to the brief document

### Logging

All skipped duplicates should be logged with clear messages so you can audit later:
- `[DEDUPE] Skipped card: "Title..." – duplicate source URL`
- `[DEDUPE] Skipped card: "Title..." – similar to existing card "Other Title..."`

---

## 12. Workflow Summary (for Claude Code)

When asked to "implement" or "update" Daily Intelligence or editorial systems:

1. **Read:**
   - `CLAUDE.md`
   - `docs/DAILY_INTEL_FRAMEWORK.md`
   - `docs/EDITORIAL_VOICE.md`
   - `API-USAGE-OPTIMIZATION.md`
   - `DAILY-INTELLIGENCE-FINAL-SUMMARY.md`

2. **Propose a plan** in 5–8 bullet points

3. **After user approval**, implement in small, reviewable steps:
   - Types & schema (`functions/src/types.ts`)
   - Cloud Function logic (`functions/src/generateDiscoverCards.ts`)
   - Frontend display (`components/DailyIntelligence.tsx`, `IntelligenceModal.tsx`)

4. **Provide:**
   - Exact commands to build and deploy
   - Manual checks to run in Firestore and on the live site

---

**End of CLAUDE.md**
