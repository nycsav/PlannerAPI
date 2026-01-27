# PlannerAPI Design System

**Last Updated:** January 25, 2026  
**Product:** AI-powered strategic intelligence platform for C-suite marketing executives  
**Dark Mode:** ✅ Fully Implemented & Production Ready

---

## Design Context

### Users

**Who They Are:**
- **Primary:** CMOs, VP Marketing, Brand Directors, Growth Leaders at enterprise companies
- **Context:** Time-constrained executives (8-10 second attention span), decision-makers under pressure
- **Use Case:** Strategic planning, board reporting, competitive intelligence, budget allocation decisions

**Job to Be Done:**
Get real-time, actionable strategic intelligence without spending hours on research. Transform market signals into board-ready insights with structured analysis (What This Means → Suggested Actions → Signals).

**User Journey Insight (from UX Audit):**
Executives scan rapidly (0-15 seconds), evaluate credibility (15-60 seconds), then commit or bounce (60-120 seconds). They need instant clarity, trust signals, and a clear next action.

---

### Brand Personality

**Three Words:**
**Precise. Commanding. Trustworthy.**

**Voice & Tone:**
- Direct and outcome-focused (not conversational or playful)
- Data-driven and credible (cite sources, show metrics, build trust)
- Executive-appropriate (professional, confident, authoritative)
- Signal vs noise mentality (clarity over volume)

**Emotional Arc:**
1. **On Arrival:** Focused — "I instantly understand what this does amid the noise"
2. **On Engagement:** Empowered — "I have strategic intel advantage my competitors don't"
3. **On Return:** Relieved — "This tool handles research I don't have time for"

