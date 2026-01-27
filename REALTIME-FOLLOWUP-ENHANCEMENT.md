# Real-Time Follow-Up Questions Enhancement

**Date:** January 25, 2026  
**Status:** ✅ Complete  
**Purpose:** Enhanced follow-up question generation to match Perplexity's "Related" section with real-time, context-aware questions

---

## 🎯 Overview

Enhanced the follow-up question generation system to extract real-time entities, technologies, and contexts from intelligence briefs, generating questions similar to Perplexity's "Related" section that are:

- **Real-time:** Based on actual entities, technologies, and events mentioned in the brief
- **Context-aware:** Extracted from the content itself, not generic topic detection
- **Useful:** Specific, technical questions that enable deeper exploration
- **Perplexity-style:** Displayed in a "Related" section format matching Perplexity's UI

---

## 🔍 Key Enhancements

### 1. Real-Time Entity Extraction

**Extracts from Content:**
- **Companies:** Nvidia, Groq, DeepSeek, OpenAI, Anthropic, Google, Meta, Microsoft, Amazon, Apple, Boston Dynamics, Hyundai, Shopify, Walmart, Target, TikTok, Instagram, Facebook, Twitter, X, LinkedIn, Reddit, Smartly
- **Technologies:** LPU, LPU architecture, V4, Atlas robot, AI agents, agentic AI, machine learning, inference, context windows, coding AI, physical AI, robot chips, open-source AI, retail media, attribution, first-party data, zero-party data, CDP, AEO, GEO
- **Metrics:** Transactions ($20B acquisition), percentages (57%), multipliers (2.8x)
- **Temporal Signals:** Events (CES 2026, acquisition, deployment), years (2026, 2025)

### 2. Context-Aware Question Generation

**Question Types Generated:**

1. **Architecture/Technology Questions:**
   - "What is Groq's LPU architecture and why did Nvidia acquire it for $20B"
   - "How does DeepSeek V4 improve coding AI compared to GPT and Claude"
   - "Details on Boston Dynamics Atlas robot deployment at Hyundai factory"

2. **Event-Based Questions:**
   - "NVIDIA'S CES 2026 announcements on physical AI and robot chips"

3. **Trend/Prediction Questions:**
   - "Predictions for open-source AI models in 2026 breaking Big Tech dominance"

4. **Company Comparison Questions:**
   - "How does [Company1] compare to [Company2] in [Technology]"

5. **Transaction/Acquisition Questions:**
   - "What drove the [Amount] acquisition and strategic implications for the market"

### 3. Perplexity-Style "Related" Section

**UI Updates:**
- Changed from "Continue Exploring" buttons to "Related" section
- Full-width clickable questions with arrow icons (→)
- Hover states with color transitions
- Displays `displayQuery` (clean, user-friendly) instead of technical `question`
- Matches Perplexity's visual style and interaction pattern

---

## 📐 Implementation Details

### Entity Extraction Function

```typescript
const extractEntities = (text: string) => {
  const companies = [
    'Nvidia', 'NVIDIA', 'Groq', 'DeepSeek', 'OpenAI', 'Anthropic', 
    'Google', 'Meta', 'Microsoft', 'Amazon', 'Apple', 'Boston Dynamics', 
    'Hyundai', 'Shopify', 'Walmart', 'Target', 'TikTok', 'Instagram',
    'Facebook', 'Twitter', 'X', 'LinkedIn', 'Reddit', 'Smartly'
  ];
  
  const technologies = [
    'LPU', 'LPU architecture', 'V4', 'Atlas robot', 'AI agents', 
    'agentic AI', 'machine learning', 'inference', 'context windows',
    'coding AI', 'physical AI', 'robot chips', 'open-source AI',
    'retail media', 'attribution', 'first-party data', 'zero-party data'
  ];
  
  // Filter to find entities mentioned in content
  const foundCompanies = companies.filter(company => 
    text.includes(company) || lowerContent.includes(company.toLowerCase())
  );
  
  const foundTechnologies = technologies.filter(tech => 
    text.includes(tech) || lowerContent.includes(tech.toLowerCase())
  );
  
  return { companies: foundCompanies, technologies: foundTechnologies };
};
```

### Question Generation Logic

**Priority Order:**
1. **Real-time context questions** (entities, technologies, events from content)
2. **Topic-based fallback** (if not enough context-specific questions)

