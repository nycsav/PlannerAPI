# Analytics Architecture for PlannerAPI

## Overview

Track content performance across Daily Intelligence cards, Strategy Chat queries, and LinkedIn posts to understand what resonates with marketing leaders.

---

## 1. Events to Track

### Card Engagement Events

| Event | Description | Properties |
|-------|-------------|------------|
| `card_impression` | Card appeared in viewport | cardId, pillar, position, source (featured/slider) |
| `card_click` | User clicked to open modal | cardId, pillar, type, priority |
| `card_read` | User spent 5+ seconds on modal | cardId, readTimeMs, scrollDepth |
| `card_signal_click` | User clicked a signal bullet | cardId, signalIndex, signalText |
| `card_move_click` | User clicked an action item | cardId, moveIndex, moveText |
| `card_share` | User shared card (future) | cardId, shareMethod |
| `card_save` | User bookmarked card (future) | cardId |
| `card_follow_up` | User asked follow-up question | cardId, followUpType |

### Search & Chat Events

| Event | Description | Properties |
|-------|-------------|------------|
| `search_query` | User submitted search | query, queryLength, source (hero/chat) |
| `search_result_click` | User clicked search result | query, resultIndex |
| `chat_message_sent` | User sent chat message | messageLength, isFollowUp |
| `chat_response_rating` | User rated response (future) | rating, responseId |
| `category_click` | User clicked category pill | category, source (hero/filter) |

### Session Events

| Event | Description | Properties |
|-------|-------------|------------|
| `session_start` | User started session | userId, isReturning, referrer |
| `pillar_filter_change` | User changed pillar filter | pillar, previousPillar |
| `scroll_depth` | User scrolled page | depth (25/50/75/100), section |

---

## 2. Firestore Analytics Collections

### Collection: `analytics_events`

```typescript
interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;           // null for anonymous
  sessionId: string;
  timestamp: Timestamp;
  properties: {
    cardId?: string;
    pillar?: string;
    query?: string;
    // ... event-specific properties
  };
  context: {
    userAgent: string;
    viewport: { width: number; height: number };
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}
```

### Collection: `card_metrics` (Aggregated Daily)

```typescript
interface CardMetrics {
  cardId: string;
  date: string;              // "2026-01-22"
  impressions: number;
  clicks: number;
  uniqueClicks: number;
  avgReadTimeMs: number;
  avgScrollDepth: number;
  followUps: number;
  signalClicks: number[];    // clicks per signal index
  moveClicks: number[];      // clicks per move index
  ctr: number;               // clicks / impressions
  engagementScore: number;   // weighted composite
}
```

### Collection: `content_performance` (Weekly Rollup)

```typescript
interface ContentPerformance {
  weekOf: string;            // "2026-01-20"
  pillar: string;
  topCards: Array<{
    cardId: string;
    title: string;
    engagementScore: number;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  avgEngagementByType: {
    brief: number;
    hot_take: number;
    datapulse: number;
  };
  topSignals: string[];      // most-clicked signal texts
  topMoves: string[];        // most-clicked move texts
  topQueries: string[];      // most common search queries
}
```

---

## 3. Frontend Tracking Implementation

### Analytics Hook: `useAnalytics.ts`

```typescript
import { useCallback, useRef } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { v4 as uuidv4 } from 'uuid';

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('papi_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('papi_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const sessionId = useRef(getSessionId());

  const track = useCallback(async (
    eventName: string,
    properties: Record<string, any> = {}
  ) => {
    try {
      // Send to Firestore
      await addDoc(collection(db, 'analytics_events'), {
        eventName,
        sessionId: sessionId.current,
        userId: null, // TODO: Add auth user ID
        timestamp: Timestamp.now(),
        properties,
        context: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          referrer: document.referrer,
          url: window.location.href,
        },
      });

      // Also send to GA4 if configured
      if (window.gtag) {
        window.gtag('event', eventName, properties);
      }
    } catch (error) {
      console.error('Analytics track error:', error);
    }
  }, []);

  // Convenience methods
  const trackCardImpression = (cardId: string, pillar: string, position: number) => {
    track('card_impression', { cardId, pillar, position });
  };

  const trackCardClick = (cardId: string, pillar: string, type: string) => {
    track('card_click', { cardId, pillar, type });
  };

  const trackCardRead = (cardId: string, readTimeMs: number, scrollDepth: number) => {
    track('card_read', { cardId, readTimeMs, scrollDepth });
  };

  const trackSearch = (query: string, source: 'hero' | 'chat') => {
    track('search_query', { query, queryLength: query.length, source });
  };

  return {
    track,
    trackCardImpression,
    trackCardClick,
    trackCardRead,
    trackSearch,
  };
};
```

### Impression Tracking with IntersectionObserver