**Anti-Reference (What We're NOT):**
Consumer AI chatbot (ChatGPT, Gemini) — We are NOT playful, conversational, or minimalist chat-only. We're an **executive intelligence console**, not a general-purpose assistant.

---

### Aesthetic Direction

**Visual Tone:**
- **Professional SaaS console** (not chatbot, not dashboard, not news site)
- **Minimal but confident** (restraint over decoration, purposeful whitespace)
- **Data-forward** (structured results, clear hierarchy, scannable)
- **Accessible at speed** (executives need to scan and act fast)

**Color Palette:**

**Light Mode:**
- **Primary Dark:** `planner-navy` (#1B365D) — replaces bureau-ink for distinctive brand identity
- **Accent/CTAs:** `planner-orange` (#FF6B35) — high-contrast for action buttons and highlights
- **Links/Secondary:** `bureau-signal` (#2563EB) — keep blue for clickable elements
- **Text:** `bureau-slate` (#475569) — body text, secondary content
- **Surface:** `bureau-surface` (#FFFFFF) — clean white backgrounds
- **Borders:** `bureau-border` (#E2E8F0) — subtle dividers

**Dark Mode:**
- **Background:** `slate-900` (#0F172A) — deep navy for main surfaces
- **Surface:** `slate-800` (#1E293B) — elevated panels, cards, modals
- **Text Primary:** `gray-100` (#F1F5F9) — high contrast for headings and primary text
- **Text Secondary:** `gray-200` (#E2E8F0) — body text, secondary content
- **Text Tertiary:** `gray-300` (#CBD5E1) — helper text, timestamps
- **Accent/CTAs:** `planner-orange` (#FF6B35) — maintains brand identity in dark mode
- **Links:** `blue-400` (#60A5FA) — high contrast for clickable elements
- **Borders:** `slate-700/50` — subtle dividers with opacity for depth
- **Logo Colors:** CSS variables (`--logo-bg`, `--logo-signal`, `--logo-white`) — dynamic SVG coloring

**Typography:**
- **Display Headings:** Outfit (black weight, uppercase, **NO italic**) — commanding but clean
- **Body Text:** Inter/Roboto — professional, readable, accessible
- **Monospace:** Roboto Mono — technical elements, IDs, timestamps

**Typography Principle:**
All-caps for section headers and key headlines (authority), but **remove italic** for modern, cleaner look. Use sentence case for body copy and CTAs.

**Spacing Scale (8px base):**
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- 2xl: 64px
- 3xl: 96px

**Max Widths:**
- Hero: 1000px (focused attention)
- Content: 1400px (readable briefing cards)
- Wide: 1400px (full-width sections)

**Dark Mode:**
- **Implementation:** Class-based dark mode via Tailwind (`darkMode: 'class'`)
- **Toggle:** Theme toggle in Navbar (top-right) with instant feedback
- **Persistence:** Theme preference saved to `localStorage` and persists across sessions
- **System Preference:** Automatically detects and respects system dark mode preference on first visit
- **CSS Variables:** Logo colors adapt via CSS custom properties for seamless dark mode integration
- **Contrast Standards:** All dark mode text meets WCAG AA standards (minimum 4.5:1 ratio)
- **Global Overrides:** High-specificity CSS rules ensure dark mode applies consistently across all components

**Accessibility:**
- All transitions/animations disabled globally (per requirement in index.css)
- Minimum contrast ratio: WCAG AA (4.5:1 for text, 3:1 for UI elements)
- Touch targets: 44x44px minimum
- Semantic HTML: proper heading hierarchy, ARIA labels, keyboard navigation
- Dark mode: All text colors tested for WCAG AA compliance in both light and dark modes

---

### Design Principles

#### 1. **Signal Over Noise**
Every element must serve a purpose. Remove decoration, reduce cognitive load, prioritize scannable information. Executives have 8-10 seconds to decide—make every pixel count.

**In Practice:**
- Minimal nav (logo, audience selector, CTA only)
- No hero carousels, no decorative animations, no generic stock imagery
- Structured results (What This Means → Actions → Signals) over paragraph dumps
- Trust signals where needed (social proof, security badges), not plastered everywhere

---

#### 2. **Clarity Before Cleverness**
Be direct over clever. "Start Executive Preview" not "Request Access". "Get Intelligence" not "Ask AI Anything". Executive users need instant understanding, not puzzles to solve.

**In Practice:**
- Clear CTAs with explicit benefit ("Get structured analysis in 30 seconds")
- No jargon without context (explain "Signals", "Sonar API", etc.)
- Upfront value prop: what it is, what it does, how it works (3 sentences max)
- Error messages are helpful, not witty

---

#### 3. **Trust Through Precision**
Credibility comes from specificity, recency, and transparency. Generic claims ("Trusted by Fortune 500") destroy trust. Specific data ("Join 50+ CMOs in early access", "Updated 2 hours ago") builds it.

**In Practice:**
- Show freshness indicators (timestamps, "Updated X hours ago")
- Cite sources with links (not just "Industry Analysis")
- Use specific metrics ("$4.2B market shift", "92% automation achieved")
- Security badges where relevant (SOC 2, GDPR) but not overwhelming

---

#### 4. **Progressive Disclosure**
Show the most important information first, details on demand. Don't overwhelm executives with everything at once. Guide them from clarity (hero) → empowerment (results) → relief (repeat use).

**In Practice:**
- Hero: Clear value prop + one action (search or chat)
- Results: Structured summary (What This Means) before deep context (Signals)
- Briefings: Title + 2-sentence summary, "Read Analysis" for full report
- No feature dumping—introduce capabilities as users need them

---

#### 5. **Consistent, Purposeful Motion**
All animations/transitions disabled globally per requirement. Interactions are instant. When motion is re-enabled (future), use sparingly: smooth scrolls, subtle focus states, intentional loading indicators only.

**In Practice:**
- Button states: instant feedback (hover, active, disabled)
- Form validation: immediate, clear error indicators
- Loading: purposeful spinners with context ("Analyzing market intelligence...")
- No bounces, no elastic effects, no decorative animations

---

## Component Patterns

### Established Patterns (In Codebase)

**Hero Search:**
- Large, outcome-focused placeholders that rotate every 3 seconds
- Category chips with trending indicators
- Minimal trust strip below (social proof, security, real-time data)

**Executive Strategy Chat:**
- Structured output: What This Means → Suggested Actions → Signals
- Signals include: title, summary, source + link, ID badge
- Empty states with helpful fallback messages
- Focus management (auto-scroll, input focus on errors)

**Intelligence Briefing Cards:**
- ID + date header (shows recency)
- Category tag (colored, uppercase)
- Title + 2-3 sentence description with specific metrics
- Action buttons (Analyze, Research, Read Analysis)
- Hover states for interactivity

**Navbar:**
- Minimal: Logo + Audience Selector + Single CTA
- Sticky top, subtle backdrop blur
- UTC timestamp (reinforces real-time intelligence)

**Footer:**
- Functional CTAs (not just social links)
- Segmented by audience (For CMOs, For Growth Teams)
- Single-column mobile, multi-column desktop

---

## Color Usage Guidelines

### Primary Actions
- **CTA Buttons:** `planner-orange` (#FF6B35) background, white text
- **Hover:** Darken orange 10% or use `planner-navy` for high-contrast

### Links & Interactive
- **Hyperlinks:** `bureau-signal` (#2563EB)
- **Hover:** Darken blue 10%, no underline by default (underline on hover)

### Text Hierarchy
- **Headings:** `planner-navy` (#1B365D) or `bureau-ink` (#0F172A) for depth
- **Body:** `bureau-slate` (#475569) — 70-80% opacity for secondary text
- **Muted:** `bureau-slate/60` — timestamps, helper text, subtle info

### Borders & Dividers
- **Default:** `bureau-border` (#E2E8F0)
- **Emphasis:** `bureau-ink/10` or `bureau-ink/20` for stronger separation

### Backgrounds
- **Primary:** `bureau-surface` (#FFFFFF)
- **Alternate:** `bureau-surface` with subtle shadow or `bg-gray-50` for zebra striping
- **Highlight:** `bureau-signal/5` for loading states or info callouts

---

## Typography Scale

### Display (Outfit, Black, Uppercase)
- **Hero:** text-4xl md:text-6xl lg:text-7xl (56-72px) — commanding presence
- **Section Headers:** text-3xl md:text-4xl (36-48px) — clear hierarchy
- **Component Headers:** text-xl (20px) — subsection titles

### Body (Inter/Roboto, Regular/Medium)
- **Primary:** text-base (16px) — standard body copy, line-height: 1.6
- **Secondary:** text-sm (14px) — helper text, captions, card descriptions
- **Micro:** text-xs (12px) — timestamps, IDs, metadata

### Monospace (Roboto Mono, Medium/Bold)
- **IDs/Codes:** text-xs font-mono (12px) — briefing IDs, technical labels
- **Buttons:** text-xs uppercase tracking-wide (10-12px) — technical CTAs

---

## Spacing Patterns

### Section Padding
- **Vertical:** py-2xl (64px) — consistent section breathing room
- **Horizontal:** app-padding-x (24px mobile, 48px desktop)

### Component Spacing
- **Card Grid:** gap-md (24px) — briefing cards, feature grids
- **Inline Elements:** gap-sm (16px) — buttons, chips, inline icons
- **Stacked Content:** space-y-lg (32px) — result sections, form fields

### Container Max Widths
- **Hero:** max-w-hero (1000px) — focused attention
- **Content:** max-w-content (1400px) — briefings, results
- **Wide:** max-w-wide (1400px) — full-width sections

---

## Accessibility Standards

**Compliance Level:** WCAG 2.1 Level AA minimum

**Focus States:**
- All interactive elements have visible focus indicators
- Use `focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2`
- Never remove focus outlines without replacement

**Semantic HTML:**
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- Form labels for all inputs (visible or sr-only)
- ARIA attributes where needed (aria-label, aria-describedby, role)

**Keyboard Navigation:**
- Tab order is logical and predictable
- Enter/Space activate buttons
- Escape closes modals/dropdowns
- All features accessible without mouse

**Screen Readers:**
- Descriptive alt text for images
- aria-hidden="true" for decorative icons
- aria-live regions for dynamic content (loading, errors)

**Color Contrast:**
- Text on white: minimum 4.5:1 (use bureau-ink or planner-navy)
- UI elements: minimum 3:1 (borders, icons, disabled states)
- Never rely on color alone (use icons, labels, patterns)

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Adequate spacing between touch targets (8-16px gap)

---

## Future Considerations

### When Animations Are Re-Enabled
Currently all transitions are disabled (`transition: none !important` in index.css). If/when re-enabled:

- **Timing:** 150-300ms max (fast, purposeful)
- **Easing:** ease-out-quart or ease-out-expo (natural deceleration)
- **Properties:** Transform and opacity only (no layout thrashing)
- **Respect:** `prefers-reduced-motion` media query

### When Adding Illustrations/Icons
- Use lucide-react (already in dependencies) for consistent icon family
- No decorative illustrations unless they clarify complex concepts
- Icons should be functional (button labels, status indicators), not decorative

### Dark Mode Color Usage
- **Backgrounds:** Use `bg-white dark:bg-slate-900` for main surfaces
- **Elevated Panels:** Use `bg-white dark:bg-slate-800` for cards, modals, sidebars
- **Text Hierarchy:** 
  - Headings: `text-gray-900 dark:text-gray-100`
  - Body: `text-gray-700 dark:text-gray-200`
  - Secondary: `text-gray-600 dark:text-gray-300`
- **Borders:** Use opacity for subtlety: `border-gray-200/60 dark:border-slate-700/50`
- **Accents:** Maintain brand colors: `text-bureau-signal dark:text-planner-orange`
- **Logo:** Use CSS variables for dynamic SVG coloring in dark mode

### When Expanding Color Palette
- Ensure all new colors pass WCAG contrast ratios in both light and dark modes
- Test in light/dark mode before deploying
- Maintain signal vs noise principle (color = meaning, not decoration)
- Use Tailwind's standard `slate` colors for dark mode consistency

---

## Reference Files

**UX Audit:** `/ux/executive-journey-audit.md` — Complete user journey analysis, pain points, recommendations  
**Tailwind Config:** `/tailwind.config.js` — Design tokens (spacing, colors, typography, dark mode)  
**Global Styles:** `/index.css` — Base styles, utilities, animation override, dark mode CSS variables  
**Theme Context:** `/contexts/ThemeContext.tsx` — Theme state management and persistence  
**Design Config:** `/src/config/design.ts` — Centralized design tokens and interpretation  
**Logo Component:** `/components/Logo.tsx` — Terminal, compass, pivot variants with dark mode adaptation  
**Trust Strip:** `/components/TrustStrip.tsx` — Social proof component pattern  
**Dark Mode Guide:** `/DARK-MODE-DESIGN-SYSTEM.md` — Complete dark mode implementation documentation  
**Design Tokens:** `/DESIGN-TOKENS.md` — All design tokens and usage patterns

---

## Design Interpretation Saved

The complete design interpretation has been saved to:
- **`/src/config/design.ts`** - TypeScript configuration with all design tokens
- **`/DESIGN-TOKENS.md`** - Comprehensive markdown documentation
- **`/DARK-MODE-DESIGN-SYSTEM.md`** - Complete dark mode implementation guide

**Key Design Decisions:**
- Light Mode: Clean, professional, high contrast for maximum readability
- Dark Mode: Deep, sophisticated, reduces eye strain while maintaining brand identity
- Brand Consistency: `planner-orange` maintained in both modes
- Accessibility: WCAG AA compliance (4.5:1 minimum contrast) in both modes

---

**End of Design System**

*This document guides all future design decisions for PlannerAPI. Update as the product evolves, but core principles remain constant: clarity, trust, executive-appropriate precision. Dark mode is production-ready and fully documented.*
