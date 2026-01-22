# Moves for Leaders - Actionable Prompt Engineering Guide

**Date:** January 19, 2026
**Purpose:** Enhance backend prompts to generate realistic, actionable moves instead of generic advice

---

## Problem Statement

**Current "Moves for Leaders" are too generic:**
```
❌ "Audit current digital budget."
❌ "Build cross-functional team."
❌ "Measure & optimize."
```

These lack specificity, timelines, resources, and measurability.

**What executives need:**
```
✅ "Audit current digital budget: Reallocate 10-15% ($5-10M for mid-sized CPG) to Amazon/Walmart in 30 days, modeling 3-5x ROAS based on closed-loop attribution for $15-50M 12-month return."
```

Specific numbers, timelines, tools, ROI projections, and execution details.

---

## Enhanced System Prompt Template

**File to modify:** `/backend-integration/chat-intel-endpoint.ts`

**Current Prompt Section (Generic):**
```typescript
## MOVES FOR LEADERS
Based on the analysis above, provide 3-4 actionable recommendations for marketing leaders.
```

**Enhanced Prompt Section (Specific):**
```typescript
## MOVES FOR LEADERS
Based on the analysis above, provide 3-4 HIGHLY SPECIFIC, IMMEDIATELY ACTIONABLE recommendations for ${audience} (CMO, VP Marketing, etc.).

Each move MUST include:
1. **Specific Action Verb** - Start with: Audit, Reallocate, Launch, Build, Partner, Measure, Test, etc.
2. **Quantifiable Target** - Include specific metrics: "10-15% budget", "$5-10M", "3-5x ROAS", "30-day pilot"
3. **Timeline** - When to execute: "in 30 days", "Days 1-30", "Q1 2026", "by Q2 2026"
4. **Specific Tools/Vendors** - Name actual platforms: "Amazon/Walmart", "DSP audit", "CDP platform", "Snowflake"
5. **Expected Outcome** - Measurable result: "for $15-50M 12-month return", "20% sales lift", "4x+ ROAS"
6. **Team/Resources** - Who executes: "Assign 2-3 FTEs", "partner with 2-3 consolidating RMNs", "media buyer + analyst + data scientist"

**Format each move as:**
[Action Verb] [What] [Quantifiable Target] [When/Timeline] [How/Tools] [Expected Outcome] [Resources Needed]

**Example Good Moves:**
- "Audit current digital budget: Reallocate 10-15% ($5-10M for mid-sized CPG) to Amazon/Walmart in 30 days, modeling 3-5x ROAS based on closed-loop attribution for $15-50M 12-month return."
- "Launch 30/60/90-day pilot: Days 1-30 assess RMN platforms via DSP audit; 31-60 test $1M off-site CTV/social campaigns; 91+ scale winners with ROAS >4x, tracking vs. 17.8% market benchmark."
- "Build cross-functional team: Assign 2-3 FTEs (media buyer, analyst, data scientist) + $500K tech budget for clean rooms/APIs; partner with 2-3 consolidating RMNs for guarantees by Q2 2026."

**Example Bad Moves (DO NOT GENERATE):**
- "Consider investing in AI technology." ❌ (too vague)
- "Explore new marketing channels." ❌ (no specifics)
- "Stay competitive in the market." ❌ (not actionable)
```

---

## Audience-Specific Customization

**Different audiences need different levels of detail:**

### CMO (C-Suite)
Focus on: Strategic impact, board-level metrics, budget allocation, competitive positioning

**Example:**
"Reallocate $10-15M (10-15% of digital budget) from search/social to retail media (Amazon/Walmart) by Q2 2026, targeting 3-5x ROAS and 89% incremental reach. Present consolidated RMN strategy to board with projected $50M 12-month return and attribution measurement framework."

### VP Marketing (Operational Leader)
Focus on: Execution details, vendor management, team coordination, pilot programs

**Example:**
"Launch 60-day RMN pilot: Days 1-30 conduct DSP audit across Amazon Ads, Walmart Connect, and Target Roundel; Days 31-60 test $500K off-site campaigns with 3 vendors. Track ROAS, CTV attribution, and social layering metrics. Scale winners exceeding 4x ROAS by Day 91."

### Brand Director (Creative Leader)
Focus on: Brand safety, creative optimization, positioning strategy, measurement

**Example:**
"Prioritize scalable DSPs with off-site/CTV capabilities: Audit Amazon DSP, Walmart DSP, and Target's display network for brand safety controls. Test creative across 3 formats (video, display, social) with $300K budget. Optimize for ROAS >4x while maintaining brand guidelines and avoiding inefficiency risks."

### Growth Leader (Performance Marketer)
Focus on: Conversion metrics, channel optimization, testing strategy, attribution

**Example:**
"Test closed-loop attribution models: Run parallel campaigns on Amazon Ads ($200K) vs. Google/Meta ($200K) over 30 days. Track conversion lift, ROAS, and incremental reach using clean room data. Double down on channels exceeding 5x ROAS benchmark."

---

## Implementation Checklist

**Backend Changes (chat-intel-endpoint.ts):**

