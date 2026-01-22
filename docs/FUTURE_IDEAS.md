# Future Ideas & Experiments

## Purpose

A parking lot for new concepts, features, and experiments to evaluate before committing to the roadmap or updating Skills/specs.

Add ideas freely. Review periodically to promote, archive, or discard.

---

## Format

For each idea, capture:
- **Idea:** One-line description
- **Source:** Where it came from
- **Audience impact:** Who benefits and how
- **Effort estimate:** Low / Medium / High
- **Status:** New / Evaluating / Approved / Archived

---

## Ideas

### 1. "Ask Follow-Up" button on Daily Intelligence cards
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** Lets users drill into a card via Strategy Chat with pre-filled context
- **Effort:** Low (frontend only, uses existing chat endpoint)
- **Status:** Approved – ready to implement

### 2. In-app briefs from LinkedIn posts
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** LinkedIn followers can read full brief on PlannerAPI; builds library
- **Effort:** Medium (new Firestore collection + simple detail view)
- **Status:** Approved – ready to implement

### 3. Playbook library with named workflows
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** Turns insights into repeatable, productized strategy
- **Effort:** Medium–High (new collection, UI, possibly gated)
- **Status:** Evaluating – define 3–5 launch playbooks first

### 4. Perplexity Discover-style gallery layout
- **Source:** Perplexity Discover (observed Jan 2026)
- **Audience impact:** More visual, browsable feed for returning users
- **Effort:** Medium (frontend refactor)
- **Status:** New – capture in `FEED_LAYOUT_INSPIRATION.md` first

### 5. AI Upskilling Tracks for agency teams
- **Source:** Anthropic Economic Index Jan 2026 + internal planning
- **Audience impact:** Agencies can show clients they're investing in AI fluency
- **Effort:** High (content + possible gating/packaging)
- **Status:** Evaluating – outline curriculum first

### 6. Data Pulse: Weekly/Monthly Rankings
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** Establishes PlannerAPI as a data aggregator; gives users curated "top lists" they can cite
- **Data sources:** Spotify Charts, Kantar, WARC, Power Digital, G2, Product Hunt
- **Effort:** Medium (manual curation initially; semi-automate with n8n later)
- **Status:** Approved – start with Top Podcasts and Top Ads; expand monthly

### 7. Content deduplication automation
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** Prevents repeat content, maintains quality and trust
- **Effort:** Low–Medium (add checks to Cloud Function)
- **Status:** Approved – implement in `generateDiscoverCards.ts`

### 8. Phase II: Personalized Homepage for Logged-In & Paid Users
- **Source:** Internal planning (Jan 2026)
- **Audience impact:** Transforms generic homepage into personalized intelligence feed based on user preferences, industry, role, and engagement history
- **Effort:** High
- **Status:** Approved for Phase II

**Personalization Layers:**

| User Type | Experience |
|-----------|------------|
| **Anonymous** | Generic Daily Intelligence feed (current state) |
| **Logged-in (Free)** | Pillar preferences, saved cards, "continue reading" history, role-based content weighting |
| **Paid Subscriber** | Full personalization + priority access to hot takes, Data Pulse rankings, playbooks, custom alerts, industry-specific briefings |

**Implementation Components:**
1. **User Preferences Collection:** Onboarding flow to capture role (CMO, Agency Owner, Brand Lead, CX Leader), industry vertical, and pillar interests
2. **Engagement Tracking:** Track card clicks, time-on-card, saved items, follow-up queries to build preference model
3. **Content Weighting Algorithm:** Adjust card priority based on user profile + engagement signals
4. **Saved/Bookmarked Cards:** Allow users to save cards for later reference
5. **Custom Alerts:** Paid users can set up keyword/topic alerts for new intelligence
6. **Industry Verticals:** Filter content by retail, CPG, financial services, tech, healthcare, etc.
7. **"For You" Section:** ML-based recommendations based on reading history and similar user behavior

**Firestore Schema Additions:**
```typescript
// users/{userId}
{
  role: 'cmo' | 'agency_owner' | 'brand_lead' | 'cx_leader',
  industry: string,
  pillarPreferences: ['ai_strategy', 'brand_performance'],
  savedCards: string[], // card IDs
  lastVisit: Timestamp,
  subscription: 'free' | 'pro' | 'enterprise'
}

// user_engagement/{eventId}
{
  userId: string,
  cardId: string,
  action: 'view' | 'click' | 'save' | 'share' | 'follow_up',
  timestamp: Timestamp,
  durationMs?: number
}
```

**Success Metrics:**
- Increased session duration for logged-in users
- Higher card engagement rate (clicks, saves)
- Conversion from free to paid
- Reduced bounce rate on homepage

---

## Archived Ideas

*(Move ideas here if discarded or superseded)*

---

**End of FUTURE_IDEAS.md**
