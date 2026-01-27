# Agentic Research Guide - Perplexity AI Content Structure

**Date:** January 25, 2026  
**Purpose:** Guide for generating digestible, actionable, and insightful research content using Perplexity AI for agentic deployments  
**Status:** ✅ Production Ready

---

## 1. Overview

This guide analyzes Perplexity AI's content structure and output patterns to help agents generate better research content that is:

- **Digestible:** Clear hierarchy, scannable format, concise language
- **Actionable:** Specific moves, concrete steps, role-targeted implications
- **Insightful:** Data-driven, source-backed, strategic depth
- **Credible:** Proper citations, tier-based sourcing, quantifiable claims

---

## 2. Perplexity Content Structure Analysis

### 2.1 Hierarchical Organization

**Pattern Observed:**
```
1. Main Topic Heading (Numbered)
   ├─ Sub-topic (Bolded bullet point)
   │  ├─ Detailed explanation (1-2 paragraphs)
   │  ├─ Specific data points (metrics, percentages)
   │  └─ Inline citations (@source-name)
   │
   └─ Sub-topic (Bolded bullet point)
      ├─ Detailed explanation
      └─ Implications section
```

**Example Structure:**
```
1) AI and ML breakthroughs
   • Agentic AI moves from hype to default architecture
     [Detailed explanation with 57% stat, 16% cross-functional stat]
     @2026-State-of-AI-Agents-etcjournal
   
   • Real-time inference and long-context models as the new baseline
     [Nvidia-Groq deal, DeepSeek V4 context windows]
     @etcjournal +1
```

**Key Principles:**
- Use numbered main sections (1, 2, 3) for major themes
- Bold sub-topics as mini-headlines for scannability
- Keep explanations to 1-2 paragraphs per sub-topic
- Embed citations inline, not at the end

---

### 2.2 Content Segmentation

**Three-Layer Architecture:**

1. **Context Layer** (Introduction)
   - Time frame: "Here's a synthesized briefing for the week of Jan 19-25, 2026"
   - Audience lens: "with a lens on what matters for advertising / CX / AI-product pro"
   - Purpose statement: "organized by your three lenses and translated into implications for strategy"

2. **Intelligence Layer** (Main Content)
   - Numbered sections by theme
   - Bolded sub-topics with detailed explanations
   - Data points embedded naturally
   - Inline source citations

3. **Action Layer** (Implications & Moves)
   - "Implications for you" section
   - "How to turn this week's signals into concrete moves"
   - Numbered practical tracks (30-60 day timelines)
   - Specific, executable actions

---

### 2.3 Citation Patterns

**Inline Citation Format:**
- Format: `@source-name` or `@source-name +N` (for multiple sources)
- Placement: Immediately after the claim or paragraph
- Style: Grey rounded rectangles with paperclip icon
- Examples:
  - `@OpenAI-Enterprise-Report`
  - `@2026-State-of-AI-Agents-etcjournal`
  - `@etcjournal +1`
  - `@ppl-ai-file-upload.s3.ama +2`

**Citation Best Practices:**
- Cite immediately after the claim, not at the end
- Use publication names (etcjournal, aiforum) for readability
- Include "+N" when multiple sources support the claim
- Prioritize Tier 1-2 sources (McKinsey, Gartner, Google) when available

---

## 3. Content Generation Framework

### 3.1 Prompt Structure for Agents

**Template:**
```
Analyze [TIME_FRAME]'s most significant [DOMAIN] developments, focusing on:
1) [THEME_1]
2) [THEME_2]
3) [THEME_3]

Target audience: [AUDIENCE_ROLE]
Output format: Strategic briefing with implications and concrete moves
```

**Example:**
```
Analyze this week's most significant technology developments, focusing on:
1) AI and ML breakthroughs
2) Major tech company strategic moves
3) Emerging tech trends and their potential impact on advertising strategy professionals

Target audience: advertising / CX / AI-product professionals
Output format: Strategic briefing with implications and concrete moves
```

---

### 3.2 Content Generation Rules

#### Rule 1: Start with Context
- **Time frame:** Always specify the period (week, month, quarter)
- **Audience:** Explicitly name the target role
- **Purpose:** State what the content will deliver

