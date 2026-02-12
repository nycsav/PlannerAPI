# n8n Workflow Integration Analysis & Architectural Decision

**Date:** January 21, 2026
**Status:** 🚨 CRITICAL DISCOVERY - n8n workflow is NOT integrated with Daily Intelligence
**Decision Authority:** CTO Review
**Launch Target:** 48-72 hours

---

## EXECUTIVE SUMMARY: THE CRITICAL DISCOVERY

**What we thought:** n8n workflow generates Daily Intelligence cards for PlannerAPI
**What we have:** n8n workflow generates **LinkedIn posts** (separate content, separate flow)

### Current State Reality Check

You have **TWO SEPARATE CONTENT SYSTEMS** running independently:

| System | Purpose | Status | Integration | Output |
|--------|---------|--------|-------------|--------|
| **Firebase Cloud Function** | Generate 10 Daily Intelligence cards | ✅ Production | Firestore | App homepage |
| **n8n Workflow** | Generate LinkedIn posts | ⚠️ Manual trigger | Gmail only | LinkedIn (with approval) |

**These systems do NOT talk to each other.**

---

## 1. TECHNICAL ANALYSIS: n8n Workflow Breakdown

### Data Flow Diagram

```
[Schedule Trigger: 8:00 daily]
        ↓
[Perplexity API: sonar-pro]
   "Give me 3 AI developments in advertising/marketing from last 24h"
        ↓
[Claude Sonnet 4.5: LLM Chain]
   "Create short LinkedIn post for Sav Banerjee"
        ↓
[Structured Output Parser]
   JSON: { briefing_items[], linkedin_post, hashtags[] }
        ↓
[Gmail: Send and Wait]
   Email to: sav@ensopartners.co
   Subject: "Approval Needed: LinkedIn Post for [date]"
   Options: APPROVE / REJECT / REGEN
        ↓
[Switch Node]
   IF approved → LinkedIn Post
   IF rejected → Stop
   IF regen → (no loop configured - dead end)
        ↓
[LinkedIn API]
   Post to Sav's LinkedIn profile
```

### Node-by-Node Configuration

#### Node 1: Schedule Trigger
```json
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "parameters": {
    "rule": {
      "interval": [{ "triggerAtHour": 8 }]
    }
  }
}
```
- **Trigger Time:** 8:00 (timezone unclear - likely UTC or local)
- **Frequency:** Daily
- **Status:** `"active": false` ⚠️ **WORKFLOW IS DISABLED**

#### Node 2: Perplexity Research
```json
{
  "type": "n8n-nodes-base.perplexity",
  "parameters": {
    "model": "sonar-pro",
    "messages": [
      {
        "role": "system",
        "content": "You are a research assistant for advertising strategists..."
      },
      {
        "content": "Give me 3 AI-related developments in advertising/marketing from the last 24 hours..."
      }
    ]
  }
}
```
- **Model:** sonar-pro (same as Firebase function)
- **Query:** 3 items (vs 10 cards in Firebase)
- **Focus:** Advertising/marketing AI news
- **Output:** Array of {title, summary, sourceUrl}

#### Node 3: Claude LLM Chain
```json
{
  "type": "@n8n/n8n-nodes-langchain.chainLlm",
  "parameters": {
    "text": "You are creating a LinkedIn post for Sav Banerjee...",
    "model": "claude-sonnet-4-5-20250929"
  }
}
```
- **Model:** Claude Sonnet 4.5 (latest)
- **Temperature:** 0.4 (creative but consistent)
- **Max Tokens:** 1,500
- **Output:** Structured LinkedIn post (200 words max)
- **Format:** Data-focused, 3 bullet points, actionable closing

#### Node 4: Structured Output Parser
```json
{
  "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
  "parameters": {
    "jsonSchemaExample": {
      "briefing_items": [...],
      "linkedin_post": "...",
      "hashtags": [...]
    }
  }
}
```
- **Output Schema:** JSON with briefing_items, linkedin_post, hashtags
- **Purpose:** Ensure consistent format for downstream nodes

#### Node 5: Gmail Approval
```json
{
  "type": "n8n-nodes-base.gmail",
  "operation": "sendAndWait",
  "parameters": {
    "sendTo": "sav@ensopartners.co",
    "subject": "Approval Needed: LinkedIn Post for [date]",
    "message": "Reply with: APPROVE / REJECT / REGEN"
  }
}
```
- **Workflow Pauses** until email reply received
- **Webhook ID:** 1a2f2c55-52aa-434b-af38-99fde0fe7f90
- **Human-in-the-loop:** Quality control before posting

