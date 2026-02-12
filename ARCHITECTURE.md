# PlannerAPI Architecture (Living Document)

> ⚠️ This document evolves as the project matures. Last updated: Feb 12, 2026

## System Overview

PlannerAPI is an AI-powered strategic intelligence platform delivering McKinsey-level insights to advertising strategists, CMOs, and marketing leaders. The system combines automated research aggregation, AI-powered content enrichment, and real-time Q&A capabilities.

**Core Value Proposition:**
- Surface tier 1-3 research from premier sources (McKinsey, Gartner, Google, Anthropic)
- Transform raw research into actionable intelligence (signals + moves)
- Enable real-time follow-up research via Perplexity AI
- Deliver daily at 6 AM ET with minimal API costs (~$2-5/month)

---

## Data Flow

### 1. Notion Research Inbox → Firestore Pipeline

```
Notion Database (PlannerAPI Research Inbox)
    ↓
n8n Automation Workflow
    ↓
Claude API (content enrichment)
    - Extract key stats
    - Generate summary (3-5 sentences)
    - Identify signals (3-5 bullet points)
    - Craft moves (2-3 actionable steps)
    ↓
Firestore Collection: premium_briefs
    ↓
React Frontend (PremiumLibrary.tsx)
```

**Trigger:** New entry added to Notion database
**Frequency:** Real-time (on Notion entry creation)
**Cost:** ~$0.10-0.20 per brief (Claude Sonnet 4.5)

### 2. Daily Intelligence Cards Generation

```
Cloud Scheduler (6 AM ET daily)
    ↓
generateDiscoverCards Cloud Function
    ↓
Perplexity API (sonar-pro model)
    - Search recency: last 24 hours
    - 4 pillar-based queries
    ↓
Claude API (Haiku with prompt caching)
    - Normalize JSON structure
    - Apply editorial voice
    - Format cards
    ↓
Firestore Collection: discover_cards
    ↓
React Frontend (DailyIntelligence.tsx)
```

**Frequency:** Once daily at 6 AM ET
**Cost:** ~$0.31/day with prompt caching (~$15/day without)

### 3. Real-Time Strategy Chat

```
User Query (HeroSearch.tsx)
    ↓
Cloud Function: chat-intel
    ↓
Perplexity API (sonar-pro)
    - Real-time web research
    - Citations included
    ↓
React Frontend (ExecutiveStrategyChat.tsx)
```

**Trigger:** User-initiated search
**Cost:** ~$0.05-0.10 per query

### 4. Follow-Up Questions (Modal)

```
User clicks "Ask Follow-Up" (IntelligenceModal.tsx)
    ↓
Cloud Function: chatSimple
    ↓
Perplexity API (sonar-pro) + Card Context
    ↓
Display in Modal
```

**Trigger:** User-initiated from intelligence card modal
**Cost:** ~$0.05-0.10 per follow-up

---

## Firestore Schema

### Collection: `premium_briefs`

**Purpose:** Tier 1-3 research briefs from Notion Research Inbox

```typescript
interface PremiumBrief {
  id: string;                    // Auto-generated
  title: string;                 // Brief title
  source: string;                // e.g., "McKinsey", "Gartner", "Google"
  sourceTier: number;            // 1-5 (1=Premier Research, 5=Emerging Signal)
  excerpt: string;               // Key excerpt from source
  featured: boolean;             // Display in Premium Library?
  pillar: string;                // ai_strategy | brand_performance | competitive_intel | media_trends
  summary: string;               // 3-5 sentence synthesis
  signals: string[];             // 3-5 bullet points (what's happening)
  moves: string[];               // 2-3 actionable steps (what to do)
  sourceUrl: string;             // Original source URL
  createdAt: Timestamp;          // Auto-generated
  notionId?: string;             // Notion entry ID (for deduplication)
}
```

**Indexes:**
- `featured + createdAt` (composite, descending)
- `pillar + createdAt` (composite, descending)
- `sourceTier + createdAt` (composite, descending)

**Deduplication Logic:**
- Check for existing `notionId` before insert
- Max 1 brief per `source` in Premium Library (source diversity)

---

### Collection: `discover_cards`

**Purpose:** Daily intelligence cards (10 per day, refreshed at 6 AM ET)

```typescript
interface DiscoverCard {
  id: string;                    // Auto-generated
  title: string;                 // Card headline
  pillar: string;                // ai_strategy | brand_performance | competitive_intel | media_trends
  cardType: string;              // brief | hot_take | datapulse
  summary: string;               // 2-3 sentences
  signals: string[];             // 3-5 data points or developments
  moves: string[];               // 2-3 tactical next steps
  source: string;                // Primary source cited
  sourceUrl: string;             // URL to original research
  contentHash?: string;          // For deduplication (SHA-256)
  createdAt: Timestamp;          // Auto-generated
  featured: boolean;             // Highlight in feed?
}
```