```typescript
// In ContentSliderCard.tsx
import { useEffect, useRef } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export const ContentSliderCard = ({ card, index }) => {
  const { trackCardImpression } = useAnalytics();
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpression.current) {
          trackCardImpression(card.id, card.pillar, index);
          hasTrackedImpression.current = true;
        }
      },
      { threshold: 0.5 } // 50% visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [card.id, card.pillar, index]);

  return <div ref={cardRef}>...</div>;
};
```

---

## 4. GA4 Integration

### Setup

1. Create GA4 property in Google Analytics
2. Add gtag.js to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

3. Configure custom dimensions in GA4:
   - `card_pillar` (text)
   - `card_type` (text)
   - `user_role` (text) - for logged-in users
   - `subscription_tier` (text)

### Custom Events in GA4

Map Firestore events to GA4 recommended events where possible:

| Firestore Event | GA4 Event | Notes |
|-----------------|-----------|-------|
| `card_click` | `select_content` | content_type: 'intelligence_card' |
| `search_query` | `search` | search_term: query |
| `card_share` | `share` | method, content_type |
| `card_save` | `add_to_wishlist` | Repurpose for bookmarks |

---

## 5. Backend Aggregation (Cloud Functions)

### Daily Metrics Aggregation

```typescript
// functions/src/aggregateCardMetrics.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const aggregateCardMetrics = functions
  .pubsub.schedule('0 0 * * *') // Midnight daily
  .timeZone('America/New_York')
  .onRun(async () => {
    const db = admin.firestore();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Query yesterday's events
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(dateStr);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const eventsSnap = await db.collection('analytics_events')
      .where('timestamp', '>=', startOfDay)
      .where('timestamp', '<', endOfDay)
      .get();

    // Group by cardId
    const cardStats: Map<string, any> = new Map();

    eventsSnap.docs.forEach(doc => {
      const event = doc.data();
      const cardId = event.properties?.cardId;
      if (!cardId) return;

      if (!cardStats.has(cardId)) {
        cardStats.set(cardId, {
          impressions: 0,
          clicks: 0,
          uniqueSessions: new Set(),
          readTimes: [],
          scrollDepths: [],
          signalClicks: [0, 0, 0],
          moveClicks: [0, 0, 0],
          followUps: 0,
        });
      }

      const stats = cardStats.get(cardId);

      switch (event.eventName) {
        case 'card_impression':
          stats.impressions++;
          break;
        case 'card_click':
          stats.clicks++;
          stats.uniqueSessions.add(event.sessionId);
          break;
        case 'card_read':
          stats.readTimes.push(event.properties.readTimeMs);
          stats.scrollDepths.push(event.properties.scrollDepth);
          break;
        case 'card_signal_click':
          stats.signalClicks[event.properties.signalIndex]++;
          break;
        case 'card_move_click':
          stats.moveClicks[event.properties.moveIndex]++;
          break;
        case 'card_follow_up':
          stats.followUps++;
          break;
      }
    });

    // Write aggregated metrics
    const batch = db.batch();

    cardStats.forEach((stats, cardId) => {
      const avgReadTime = stats.readTimes.length > 0
        ? stats.readTimes.reduce((a, b) => a + b, 0) / stats.readTimes.length
        : 0;
      const avgScrollDepth = stats.scrollDepths.length > 0
        ? stats.scrollDepths.reduce((a, b) => a + b, 0) / stats.scrollDepths.length
        : 0;
      const ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;

      // Engagement score: weighted composite
      const engagementScore = (
        (ctr * 40) +
        (Math.min(avgReadTime / 30000, 1) * 30) + // Cap at 30s
        (avgScrollDepth * 20) +
        (stats.followUps * 10)
      );

      const docRef = db.collection('card_metrics').doc(`${cardId}_${dateStr}`);
      batch.set(docRef, {
        cardId,
        date: dateStr,
        impressions: stats.impressions,
        clicks: stats.clicks,
        uniqueClicks: stats.uniqueSessions.size,
        avgReadTimeMs: avgReadTime,
        avgScrollDepth,
        followUps: stats.followUps,
        signalClicks: stats.signalClicks,
        moveClicks: stats.moveClicks,
        ctr,
        engagementScore,
      });
    });

    await batch.commit();
    console.log(`Aggregated metrics for ${cardStats.size} cards on ${dateStr}`);
  });
```

---

## 6. AI-Powered Analytics

### Option A: Claude-Powered Weekly Digest

Create a Cloud Function that runs weekly to analyze content performance:

```typescript
// functions/src/generateAnalyticsDigest.ts
export const generateAnalyticsDigest = functions
  .pubsub.schedule('0 8 * * 1') // Monday 8am
  .timeZone('America/New_York')
  .onRun(async () => {
    // 1. Fetch last 7 days of card_metrics
    const metricsSnap = await db.collection('card_metrics')
      .where('date', '>=', sevenDaysAgo)
      .get();

    // 2. Fetch the actual cards for context
    const cardIds = [...new Set(metricsSnap.docs.map(d => d.data().cardId))];
    const cards = await Promise.all(cardIds.map(id =>
      db.collection('discover_cards').doc(id).get()
    ));

    // 3. Build prompt for Claude
    const prompt = `Analyze this week's Daily Intelligence performance data and provide insights:

## Performance Data
${JSON.stringify(metricsData, null, 2)}

## Card Content
${JSON.stringify(cardContent, null, 2)}

Please provide:
1. **Top Performing Content:** Which 3 cards performed best and why?
2. **Content Patterns:** What topics, framing, or signals drove engagement?
3. **Underperforming Content:** Which cards underperformed and hypotheses why?
4. **Pillar Analysis:** Which pillar is resonating most with users?
5. **Recommendations:** 3 specific recommendations for next week's content strategy.

Format as a concise executive brief.`;

    // 4. Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    // 5. Store digest
    await db.collection('analytics_digests').add({
      weekOf: mondayDate,
      digest: response.content[0].text,
      generatedAt: Timestamp.now(),
    });

    // 6. Optionally send via email or Slack
  });
```

### Option B: Real-Time Content Optimization Suggestions

When generating new cards, use historical performance to guide content:

```typescript
// In generateDiscoverCards.ts, add to system prompt:
const topPerformingPatterns = await getTopPerformingPatterns();

const ENHANCED_SYSTEM_PROMPT = `
${CACHED_SYSTEM_PROMPT.text}

## Historical Performance Data
Based on last 30 days of engagement data:

**High-Performing Title Patterns:**
${topPerformingPatterns.titlePatterns.join('\n')}

**Most-Clicked Signals (users want specific metrics on):**
${topPerformingPatterns.topSignalTopics.join('\n')}

**Most-Actioned Moves (users find these actionable):**
${topPerformingPatterns.topMovePatterns.join('\n')}

**Underperforming Patterns to Avoid:**
${topPerformingPatterns.lowPerformingPatterns.join('\n')}

Use these insights to optimize content for engagement.
`;
```

### Option C: Anomaly Detection & Alerts

```typescript
// Detect unusual engagement patterns
export const detectEngagementAnomalies = functions
  .pubsub.schedule('0 9 * * *')
  .onRun(async () => {
    const todayMetrics = await getTodayMetrics();
    const avgMetrics = await get30DayAverages();

    const anomalies = [];

    // Check for viral content (3x average engagement)
    todayMetrics.forEach(metric => {
      if (metric.engagementScore > avgMetrics.avgEngagement * 3) {
        anomalies.push({
          type: 'viral_content',
          cardId: metric.cardId,
          score: metric.engagementScore,
          message: `Card "${metric.title}" is performing 3x above average`,
        });
      }
    });

    // Check for pillar engagement shifts
    const pillarEngagement = calculatePillarEngagement(todayMetrics);
    Object.entries(pillarEngagement).forEach(([pillar, engagement]) => {
      const avgPillarEngagement = avgMetrics.pillarAverages[pillar];
      if (engagement > avgPillarEngagement * 1.5) {
        anomalies.push({
          type: 'pillar_surge',
          pillar,
          message: `${pillar} engagement up 50%+ - consider more content`,
        });
      }
    });

    // Send alerts (Slack, email, or store for dashboard)
    if (anomalies.length > 0) {
      await sendAnomalyAlerts(anomalies);
    }
  });
```

---

## 7. Analytics Dashboard (Future)

### Key Metrics to Display

**Overview:**
- Total impressions (daily/weekly/monthly)
- Total clicks
- Overall CTR
- Avg engagement score
- Active users

**Content Performance:**
- Top 10 cards by engagement score
- Bottom 10 cards (for content learning)
- Performance by pillar (bar chart)
- Performance by card type (brief vs hot_take)
- Engagement trend over time (line chart)

**User Behavior:**
- Most common search queries
- Pillar filter usage distribution
- Time-of-day engagement patterns
- Session duration distribution

**AI Insights:**
- Weekly digest summary
- Content recommendations
- Anomaly alerts

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `useAnalytics` hook
- [ ] Add event tracking to key components
- [ ] Set up Firestore collections
- [ ] Deploy aggregation Cloud Function

### Phase 2: GA4 Integration (Week 2)
- [ ] Set up GA4 property
- [ ] Configure custom dimensions
- [ ] Map events to GA4
- [ ] Create basic GA4 reports

### Phase 3: AI Analytics (Week 3)
- [ ] Build weekly digest generator
- [ ] Add performance data to content generation
- [ ] Set up anomaly detection

### Phase 4: Dashboard (Week 4+)
- [ ] Build admin analytics page
- [ ] Create visualizations
- [ ] Add export functionality

---

## 9. Privacy & Compliance

- **Anonymous tracking:** Default for non-logged-in users
- **User consent:** Add cookie banner for GA4
- **Data retention:** Auto-delete raw events after 90 days
- **No PII in events:** Only track behavioral data
- **GDPR compliance:** Allow users to request data deletion

---

**End of ANALYTICS_ARCHITECTURE.md**