**Example:**
> "Here's a synthesized briefing for the week of Jan 19-25, 2026, with a lens on what matters for advertising / CX / AI-product pro, organized by your three lenses and translated into implications for strategy."

#### Rule 2: Use Numbered Main Sections
- Number major themes (1, 2, 3)
- Each section covers one strategic theme
- Keep to 3-5 main sections maximum

#### Rule 3: Bold Sub-Topics as Headlines
- Each sub-topic is a bolded bullet point
- Acts as a mini-headline for scannability
- Should be specific and tension-framed when possible

**Good Sub-Topic Examples:**
- "Agentic AI moves from hype to default architecture"
- "Real-time inference and long-context models as the new baseline"
- "Enterprise-grade applied AI patterns solidify"

**Bad Sub-Topic Examples:**
- "AI developments" (too vague)
- "Recent changes" (not specific)
- "Things to know" (not actionable)

#### Rule 4: Embed Data Points Naturally
- Include specific metrics in the first sentence when possible
- Use percentages, dollar amounts, timeframes
- Quantify claims: "57% of orgs" not "many orgs"

**Example:**
> "57% of organizations now run AI agents for multi-stage workflows, and 16% already use cross-functional agents. 80% say agents are delivering measurable economic ROI today."

#### Rule 5: Include Implications Section
- Always end with "Implications for you" or similar
- Frame as direct advice to the target audience
- Connect insights to specific roles and decisions

**Example:**
> "Expect your clients to ask for 'real-time, in-flow' AI (shopping, support, analytics) rather than standalone chatbots. Agent design (tools, context, guardrails) is now a core capability, not a side experiment."

#### Rule 6: Provide Concrete Moves
- Structure as "How to turn this week's signals into concrete moves"
- Use numbered practical tracks (1, 2, 3)
- Include timelines (30-60 days, next quarter)
- Make actions specific and executable

**Example:**
> "1. Build a reference 'marketing agent stack' you can sell
>    - One research/reporting agent that ingests Reddit, search data, and client analytics to generate weekly opportunity reports and creative briefs.
>    - One predictive performance agent that scores creative pre-launch, proposes budget splits across 5–7 platforms, and monitors waste in-flight."

---

## 4. Alignment with PlannerAPI Framework

### 4.1 Mapping to Daily Intelligence Framework

| Perplexity Pattern | PlannerAPI Equivalent | Notes |
|-------------------|----------------------|-------|
| Numbered main sections | Content Pillars | Map to ai_strategy, brand_performance, etc. |
| Bolded sub-topics | Title (tension-framed) | Use PlannerAPI tension patterns |
| Detailed explanation | Summary (macro + micro) | Combine context + signal |
| Data points | Signals array | Extract specific metrics |
| Implications | Moves for Leaders | First move starts with "Your next move:" |
| Inline citations | Sources array | Map to sourceTier system |

### 4.2 Editorial Voice Alignment

**PlannerAPI Voice Requirements:**
- ✅ **Analytical:** "The data suggests…" → Perplexity provides data-driven insights
- ✅ **Pragmatic:** "Here's your next move:" → Perplexity includes concrete moves
- ✅ **Concise:** 2-3 sentences max → Perplexity keeps explanations brief
- ✅ **Direct:** "This hurts mid-market agencies most" → Perplexity names specific roles
- ✅ **Credible:** Cite source + specific stat → Perplexity uses inline citations

**Voice Patterns to Apply:**
- Use tension patterns in sub-topic headlines: "The [X]% Problem", "Two Camps Are Emerging"
- Frame implications as: "What this means for [ROLE] is…"
- Start moves with: "Your next move:", "Start here:", "The 3-step audit:"

---

## 5. Content Structure Template

### 5.1 Full Briefing Template

