# MCP Apps Optimization Recommendations for PlannerAPI

**Date:** 2026-01-28  
**Source:** [MCP Apps Blog Post](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)  
**Target Audiences:** CMOs, Agency Owners, Senior Marketers, CX Leaders

---

## Executive Summary

MCP Apps enables **interactive UI components** to be embedded directly in intelligence briefs, transforming PlannerAPI from a text-based intelligence tool into an **interactive data exploration platform**. This aligns perfectly with our target audience's need for **actionable insights** and **real-time decision support**.

**Key Opportunity:** Replace static text responses with **interactive dashboards, real-time visualizations, and embedded exploration tools** that let executives explore data without leaving the conversation.

---

## Current State Analysis

### What We Have Now
- ✅ Static intelligence briefs with text summaries
- ✅ Basic charts (InsightDashboard) that are view-only
- ✅ Follow-up chat (text-based Q&A)
- ✅ PDF export
- ✅ Source citations (links)

### Gaps Identified
- ❌ **No interactive data exploration** - Users can't filter, drill down, or manipulate visualizations
- ❌ **No real-time updates** - Charts are static snapshots
- ❌ **Limited context switching** - Users must leave brief to explore sources
- ❌ **No embedded workflows** - Strategic frameworks are text-only action lists
- ❌ **No multi-step interactions** - Can't build on previous queries within the brief

---

## MCP Apps Integration Opportunities

### 1. Interactive Intelligence Briefs (High Priority)

**Current:** Static text summary + view-only charts  
**MCP Apps Enhancement:** Embedded interactive dashboard

**Implementation:**
```typescript
// Tool returns UI resource instead of just text
{
  name: "generate_intelligence_brief",
  _meta: {
    ui: {
      resourceUri: "ui://intelligence-brief/interactive"
    }
  }
}
```

**Features:**
- **Filterable metrics dashboard** - Click to filter by pillar, date range, or metric type
- **Drill-down charts** - Click a bar to see underlying signals
- **Real-time source exploration** - Click source to see full article inline
- **Comparison builder** - Select multiple signals to compare side-by-side
- **Export controls** - Choose what to include in PDF before exporting

**Target Audience Impact:**
- **CMOs:** Quick budget impact analysis without switching tools
- **Agency Owners:** Client-ready visualizations for presentations
- **CX Leaders:** Real-time customer journey data exploration

---

### 2. Real-Time Market Monitoring Dashboard (High Priority)

**Current:** Daily intelligence cards (static, refreshed once/day)  
**MCP Apps Enhancement:** Live monitoring dashboard with auto-updates

**Implementation:**
```typescript
{
  name: "monitor_market_signals",
  _meta: {
    ui: {
      resourceUri: "ui://market-monitor/live"
    }
  }
}
```

**Features:**
- **Live metric updates** - Charts refresh automatically as new data arrives
- **Alert thresholds** - Visual indicators when metrics cross critical thresholds
- **Multi-pillar view** - Toggle between AI Strategy, Brand Performance, etc.
- **Trend lines** - See 7-day/30-day trends without re-querying
- **Custom watchlists** - Track specific companies, topics, or metrics

**Target Audience Impact:**
- **CMOs:** Real-time competitive intelligence without manual refresh
- **Agency Owners:** Client dashboard showing market movements
- **Senior Marketers:** Proactive alerts for budget-impacting changes

---

### 3. Interactive Strategic Framework Builder (Medium Priority)

**Current:** Static framework tabs with text action lists  
**MCP Apps Enhancement:** Interactive framework configuration wizard

**Implementation:**
```typescript
{
  name: "build_strategic_framework",
  _meta: {
    ui: {
      resourceUri: "ui://framework-builder/wizard"
    }
  }
}
```

**Features:**
- **Multi-step wizard** - Guide users through framework selection
- **Dependent fields** - Selecting "AI Adoption" reveals AI-specific options
- **Action prioritization** - Drag-and-drop to reorder actions by priority
- **Timeline builder** - Visual timeline for action implementation
- **Resource calculator** - Estimate budget/time needed for each action
- **Export to roadmap** - Generate presentation-ready roadmap

**Target Audience Impact:**
- **CMOs:** Build Q2/Q3 roadmaps directly from intelligence
- **Agency Owners:** Create client proposals with embedded intelligence
- **CX Leaders:** Map customer journey improvements to intelligence signals

---

### 4. Embedded Source Explorer (Medium Priority)

**Current:** Source links open in new tab  
**MCP Apps Enhancement:** Inline source viewer with highlighting

