# Signal2Noise — Brand Identity System

**Date**: 2026-03-19

## Logo Concepts (4 Directions)

### Concept 1: Signal Wave Mark
- Orange circle (signal origin) + diminishing wave lines fading to gray (noise)
- Clean, minimal, works at 16px (just the dot) up to full-size
- Wordmark: "Signal" (bold white) + "2" (muted gray) + orange dot + "Noise" (bold white)

### Concept 2: Dot Separator (Current Magic Patterns Version)
- Text-based: "Signal" + faded "2" + orange dot separator + "Noise"
- Minimalist, typography-forward
- Favicon: Orange rounded square with "S2N" in white

### Concept 3: Radar/Pulse Mark
- Concentric circles radiating from center (like a radar pulse)
- Center dot is solid orange, outer rings fade in opacity
- Suggests "detecting signals" — very on-brand
- Favicon: Single orange pulse ring with center dot

### Concept 4: Abstract S/N Mark
- Stylized "S" that transforms into a wave/signal shape
- Modern, geometric, distinctive at all sizes
- Single color (orange on dark, dark on light)

## Logo System Files Needed

| File | Format | Sizes | Purpose |
|---|---|---|---|
| `s2n-logo-primary.svg` | SVG | Vector | Primary horizontal logo |
| `s2n-logo-mark.svg` | SVG | Vector | Icon/mark only |
| `s2n-logo-wordmark.svg` | SVG | Vector | Text only |
| `s2n-logo-dark-bg.svg` | SVG | Vector | For dark backgrounds |
| `s2n-logo-light-bg.svg` | SVG | Vector | For light backgrounds |
| `s2n-logo-mono-white.svg` | SVG | Vector | Monochrome white |
| `s2n-logo-mono-dark.svg` | SVG | Vector | Monochrome dark |
| `s2n-favicon.svg` | SVG | Vector | Browser favicon (SVG) |
| `favicon.ico` | ICO | 16/32/48 | Legacy favicon |
| `apple-touch-icon.png` | PNG | 180x180 | iOS home screen |
| `android-chrome-192.png` | PNG | 192x192 | Android/PWA |
| `android-chrome-512.png` | PNG | 512x512 | Android/PWA |

## Recommended Tools for Logo Generation

### Option A: Magic Patterns (MCP) — SVG React Component
- Create the logo as a React SVG component in Magic Patterns
- Export the SVG code directly
- Best for iteration with AI assistance

### Option B: Logoai.com / Brandmark.io
- AI-generated logos with SVG output
- Good for rapid iteration on concepts
- Brandmark produces cleaner vector output

### Option C: Figma (manual, highest quality)
- Design in Figma, use Figma MCP to extract
- Most control over final output
- Best for final polish

### Option D: Pencil.dev
- Design on canvas inside IDE
- SVG export via MCP
- Good for iterating alongside code

**Recommended workflow**: Generate 3-4 concepts with Logoai/Brandmark → Refine winner in Figma → Export via Figma MCP → Generate favicon set with realfavicongenerator.net

## Brand Voice

### Tone
- **Confident, not arrogant**: "We found something you should see" not "We're the best"
- **Data-driven, not cold**: Numbers with context, not just metrics
- **Concise, not terse**: Every word matters, but the writing feels human
- **Expert, not academic**: Analyst-quality insights in plain language

### Writing Style
- Short sentences. Direct. No fluff.
- Lead with the signal, not the source
- Use active voice: "Anthropic raised $4B" not "A round of $4B was raised"
- Numbers first: "87/100 signal score" not "A high signal score of 87"

### Taglines (Options)
1. "Track signals, not noise."
2. "AI-powered competitive intelligence."
3. "See what matters. Ignore the rest."
4. "The intelligence you need. Nothing you don't."
5. "10,000 sources. One feed. Zero noise."

## Color System

### Primary
| Name | Hex | Usage |
|---|---|---|
| S2N Orange | `#f97316` | Logo accent, CTAs, highlights, signal indicators |
| S2N Dark | `#0a0e1a` | Background, dark theme base |
| S2N White | `#e8eaed` | Primary text on dark |

### Secondary
| Name | Hex | Usage |
|---|---|---|
| Muted | `#8b8fa3` | Secondary text, labels |
| Positive | `#22c55e` | Uptrends, rising signals |
| Negative | `#ef4444` | Downtrends, falling signals |
| Amber | `#f59e0b` | Medium/neutral signals |

### Extended (Data Viz)
| Name | Hex | Usage |
|---|---|---|
| Blue | `#3b82f6` | Data series 1, links |
| Purple | `#8b5cf6` | Data series 2, enriched content |
| Pink | `#ec4899` | Data series 3, avatar gradients |
| Cyan | `#06b6d4` | Data series 4, info states |