```typescript
const AUDIENCE_CONTEXT = {
  CMO: {
    focus: 'Strategic impact, board-level metrics, budget allocation, competitive positioning',
    movesTemplate: '[Strategic Action] [Budget Range] [Timeline] [Business Outcome] [Board Presentation]'
  },
  'VP Marketing': {
    focus: 'Execution details, vendor management, team coordination, pilot programs',
    movesTemplate: '[Operational Action] [Pilot Details] [Timeline] [Vendor/Tools] [Team Assignment] [Scale Criteria]'
  },
  'Brand Director': {
    focus: 'Brand safety, creative optimization, positioning strategy, measurement',
    movesTemplate: '[Creative Action] [Brand Guidelines] [Test Budget] [Format] [Safety Controls] [Optimization Metrics]'
  },
  'Growth Leader': {
    focus: 'Conversion metrics, channel optimization, testing strategy, attribution',
    movesTemplate: '[Performance Action] [Test Budget] [Attribution Model] [Conversion Lift] [Scale Criteria]'
  }
};

const systemPrompt = `
You are an executive intelligence analyst providing strategic insights for ${audience}.

Context: ${AUDIENCE_CONTEXT[audience].focus}

## MOVES FOR LEADERS
Provide 3-4 HIGHLY SPECIFIC, IMMEDIATELY ACTIONABLE recommendations.

Each move MUST follow this template:
${AUDIENCE_CONTEXT[audience].movesTemplate}

Requirements:
- Include specific numbers ($X budget, Y% allocation, Z days timeline)
- Name actual vendors/platforms (Amazon, Snowflake, DSP, etc.)
- Provide measurable outcomes (Xx ROAS, Y% lift, $Z return)
- Assign specific resources (2-3 FTEs, $XK budget, etc.)

Example format:
"[Action Verb] [What]: [Specific Details] [Timeline], [Tools/Vendors], [Expected Outcome] [Resources]."
`;
```

---

## Quality Assurance Checklist

**Before deploying, verify each "Move for Leaders" has:**

- [ ] Action verb (Audit, Reallocate, Launch, Build, Partner, Measure, Test)
- [ ] Quantifiable target ($X, Y%, Z days)
- [ ] Specific timeline (30 days, Q1 2026, Days 1-30)
- [ ] Named tools/vendors (Amazon Ads, Snowflake, CDP, etc.)
- [ ] Measurable outcome (3-5x ROAS, 20% lift, $XM return)
- [ ] Resource assignment (2-3 FTEs, $XK budget, team roles)

**Reject if:**
- [ ] Uses vague language ("consider", "explore", "think about")
- [ ] No numbers or metrics
- [ ] No timeline
- [ ] No tools/vendors named
- [ ] Not immediately executable

---

## Testing Examples

**Test Query:** "Strategic breakdown: First-Party Data Strategy: 34% LTV Increase"

**Bad Response (Generic):**
```
MOVES FOR LEADERS
• Consider implementing first-party data strategy
• Explore CDP platforms
• Focus on customer retention
• Measure results over time
```
❌ Not actionable, no specifics

**Good Response (Specific):**
```
MOVES FOR LEADERS
• Audit current data sources: Map existing customer data silos within 30 days; identify gaps in consent management, unification, and personalization. Prioritize 3 LTV-focused use cases (e.g., repeat purchase rate, cart size) for CDP implementation targeting 34% LTV increase.

• Launch 60-day CDP pilot: Select platform (Segment, mParticle, or Treasure Data) with $400K-600K budget; unify data from web, app, and CRM by Day 30; test 2-3 personalized loyalty campaigns targeting 10% LTV uplift initially. Partner with 1-2 FTEs (data engineer + marketing ops).

• Measure 34% LTV impact: Set baseline KPIs (current LTV, repeat purchase rate, cart size) by Week 1; run A/B test with first-party personalization vs. third-party targeting over 90 days. Track closed-loop attribution and scale campaigns exceeding 3.2x ROI by Q2 2026.

• Build governance framework: Establish quarterly review dashboard tracking LTV lift, consent rates, and data quality metrics. Present results to board with projected $2.1M additional revenue over 3 years and 8-12 month payback period.
```
✅ Specific, actionable, measurable, executable

---

## Deployment Instructions

1. **Update Backend Prompt:**
   - File: `/backend-integration/chat-intel-endpoint.ts`
   - Replace generic "## MOVES FOR LEADERS" prompt with enhanced version above
   - Add audience-specific templates

2. **Test With Real Queries:**
   ```bash
   curl -X POST "https://planners-backend-865025512785.us-central1.run.app/chat-intel" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Strategic breakdown: First-Party Data Strategy: 34% LTV Increase",
       "audience": "CMO"
     }'
   ```

3. **Verify Quality:**
   - Check that each move has 6 required elements
   - Ensure numbers are realistic for industry
   - Confirm actions are immediately executable

4. **Deploy to Production:**
   ```bash
   gcloud run deploy planners-backend --source .
   ```

---

## Maintenance

**Monthly Review:**
- Audit 10 random responses
- Check for generic language creeping back in
- Update vendor/tool names as market evolves
- Adjust budget ranges based on inflation/market rates

**Quarterly Updates:**
- Refresh tool/vendor names (new platforms launch)
- Update metric benchmarks (ROAS expectations change)
- Add new audience types if needed
- Review user feedback on actionability

---

## Success Metrics

**Track:**
- % of moves with all 6 required elements
- User engagement with "Moves for Leaders" section
- User feedback on actionability (survey)
- Time to implementation (user interviews)

**Target:**
- 100% of moves have all 6 elements
- 80%+ user satisfaction with actionability
- 50%+ users report implementing at least one move

---

**Questions? Need examples for specific industries?** Reference this guide when updating backend prompts.
