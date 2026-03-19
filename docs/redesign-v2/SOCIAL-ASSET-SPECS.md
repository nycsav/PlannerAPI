# Signal2Noise — Social & Brand Asset Specifications

**Date**: 2026-03-19

## 1. Favicon & Browser Icons

| Asset | Size | Format | File Name |
|---|---|---|---|
| Favicon (classic) | 16x16 | .ico | `favicon.ico` |
| Favicon (modern) | 32x32 | .svg or .png | `favicon-32x32.png` |
| Apple Touch Icon | 180x180 | .png | `apple-touch-icon.png` |
| Android Chrome 192 | 192x192 | .png | `android-chrome-192x192.png` |
| Android Chrome 512 | 512x512 | .png | `android-chrome-512x512.png` |
| Safari Pinned Tab | any (vector) | .svg | `safari-pinned-tab.svg` |
| MS Tile Image | 150x150 | .png | `mstile-150x150.png` |
| MS Tile Wide | 310x150 | .png | `mstile-310x150.png` |
| OG Fallback Icon | 1200x630 | .png | `og-default.png` |

### PWA Manifest Icons (site.webmanifest)

```json
{
  "name": "Signal2Noise",
  "short_name": "S2N",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#0a0e1a",
  "background_color": "#0a0e1a",
  "display": "standalone",
  "start_url": "/"
}
```

## 2. Open Graph & Social Sharing Meta Tags

### Required HTML Meta Tags (index.html)

```html
<!-- Primary Meta Tags -->
<title>Signal2Noise — AI Competitive Intelligence</title>
<meta name="title" content="Signal2Noise — AI Competitive Intelligence" />
<meta name="description" content="AI-powered competitive intelligence, distilled from 10,000+ sources. Track signals, not noise." />

<!-- Open Graph / Facebook / LinkedIn / Discord / Slack -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://signals.ensolabs.ai/" />
<meta property="og:title" content="Signal2Noise — AI Competitive Intelligence" />
<meta property="og:description" content="AI-powered competitive intelligence, distilled from 10,000+ sources." />
<meta property="og:image" content="https://signals.ensolabs.ai/og-default.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://signals.ensolabs.ai/" />
<meta property="twitter:title" content="Signal2Noise — AI Competitive Intelligence" />
<meta property="twitter:description" content="AI-powered competitive intelligence, distilled from 10,000+ sources." />
<meta property="twitter:image" content="https://signals.ensolabs.ai/og-default.png" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0a0e1a" />
<meta name="msapplication-TileColor" content="#0a0e1a" />
```

## 3. Social Channel Profile Assets

### Twitter / X
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Profile photo | 400x400 | PNG/JPG | Displays as circle, use logo mark |
| Header/banner | 1500x500 | PNG/JPG | 3:1 aspect ratio |
| Post image | 1200x675 | PNG/JPG | 16:9, max 5MB |
| Card image (summary) | 120x120 | PNG/JPG | Square thumbnail |
| Card image (large) | 1200x628 | PNG/JPG | ~1.91:1 ratio |

### LinkedIn
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Company page logo | 300x300 | PNG | Square, displays as circle |
| Company banner | 1128x191 | PNG | 5.9:1 ratio |
| Post image (single) | 1200x627 | PNG/JPG | ~1.91:1 ratio |
| Article cover | 1200x644 | PNG/JPG | |
| Shared link preview | 1200x627 | PNG/JPG | Auto-pulled from og:image |

### GitHub
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Profile avatar | 500x500 | PNG | Square |
| Org avatar | 500x500 | PNG | Square |
| Social preview (repo) | 1280x640 | PNG | 2:1 ratio, set in repo settings |

### Product Hunt
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Logo/thumbnail | 240x240 | PNG | Square, displayed rounded |
| Gallery images | 1270x760 | PNG | Up to 8 images |
| Maker avatar | 160x160 | PNG | Displays as circle |
| GIF/video | 1270x760 | GIF/MP4 | Optional, first gallery slot |

### Discord
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Server icon | 512x512 | PNG | Displays as circle |
| Server banner | 960x540 | PNG | 16:9 |
| Embed thumbnail | 80x80 | PNG | Auto from og:image |
| Embed image | 400x300 | PNG | Auto from og:image |

### YouTube
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Channel icon | 800x800 | PNG | Displays as circle |
| Channel banner | 2560x1440 | PNG | Safe area: 1546x423 center |
| Video thumbnail | 1280x720 | PNG/JPG | 16:9 |

### Instagram
| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Profile picture | 320x320 | PNG/JPG | Displays as circle |
| Post (square) | 1080x1080 | PNG/JPG | 1:1 |
| Post (landscape) | 1080x566 | PNG/JPG | 1.91:1 |
| Post (portrait) | 1080x1350 | PNG/JPG | 4:5 |
| Story / Reel cover | 1080x1920 | PNG/JPG | 9:16 |

## 4. Email Assets

| Asset | Dimensions | Format | Notes |
|---|---|---|---|
| Email header banner | 600x200 | PNG | Max width for most clients |
| Email signature logo | 200x50 | PNG | Transparent bg |
| Newsletter hero | 600x300 | PNG | Above the fold |

## 5. Brand Color Codes

| Color | Hex | RGB | HSL | Usage |
|---|---|---|---|---|
| Background | `#0a0e1a` | 10, 14, 26 | 225, 44%, 7% | Page bg, dark theme |
| Card Surface | `rgba(255,255,255,0.03)` | — | — | Glass card bg |
| Text Primary | `#e8eaed` | 232, 234, 237 | 216, 12%, 92% | Body text |
| Text Muted | `#8b8fa3` | 139, 143, 163 | 230, 10%, 59% | Secondary text |
| Accent Orange | `#f97316` | 249, 115, 22 | 25, 95%, 53% | CTAs, highlights, logo |
| Positive | `#22c55e` | 34, 197, 94 | 142, 71%, 45% | Uptrends, success |
| Negative | `#ef4444` | 239, 68, 68 | 0, 84%, 60% | Downtrends, errors |
| Border | `rgba(255,255,255,0.08)` | — | — | Card/section borders |

## 6. Typography

| Usage | Font | Weight | Size |
|---|---|---|---|
| Headings | Inter | 600-700 | 20-48px |
| Body text | Inter | 400 | 14-16px |
| Labels / badges | Inter | 500-600 | 10-12px |
| Code / shortcuts | JetBrains Mono | 400 | 12-14px |

## 7. Asset Generation Checklist

- [ ] Design final logo mark (SVG)
- [ ] Generate favicon set from SVG (use realfavicongenerator.net)
- [ ] Create OG image template (1200x630, dark bg, logo + tagline)
- [ ] Create Twitter banner (1500x500)
- [ ] Create LinkedIn banner (1128x191)
- [ ] Create GitHub social preview (1280x640)
- [ ] Create Product Hunt gallery (1270x760 x 5-8 screenshots)
- [ ] Create Discord server icon (512x512)
- [ ] Update index.html with all meta tags
- [ ] Update site.webmanifest with all icon sizes
