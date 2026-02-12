# DISCOVER-SLIDER-UPGRADE.md

## Overview

This document specifies all content, visual, and UX changes for the **Discover More** briefing slider component. Cursor should read this file in full before making any changes, then implement tasks in order.

**Component location (probable):** `src/components/DiscoverMore.tsx` or `src/components/DailyIntelligence/BriefingSlider.tsx`

**Design inspiration:** Pencil (trypencil.com), Profound (tryprofound.com), Hex (hex.tech)

**Target audience:** CMOs, CX leaders, agency owners scanning for strategic signals

---

## Current State (Problems to Solve)

1. **Cards feel flat and template-y** — gradient backgrounds are decorative but don't convey information hierarchy or urgency.
2. **Category tags are inconsistent** — "HOT" badge is useful but visually noisy; not clear what criteria earns it.
3. **Headlines truncate awkwardly** — ellipses cut off meaning; hard to scan.
4. **Preview text is generic** — doesn't pull the reader in or hint at the "so what."
5. **Filter pills lack visual feedback** — active state is subtle; no indication of card count per filter.
6. **Navigation arrows are small and low-contrast** — easy to miss.
7. **Footer ("Live data · 12 briefings") is buried** — this is a trust signal and should be more prominent.
8. **No micro-interactions** — cards don't respond to hover; feels static.

---

## Section 1: Content Changes

### 1.1 Card headlines

**Goal:** Make headlines scannable and outcome-oriented.

**Rules:**
- Max 70 characters (hard limit); prefer under 60.
- Lead with the business impact or tension, not the subject.
- Avoid jargon unless it's a known term for the audience (e.g., "CLV" is fine, "ROAS" is fine).

**Examples (before → after):**
- ❌ "Loyalty Programs Drive $260B CLV Surge Across Enterprise…"
- ✅ "$260B CLV Surge: What Enterprise Loyalty Programs Are Doing Differently"

- ❌ "Super Bowl Creative Rejections Signal Broken Brand Safety…"
- ✅ "Super Bowl Ad Rejections Expose Brand Safety Blind Spots"

- ❌ "Meta's $28B Reality Labs Loss Exposes CMO VR/AR Budget…"
- ✅ "Meta's $28B VR Loss: What It Means for CMO AR/VR Bets"

**Task for Cursor:**
- Review all briefing headlines in the data model or CMS.
- Flag any over 70 chars and propose rewrites following the rules above.
- If headlines are generated dynamically, update the prompt/logic to enforce these rules.

---

### 1.2 Preview text (card body)

**Goal:** Tease the "so what," not just summarize the event.

**Rules:**
- Max 120 characters.
- End with implication or question, not a period after a fact.
- Avoid repeating the headline.

**Examples (before → after):**
- ❌ "Five major enterprise brands reported collective $260B+ customer lifetime…"
- ✅ "Enterprise brands are rewriting the loyalty playbook—here's what's working."

- ❌ "Dollar Shave Club's Super Bowl rejection over mild profanity exposes…"
- ✅ "If mild profanity triggers rejection, what does that mean for edgy creative?"

**Task for Cursor:**
- Update preview text generation logic (or static content) to follow these rules.
- If using LLM summarization, update the prompt to produce implication-forward teasers.

---

### 1.3 Category tags

**Goal:** Make tags meaningful and reduce noise.

**Current tags:** Brand Performance, Competitive Intel, AI Strategy, Media Trends

**Changes:**
- Keep these four as primary categories.
- Add a fifth: **Org Readiness** (for talent, change management, AI adoption stories).
- Remove or rethink the "HOT" badge:
  - Option A: Replace with "Trending" only if the story has >X views or is <24 hrs old.
  - Option B: Replace with a subtle flame icon (no text) to reduce visual clutter.
  - Option C: Remove entirely; let recency and position convey importance.

**Task for Cursor:**
- Add `Org Readiness` to the category enum/filter list.
- Implement Option B (flame icon) for "HOT" items; remove the text label.
- Ensure flame icon only appears if `isHot: true` or `publishedAt < 24 hours ago`.