```markdown
# [Title: Time Frame + Audience Lens]

Here's a synthesized briefing for [TIME_FRAME], with a lens on what matters for [AUDIENCE_ROLE], organized by [ORGANIZATIONAL_STRUCTURE] and translated into implications for strategy.

## 1) [THEME_1]

**• [Sub-topic 1 - Bolded Headline]**
[1-2 paragraph explanation with specific data points]
@source-name

**• [Sub-topic 2 - Bolded Headline]**
[1-2 paragraph explanation with specific data points]
@source-name +1

## 2) [THEME_2]

**• [Sub-topic 1 - Bolded Headline]**
[Explanation with metrics]
@source-name

## 3) [THEME_3]

**• [Sub-topic 1 - Bolded Headline]**
[Explanation with metrics]
@source-name

---

## Implications for you

- [Implication 1 - Direct advice for target audience]
- [Implication 2 - Role-specific insight]
- [Implication 3 - Strategic consideration]
@source-name

---

## How to turn this week's signals into concrete moves (for you)

Given your focus ([AUDIENCE_CONTEXT]), here are [NUMBER] practical tracks to work on in the next [TIMEFRAME]:

1. **[Move Track 1 Title]**
   - [Specific action 1 with details]
   - [Specific action 2 with details]
   - [Specific action 3 with details]
   @source-name +N

2. **[Move Track 2 Title]**
   - [Specific action 1]
   - [Specific action 2]
   @source-name

3. **[Move Track 3 Title]**
   - [Specific action 1]
   - [Specific action 2]
   @source-name
```

---

## 6. Best Practices for Agentic Research

### 6.1 Research Depth

**Tier-Based Sourcing:**
- **Tier 1-2 (60% minimum):** McKinsey, Gartner, Google, OpenAI, Anthropic
- **Tier 3:** Ad Age, Digiday, Marketing Week (for practical sentiment)
- **Tier 4-5:** Data providers, AI-native publications (for early signals)

**Recency Requirements:**
- Use `search_recency_filter: 'day'` for real-time data
- Prioritize developments from last 24-48 hours
- Balance recency with credibility (prefer Tier 1-2 even if slightly older)

### 6.2 Data Extraction

**Required Elements:**
- Specific percentages: "57% of organizations"
- Dollar amounts: "$20B acquisition", "$8.9B misallocated budget"
- Timeframes: "30-60 days", "Q1 2026", "8 months payback"
- Comparative metrics: "2.8x higher", "340% YoY", "3.1x ROI"

**Extraction Patterns:**
- Look for: "X% of", "$X", "Xx higher/lower", "X% YoY", "X months"
- Validate: Ensure numbers are from cited sources
- Context: Always include what the metric measures

### 6.3 Implication Framing

**Role-Specific Language:**
- CMO: "Board presentation", "Budget allocation", "Competitive positioning"
- Agency Owner: "Client delivery", "Service positioning", "Tool stack"
- Brand Lead: "Campaign ROI", "Media optimization", "Attribution"
- CX Leader: "Customer journey", "Touchpoint design", "Experience metrics"

**Implication Patterns:**
- "Expect [AUDIENCE] to [ACTION]"
- "This means [ROLE] will need to [ACTION]"
- "For [ROLE], the risk/opportunity is [SPECIFIC]"
- "This puts pressure on [SPECIFIC_TEAM] to [ACTION]"

### 6.4 Action Specificity

**Action Requirements:**
- **Verb:** Specific action verb (Build, Audit, Launch, Test, Reallocate)
- **What:** Clear object (agent stack, budget split, creative pipeline)
- **Target:** Quantifiable goal (10-15% budget, $5-10M, 3-5x ROAS)
- **Timeline:** When (30 days, Q1 2026, Days 1-30)
- **Tools/Vendors:** Specific platforms when relevant (Shopify, Reddit, CRM)
- **Outcome:** Expected result (weekly reports, waste reduction, efficiency gains)

**Action Template:**
```
[Action Verb] [What] [Target] [Timeline] [Tools] [Outcome]
```

**Example:**
> "Build one research/reporting agent that ingests Reddit, search data, and client analytics to generate weekly opportunity reports and creative briefs."

---

## 7. Integration with Backend Prompts

### 7.1 System Prompt Enhancement

**Current System Prompt Structure:**
```typescript
const systemPrompt = `You are an elite strategic intelligence analyst...

