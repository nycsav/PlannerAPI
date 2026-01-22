# Daily Intelligence Framework

## 1. Purpose

Define the data model, source strategy, and content architecture for Daily Intelligence cards used on the PlannerAPI homepage and distributed via LinkedIn.

The goal: **credible, operator-focused intelligence** that connects:
- Macro insights from consulting firms/platform research
- Micro, real-time signals from daily news and platform changes
- Clear, practical actions for marketing and CX leaders

---

## 2. Target Audiences

| Audience | What They Need | Example Question |
|----------|----------------|------------------|
| CMO / VP Marketing | Budget, roadmap, org decisions | "Should I invest in AI attribution this quarter?" |
| Agency Owner | Client delivery, competitive positioning | "How do I position AI services to my clients?" |
| Brand / Performance Lead | Campaign ROI, media optimization | "Is my SEO strategy at risk from AI Overviews?" |
| CX Leader | Customer journey, AI experience design | "Where should AI touch the customer journey?" |

---

## 3. Content Pillars

These four pillars are fixed and must be used consistently:

| Pillar | ID | Focus | Color |
|--------|-----|-------|-------|
| AI Strategy | `ai_strategy` | CMO adoption, AI operating models, enterprise tools, governance | Purple |
| Brand Performance | `brand_performance` | Brand equity, attribution, measurement, creative effectiveness, ROI | Blue |
| Competitive Intel | `competitive_intel` | Market share shifts, agency moves, holding company strategy, vendor moves | Orange |
| Media Trends | `media_trends` | Platform changes, channel mixes, retail media, programmatic, CTV, AEO/GEO | Emerald |

Each card MUST be tagged with one of these pillars.

---

## 4. Source Tiers

We use five tiers of sources to signal credibility and control prioritization.

### Tier 1 – Premier Research & Consulting (Highest Credibility)
- McKinsey & Company
- Gartner
- Forrester
- BCG, Bain, Deloitte

Use for: macro anchors, maturity models, global benchmarks.

### Tier 2 – Technology Platform Research
- Google (Think with Google, blog.google, Google Trends)
- OpenAI (blog, research, changelog)
- Anthropic (research, news, Economic Index)
- Meta AI, Microsoft Research, Amazon Ads

Use for: product changes, platform AI capabilities, usage patterns.

### Tier 3 – Trade Publications
- Ad Age, Adweek, Digiday, Marketing Week, The Drum, Campaign

Use for: campaign case studies, agency news, practical sentiment.

### Tier 4 – Data & Benchmark Providers
- eMarketer / Insider Intelligence
- WARC
- Kantar / BrandZ
- Nielsen, Comscore

Use for: forecasts, ad spend, measurement, brand value.

### Tier 5 – AI-Native & Ecosystem
- VentureBeat AI
- The Rundown
- Ben's Bites
- TechCrunch AI

Use for: early signals, new tools, startup landscape.

**Rule:** At least 60% of daily cards should cite Tier 1–2 sources for credibility.

---

## 5. Macro + Micro Content Architecture

Each card follows this logical structure:

### Layer 1: Macro Anchor (Context)
- 1 sentence citing Tier 1/2 research
- Provides strategic framing
- Example: "McKinsey's 2026 State of Marketing finds only 6% of teams reach AI maturity, but they see 22% efficiency gains."

### Layer 2: Micro Signal (Today)
- 1 sentence describing a development from the last 24 hours
- Provides freshness and urgency
- Example: "Today, Google expanded AI Overviews to 40% of commercial queries in retail and travel."

### Layer 3: Tension (Gap / Risk)
- 1 sentence naming the conflict
- Creates engagement and urgency
- Example: "The gap between AI-mature and laggard teams is widening as search real estate shrinks."

### Layer 4: Summary
- 2–3 sentences combining macro + micro + implication
- Ends with "what this means" for the pillar's audience

### Layer 5: Signals (Bullets)
- 2–4 bullet points with specific metrics or facts

### Layer 6: Moves (Actions)
- First item: "Your next move:" — primary, exec-level action that translates the intel into one concrete decision or step.
- Next 1–3 items: supporting audits, decisions, or experiments

---

## 6. IntelligenceCard Schema

TypeScript interface (mirror in `functions/src/types.ts`):