---

### 1.4 Filter pills

**Goal:** Make filters feel interactive and informative.

**Changes:**
- Add a small count badge inside or next to each filter pill showing how many cards match (e.g., "AI Strategy (4)").
- Active filter should have a filled background (current orange) + slight scale bump (1.02).
- Inactive filters should have a subtle border, not just text.

**Task for Cursor:**
- Update filter pill component to accept and display a `count` prop.
- On filter change, recompute counts and pass to pills.
- Add `transform: scale(1.02)` and filled background to active state.

---

## Section 2: Visual / UI Changes

### 2.1 Card design overhaul

**Goal:** Cards should feel like premium editorial content, not generic SaaS tiles.

**Layout (per card):**
```
┌─────────────────────────────────────┐
│  [Category Tag]       [Flame icon]  │  ← top row, left-aligned tag, right-aligned icon if hot
│                                     │
│  HEADLINE (2 lines max)             │  ← bold, high contrast
│                                     │
│  Preview text (2 lines max)         │  ← muted, smaller
│                                     │
│  Jan 28  ·  2m read                 │  ← footer, smallest, muted
└─────────────────────────────────────┘
```

**Visual specs:**

| Element | Current | Target |
|---------|---------|--------|
| Card background | Gradient (blue→teal, etc.) | Solid dark surface (`#0b1020`) with subtle gradient border or glow on hover |
| Card border | None | 1px subtle border (`#1e293b`), glow on hover (`box-shadow: 0 0 20px rgba(249,115,22,0.15)`) |
| Category tag | Filled pill, dark bg | Smaller, outlined pill with category color as border; text in category color |
| Headline | White, truncated | Off-white (`#f1f5f9`), max 2 lines, ellipsis if overflow |
| Preview text | White, truncated | Muted (`#94a3b8`), max 2 lines |
| Date / read time | White, small | Muted (`#64748b`), smallest size |
| Hot badge | Orange pill with "HOT" text | Small flame icon (`#f97316`), no text |

**Hover state:**
- Card lifts slightly (`translateY(-4px)`).
- Border glows with primary accent color.
- Headline color shifts to white (`#ffffff`).
- Transition: 200ms ease-out.

**Task for Cursor:**
- Refactor card component styles to match specs above.
- Remove gradient backgrounds; use solid surface + glow border.
- Implement hover state with lift + glow + headline color shift.
- Ensure all transitions use same easing curve.

---

### 2.2 Category color system

**Goal:** Each category has a distinct, recognizable accent color.

| Category | Accent color | Use for |
|----------|--------------|---------|
| AI Strategy | `#22d3ee` (cyan) | Tag border, tag text, hover glow |
| Brand Performance | `#a78bfa` (violet) | Tag border, tag text, hover glow |
| Competitive Intel | `#f97316` (orange) | Tag border, tag text, hover glow |
| Media Trends | `#34d399` (emerald) | Tag border, tag text, hover glow |
| Org Readiness | `#fbbf24` (amber) | Tag border, tag text, hover glow |

**Task for Cursor:**
- Create a `categoryColors` map/constant.
- Apply category color to tag border, tag text, and card hover glow.
- Ensure consistency across filter pills and card tags.

---

### 2.3 Slider navigation

**Goal:** Navigation should be obvious and satisfying.

**Changes:**
- Increase arrow button size: 40×40px (currently ~32×32).
- Add a subtle filled background on hover (`#1e293b`).
- Add a pressed state: scale down slightly (`scale(0.95)`).
- On first/last card, disable the corresponding arrow (reduced opacity, no pointer events).

**Task for Cursor:**
- Update arrow button dimensions and padding.
- Add hover and pressed states with transitions.
- Implement disabled state logic based on scroll position.

---

### 2.4 Footer / trust strip

**Goal:** "Live data · 12 briefings · Updated 6:00 AM ET" is a trust signal—make it visible.

