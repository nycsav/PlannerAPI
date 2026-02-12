# Skill: daily-intel-editor

## Purpose

Transform raw research and news about AI, marketing, and media into structured Daily Intelligence cards and LinkedIn posts for CMOs, agency owners, senior marketers, and CX leaders.

The output is used in:
- `functions/src/generateDiscoverCards.ts` (server-side generation)
- `components/DailyIntelligence.tsx` (frontend display)
- LinkedIn publishing via n8n workflow
- In-app briefs and future playbooks

---

## When to Use

Activate this skill when:

- The user mentions:
  - "Daily Intelligence"
  - "AI Intelligencer"
  - "discover cards" / "intelligence cards"
  - "LinkedIn post" (in context of PlannerAPI content)
  - "brief" or "playbook"

- The task involves:
  - Designing or updating Perplexity/Claude prompts for intelligence
  - Structuring intelligence outputs
  - Enforcing editorial voice or schema for PlannerAPI content
  - Drafting LinkedIn content for the publishing engine

---

## Inputs

Raw inputs may include:
- URLs, excerpts, or summaries from Perplexity
- Consulting firm reports (McKinsey, Gartner, Anthropic, etc.)
- Platform updates (Google, Meta, OpenAI, Anthropic)
- Existing card data from Firestore
- User-provided themes or audience questions

---

## Output Requirements

Always aim to produce either:

1. A valid `IntelligenceCard` JSON object matching `docs/DAILY_INTEL_FRAMEWORK.md`, or
2. A LinkedIn post following the structure in `docs/EDITORIAL_VOICE.md`, or
3. A clear plan for updating code files

### IntelligenceCard JSON Fields

**Required:**
- `title` – Tension-framed, includes source when possible
- `summary` – 2–3 sentences combining macro + micro + implication
- `signals[]` – 2–4 key metrics or facts
- `moves[]` ▢ 2–4 actions (first starts with "Your next move:" and is the primary, exec-level action)
- `pillar` – One of: `ai_strategy`, `brand_performance`, `competitive_intel`, `media_trends`
- `source` – Primary source name
- `sourceTier` – 1–5
- `priority` – 1–100
- `type` – `brief`, `hot_take`, or `datapulse`

**Optional but Preferred:**
- `macroAnchor` – 1 sentence citing Tier 1/2 research
- `microSignal` – 1 sentence on latest development <24h
- `tension` – 1 sentence on the conflict/gap
- `sourceUrl` – Direct URL
- `contentHash` – For deduplication

### Data Pulse Cards

For curated ranking content (top podcasts, top ads, top trends):

- `type`: `"datapulse"`
- `title`: "Top [X] [Category] This [Week/Month]"
- `signals[]`: The ranked list (1–10 items, numbered)
- `moves[]`: 1–2 actions related to the list
- `pillar`: Map to the most relevant pillar

Data Pulse cards prioritize **simplicity and citability**.

---

## Editorial Rules

Follow `docs/EDITORIAL_VOICE.md`:

- **Analytical:** Lead with data, not opinion
- **Pragmatic:** Every insight must connect to a clear "next move" action
- **Concise:** Maximum 3 sentences per section
- **Direct:** Name who wins and who loses
- **Credible:** Cite specific sources by name in titles

### Absolute Prohibitions
- No emojis
- No hype phrases ("revolutionary", "game-changing", "paradigm shift")
- No vague recommendations ("consider evaluating")
- No generic AI content that could appear anywhere

---

## Source Strategy

When generating or refining content:

1. **Prefer Tier 1 & 2 sources for macro anchors:**
   - McKinsey, Gartner, Forrester, BCG, Bain, Deloitte
   - Google, OpenAI, Anthropic, Meta, Microsoft

2. **Use Tier 3–5 for fresher micro signals:**
   - Ad Age, Adweek, Digiday, Marketing Week, The Drum
   - eMarketer, WARC, Kantar, Nielsen
   - VentureBeat, The Rundown, TechCrunch AI

3. **Always:**
   - Name the primary source in `source`
   - Use `sourceTier` (1–5)
   - Provide `sourceUrl` when known

