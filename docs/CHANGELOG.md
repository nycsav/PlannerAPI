# PlannerAPI Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added - 2026-02-17
- **Conversational follow-up interface** in IntelligenceModal
  - User questions appear on right (orange bubbles)
  - AI responses stack on left (structured cards)
  - Auto-scroll to latest message
  - Conversation persists within modal session
- **Smart contextual question suggestions** (auto-generated, 3 per brief)
  - Theme-aware (AI, retail media, budget, competitive, etc.)
  - Clickable chips populate input field
  - Only shown before conversation starts
- **Sources always visible** (3 visibility features)
  - Header banner: "Powered by Perplexity Research" + source count
  - Floating badge: Top-right corner with click-to-scroll
  - Enhanced detail section: Favicons, numbering, prominent styling

### Changed - 2026-02-17
- **Perplexity model:** `sonar-pro-fast` → `sonar` (faster, lower latency)
- **Backend signal validation:** Added completeness checks to prevent truncated bullets
- **Token limit:** Increased from 2048 → 3072 for complete responses
- **Response parsing:** Fixed follow-up question format (Summary → Signals → Actions)
- **Source display:** Blue/violet theme, larger cards, better hover effects

### Fixed - 2026-02-17
- Incomplete signal text (4th bullet cut off mid-word)
- Follow-up questions not appearing in conversation
- Modal refreshing instead of stacking responses
- Truncation detection (stop_reason === 'max_tokens')

### Planned
- Bloomberg Terminal-inspired design system
- Email newsletter delivery automation (SendGrid/Mailgun)
- Advanced search and filtering (multi-pillar, source tier, date range)
- LinkedIn publishing automation (n8n → Claude → LinkedIn)
- Playbook Library (AEO/GEO, AI Workflows, Enterprise AI)
- Team workspaces and collaboration features

---

## [0.2.0-alpha] - 2026-02-11

### Added
- **Premium Intelligence Library** component with tier 1-3 research briefs
- **Notion → Firestore automation** scripts (`populatePremiumLibrary.cjs`)
- **Source diversity logic** (max 1 brief per source in Premium Library)
- **Perplexity AI integration** in intelligence modals for follow-up questions
- **Brand logos** for tier 1 sources (McKinsey, Gartner, Forrester, etc.)
- **Composite Firestore index** for `featured + createdAt` queries
- **Source tier badges** (1-5) with color-coded design
- **Deduplication logic** for Notion imports (check `notionId` before insert)

### Changed
- Reduced hero section height from 75vh to 50vh for content density
- Tightened section padding throughout app for Bloomberg-inspired layout
- Updated homepage copy with validated audience targeting (#1: Brand-side CMOs)
- Improved modal layout for better readability of summary/signals/moves

### Fixed
- Firestore permissions for `premium_briefs` collection (read: all, write: admin only)
- Modal content display for enriched briefs from Claude API
- Mobile responsiveness for Premium Library grid layout

---

## [0.1.0-alpha] - 2026-02-01

### Added
- **Daily Intelligence feed** with 10 cards refreshed at 6 AM ET
- **Cloud Scheduler** integration for automated card generation
- **Firestore backend** with `discover_cards` collection
- **Perplexity API integration** (`sonar-pro` model) for real-time research
- **Claude API integration** (Sonnet 4.5 + Haiku) with prompt caching
- **HeroSearch component** for real-time strategy chat
- **ExecutiveStrategyChat** component for conversational Q&A
- **IntelligenceModal** with structured summary/signals/moves display
- **Authentication system** (Firebase Auth with Google OAuth + email/password)
- **Analytics tracking** (Google Analytics 4 + Firestore custom events)
- **Dark theme UI** with Tailwind CSS
- **Responsive design** (mobile-first, accessible)
- **Four content pillars:**
  - 🟣 AI Strategy
  - 🔵 Brand Performance
  - 🟠 Competitive Intelligence
  - 🟢 Media Trends
- **Cost optimization:** Prompt caching reduces Claude API costs by 95%

### Documentation
- Created `CLAUDE.md` - Project instructions for Claude Code
- Created `docs/DAILY_INTEL_FRAMEWORK.md` - Content architecture
- Created `docs/EDITORIAL_VOICE.md` - Writing guidelines and tone
- Created `API-USAGE-OPTIMIZATION.md` - Cost constraints and strategies
- Created `DESIGN-SYSTEM.md` - Visual design, typography, colors
- Created `docs/AUDIENCE-STRATEGY.md` - Validated audience segments

---

## [0.0.1] - 2026-01-15

### Added
- Initial project setup with Vite + React + TypeScript
- Firebase project configuration (`plannerapi-prod`)
- Basic folder structure (`src/`, `functions/`, `docs/`)
- `.gitignore` for sensitive files
- `README.md` with project overview

---

## Infrastructure Changes

### 2026-02-07 — Notion Database Schema v2

**Database:** PlannerAPI Research Inbox
**Data Source ID:** `2fa0bdff-e59e-8075-a696-000b88058c9e`

**Schema Updates:**
- **Renamed:** Source Type → Source (26 publisher-level options replacing 6 format labels)
- **Renamed:** Relevance → Pillar (4 content pillars replacing 1-5 numeric scale)
- **Renamed:** Audience → Audience Segment (5 validated segments)
- **Renamed:** AI Summary → Key Stat
- **Updated:** Source Tier (5 tiered options replacing single "Tier 1")
  - Tier 1: Premier Research (McKinsey, Gartner, Forrester, BCG, Bain, Deloitte)
  - Tier 2: Platform Research (Google, OpenAI, Anthropic, Meta, Microsoft, Amazon Ads, Perplexity)
  - Tier 3: Trade Publication (Ad Age, AdWeek, Digiday, Marketing Week, Webflow, The Verge)
  - Tier 4: Data Provider (eMarketer, WARC, Kantar, Nielsen)
  - Tier 5: Emerging Signal (VentureBeat, TechCrunch, The Rundown, LinkedIn Post, Whitepaper, PDF Report)
- **Added:** Pain Points (multi-select, 9 options)
- **Added:** Used In Card (checkbox)
- **Deleted:** Content Pillars (redundant with Pillar)
- **Unchanged:** Status, URL, Excerpts / Notes, Date Added, Name

---

## API & Dependencies

### 2026-02-01 — Initial API Integrations

**Perplexity API:**
- Model: `sonar` (fast, real-time web search) - updated 2026-02-17
- Previous: `sonar-pro-fast` (deprecated)
- Use cases: Daily intelligence, HeroSearch, follow-up questions
- Cost: ~$1-2/month

**Anthropic Claude API:**
- Models:
  - Sonnet 4.5 (`claude-sonnet-4-5-20250514`) - Content enrichment
  - Haiku (`claude-haiku-20250514`) - Daily intelligence normalization
- Prompt caching enabled: 95% cost reduction
- Cost: ~$0.31/day (with caching) vs ~$15/day (without)

**Firebase Services:**
- Firestore (NoSQL database)
- Cloud Functions (Node.js 20)
- Firebase Auth (Google OAuth + email/password)
- Firebase Hosting (static site)
- Cloud Scheduler (daily triggers at 6 AM ET)

---

**Note:** This changelog is maintained manually. For detailed commit history, see: https://github.com/nycsav/PlannerAPI/commits/main