**Changes:**
- Move footer closer to the cards (reduce bottom margin).
- Add a subtle pulsing dot (green, `#22c55e`) before "Live data" to indicate freshness.
- Increase font size slightly (from ~12px to 14px).
- Add a subtle divider line above the footer.

**Task for Cursor:**
- Adjust footer positioning and font size.
- Add pulsing green dot animation (`@keyframes pulse`).
- Add a 1px divider (`#1e293b`) above the footer.

---

### 2.5 Responsive behavior

**Goal:** Slider should work well from 1024px to 1920px+ viewports.

**Rules:**
- 1024–1279px: show 3 cards, tighter gap.
- 1280–1535px: show 4 cards.
- 1536px+: show 5 cards.
- Below 1024px: stack vertically or use a different mobile layout (out of scope for now, but don't break it).

**Task for Cursor:**
- Audit current breakpoints and card widths.
- Adjust to match rules above.
- Test at 1280px and 1440px to ensure no overflow or awkward gaps.

---

## Section 3: Micro-interactions

### 3.1 Card click / tap

- On click, card should have a brief press animation (`scale(0.98)`, 100ms) before navigating.
- If navigating to a modal (Intelligence Brief popup), the card should fade slightly as the modal opens.

### 3.2 Filter change

- On filter change, cards should fade out (100ms), reorder, then fade in (150ms).
- Avoid layout shift; use a fixed-height container.

### 3.3 Refresh button

- On click, show a subtle rotation animation on the refresh icon (360° over 500ms).
- After data loads, flash the "Updated X:XX AM ET" text briefly (highlight, then fade).

**Task for Cursor:**
- Implement click animation on cards.
- Implement filter transition (fade out → reorder → fade in).
- Implement refresh icon spin and timestamp flash.

---

## Section 4: Acceptance Criteria

Before marking this work complete, verify:

- [ ] All card headlines are under 70 characters; truncation uses ellipsis only if necessary.
- [ ] Preview text teases implication, not just facts.
- [ ] Category tags use outlined style with category-specific colors.
- [ ] "HOT" is replaced by a flame icon (no text).
- [ ] Filter pills show count badges and have clear active/inactive states.
- [ ] Card backgrounds are solid dark surface with glow border on hover.
- [ ] Hover state includes lift, glow, and headline color shift.
- [ ] Navigation arrows are larger, have hover/pressed states, and disable at edges.
- [ ] Footer has pulsing green dot, larger text, and divider above.
- [ ] All transitions use 150–250ms duration and `ease-out` easing.
- [ ] Layout is responsive and shows correct card count per breakpoint.

---

## Section 5: Cursor Instructions

When you process this file:

1. **Read the entire document first** before making any changes.
2. **Locate the component(s)** responsible for the Discover More slider (likely in `src/components/`).
3. **Work through sections in order**: Content (1) → Visual (2) → Micro-interactions (3).
4. **For each task**, propose the code change, then apply it.
5. **Test at 1440px viewport width** as the primary breakpoint.
6. **Keep all styling consistent** with existing Tailwind tokens and design system.
7. **Do not introduce new dependencies** unless absolutely necessary (e.g., for animations, prefer CSS or existing Framer Motion if already installed).
8. **After all changes**, run a visual diff and confirm acceptance criteria.

If you encounter ambiguity or need clarification, flag it rather than guessing.

---

## Appendix: Design References

- **Pencil (trypencil.com):** Cinematic card gallery, subtle gradients, clean typography.
- **Profound (tryprofound.com):** Data-forward cards, minimal chrome, trust signals.
- **Hex (hex.tech):** Analytical workspace feel, clear hierarchy, professional motion.
- **PlannerAPI brand:** Dark navy bg (`#050814`), orange accent (`#f97316`), off-white text (`#e5e7eb`).

---

*Document version: 1.0*  
*Last updated: 2026-01-28*  
*Owner: Editorial / Product*

