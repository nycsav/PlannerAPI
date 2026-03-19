# Critical Gaps to Fix Before Launch

**Date**: 2026-03-19
**Priority**: These are blocking issues for social sharing and brand presentation.

## 1. Missing Favicon PNGs (BLOCKING)

`index.html` references these files but they DON'T EXIST in `/public/`:
- `/favicon-32x32.png` — referenced but missing
- `/favicon-16x16.png` — referenced but missing
- `/apple-touch-icon.png` — referenced but missing
- `/logo.png` — referenced in JSON-LD schema but missing
- `/og-image.png` — referenced in twitter:image but missing

**Fix**: Generate full favicon set from chosen logo concept using RealFaviconGenerator.net.

Only 3 files needed for full browser coverage (Evil Martians method):
1. `favicon.svg` — modern browsers + dark mode support (EXISTS, needs update)
2. `favicon.ico` — 16x16 + 32x32 multi-size (needs generation)
3. `apple-touch-icon.png` — 180x180 for iOS (needs generation)

Plus for PWA:
4. `android-chrome-192x192.png`
5. `android-chrome-512x512.png`

## 2. OG Image is SVG (BLOCKING for social sharing)

Current `og:image` points to: `https://signals.ensolabs.ai/brand/s2n-logo-v2.svg`

**Problem**: Twitter/X, LinkedIn, WhatsApp, and Slack may not render SVG og:images correctly. Some platforms explicitly require JPG/PNG.

**Fix**: Create a proper `og-default.png` at 1200x630px (JPG, under 300KB for WhatsApp compatibility).

Content for OG image:
- Dark background (#0a0e1a)
- Signal2Noise logo centered
- Tagline: "AI-powered competitive intelligence"
- signals.ensolabs.ai URL

## 3. Missing Meta Tags

Current `index.html` has good OG tags but is missing:
- `og:image:width` and `og:image:height` (prevents Facebook async parsing)
- Proper PNG references instead of SVG

## 4. site.webmanifest Needs Update

Current manifest needs:
- Proper `name` and `short_name`
- `theme_color` and `background_color` set to `#0a0e1a`
- `display: standalone`
- Icon references to actual PNG files

## 5. SVG Favicon Should Support Dark Mode

The SVG favicon can auto-adapt to dark/light mode:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .mark { fill: #0a0e1a; }
    @media (prefers-color-scheme: dark) {
      .mark { fill: #f97316; }
    }
  </style>
  <!-- logo mark path here -->
</svg>
```

## Action Items (in order)

1. **Pick logo concept** from the 4 options in Magic Patterns
2. **Export SVG mark** from chosen concept
3. **Generate favicon set** via realfavicongenerator.net or `npx pwa-asset-generator`
4. **Create OG image** (1200x630 PNG, dark bg + logo + tagline)
5. **Update `/public/`** with all generated files
6. **Update `index.html`** meta tags to point to PNG files
7. **Update `site.webmanifest`** with correct icon paths
8. **Deploy**: `npm run build && firebase deploy --only hosting`
9. **Validate**: Test social previews at https://cards-dev.twitter.com/validator and https://developers.facebook.com/tools/debug/