**Indexes:**
- `createdAt` (descending)
- `pillar + createdAt` (composite, descending)

**Deduplication Logic:**
- Check `source + sourceUrl` within last 30 days
- Title similarity check (>90% match = skip)
- Optional: `contentHash` match within last 30 days

---

### Collection: `linked_briefs` (Planned)

**Purpose:** Briefs published to LinkedIn with backlinks to app

```typescript
interface LinkedBrief {
  id: string;
  title: string;
  content: string;               // LinkedIn post body (200-400 words)
  linkedinPostId: string;        // LinkedIn API post ID
  linkedinPermalink: string;     // Public URL to post
  appUrl: string;                // Deep link to full brief in app
  dedupeKey: string;             // Hash of title + sourceUrl
  publishedAt: Timestamp;
  views?: number;                // Optional: scrape from LinkedIn
  engagement?: {                 // Optional: scrape from LinkedIn
    likes: number;
    comments: number;
    shares: number;
  };
}
```

---

### Collection: `analytics_events`

**Purpose:** User engagement tracking (custom events + GA4)

```typescript
interface AnalyticsEvent {
  id: string;
  userId?: string;               // Firebase Auth UID (if logged in)
  sessionId: string;             // Browser session ID
  eventName: string;             // e.g., "card_view", "modal_open", "follow_up_click"
  eventData: object;             // Event-specific metadata
  timestamp: Timestamp;
  userAgent: string;
  page: string;                  // URL path
}
```

**Common Events:**
- `card_view` - Intelligence card displayed in feed
- `modal_open` - Full brief modal opened
- `follow_up_click` - "Ask Follow-Up" button clicked
- `search_query` - HeroSearch query submitted
- `strategy_chat_message` - Strategy chat message sent

---

### Collection: `users`

**Purpose:** User profiles and preferences