**Implementation:**
```typescript
{
  name: "explore_sources",
  _meta: {
    ui: {
      resourceUri: "ui://source-explorer/inline"
    }
  }
}
```

**Features:**
- **Inline PDF/article viewer** - Read sources without leaving brief
- **Highlighted excerpts** - See exactly which parts were cited
- **Cross-reference links** - Click to see other briefs citing same source
- **Annotation tools** - Mark up sources for team sharing
- **Source credibility scoring** - Visual indicators for source quality

**Target Audience Impact:**
- **CMOs:** Verify claims before presenting to board
- **Agency Owners:** Build client trust with transparent sourcing
- **Senior Marketers:** Deep-dive into methodology without context switching

---

### 5. Interactive Comparison Tool (Low Priority)

**Current:** Static comparison bars in InsightDashboard  
**MCP Apps Enhancement:** Build-your-own comparison interface

**Implementation:**
```typescript
{
  name: "compare_signals",
  _meta: {
    ui: {
      resourceUri: "ui://comparison-builder/interactive"
    }
  }
}
```

**Features:**
- **Signal selector** - Choose which signals to compare
- **Custom grouping** - Group by company, category, or date
- **Visualization options** - Switch between bar, line, scatter plots
- **Export comparison** - Save comparison views for reports
- **Share comparison** - Generate shareable link for team

**Target Audience Impact:**
- **CMOs:** Compare vendor options side-by-side
- **Agency Owners:** Show client competitive positioning
- **CX Leaders:** Compare customer journey metrics across channels

---

## Homepage Content Enhancements

### Current Homepage Structure
1. Hero search bar
2. Daily Intelligence cards (slider)
3. Featured Intelligence (chart of the day)

### Recommended Enhancements

#### 1. Interactive Hero Section
**Current:** Static search bar with rotating placeholders  
**Enhancement:** MCP App-powered search with live suggestions

- **Live trending topics** - See what other CMOs are searching (anonymized)
- **Visual query builder** - Drag-and-drop to build complex queries
- **Recent searches** - Quick access to your last 5 searches with previews
- **Saved briefs** - Access your saved intelligence briefs from hero

**Impact:** Reduces friction for repeat users, surfaces relevant topics

#### 2. Dynamic Intelligence Feed
**Current:** Static cards refreshed daily  
**Enhancement:** Interactive feed with embedded MCP Apps

- **Live metric cards** - Cards show real-time updates (e.g., "Market cap changed +2.3%")
- **Interactive previews** - Hover to see expanded dashboard preview
- **Quick actions** - One-click to add to watchlist, share, or schedule follow-up
- **Personalized ranking** - Cards reorder based on your role/interests

**Impact:** Executives see what matters most to them, faster

#### 3. Embedded Mini-Dashboards
**Current:** Cards show single metric  
**Enhancement:** Cards embed mini interactive dashboards

- **Expandable charts** - Click card to expand inline chart
- **Multi-metric view** - See related metrics without opening full brief
- **Quick filters** - Filter by date range, category directly on card
- **Export from card** - Export just this card's data

**Impact:** Faster data exploration without modal overhead

---

## UX Flow Improvements

### Current Flow
```
Search → Brief Modal → Read → Close → Search Again
```

### Enhanced Flow with MCP Apps
```
Search → Interactive Brief (embedded) → Explore Data → Build Framework → 
Export Roadmap → Share with Team → Continue Conversation
```

**Key Improvements:**
1. **No modal context loss** - Everything happens inline
2. **Progressive disclosure** - Start simple, drill deeper as needed
3. **Persistent state** - Your exploration persists across sessions
4. **Multi-step workflows** - Build on previous queries naturally

---

## Feature Prioritization by Audience

### For CMOs (Highest Priority)
1. ✅ **Real-time market monitoring** - Budget impact alerts
2. ✅ **Interactive budget calculators** - ROI estimation tools
3. ✅ **Board-ready exports** - One-click presentation generation
4. ✅ **Competitive positioning dashboards** - See market share shifts

### For Agency Owners (High Priority)
1. ✅ **Client-ready visualizations** - White-label dashboards
2. ✅ **Proposal builder** - Embed intelligence into client proposals
3. ✅ **Multi-client comparison** - Compare client positioning
4. ✅ **Resource planning tools** - Estimate project scope from intelligence

### For Senior Marketers (Medium Priority)
1. ✅ **Campaign performance predictors** - Forecast based on market signals
2. ✅ **Channel mix optimizer** - Visual tool for budget allocation
3. ✅ **Creative trend explorer** - See what's working in market
4. ✅ **Attribution model builder** - Test different attribution scenarios