**AUDIENCE CONTEXT:**
Role: ${audienceProfile.role}
Primary Focus: ${audienceProfile.focus}
...

**CONTENT GENERATION RULES:**
1. SIGNALS (2-5 key insights)
2. IMPLICATIONS (2-4 points)
3. ACTIONS (3-4 highly specific moves)
4. FRAMEWORKS (2-3 relevant strategic frameworks)
`;
```

**Enhanced with Perplexity Patterns:**
```typescript
const systemPrompt = `You are an elite strategic intelligence analyst...

**CONTENT STRUCTURE (Perplexity-Inspired):**
1. Start with time frame and audience lens
2. Use numbered main sections (1, 2, 3) for themes
3. Bold sub-topics as mini-headlines
4. Embed data points naturally (percentages, dollar amounts)
5. Include inline citations (@source-name format)
6. End with "Implications for you" section
7. Provide "Concrete moves" with numbered tracks (30-60 day timelines)

**CITATION FORMAT:**
- Use inline citations: @source-name or @source-name +N
- Place immediately after claims
- Prioritize Tier 1-2 sources (McKinsey, Gartner, Google)

**DATA REQUIREMENTS:**
- Every claim must include specific metrics
- Use percentages: "57% of organizations"
- Use dollar amounts: "$20B acquisition"
- Use timeframes: "30-60 days", "Q1 2026"
- Use comparisons: "2.8x higher", "340% YoY"

**IMPLICATION FRAMING:**
- Start with "Expect [AUDIENCE] to [ACTION]"
- Connect to specific roles and decisions
- Use role-specific language from AUDIENCE_CONTEXT

**ACTION SPECIFICITY:**
- Format: [Action Verb] [What] [Target] [Timeline] [Tools] [Outcome]
- Include quantifiable targets and timelines
- Make immediately executable (no "consider" or "explore")
`;
```

### 7.2 Response Parsing

**Current Parsing:**
- Extracts signals, implications, actions from markdown
- Maps to `PlannerChatResponse` structure

**Enhanced Parsing for Perplexity Structure:**
```typescript
function parsePerplexityStructuredResponse(content: string, citations: string[]): PlannerChatResponse {
  // Extract numbered main sections
  const mainSections = content.match(/##\s*(\d+\))\s*(.+)/g);
  
  // Extract bolded sub-topics
  const subTopics = content.match(/\*\*(.+?)\*\*/g);
  
  // Extract inline citations
  const inlineCitations = content.match(/@([\w-]+)(?:\s+\+(\d+))?/g);
  
  // Extract implications section
  const implicationsMatch = content.match(/##\s*Implications for you\s*\n([\s\S]+?)(?=##|$)/);
  
  // Extract concrete moves section
  const movesMatch = content.match(/##\s*How to turn.*?concrete moves[\s\S]+?(\d+\.\s*\*\*.+?)[\s\S]+?(?=##|$)/);
  
  // Map to PlannerChatResponse structure
  return {
    signals: extractSignals(subTopics, citations),
    implications: extractImplications(implicationsMatch),
    actions: extractActions(movesMatch),
    frameworks: extractFrameworks(content),
    citations: citations
  };
}
```

---

## 8. Quality Checklist

### 8.1 Content Quality

- [ ] Time frame specified (week, month, quarter)
- [ ] Target audience explicitly named
- [ ] Numbered main sections (3-5 maximum)
- [ ] Bolded sub-topics as mini-headlines
- [ ] Each sub-topic has 1-2 paragraph explanation
- [ ] Data points embedded naturally (percentages, dollars, timeframes)
- [ ] Inline citations after each claim (@source-name format)
- [ ] "Implications for you" section included
- [ ] "Concrete moves" section with numbered tracks
- [ ] Actions include: verb, what, target, timeline, tools, outcome

### 8.2 Data Quality

- [ ] At least 60% of sources are Tier 1-2 (McKinsey, Gartner, Google)
- [ ] All claims include specific metrics
- [ ] Percentages, dollar amounts, timeframes included
- [ ] Comparative metrics used (Xx higher, X% YoY)
- [ ] Data points are from cited sources

### 8.3 Actionability