**Rule:** At least 60% of content should cite Tier 1–2 sources.

---

## Pillar Mapping

Map content explicitly to one of:

- `ai_strategy` – CMO adoption, AI operating models, governance
- `brand_performance` – Attribution, ROI, brand equity, measurement
- `competitive_intel` – Market share, agency moves, vendor landscape
- `media_trends` – Platform changes, channel optimization, AEO/GEO

If unsure, ask for clarification rather than guessing.

---

## Playbook Themes to Reference

When relevant, connect content to these emerging playbook themes:

1. **AEO/GEO Readiness Check** – How search is shifting from SEO to AI-driven discovery
2. **Workflows vs Agents** – When to automate vs when to deploy agentic AI
3. **Enterprise AI, De-Jargonized** – What "enterprise AI" actually means
4. **Leadership Brief** – Anchored to Anthropic Economic Index (Jan 2026)
5. **AI Upskilling Tracks** – Role-specific training for brand and agency teams

---

## Deduplication

Before outputting a card for storage:

1. Check if same `source` + `sourceUrl` exists in last 30 days → skip
2. Check if title similarity > 90% in same pillar, last 14 days → skip
3. If `contentHash` is implemented, check for match → skip

Always flag skipped cards in logs.

---

## JSON Robustness

- Always return **valid JSON** when asked to produce data for Firestore or the Cloud Function
- If the input contains noisy or malformed JSON:
  - Clean it
  - Re-map to the `IntelligenceCard` schema
  - Fill in missing narrative fields (`macroAnchor`, `microSignal`, `tension`) if signals are clear

---

## Example Transformation

**Input (from Perplexity):**
> "McKinsey says only 6% of marketers reach AI maturity, but they gain 22% efficiency. Today, Google expanded AI Overviews to more commercial queries."

**Output:**

```json
{
  "title": "The 94% Problem: McKinsey Says Most Marketers Aren't Ready for Google's AI Overviews",
  "macroAnchor": "McKinsey's 2026 survey finds only 6% of marketing orgs reach AI maturity, but those teams see 22% efficiency gains.",
  "microSignal": "Today, Google expanded AI Overviews to cover 40% of commercial queries in key retail and travel categories.",
  "tension": "The gap between AI-mature and laggard teams is widening as search real estate shrinks.",
  "summary": "McKinsey's latest data shows that only a small minority of marketing teams have the AI maturity to respond quickly to platform shifts. Google's expansion of AI Overviews increases pressure on underinvested teams whose content is now harder to find. What this means for CMOs is that waiting on AI strategy now carries direct revenue risk.",
  "signals": [
    "6% of marketing orgs at AI maturity",
    "22% efficiency gains for AI-mature teams",
    "40% of commercial queries now show AI Overviews in key verticals"
],
"moves": [
  "Your next move: Audit your top 25 commercial search queries to identify how many now trigger AI Overviews and which competitors appear in those boxes.",
  "Build an AI readiness scorecard for your team using McKinsey's 6% maturity benchmark as the baseline.",
  "Run a 30-day pilot tracking click-through-rate changes on queries where AI Overviews have expanded."
]

  "pillar": "ai_strategy",
  "source": "McKinsey & Company",
  "sourceUrl": "https://www.mckinsey.com/...",
  "sourceTier": 1,
  "priority": 90,
  "type": "brief"
}
Flexibility
This Skill defines the default editorial and structural rules for Daily Intelligence.

When the user explicitly asks to:

Experiment with new layouts, formats, or tones

Test inspiration from external sources (e.g., Perplexity Discover, other galleries)

Deviate from standard patterns for a specific purpose

Treat this Skill as a strong default, not a hard constraint. In those cases:

Clearly flag which rules are being relaxed or changed.

Propose the experiment with a note: "This deviates from the Skill default because [reason]."

After the experiment, recommend whether to update the Skill permanently or revert.

For ongoing inspiration and ideas, check:

docs/FEED_LAYOUT_INSPIRATION.md

docs/FUTURE_IDEAS.md

End of daily-intel-editor skill