# Signal2Noise Redesign v2 — Master Plan

**Date**: 2026-03-19
**Branch**: `frontend-redesign`
**Live site**: signals.ensolabs.ai

## Design Prototype

- **Magic Patterns Editor**: https://www.magicpatterns.com/c/nhwyggqqklenruaqnscvvk
- **Live Preview**: https://project-signal2noise-homepage-v2-193.magicpatterns.app
- **Design System**: Shadcn (Tailwind v3)

## Architecture Changes

### LLM Migration: Perplexity → Gemini

| Role | Current | New |
|---|---|---|
| Web search + summarization | Perplexity Sonar / Sonar Pro | Gemini 3.1 Pro (`gemini-3.1-pro-preview`) |
| Signal scoring (JSON) | Perplexity sonar-reasoning-pro | Gemini 3.1 Pro (structured output + grounded search) |
| Image generation per card | None (og_image only) | Nano Banana 2 (`gemini-3.1-flash-image-preview`) |
| Estimated cost | Current spend | ~$20-40/month |

**Key benefit**: Every card gets an AI-generated visual via Nano Banana 2. No more relying on missing og_images.

### Frontend Stack Changes

| Need | Current | New |
|---|---|---|
| Search/command palette | None | cmdk via shadcn `<Command>` |
| Card animations | None | Framer Motion `layout` + `AnimatePresence` |
| Sparklines | Recharts | Keep Recharts + add Tremor SparkChart |
| Hover previews | Custom | Radix HoverCard (via shadcn) |
| Layout | Flex | CSS columns masonry (zero JS) |
| Mobile bottom sheet | None | vaul drawer |

### Design Direction

**DNA**: Perplexity's search UX + Koyfin's data density + Artifact's card aesthetics + Bloomberg's dark mode gravitas

- **Search**: Hero command palette (full-width, Cmd+K global)
- **Cards**: 3-column masonry, 4 card types (Hero, Standard, Data, Compact)
- **Every card has a visual**: AI-generated image, sparkline, bar chart, or score indicator
- **Glassmorphism**: `bg-white/5 backdrop-blur-xl border border-white/10` with orange glow on hover
- **Colors**: bg #0a0e1a, text #e8eaed/#8b8fa3, accent #f97316, positive #22c55e, negative #ef4444

## Design Tools

| Tool | Purpose | Status |
|---|---|---|
| Magic Patterns (MCP) | React + Tailwind prototyping | Homepage v2 complete |
| Pencil.dev (IDE extension) | Iterative design-to-code | Fallback if MP paywalled |
| Figma (MCP) | Design token extraction | Available for polish |
| Excalidraw (MCP) | Wireframes, architecture diagrams | Available |

## Logo System

- **Magic Patterns Editor**: https://www.magicpatterns.com/c/9g7wqmzsfkkkcxasuyhjey
- **Live Preview**: https://project-signal2noise-logo-system-484.magicpatterns.app
- **4 Concepts**: Signal Wave, Radar Pulse, Geometric S, Minimal Badge
- **SVG Components**: `docs/redesign-v2/logos/`

## Docs Created

| Doc | Path | Status |
|---|---|---|
| Redesign Overview | `docs/redesign-v2/REDESIGN-OVERVIEW.md` | Complete |
| Gemini Migration Plan | `docs/redesign-v2/GEMINI-MIGRATION.md` | Complete |
| Social Asset Specs | `docs/redesign-v2/SOCIAL-ASSET-SPECS.md` | Complete |
| GTM Launch Plan | `docs/redesign-v2/launch/GTM-LAUNCH-PLAN.md` | Complete |
| Brand Identity | `docs/redesign-v2/launch/BRAND-IDENTITY.md` | Complete |
| Homepage Prototype | `docs/redesign-v2/prototype/` | Complete (7 files) |
| Logo Components | `docs/redesign-v2/logos/` | Complete (4 concepts) |

## Workstreams

1. [x] Homepage prototype (Magic Patterns)
2. [x] Logo and brand identity system (4 concepts in Magic Patterns)
3. [x] Social media asset specs and templates
4. [x] GTM launch plan and press kit
5. [x] Gemini 3.1 Pro + Nano Banana 2 migration plan
6. [ ] Push all to GitHub