```ts
export interface IntelligenceCard {
  id?: string;

  // Core content
  title: string;              // Tension-framed, includes source when possible
  summary: string;            // 2–3 sentences combining macro + micro + implication

  // Structured narrative elements (optional but preferred)
  macroAnchor?: string;       // 1 sentence citing Tier 1/2 research for context
  microSignal?: string;       // 1 sentence describing latest development (<24h)
  tension?: string;           // 1 sentence describing the conflict/gap

  // Lists
  signals: string[];          // 2–4 key metrics or facts
  moves: string[];      // 2–4 specific actions (first starts with "Your next move:" and is the primary, exec-level action)

  // Classification
  pillar: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
  type: 'brief' | 'hot_take' | 'datapulse';

  // Source + credibility
  source: string;             // e.g., "McKinsey & Company", "Digiday"
  sourceUrl?: string;         // Direct URL to main article/report
  sourceTier: number;         // 1–5 (1 = Tier 1, 5 = Tier 5)
  sourceCount?: number;       // Optional: # of sources considered
  contentHash?: string;       // Optional: for deduplication

  // Ranking & timing
  priority: number;           // 1–100, used for ordering
  publishedAt: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;

  // Future enhancements
  imageUrl?: string;
  chartData?: Array<{ label: string; value: number }>;
}
Required fields: title, summary, signals, moves, pillar, source, sourceTier, priority, publishedAt, type, createdAt

Optional but preferred: macroAnchor, microSignal, tension, sourceUrl, contentHash

7. Title Framing Patterns
Titles should use tension framing when possible:

Tension Patterns:

"The [X]% Problem: …" → "The 94% Problem: McKinsey Finds Most EU Marketers Lack AI Maturity"

"Two Camps Are Emerging: …" → "Two Camps Are Emerging: Gartner Says 33% of Orgs Will Deploy Agentic AI by 2028"

"The Window Is Closing On …" → "The Window Is Closing: Google AI Overviews Now Cover 40% of Commercial Queries"

"The Gap Is Widening Between …"

Requirements:

Include a specific stat or finding

Include source attribution when from Tier 1–2

Be concrete, not vague

8. Data Pulse: Weekly/Monthly Rankings
In addition to standard cards, Daily Intelligence includes Data Pulse features: curated rankings that establish PlannerAPI as a data aggregator.

Data Pulse Categories
Category	Source(s)	Refresh	Example Output
Top Podcasts (Marketing/Business)	Spotify Charts, Podchaser	Weekly	"Top 5 Marketing Podcasts This Week"
Top Ads / Campaigns	Kantar, WARC, Ad Age	Monthly	"Top 5 Ads by Effectiveness Score (Jan 2026)"
Top Social Trends	TikTok/IG trending, Power Digital	Bi-weekly	"Top 5 Trending Sounds for Brand Content"
Top Benchmark Reports	Kantar, Snowflake, DemandScience	Quarterly	"3 Reports Every CMO Should Read This Quarter"
Top AI Tools (Marketing)	G2, Product Hunt	Monthly	"Top 5 AI Tools Marketers Are Adopting"
Data Pulse Card Schema
Data Pulse cards use the same IntelligenceCard schema but with:

type: "datapulse"

title: "Top [X] [Category] This [Week/Month]"

signals[]: The ranked list items (1–10, numbered)

moves[]: 1–2 actions related to the list

pillar: Map to the most relevant pillar

Data Pulse cards prioritize simplicity and citability — users should be able to drop these lists into a deck or share on LinkedIn.

9. Priority Scoring
Simple but consistent approach:

Base score: 50

Tier bonus: (6 - sourceTier) * 10 // Tier 1 → +50, Tier 5 → +10

Recency bonus: +20 (we only fetch today's content)

Formula:

text
priority = min(100, 50 + tierBonus + recencyBonus)
10. Perplexity Call Guidance
When generating cards server-side:

Model: sonar-pro

Recency: last 24 hours (search_recency_filter: 'day')

Temperature: low (0.2–0.3) for consistency

Prompt requirements:

Reference this framework

Force JSON output matching the schema

Prefer Tier 1–2 sources for macro anchors

Use Tier 3–5 for fresher micro signals when needed

Every call should:

Return exactly one card per pillar invocation

Include source, sourceUrl, sourceTier

11. Deduplication Rules
Before storing any card, check:

Source + URL match in last 30 days → skip

Title similarity > 90% in same pillar, last 14 days → skip

Content hash match (if implemented) in last 30 days → skip

Log all skipped cards for audit.

12. Acceptance Criteria
A Daily Intelligence iteration is considered aligned if:

At least 60% of cards per day come from Tier 1–2 sources

Every card includes:

1 clear tension-framed title

At least 1 specific metric

At least 1 "Your next move:" style action — first move starts with this and is the primary, exec-level action.

No card feels like generic AI news; each is clearly tailored to marketing/brand/media decisions

No duplicate cards (see Section 11)

API usage stays within the configured schedule and cost envelope

End of DAILY_INTEL_FRAMEWORK.md