- [ ] Implications framed for specific roles
- [ ] Moves include quantifiable targets
- [ ] Timelines specified (30-60 days, Q1 2026)
- [ ] Tools/vendors named when relevant
- [ ] Expected outcomes described
- [ ] No vague recommendations ("consider evaluating")

### 8.4 Editorial Voice

- [ ] Tension patterns used in sub-topic headlines
- [ ] Role-specific language from audience context
- [ ] Direct, confident tone (no disclaimers)
- [ ] Concise (2-3 sentences per insight)
- [ ] Credible (source + stat in claims)

---

## 9. Examples

### 9.1 Good Example

```markdown
# Synthesized Briefing: Week of Jan 19-25, 2026

Here's a synthesized briefing for the week of Jan 19-25, 2026, with a lens on what matters for advertising / CX / AI-product professionals, organized by three strategic lenses and translated into implications for strategy.

## 1) AI and ML breakthroughs

**• Agentic AI moves from hype to default architecture**

Agentic systems (AI that plans, tools and acts autonomously) are now treated as "infrastructure," not experiments. 57% of organizations already deploy agents for multi-stage workflows, and 16% have them running cross-functional processes. 80% say agents are delivering measurable economic ROI today.

For you, this means client expectations will shift from "chatbot" POCs to durable, KPI-tied agent workflows (research, reporting, campaign ops) that you'll be expected to design and govern.

@2026-State-of-AI-Agents-etcjournal

**• Real-time inference and long-context models as the new baseline**

The Nvidia-Groq deal ($20B) focuses on low-latency inference IP for real-time applications like streaming agents, robotics, and interactive assistants. Newer models such as DeepSeek's upcoming V4 feature extremely long coding and context windows.

Practically, this makes "always-on" brand copilots and high-context CX agents (pulling months of interactions, purchase history, and creative tests) technically and economically more viable.

@etcjournal +1

---

## Implications for you

- Expect your clients to ask for "real-time, in-flow" AI (shopping, support, analytics) rather than standalone chatbots.
- Agent design (tools, context, guardrails) is now a core capability, not a side experiment, especially for research, reporting, data analysis, and campaign ops where enterprises report the biggest non-coding impact.
- High-context CX agents become technically viable, enabling personalized experiences that pull from months of customer history.

@2026-State-of-AI-Agents-etcjournal

---

## How to turn this week's signals into concrete moves (for you)

Given your focus (AI products, advertising, CX, SEO/AEO, analytics), here are three practical tracks to work on in the next 30–60 days:

1. **Build a reference 'marketing agent stack' you can sell**
   - One research/reporting agent that ingests Reddit, search data, and client analytics to generate weekly opportunity reports and creative briefs.
   - One predictive performance agent that scores creative pre-launch, proposes budget splits across 5–7 platforms, and monitors waste in-flight.
   - One CX agent pattern (web chat + email + FAQ) tuned per vertical (retail, SaaS, fintech), integrated with CRM and analytics.
   @ppl-ai-file-upload.s3.ama +2

2. **Productize 'frontier worker' enablement for clients**
   - Package a 4–6 week program to move marketing and CX teams from basic AI use to advanced, multi-task usage, using the enterprise benchmarks as your proof that intensity and diversity of AI tasks correlate with outsized productivity.
   - Include playbooks for AI-assisted coding (for analytics and internal tools), creative pipelines, and campaign analysis.
   @ppl-ai-file-upload.s3.ama +1

3. **Lean into cross-channel, predictive creative analytics as your differentiation**
   - Use the Smartly-style insights (fluid journeys, predictive modeling, low-waste media) as your backbone pitch: efficiency as an indicator of AI maturity.
   - Build reusable frameworks for "from funnel to flow" planning: connected KPIs across social, CTV, search, Reddit, and on-site behavior, with agents stitching together insights and recommendations.
   @Trends-Report-2026-compre
```

### 9.2 Bad Example (What to Avoid)

```markdown
# AI News This Week

AI is transforming everything. Many companies are using AI agents now. This is important for marketing professionals.

## AI Developments

- AI agents are becoming popular
- Companies are investing in AI
- This affects marketing

## What to Do

- Consider using AI
- Think about how AI can help
- Explore AI opportunities
```