**Generation Rules:**
- Maximum 7 questions (matching Perplexity's "Related" section)
- Prioritize specific entities and technologies over generic topics
- Include metrics and transactions when available
- Use temporal signals (events, years) for relevance

---

## 🎨 UI/UX Updates

### Before (Old Format)
```
Continue Exploring
[Implementation Guide] [ROI Analysis] [Competitive Strategy]
```

### After (Perplexity-Style)
```
Related
→ What is Groq's LPU architecture and why did Nvidia acquire it for $20B
→ How does DeepSeek V4 improve coding AI compared to GPT and Claude
→ Details on Boston Dynamics Atlas robot deployment at Hyundai factory
→ NVIDIA'S CES 2026 announcements on physical AI and robot chips
→ Predictions for open-source AI models in 2026 breaking Big Tech dominance
```

**Visual Improvements:**
- Full-width clickable cards
- Arrow icon (→) for visual consistency
- Hover effects (border color change, background highlight)
- Better readability with larger text and spacing

---

## 📝 Files Modified

### 1. `App.tsx`
- **Enhanced `generateFollowUps` function:**
  - Added entity extraction (companies, technologies)
  - Added metric extraction (transactions, percentages, multipliers)
  - Added temporal signal extraction (events, years)
  - Real-time context-aware question generation
  - Increased from 3 to 7 questions maximum

### 2. `components/IntelligenceModal.tsx`
- **Updated "Related" section:**
  - Changed from button chips to full-width question cards
  - Added arrow icons (→)
  - Improved hover states and transitions
  - Displays `displayQuery` for better UX

### 3. `docs/AGENTIC-RESEARCH-GUIDE.md`
- **Added "Related/Follow-up Questions Section":**
  - Documented Perplexity "Related" pattern
  - Follow-up question generation rules
  - Real-time context extraction patterns
  - Implementation examples

---

## ✅ Quality Assurance

### Real-Time Context Validation
- [x] Questions reference specific entities from brief
- [x] Questions include metrics when available
- [x] Questions reference temporal signals (events, years)
- [x] Questions are technical and specific (not generic)

### UI/UX Validation
- [x] "Related" section matches Perplexity's style
- [x] Questions are clickable and generate new briefs
- [x] Hover states provide clear feedback
- [x] Display queries are user-friendly

### Content Quality
- [x] Questions enable deeper exploration
- [x] Questions are based on actual content (not assumptions)
- [x] Questions are useful for target audience
- [x] Maximum 7 questions (prevents overwhelming)

---

## 🚀 Benefits

**Before:**
- Generic topic-based questions
- Limited to 3 questions
- Button format (less scannable)
- Not based on actual content entities

**After:**
- Real-time, context-aware questions
- Up to 7 questions (more exploration)
- Perplexity-style "Related" section
- Questions reference specific entities, technologies, and events from the brief

**User Experience:**
- ✅ Questions feel relevant and specific
- ✅ Enables deeper exploration of mentioned entities
- ✅ Matches familiar Perplexity interaction pattern
- ✅ Better visual hierarchy and scannability

---

## 📚 Examples

### Example 1: AI/Technology Brief

**Content mentions:** "Nvidia acquired Groq for $20B", "DeepSeek V4", "CES 2026"

**Generated Questions:**
1. → What is Groq's LPU architecture and why did Nvidia acquire it for $20B
2. → How does DeepSeek V4 improve coding AI compared to GPT and Claude
3. → NVIDIA'S CES 2026 announcements on physical AI and robot chips

### Example 2: Competitive Brief

**Content mentions:** "Amazon Ads (38%)", "Walmart Connect (16%)", "retail media"

**Generated Questions:**
1. → How does Amazon Ads compare to Walmart Connect in retail media strategy
2. → What drove the retail media consolidation and strategic implications
3. → Predictions for retail media networks in 2026

---

## 🔄 Integration Points

**Backend:**
- Uses existing `fetchIntelligence` function
- Follow-ups generated client-side from content
- No backend changes required

**Frontend:**
- `IntelligenceModal` displays "Related" section
- Questions trigger `onFollowUp` callback
- Generates new intelligence briefs with real-time data

---

**Status:** ✅ Real-time, context-aware follow-up questions are now generated and displayed in a Perplexity-style "Related" section, enabling deeper exploration of intelligence briefs.