#### Node 6: Switch (Routing Logic)
```json
{
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "rules": [
      {
        "conditions": [
          { "leftValue": "={{$json.data.approved}}", "operator": "true" }
        ]
      }
    ]
  }
}
```
- **Route 1:** If approved → LinkedIn Post node
- **Route 2:** If rejected → Stop workflow
- **Route 3 (missing):** "Regenerate Draft" has no loop back to Claude ⚠️

#### Node 7: LinkedIn Post
```json
{
  "type": "n8n-nodes-base.linkedIn",
  "parameters": {
    "person": "2jbIhdTlzA",
    "text": "={{$node[\"Basic LLM Chain\"].json.output.linkedin_post}}",
    "additionalFields": {}
  }
}
```
- **LinkedIn Credentials:** Configured (djMBI1Q3N0qcYglV)
- **Status:** ✅ **LINKEDIN POSTING IS FUNCTIONAL**
- **Person ID:** 2jbIhdTlzA (Sav's profile)

---

## 2. GAP ANALYSIS: n8n vs Firebase vs PRD Requirements

### What n8n Workflow Does Well ✅

1. **High-Quality Content Generation**
   - Perplexity sonar-pro for research
   - Claude Sonnet 4.5 for drafting
   - Structured output with citations

2. **Human Approval Workflow**
   - Email review before posting
   - Quality control gate
   - Simple APPROVE/REJECT interface

3. **LinkedIn Publishing**
   - Fully configured credentials
   - Direct posting capability
   - Ready to use

4. **Professional LinkedIn Format**
   - Data-focused bullets
   - Actionable insights
   - Source attribution

### Critical Gaps ❌

| Requirement | Firebase | n8n | Status |
|-------------|----------|-----|--------|
| **Generate 10 Daily Intelligence cards** | ✅ Yes | ❌ No (only 3 items) | Firebase only |
| **Store in Firestore** | ✅ Yes | ❌ No integration | Firebase only |
| **Display on homepage** | ✅ Yes | ❌ No connection | Firebase only |
| **Follow editorial framework** | ✅ Yes (DAILY_INTEL_FRAMEWORK.md) | ⚠️ Different format | Divergent |
| **LinkedIn publishing** | ❌ No | ✅ Yes (with approval) | n8n only |
| **Automated scheduling** | ✅ Yes (Cloud Scheduler) | ⚠️ Disabled | Firebase only |
| **Content validation** | ❌ No | ⚠️ Manual review | Gap in both |
| **Deduplication** | ❌ Not implemented | ❌ No | Gap in both |
| **Cost tracking** | ✅ Logged | ❌ No logging | Firebase only |

### Integration Gaps

**n8n → Firebase:**
- ❌ No HTTP nodes calling Firebase Cloud Functions
- ❌ No Firestore write operations
- ❌ No shared data model

**Firebase → n8n:**
- ❌ No webhook triggers from Firebase
- ❌ No Firestore read operations in n8n
- ❌ No content sharing

**Result:** Two content systems producing different content on different schedules for different purposes.

---

## 3. ARCHITECTURE DECISION (CTO RECOMMENDATION)

### THE DECISION: Hybrid Architecture with Phased Integration

**Why this is a critical decision:**
- You want to launch in 48-72 hours
- Daily Intelligence (Firebase) is production-ready NOW
- n8n LinkedIn workflow is separate but valuable
- Integrating them fully would delay launch by 1-2 weeks

### Recommended Architecture: "Firebase-First with n8n Publishing Layer"

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: LAUNCH (48 hours)                                  │
│                                                              │
│  Firebase Cloud Function (generateDiscoverCards)            │
│    ├─ Perplexity API (10 cards/day, 4 pillars)             │
│    ├─ Claude Sonnet 4 (JSON validation, priority scoring)   │
│    └─ Firestore (discover_cards collection)                 │
│                                                              │
│  PlannerAPI Frontend                                        │
│    ├─ Daily Intelligence section                            │
│    ├─ IntelligenceModal with signals/moves                  │
│    └─ Follow-up chat (chatSimple)                           │
│                                                              │
│  n8n Workflow                                               │
│    └─ DISABLED (not needed for launch)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: LINKEDIN AUTOMATION (Week 2)                       │
│                                                              │
│  Firebase → n8n Integration                                 │
│    ├─ New Cloud Function: selectTopCardForLinkedIn()        │
│    ├─ Triggered daily at 8:00 AM ET                         │
│    ├─ Reads top card from Firestore (priority > 85)         │
│    ├─ Calls n8n webhook with card data                      │
│    └─ n8n receives, formats, sends approval email            │
│                                                              │
│  Modified n8n Workflow                                      │
│    ├─ Remove Perplexity node (use Firebase data)            │
│    ├─ Add Webhook Trigger node                              │
│    ├─ Reformat card → LinkedIn post                         │
│    ├─ Email approval (keep existing)                        │
│    └─ Post to LinkedIn (keep existing)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: PRODUCTION HARDENING (Week 3)                      │
│                                                              │
│  Content Validation Layer                                   │
│    ├─ validateDiscoverCard() function                       │
│    ├─ Deduplication checks                                  │
│    ├─ Editorial voice compliance                            │
│    └─ Reject low-quality cards                              │
│                                                              │
│  Monitoring & Analytics                                     │
│    ├─ Daily content report email                            │
│    ├─ LinkedIn engagement tracking                          │
│    └─ Cost monitoring dashboard                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. LAUNCH ROADMAP: 48-HOUR MVP PLAN

### Phase 1: Launch Daily Intelligence (Next 48 Hours)

**Goal:** Get Daily Intelligence cards live on production site with high confidence in content quality.

**Critical Path:**

#### Hour 0-8: Content Validation System
**Priority:** CRITICAL (prevents bad content from going live)

**Tasks:**
- [ ] Create `validateDiscoverCard.ts` utility
- [ ] Integrate into `generateDiscoverCards.ts` BEFORE Firestore writes
- [ ] Add `rejected_cards` Firestore collection for tracking
- [ ] Log rejection reasons to Cloud Functions logs

**Code:**
```typescript
// functions/src/utils/validateDiscoverCard.ts
import { DiscoverCard } from './types';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
}

export function validateDiscoverCard(card: DiscoverCard): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // CRITICAL CHECKS (must pass or reject)
  if (!card.title || card.title.length === 0) {
    issues.push('Title is missing');
    score -= 50;
  }

  if (card.title && card.title.length > 80) {
    issues.push(`Title too long (${card.title.length} chars, max 80)`);
    score -= 20;
  }

  if (!card.summary || card.summary.length < 50) {
    issues.push('Summary too short (min 50 chars)');
    score -= 30;
  }

  if (!card.signals || card.signals.length < 2) {
    issues.push('Need at least 2 signals');
    score -= 25;
  }

  if (!card.moves || card.moves.length < 2) {
    issues.push('Need at least 2 moves');
    score -= 25;
  }

  // Check first move starts with "Your next move:"
  if (card.moves && card.moves.length > 0) {
    if (!card.moves[0].startsWith('Your next move:')) {
      issues.push('First move must start with "Your next move:"');
      score -= 15;
    }
  }

  // PROHIBITED LANGUAGE (from EDITORIAL_VOICE.md)
  const hypeWords = [
    'revolutionary',
    'game-changing',
    'paradigm shift',
    'disrupting',
    'transformative'
  ];

  const textToCheck = (card.title + ' ' + card.summary).toLowerCase();
  hypeWords.forEach(word => {
    if (textToCheck.includes(word)) {
      issues.push(`Contains prohibited hype word: "${word}"`);
      score -= 10;
    }
  });

  // QUALITY CHECKS (warnings, not rejections)

  // Check for metrics in signals
  const hasMetrics = card.signals.some(s => /\d+%|\$\d+[BMK]?|\d+x/i.test(s));
  if (!hasMetrics) {
    warnings.push('Signals should include specific metrics (%, $, x)');
    score -= 5;
  }

  // Check source tier vs priority consistency
  if (card.sourceTier > 2 && card.priority > 85) {
    warnings.push(`High priority (${card.priority}) card should use Tier 1-2 source (currently Tier ${card.sourceTier})`);
    score -= 5;
  }

  // Check for vague recommendations
  const vagueTerms = ['consider', 'maybe', 'perhaps', 'might want to'];
  const movesText = card.moves.join(' ').toLowerCase();
  vagueTerms.forEach(term => {
    if (movesText.includes(term)) {
      warnings.push(`Moves should be direct, not vague (found "${term}")`);
      score -= 3;
    }
  });

  // Check for source attribution
  if (!card.source || card.source.length === 0) {
    issues.push('Source name is required');
    score -= 20;
  }

  if (!card.sourceTier || card.sourceTier < 1 || card.sourceTier > 5) {
    issues.push('Source tier must be 1-5');
    score -= 15;
  }

  return {
    isValid: issues.length === 0 && score >= 50,
    score: Math.max(0, score),
    issues,
    warnings
  };
}
```

**Integration into generateDiscoverCards.ts:**
```typescript
import { validateDiscoverCard } from './utils/validateDiscoverCard';

// Inside generateAllCards() function, before writing to Firestore:
const allCards: DiscoverCard[] = [];
const rejectedCards: any[] = [];

for (const pillar of PILLARS) {
  const cards = await generateCardsForPillar(pillar);

  for (const card of cards) {
    const validation = validateDiscoverCard(card);

    if (validation.isValid) {
      allCards.push(card);
      console.log(`✅ Card validated: "${card.title}" (score: ${validation.score})`);

      if (validation.warnings.length > 0) {
        console.warn(`⚠️ Warnings for "${card.title}":`, validation.warnings);
      }
    } else {
      console.error(`❌ Card REJECTED: "${card.title}" (score: ${validation.score})`);
      console.error('Issues:', validation.issues);

      rejectedCards.push({
        card,
        validation,
        rejectedAt: admin.firestore.Timestamp.now(),
        pillar: pillar.id
      });
    }
  }
}

// Write rejected cards to separate collection for review
if (rejectedCards.length > 0) {
  const rejectedRef = admin.firestore().collection('rejected_cards');
  for (const rejected of rejectedCards) {
    await rejectedRef.add(rejected);
  }
  console.log(`📊 Rejected ${rejectedCards.length} cards (saved for review)`);
}

// Only write valid cards to discover_cards
console.log(`📊 Publishing ${allCards.length} valid cards`);
```

#### Hour 8-16: Quick Visualizations
**Priority:** HIGH (increases engagement, builds trust)

**Tasks:**
- [ ] Extract metrics from signals array
- [ ] Create MetricCard component (already exists, enhance it)
- [ ] Add SourceBadge component
- [ ] Integrate into IntelligenceModal

**Code:**
```typescript
// utils/extractMetrics.ts - ENHANCE EXISTING
export function extractMetrics(text: string): Array<{
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}> {
  const metrics: Array<{ value: string; label: string; trend?: 'up' | 'down' | 'neutral' }> = [];

  // Pattern 1: Percentage (e.g., "23% increase", "15% of CMOs")
  const percentRegex = /(\d+(?:\.\d+)?%)\s+([^.,]+)/g;
  let match;

  while ((match = percentRegex.exec(text)) !== null) {
    const value = match[1];
    const label = match[2].substring(0, 40).trim();

    // Detect trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (/increase|growth|gain|up|higher/i.test(label)) trend = 'up';
    if (/decrease|decline|drop|down|lower/i.test(label)) trend = 'down';

    metrics.push({ value, label, trend });
  }

  // Pattern 2: Dollar amounts (e.g., "$4.2B market", "$480M wasted")
  const dollarRegex = /(\$\d+(?:\.\d+)?[BMK]?)\s+([^.,]+)/gi;

  while ((match = dollarRegex.exec(text)) !== null) {
    metrics.push({
      value: match[1],
      label: match[2].substring(0, 40).trim()
    });
  }

  // Pattern 3: Multipliers (e.g., "2.8x higher conversion")
  const multiplierRegex = /(\d+(?:\.\d+)?x)\s+([^.,]+)/gi;

  while ((match = multiplierRegex.exec(text)) !== null) {
    metrics.push({
      value: match[1],
      label: match[2].substring(0, 40).trim()
    });
  }

  return metrics.slice(0, 4); // Max 4 metrics
}
```

```typescript
// components/SourceBadge.tsx - NEW COMPONENT
import React from 'react';
import { Shield } from 'lucide-react';

interface SourceBadgeProps {
  tier: number;
  source: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ tier, source }) => {
  const config = {
    1: {
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      label: 'Premier Research',
      icon: '⭐'
    },
    2: {
      color: 'bg-blue-50 text-blue-900 border-blue-200',
      label: 'Platform Data',
      icon: '🔵'
    },
    3: {
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      label: 'Trade Publication',
      icon: '📰'
    },
    4: {
      color: 'bg-orange-50 text-orange-900 border-orange-200',
      label: 'Benchmark Data',
      icon: '📊'
    },
    5: {
      color: 'bg-gray-50 text-gray-900 border-gray-200',
      label: 'Ecosystem Intel',
      icon: '🌐'
    }
  };

  const { color, label, icon } = config[tier as keyof typeof config] || config[5];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border ${color}`}>
      <span className="text-sm">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        <span className="text-xs opacity-80">{source}</span>
      </div>
    </div>
  );
};
```

**Integration in IntelligenceModal.tsx:**
```typescript
// Add to imports
import { SourceBadge } from './SourceBadge';
import { extractMetrics } from '../utils/extractMetrics';