**Problems:**
- ❌ No time frame
- ❌ No specific audience
- ❌ Vague claims ("many companies", "popular")
- ❌ No data points
- ❌ No citations
- ❌ No specific implications
- ❌ Vague actions ("consider", "think about", "explore")

---

## 10. Related/Follow-up Questions Section

### 10.1 Perplexity "Related" Pattern

**Structure:**
- Section title: "**Related**" (bolded)
- 5-7 follow-up questions
- Each question preceded by a curved arrow icon (→)
- Questions are specific, technical, and based on real-time contexts
- Clickable to generate new intelligence briefs

**Example:**
```
Related
→ What is Groq's LPU architecture and why did Nvidia acquire it for $20B
→ How does DeepSeek V4 improve coding AI compared to GPT and Claude
→ Details on Boston Dynamics Atlas robot deployment at Hyundai factory
→ NVIDIA'S CES 2026 announcements on physical AI and robot chips
→ Predictions for open-source AI models in 2026 breaking Big Tech dominance
```

### 10.2 Follow-up Question Generation Rules

**Real-Time Context Extraction:**
1. **Entity Extraction:** Identify companies, technologies, products mentioned
   - Companies: "Nvidia", "Groq", "DeepSeek", "Boston Dynamics"
   - Technologies: "LPU architecture", "V4", "Atlas robot"
   - Events: "CES 2026", "acquisition", "deployment"

2. **Metric Extraction:** Identify specific numbers and transactions
   - "$20B acquisition", "57% of organizations", "340% YoY"

3. **Temporal Signals:** Identify recent developments
   - "CES 2026", "this week", "latest", "upcoming"

**Question Generation Patterns:**
- **Architecture/Technology:** "What is [TECHNOLOGY] and [CONTEXT]"
- **Comparison:** "How does [A] compare to [B] in [CONTEXT]"
- **Details:** "Details on [SPECIFIC_ENTITY] [ACTION]"
- **Announcements:** "[COMPANY]'s [EVENT] announcements on [TOPIC]"
- **Predictions:** "Predictions for [TREND] in [TIMEFRAME]"

**Requirements:**
- Questions must reference specific entities from the brief
- Questions must be based on real-time contexts (last 24-48 hours)
- Questions must be useful for deeper exploration
- Questions must be technical and specific (not generic)
- Maximum 5-7 questions per brief

### 10.3 Implementation