### For CX Leaders (Medium Priority)
1. ✅ **Customer journey mapper** - Visual journey with intelligence overlays
2. ✅ **Touchpoint analyzer** - See which touchpoints drive most value
3. ✅ **Personalization calculator** - ROI for personalization investments
4. ✅ **Voice of customer aggregator** - Combine intelligence with customer feedback

---

## Technical Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Install `@modelcontextprotocol/ext-apps` SDK
- [ ] Create `/api/mcp-apps` endpoint in Cloud Functions
- [ ] Build first MCP App: Interactive Intelligence Brief
- [ ] Test with Claude.ai and ChatGPT

### Phase 2: Core Features (Weeks 3-4)
- [ ] Real-time monitoring dashboard
- [ ] Interactive framework builder
- [ ] Embedded source explorer
- [ ] Update homepage to use MCP Apps

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Comparison tool
- [ ] Custom dashboard builder
- [ ] Multi-brief workspace
- [ ] Team collaboration features

### Phase 4: Polish & Scale (Weeks 7-8)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Analytics integration
- [ ] User testing with target audiences

---

## Security Considerations

Per MCP Apps spec, we need:
- ✅ **Iframe sandboxing** - All UI runs in sandboxed iframes
- ✅ **Pre-declared templates** - Review HTML before rendering
- ✅ **Auditable messages** - Log all UI-to-host communication
- ✅ **User consent** - Require approval for UI-initiated tool calls

**Our Implementation:**
- Use Firebase Hosting for UI resources (`ui://` scheme)
- Implement CSP headers for iframe security
- Log all interactions for audit trail
- Require explicit user action for sensitive operations

---

## Cost & Performance Impact

### Current Costs
- Perplexity API: ~$2-5/month
- Firebase Functions: ~$0/month (free tier)
- Firebase Hosting: ~$0/month (free tier)

### With MCP Apps
- **No additional API costs** - Uses existing Perplexity/Claude calls
- **Minimal hosting increase** - Static HTML/JS bundles (~50KB each)
- **Performance:** Iframe loading adds ~100-200ms per app
- **Bundle size:** +~30KB for MCP Apps SDK

**Estimated Total:** +$0-2/month (negligible)

---

## Success Metrics

### Engagement Metrics
- **Time in brief:** Target +40% (from 2min to 2.8min average)
- **Interactions per brief:** Target 3+ (currently ~1 click)
- **Return rate:** Target +25% (users come back to explore more)

### Business Metrics
- **Export rate:** Target +60% (from 10% to 16%)
- **Share rate:** Target +100% (from 5% to 10%)
- **Premium conversion:** Target +30% (if we add premium tier)

### User Satisfaction
- **"Helps me make decisions faster"** - Target 4.5/5
- **"More valuable than static reports"** - Target 4.7/5
- **"Would recommend to colleagues"** - Target 4.3/5

---

## Competitive Advantage

### What Makes This Unique
1. **First-mover in marketing intelligence** - No competitor has MCP Apps integration
2. **Executive-focused UX** - Built for CMOs, not developers
3. **Real-time + Interactive** - Combines live data with exploration
4. **Context-aware** - Intelligence adapts to your role and queries

### Differentiation
- **vs. Traditional BI tools:** More conversational, less technical
- **vs. News aggregators:** Actionable insights, not just headlines
- **vs. Consulting reports:** Real-time, interactive, always up-to-date
- **vs. AI chatbots:** Structured intelligence, not just Q&A

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review this document with product team
2. ✅ Prioritize features by audience needs
3. ✅ Create technical spike for MCP Apps integration
4. ✅ Design mockups for interactive briefs

### Short-Term (Next 2 Weeks)
1. Implement Phase 1 foundation
2. Build first interactive brief prototype
3. Test with 3-5 beta users
4. Gather feedback and iterate

### Long-Term (Next Quarter)
1. Roll out to all users
2. Add advanced features
3. Build marketplace of MCP Apps
4. Partner with other tools (e.g., Salesforce, HubSpot)

---

## References

- [MCP Apps Documentation](https://modelcontextprotocol.io/docs/apps)
- [MCP Apps SDK](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)
- [MCP Apps Examples](https://github.com/modelcontextprotocol/ext-apps)
- [Claude.ai MCP Feedback](https://github.com/anthropics/claude-ai-mcp)

---

*This document should be reviewed quarterly as MCP Apps ecosystem evolves.*