// In the modal body, after "YOUR QUERY" section:
{/* Source credibility badge */}
{payload.source && payload.sourceTier && (
  <div className="mb-6">
    <SourceBadge tier={payload.sourceTier} source={payload.source} />
  </div>
)}

// After SUMMARY section, add metrics visualization:
{(() => {
  const metrics = extractMetrics(payload.summary + ' ' + payload.signals.join(' '));

  if (metrics.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-bureau-signal" />
        <h2 className="font-display text-xl font-black text-planner-navy uppercase tracking-tight">
          Key Metrics
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-bureau-surface border-2 border-bureau-border rounded-sm p-4">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-display font-black text-bureau-signal">
                {metric.value}
              </div>
              {metric.trend && (
                <div className={`text-sm ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </div>
              )}
            </div>
            <div className="text-xs text-bureau-slate mt-2 leading-tight">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
})()}
```

#### Hour 16-24: Testing & Content Audit
**Priority:** CRITICAL (launch blocker)

**Tasks:**
- [ ] Run manual trigger of `generateDiscoverCards` Cloud Function
- [ ] Review all generated cards in Firestore
- [ ] Check validation logs for rejections
- [ ] Verify no prohibited language slipped through
- [ ] Test metric extraction on all cards
- [ ] Verify source badges display correctly

**Testing Checklist:**
```bash
# 1. Manually trigger Cloud Function
gcloud scheduler jobs run firebase-schedule-generateDiscoverCards-us-central1 \
  --location=us-central1 \
  --project=plannerapi-prod

# 2. Check function logs (wait 2-3 minutes for completion)
firebase functions:log --only generateDiscoverCards --lines 100

# Expected output:
# ✅ Card validated: "[title]" (score: 95)
# ⚠️ Warnings for "[title]": [...]
# ❌ Card REJECTED: "[title]" (score: 45)
# 📊 Rejected 2 cards (saved for review)
# 📊 Publishing 8 valid cards

# 3. Check Firestore for cards
# Visit: https://console.firebase.google.com/project/plannerapi-prod/firestore/data/discover_cards
# Verify:
# - 8-10 cards present
# - All have title, summary, signals, moves
# - No prohibited language
# - sourceTier and source populated

# 4. Check rejected cards
# Visit: https://console.firebase.google.com/project/plannerapi-prod/firestore/data/rejected_cards
# Review why cards were rejected
# If needed, adjust validation rules

# 5. Test on local dev
npm run dev
# Visit http://localhost:3000
# Check Daily Intelligence section
# Click each card → verify:
#   - Metrics display correctly
#   - Source badge shows
#   - Signals and moves render properly
```

#### Hour 24-32: Deploy & Smoke Test
**Priority:** CRITICAL

**Tasks:**
- [ ] Build frontend
- [ ] Deploy to Firebase Hosting
- [ ] Smoke test on production
- [ ] Verify no console errors
- [ ] Test mobile responsiveness

**Deployment:**
```bash
# Build
cd /Users/savbanerjee/Projects/PlannerAPI-clean
npm run build

# Expected output: No errors, bundle ~770KB

# Deploy frontend
firebase deploy --only hosting

# Expected output:
# ✔  Deploy complete!
# Hosting URL: https://plannerapi-prod.web.app

# Smoke test
open https://plannerapi-prod.web.app

# Verify:
# 1. Daily Intelligence section loads
# 2. Cards display with source badges
# 3. Click card → modal opens
# 4. Metrics section displays
# 5. Follow-up chat works
# 6. No console errors
```

#### Hour 32-40: Soft Launch to Beta
**Priority:** MEDIUM

**Tasks:**
- [ ] Send email to 5-10 beta testers
- [ ] Ask for specific feedback on Daily Intelligence
- [ ] Track initial engagement (manual observation)

**Beta Email Template:**
```
Subject: PlannerAPI Daily Intelligence - Beta Access

Hi [Name],

PlannerAPI's Daily Intelligence is now live. I'd love your feedback.

What to test:
1. Visit https://plannerapi-prod.web.app
2. Scroll to "Daily Intelligence" section
3. Click any card to see full brief
4. Try the follow-up chat

Feedback questions:
- Are the insights actionable for you?
- Is the data credible (check source badges)?
- Would you check this daily?
- Any cards feel generic or off-topic?

Reply by Friday with thoughts. Thank you!

- Sav
```

#### Hour 40-48: Buffer for Issues
**Priority:** CRITICAL

**Reserved for:**
- Bug fixes from beta feedback
- Content quality adjustments
- Performance optimizations
- Documentation updates

---

### Phase 2: LinkedIn Automation (Week 2)

**Goal:** Integrate Firebase-generated cards with n8n LinkedIn publishing.

#### Day 1-2: Firebase → n8n Integration

**Task 1: Create selectTopCardForLinkedIn Cloud Function**
```typescript
// functions/src/selectTopCardForLinkedIn.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DiscoverCard } from './types';

export const selectTopCardForLinkedIn = functions
  .pubsub.schedule('0 8 * * *') // 8:00 AM ET daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('[LinkedIn] Selecting top card for LinkedIn post...');

    // Query top card from yesterday's generation
    const cardsRef = admin.firestore().collection('discover_cards');
    const yesterday = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const snapshot = await cardsRef
      .where('publishedAt', '>=', yesterday)
      .orderBy('publishedAt', 'desc')
      .orderBy('priority', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error('[LinkedIn] No cards found from yesterday');
      return null;
    }

    const topCard = snapshot.docs[0].data() as DiscoverCard;
    console.log(`[LinkedIn] Selected card: "${topCard.title}" (priority: ${topCard.priority})`);

    // Call n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('[LinkedIn] N8N_WEBHOOK_URL not configured');
      return null;
    }

    const payload = {
      title: topCard.title,
      summary: topCard.summary,
      signals: topCard.signals,
      moves: topCard.moves,
      source: topCard.source,
      sourceUrl: topCard.sourceUrl,
      pillar: topCard.pillar,
      priority: topCard.priority,
      publishedAt: topCard.publishedAt.toDate().toISOString()
    };

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('[LinkedIn] Card sent to n8n successfully');
      } else {
        console.error('[LinkedIn] n8n webhook error:', response.status);
      }
    } catch (error) {
      console.error('[LinkedIn] Error calling n8n:', error);
    }

    return null;
  });
```

**Task 2: Modify n8n Workflow**

**Changes needed:**
1. **Remove Perplexity node** (data comes from Firebase)
2. **Replace Schedule Trigger with Webhook Trigger**
3. **Add data transformation node** (Firebase format → LinkedIn format)
4. **Keep approval + LinkedIn posting nodes**

**New workflow structure:**
```
[Webhook Trigger]
  ↓ (receives Firebase card data)
[Function Node: Transform Data]
  ↓ (convert signals/moves → LinkedIn post format)
[Basic LLM Chain] (Claude formats into LinkedIn-optimized post)
  ↓
[Gmail: Send and Wait] (approval email)
  ↓
[Switch] (route based on approval)
  ↓
[LinkedIn: Create Post]
```

**Webhook node configuration:**
```json
{
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "firebase-card",
    "responseMode": "responseNode",
    "httpMethod": "POST"
  }
}
```

**Function node to transform Firebase data:**
```javascript
// Function Node: "Transform Firebase Card to LinkedIn Format"
const card = $input.item.json;

const linkedInPrompt = `Here is a Daily Intelligence card from PlannerAPI:

**Title:** ${card.title}
**Summary:** ${card.summary}

**Signals:**
${card.signals.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Moves for Leaders:**
${card.moves.map((m, i) => `${i + 1}. ${m}`).join('\n')}

**Source:** ${card.source}
**Pillar:** ${card.pillar}

---

Create a LinkedIn post (200 words max) that:
1. Opens with the most surprising signal or stat
2. Includes 3 bullet points with data
3. Ends with "Your next move: [actionable insight]"
4. Mentions the source
5. No hashtags

Match this tone: analytical, direct, operator-focused.`;

return {
  json: {
    cardTitle: card.title,
    linkedInPrompt: linkedInPrompt,
    originalCard: card
  }
};
```

#### Day 3-4: Testing & Monitoring

**Test Plan:**
1. Manually trigger `selectTopCardForLinkedIn` function
2. Verify n8n webhook receives data
3. Check email approval sent correctly
4. Reply APPROVE → verify LinkedIn post
5. Monitor for 48 hours

**Monitoring setup:**
```bash
# Check Cloud Function logs
firebase functions:log --only selectTopCardForLinkedIn --lines 50

# Check n8n execution logs
# Visit n8n dashboard → Executions tab

# Track LinkedIn engagement
# Check post analytics after 24/48 hours
```

---

### Phase 3: Production Hardening (Week 3)

**Focus:** Reliability, monitoring, analytics

**Tasks:**
- [ ] Daily content report email (SendGrid)
- [ ] Cost monitoring dashboard
- [ ] Error alerting (Cloud Monitoring)
- [ ] Weekly content audit process
- [ ] Admin dashboard for content review

**Implementation:**
```typescript
// functions/src/sendDailyContentReport.ts
export const sendDailyContentReport = functions
  .pubsub.schedule('30 6 * * *') // 6:30 AM ET (30 min after generation)
  .timeZone('America/New_York')
  .onRun(async () => {
    // Fetch today's cards
    const cardsSnapshot = await getCardsFromToday();
    const rejectedSnapshot = await getRejectedCardsFromToday();

    // Build email report
    const report = {
      published: cardsSnapshot.size,
      rejected: rejectedSnapshot.size,
      topCards: cardsSnapshot.docs.slice(0, 3).map(doc => ({
        title: doc.data().title,
        priority: doc.data().priority,
        source: doc.data().source
      })),
      rejectionReasons: rejectedSnapshot.docs.map(doc => ({
        title: doc.data().card.title,
        issues: doc.data().validation.issues
      }))
    };

    // Send via SendGrid
    await sendEmail({
      to: 'sav@ensopartners.co',
      subject: `Daily Intelligence Report - ${new Date().toLocaleDateString()}`,
      html: buildReportHTML(report)
    });
  });
```

---

## 5. COST ANALYSIS

### Current Costs (Firebase Only)

**Daily Intelligence Generation:**
- Perplexity API: 10 calls/day × $0.005/call = **$0.05/day**
- Claude Sonnet 4: ~20K tokens/day (prompt caching) = **$0.01/day**
- **Daily total: $0.06/day**
- **Monthly total: ~$2/month**

### With n8n LinkedIn Automation (Phase 2)

**LinkedIn Post Generation:**
- Perplexity: $0 (using Firebase data, no new calls)
- Claude Sonnet 4.5: 1 call/day × 1,500 tokens = **$0.003/day**
- Gmail API: Free
- LinkedIn API: Free
- **Additional daily cost: $0.003/day**
- **Additional monthly cost: ~$0.10/month**

### With Production Hardening (Phase 3)

**Monitoring & Reporting:**
- SendGrid: Free tier (100 emails/day)
- Cloud Monitoring: Free tier (sufficient for our use)
- Cloud Logging: Free tier (50GB/month)
- **Additional cost: $0/month**

### Total Cost at Scale

**Monthly total: ~$2.10/month**

**Cost per card: $0.07**

**Comparison to manual content creation:**
- Manual research: ~30 min/card × 10 cards = 5 hours/day
- At $100/hour = $500/day = **$15,000/month**
- **Automation saves: $14,997.90/month (99.986% reduction)**

---

## 6. RISK ANALYSIS & MITIGATIONS

### Risk 1: Bad Content Goes Live
**Probability:** Medium (without validation)
**Impact:** HIGH (damages credibility)
**Mitigation:** Phase 1 validation system (Hour 0-8)
**Fallback:** Manual review of rejected_cards collection daily

### Risk 2: LinkedIn Posting Fails
**Probability:** Low (n8n is tested)
**Impact:** Medium (content still on site, just not amplified)
**Mitigation:** Phase 2 monitoring + email alerts
**Fallback:** Manual posting from approved cards

### Risk 3: API Cost Overrun
**Probability:** Very Low
**Impact:** Low ($2/month → $20/month worst case)
**Mitigation:** Usage logging + daily cost reports
**Fallback:** Reduce generation frequency (daily → 3x/week)

### Risk 4: Content Quality Drift
**Probability:** Medium (over weeks/months)
**Impact:** Medium (slowly damages brand)
**Mitigation:** Weekly content audits + skill system enforcement
**Fallback:** Pause generation, retune prompts, re-launch

### Risk 5: Firebase → n8n Integration Breaks
**Probability:** Low (webhook is simple)
**Impact:** Medium (no LinkedIn posting)
**Mitigation:** Error handling + retry logic
**Fallback:** Manual LinkedIn posting workflow

---

## 7. SUCCESS METRICS

### Phase 1 Success Criteria (Launch)
- ✅ 8-10 cards published daily
- ✅ <10% rejection rate
- ✅ No prohibited language in published cards
- ✅ Source badges display correctly
- ✅ Metrics extraction works on 80%+ of cards
- ✅ Zero console errors on production
- ✅ Page load time <2 seconds

### Phase 2 Success Criteria (LinkedIn)
- ✅ 1 LinkedIn post per day (7 days/week)
- ✅ Approval workflow <5 min response time
- ✅ 90%+ approval rate (most drafts are good)
- ✅ LinkedIn engagement: 10+ likes, 2+ comments per post
- ✅ 5+ clicks back to PlannerAPI per post

### Phase 3 Success Criteria (Production)
- ✅ Daily content report delivered by 6:30 AM ET
- ✅ Cost stays under $5/month
- ✅ Zero unhandled errors in Cloud Functions
- ✅ Weekly content audit completed every Friday
- ✅ 95%+ content quality score (validated cards)

---

## THE PLAN (FINAL DECISION)

### What to Build in Next 48 Hours

**Hour 0-24: Validation + Visualizations**
1. Create `validateDiscoverCard.ts` utility
2. Integrate into `generateDiscoverCards.ts`
3. Add `SourceBadge` component
4. Enhance `extractMetrics` function
5. Integrate into `IntelligenceModal`

**Hour 24-48: Testing + Deploy**
1. Manual trigger Cloud Function → review output
2. Check rejected_cards collection
3. Test all visualizations on local dev
4. Build + deploy to production
5. Soft launch to 5-10 beta testers

**What NOT to Do:**
- ❌ Don't modify n8n workflow yet (Phase 2)
- ❌ Don't build admin dashboard (Phase 3)
- ❌ Don't build email reporting (Phase 3)
- ❌ Don't integrate LinkedIn automation (Phase 2)

**Why:**
- Daily Intelligence (Firebase) is production-ready NOW
- Adding validation + viz = 48 hours
- n8n integration can wait until Week 2
- Focus on launching high-quality Daily Intelligence first

### What to Build in Week 2

**Firebase → n8n Integration**
1. Create `selectTopCardForLinkedIn` Cloud Function
2. Modify n8n workflow (remove Perplexity, add Webhook)
3. Test integration end-to-end
4. Monitor for 3 days before trusting it

### What to Build Later

**Week 3+:**
- Daily content report email
- Admin dashboard for content review
- Cost monitoring dashboard
- Advanced visualizations (comparison charts, sparklines)
- Data Pulse cards (top podcasts, top ads)

---

## IMMEDIATE NEXT STEPS (RIGHT NOW)

**As CTO, here's your exact task list for the next 4 hours:**

1. **Create validation utility** (90 min)
   - File: `functions/src/utils/validateDiscoverCard.ts`
   - Copy code from Hour 0-8 section above
   - Test with sample card data

2. **Integrate validation** (60 min)
   - Modify: `functions/src/generateDiscoverCards.ts`
   - Add validation before Firestore writes
   - Add rejected_cards collection writes

3. **Deploy backend** (30 min)
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions:generateDiscoverCards
   ```

4. **Test manually** (60 min)
   - Trigger Cloud Function
   - Review logs
   - Check Firestore for cards + rejections
   - Verify quality improvements

**After 4 hours, you'll have:**
- ✅ Content validation preventing bad cards
- ✅ Rejection tracking for quality monitoring
- ✅ Production-ready Daily Intelligence system

**Then move to Hour 8-16: Quick Visualizations**

---

**DO THIS NOW. Everything else waits.**

---

## APPENDIX: n8n Workflow Webhook Configuration (Phase 2)

**For reference when implementing Phase 2:**

**Webhook URL format:**
```
https://[your-n8n-instance].app.n8n.cloud/webhook/firebase-card
```

**Expected payload from Firebase:**
```json
{
  "title": "The 94% Problem: McKinsey Finds Most Marketers Lack AI Maturity",
  "summary": "McKinsey's 2026 survey shows only 6% of marketing orgs...",
  "signals": [
    "6% of marketing orgs at AI maturity",
    "22% efficiency gains for AI-mature teams",
    "40% of commercial queries now show AI Overviews"
  ],
  "moves": [
    "Your next move: Audit your top 25 commercial search queries...",
    "Build an AI readiness scorecard...",
    "Run a 30-day pilot tracking CTR changes..."
  ],
  "source": "McKinsey & Company",
  "sourceUrl": "https://www.mckinsey.com/...",
  "sourceTier": 1,
  "pillar": "ai_strategy",
  "priority": 90,
  "publishedAt": "2026-01-22T06:00:00.000Z"
}
```

**n8n workflow modifications needed:**
- Remove: "Message a model" (Perplexity) node
- Remove: "Schedule Trigger" node
- Add: "Webhook" node (receives Firebase data)
- Add: "Function" node (transforms to LinkedIn format)
- Keep: "Basic LLM Chain", "Gmail", "Switch", "LinkedIn" nodes

---

**END OF ANALYSIS**

**Next Action:** Start Hour 0 tasks (validation system). Report back when validation is deployed and tested.