**Backend Enhancement:**
```typescript
function generateRelatedQuestions(
  content: string,
  signals: Signal[],
  citations: string[]
): string[] {
  // Extract entities (companies, technologies, products)
  const entities = extractEntities(content);
  
  // Extract metrics and transactions
  const metrics = extractMetrics(content);
  
  // Extract temporal signals (events, dates)
  const temporalSignals = extractTemporalSignals(content);
  
  // Generate questions based on extracted context
  const questions: string[] = [];
  
  // Architecture/Technology questions
  entities.technologies.forEach(tech => {
    if (temporalSignals.includes(tech)) {
      questions.push(`What is ${tech} and ${getContextForTech(tech, content)}`);
    }
  });
  
  // Comparison questions
  if (entities.companies.length >= 2) {
    questions.push(`How does ${entities.companies[0]} compare to ${entities.companies[1]} in ${getContext(content)}`);
  }
  
  // Details questions
  entities.companies.forEach(company => {
    if (metrics.transactions.includes(company)) {
      questions.push(`Details on ${company} ${getActionForCompany(company, content)}`);
    }
  });
  
  // Event-based questions
  temporalSignals.events.forEach(event => {
    questions.push(`${getCompanyForEvent(event)}'s ${event} announcements on ${getTopicForEvent(event, content)}`);
  });
  
  // Prediction questions
  if (temporalSignals.includes('trend')) {
    questions.push(`Predictions for ${getTrendFromContent(content)} in ${getTimeframe(content)}`);
  }
  
  return questions.slice(0, 7); // Max 7 questions
}
```

**Frontend Display:**
```tsx
{relatedQuestions && relatedQuestions.length > 0 && (
  <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-8">
    <h3 className="font-display text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">
      Related
    </h3>
    <div className="space-y-3">
      {relatedQuestions.map((question, index) => (
        <button
          key={index}
          onClick={() => handleRelatedQuestionClick(question)}
          className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-gray-200/60 dark:border-slate-700/50 hover:border-bureau-signal dark:hover:border-planner-orange hover:bg-blue-50 dark:hover:bg-slate-700/80 transition-all duration-200 group"
        >
          <span className="text-bureau-signal dark:text-planner-orange mt-0.5">→</span>
          <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-bureau-signal dark:group-hover:text-planner-orange">
            {question}
          </span>
        </button>
      ))}
    </div>
  </div>
)}
```

---

## 11. Integration Points

### 10.1 Backend Integration

**File:** `backend-integration/chat-intel-endpoint.ts`

**Enhancement:**
- Update `systemPrompt` to include Perplexity structure patterns
- Add parsing logic for numbered sections and bolded sub-topics
- Extract inline citations in `@source-name` format
- Map to existing `PlannerChatResponse` structure

### 10.2 Frontend Display

**File:** `components/IntelligenceModal.tsx`

**Enhancement:**
- Support rendering of numbered main sections
- Display bolded sub-topics as section headers
- Show inline citations as badges/pills
- Render "Implications" and "Concrete Moves" sections prominently

### 10.3 Daily Intelligence Cards

**File:** `functions/src/generateDiscoverCards.ts`

**Enhancement:**
- Use Perplexity structure for card generation
- Extract sub-topics as card titles
- Map implications to "Moves for Leaders"
- Include inline citations in sources array

---

## 13. Testing & Validation

### 13.1 Content Quality Tests

**The "So What?" Test:**
- Can a CMO act on this in 10 seconds?
- Is there one clear, operator-ready action?

**The "Citation Test":**
- Can this insight be quoted in a board presentation?
- Are sources credible and specific?

**The "Differentiation Test":**
- Would this appear in a generic AI news aggregator?
- Is it clearly tailored to marketing/brand/media decisions?

### 11.2 Structure Validation

- [ ] Numbered main sections present (1, 2, 3)
- [ ] Bolded sub-topics as mini-headlines
- [ ] Inline citations in @source-name format
- [ ] "Implications for you" section included
- [ ] "Concrete moves" section with numbered tracks
- [ ] Time frame and audience specified

### 13.3 Data Validation

- [ ] At least 60% Tier 1-2 sources
- [ ] All claims include specific metrics
- [ ] Percentages, dollars, timeframes present
- [ ] Comparative metrics used
- [ ] Data points from cited sources

---

## 14. Future Enhancements

### 14.1 Advanced Features

- **Multi-source synthesis:** Combine insights from multiple Perplexity queries
- **Temporal tracking:** Compare signals across weeks/months
- **Competitive analysis:** Extract competitive intelligence patterns
- **Predictive insights:** Use historical patterns to predict trends

### 14.2 Automation

- **Scheduled briefings:** Auto-generate weekly/monthly briefings
- **Topic clustering:** Group related signals automatically
- **Citation validation:** Verify source URLs and credibility
- **Content deduplication:** Prevent duplicate insights

---

## 15. References

**Related Documentation:**
- `docs/DAILY_INTEL_FRAMEWORK.md` - Content architecture and schema
- `docs/EDITORIAL_VOICE.md` - Voice, tone, and framing rules
- `backend-integration/chat-intel-endpoint.ts` - Backend implementation
- `CLAUDE.md` - Project instructions and guidelines

**Perplexity API:**
- Model: `sonar-pro` (real-time web access)
- Parameters: `search_recency_filter: 'day'`, `return_citations: true`
- Temperature: 0.2-0.3 (for consistency)
- Max tokens: 1500-2000 (for comprehensive briefings)

---

**End of AGENTIC-RESEARCH-GUIDE.md**

*This guide ensures all agentic research content generated from Perplexity AI follows a consistent, digestible, and actionable structure that aligns with PlannerAPI's editorial voice and content framework.*