```typescript
interface User {
  uid: string;                   // Firebase Auth UID
  email: string;
  displayName?: string;
  photoURL?: string;
  audienceSegment?: string;      // CMO_Mid-Market | Agency_Strategy | CX_Leader | Independent_Consultant
  preferences: {
    emailDigest: boolean;        // Opt-in for weekly email
    pillars: string[];           // Preferred pillars (for personalization)
  };
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

---

## Component Hierarchy

```
App.tsx (Root)
├── AuthContext (Firebase Auth)
├── AudienceContext (User segment selection)
├── ErrorBoundary (Crash protection)
│
├── HeroSection
│   └── HeroSearch.tsx (Real-time Perplexity search)
│       └── ExecutiveStrategyChat.tsx (Chat interface)
│
├── PremiumLibrary.tsx (Featured tier 1-3 briefs)
│   └── IntelligenceModal.tsx (Full brief display)
│       ├── Summary, Signals, Moves
│       └── "Ask Follow-Up" button → chatSimple
│
├── DailyIntelligence.tsx (10 daily cards)
│   └── Card Grid (pillar-based)
│       └── IntelligenceModal.tsx (on click)
│
├── Footer
└── Analytics (GA4 + Firestore tracking)
```

**Key Props Flow:**
- `audienceSegment` (from AudienceContext) → filters relevant content
- `currentCard` (from DailyIntelligence) → passed to IntelligenceModal
- `followUpQuestion` (from IntelligenceModal) → sent to chatSimple function

---

## Automation Pipeline (n8n)

### Workflow 1: Notion → Firestore Premium Briefs

**Trigger:** Webhook on new Notion entry
**Steps:**
1. Extract entry data (title, source, excerpt, pillar, sourceTier)
2. Check Firestore for duplicate `notionId` (skip if exists)
3. Call Claude API (Sonnet 4.5) with enrichment prompt:
   ```
   Generate:
   - Summary (3-5 sentences)
   - Signals (3-5 bullet points, what's happening)
   - Moves (2-3 actionable steps, what to do)
   ```
4. Parse JSON response
5. Write to Firestore `premium_briefs` collection
6. Set `featured: true` if `sourceTier <= 3`

**Error Handling:**
- Retry Claude API up to 2 times on timeout
- Log failures to separate Firestore collection (`pipeline_errors`)

---

### Workflow 2: LinkedIn Publishing (Planned)

**Trigger:** Manual or scheduled (daily/weekly)
**Steps:**
1. Query Firestore for `premium_briefs` where `featured: true` and not in `linked_briefs`
2. Select top brief (source diversity + recency)
3. Call Claude API (Sonnet 4.5) with LinkedIn post prompt:
   ```
   Create LinkedIn post:
   - Hook: Strong data point (1 sentence)
   - Body: 2-3 data sources synthesized (200-400 words)
   - CTA: Tactical Monday move + link to full brief
   ```
4. Publish to LinkedIn via API
5. Write to `linked_briefs` collection with `dedupeKey`
6. Update `premium_briefs` doc with `linkedinPublished: true`

---

## AI Integration Points

### 1. Claude API (Anthropic)

**Model:** `claude-sonnet-4-5-20250514` (Sonnet 4.5)
**Use Cases:**
- Content enrichment (Notion → Firestore)
- LinkedIn post generation
- Daily intelligence card normalization (with Haiku + prompt caching)

**Prompt Caching Strategy:**
- Static system prompt (editorial voice, JSON schema) → cached
- Dynamic user content → not cached
- **Result:** 95% cost reduction ($0.31/day vs $15/day)

**API Call Volume:**
- Daily intelligence: 10 calls/day (Haiku)
- Premium briefs: 1-3 calls/day (Sonnet 4.5)
- LinkedIn posts: 1-7 calls/week (Sonnet 4.5)

---

### 2. Perplexity API

**Model:** `sonar-pro` (real-time web search)
**Use Cases:**
- Daily intelligence research (4 pillar-based queries)
- HeroSearch real-time queries
- Follow-up questions in modals

**Parameters:**
- `search_recency_filter: 'day'` (for daily intelligence)
- `search_recency_filter: 'week'` (for follow-ups)
- `return_citations: true` (always)

**API Call Volume:**
- Daily intelligence: 4 calls/day (scheduled)
- HeroSearch: ~10-50 calls/day (user-initiated)
- Follow-ups: ~5-20 calls/day (user-initiated)

---

## Security & Permissions

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Premium briefs: read-only for all, write-only for admin
    match /premium_briefs/{briefId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Discover cards: read-only for all, write-only for Cloud Functions
    match /discover_cards/{cardId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Analytics events: write-only (no reads)
    match /analytics_events/{eventId} {
      allow read: if false;
      allow create: if true;
    }

    // Users: read/write own profile only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Environment Variables

**Frontend (.env):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GA4_MEASUREMENT_ID`

**Cloud Functions (Firebase config):**
- `pplx.api_key` (Perplexity)
- `anthropic.api_key` (Claude)

**n8n (Environment variables):**
- `NOTION_API_TOKEN`
- `NOTION_DATABASE_ID`
- `ANTHROPIC_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

---

## Cost Optimization Strategies

1. **Prompt Caching (Claude):** Reduces API costs by 95% for daily intelligence generation
2. **Batch Processing:** Generate 10 cards once daily instead of real-time
3. **Perplexity Model Selection:** Use `sonar-pro` (not `sonar-reasoning`) for cost/speed balance
4. **Firestore Indexes:** Optimize queries to avoid full collection scans
5. **Static Fallback Cards:** If API fails, display cached cards from previous day
6. **Deduplication:** Prevent duplicate briefs/cards to reduce storage costs

**Monthly Cost Estimate:**
- Perplexity API: ~$1-2
- Claude API: ~$0.31 (with caching)
- Firebase Functions: ~$1
- Cloud Run: ~$1
- Firebase Hosting: Free tier
- Firestore: ~$0.50 (within free tier for normal usage)
- **Total: ~$2-5/month**

---

## Future Architecture Considerations

### Phase 2 (Q2 2026)
- **Email Delivery:** SendGrid/Mailgun integration for weekly digests
- **Advanced Search:** Algolia or Firestore full-text search
- **User Personalization:** ML-based content recommendations
- **Team Workspaces:** Multi-user collaboration features

### Phase 3 (Q3 2026)
- **API Gateway:** Public API for third-party integrations
- **Webhook System:** Real-time notifications for new briefs
- **Analytics Dashboard:** Admin view of user engagement metrics
- **A/B Testing:** Optimize editorial voice and content formats

---

## Related Documentation

- [Daily Intelligence Framework](docs/DAILY_INTEL_FRAMEWORK.md)
- [Editorial Voice Guidelines](docs/EDITORIAL_VOICE.md)
- [API Usage Optimization](API-USAGE-OPTIMIZATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Last Updated:** February 12, 2026
**Maintainer:** Sav Banerjee
**Status:** Living document - evolves with project maturity
