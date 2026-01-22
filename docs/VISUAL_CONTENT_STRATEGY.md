# Visual Content Strategy for PlannerAPI

## 1. Brand Visual Identity

### Core Elements

| Element | Specification |
|---------|---------------|
| **Primary Logo** | Terminal icon (dark square with > arrow) + "PLANNERAPI" bold italic |
| **Colors** | Navy (#1B365D), Orange (#FF6B35), Off-white (#F8F6F0) |
| **Pillar Colors** | Purple (#7C3AED), Blue (#2563EB), Orange (#EA580C), Emerald (#059669) |
| **Fonts** | Plus Jakarta Sans (headlines), Inter (body), IBM Plex Mono (data) |
| **Style** | Clean, editorial, data-forward, no stock photos |

### Visual Tone
- **Professional but bold** - Not corporate boring, but not startup playful
- **Data-centric** - Numbers and metrics are the hero
- **High contrast** - Dark backgrounds for impact, white for readability
- **Geometric patterns** - Dot grids, gradients, abstract shapes

---

## 2. LinkedIn Content Types

### A. Daily Intelligence Cards (Single Image)

**Format:** 1200 x 627px (link preview) or 1080 x 1080px (native post)

**Template Structure:**
```
┌────────────────────────────────────────┐
│  [Pillar gradient background]          │
│                                        │
│  [BIG METRIC]     94%                  │
│  [Context line]   of CMOs lack AI      │
│                   maturity             │
│                                        │
│  ─────────────────────────────────────│
│                                        │
│  [Title - 2 lines max]                 │
│  The Gap Is Widening: McKinsey Says... │
│                                        │
│  [PlannerAPI logo]     [Pillar badge]  │
└────────────────────────────────────────┘
```

**Design Tools:** Canva template or Figma component

---

### B. LinkedIn Carousels (High Engagement)

**Format:** 1080 x 1350px (portrait), 5-10 slides

**Carousel Structure for Daily Intelligence:**

| Slide | Content |
|-------|---------|
| **1 - Hook** | Big stat + tension headline (gradient background) |
| **2 - Context** | Macro anchor from Tier 1 source (McKinsey quote) |
| **3 - Today's Signal** | Micro signal with chart/visual |
| **4-6 - Key Signals** | One signal per slide with supporting visual |
| **7-8 - Moves** | Actionable recommendations |
| **9 - CTA** | "Full analysis at PlannerAPI" + QR code |

**Example Carousel: "The 94% Problem"**
1. "94% of marketers aren't ready for what's coming" (big number, dark bg)
2. McKinsey quote card with their logo
3. Simple bar chart: AI Maturity Distribution
4. Signal 1: "6% at AI maturity" with icon
5. Signal 2: "22% efficiency gains for leaders"
6. Signal 3: "Google AI Overviews now 40% of queries"
7. Move 1: "Audit your top 25 search queries"
8. Move 2: "Build AI readiness scorecard"
9. CTA: PlannerAPI logo + "Get daily intelligence" + link

---

### C. Data Visualization Cards

**Types of Charts to Create:**

| Chart Type | Use Case | Tool |
|------------|----------|------|
| **Horizontal Bar** | Comparing metrics (market share, adoption %) | Recharts/Figma |
| **Donut/Pie** | Distribution (pillar breakdown, budget allocation) | Recharts/Figma |
| **Line/Area** | Trends over time (spend shifts, adoption curves) | Recharts/Figma |
| **Stat Cards** | Single big number with context | Figma template |
| **Comparison Table** | Before/after, competitor analysis | Figma template |

**Chart Style Guide:**
- Dark background (#0F172A) for social posts
- Pillar colors for data series
- Minimal gridlines
- Large labels (readable on mobile)
- Always include source attribution

---

## 3. Thumbnail System

### Card Thumbnails (In-App)

Currently using gradient backgrounds per pillar. Consider adding:

**Option A: Abstract Data Viz**
- Subtle chart shapes in background
- Geometric patterns that suggest data

**Option B: Icon-Based**
- Large Lucide icon per pillar
- Consistent placement

**Option C: AI-Generated Abstract**
- Use Midjourney/DALL-E for abstract "data" imagery
- Create 4 base images (one per pillar)
- Reuse across cards

---

### LinkedIn Post Thumbnails

**Dimensions:** 1200 x 627px

**Template Variants:**

1. **Metric Hero**
   - Giant number (72pt+)
   - 1-line context
   - Pillar color gradient

2. **Quote Card**
   - Source logo (McKinsey, Gartner)
   - Key quote
   - Attribution

3. **Chart Preview**
   - Simplified chart
   - "See full analysis" CTA
   - PlannerAPI branding

4. **Hot Take**
   - Contrarian statement
   - Fire/lightning accent
   - Different visual treatment

---

## 4. Social Graph (Open Graph) Images

### Default OG Image
**Size:** 1200 x 630px

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   [PlannerAPI Logo - large]                        │
│                                                    │
│   STRATEGIC INTELLIGENCE                           │
│   FOR MARKETING LEADERS                            │
│                                                    │
│   AI-powered market analysis for CMOs,             │
│   VP Marketing, and Growth Leaders                 │
│                                                    │
│   [4 pillar icons in a row]                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Dynamic OG Images (Per Card)

Generate unique OG images for each intelligence card:
- Card title
- Key metric
- Pillar color
- PlannerAPI branding

**Tools:** Vercel OG Image Generation, Cloudinary, or custom Canvas API

---

## 5. LinkedIn Carousel Creation Workflow

### Manual Process (Canva)

1. **Create master template** in Canva with:
   - 10 slide deck
   - Locked branding elements
   - Editable text/chart placeholders

2. **Weekly workflow:**
   - Select top 3 cards from Daily Intelligence
   - Export card data (title, signals, moves)
   - Populate Canva template
   - Export as PDF
   - Upload to LinkedIn as document

### Semi-Automated Process (n8n + Canva API)

```
Daily Intelligence Card (Firestore)
    ↓
n8n Workflow (triggered on high-engagement cards)
    ↓
Canva API (populate template)
    ↓
Export PDF
    ↓
Store in Cloud Storage
    ↓
Notify for LinkedIn posting
```

### Fully Automated (Future)

Use Figma API or custom Canvas/SVG generation to create images programmatically from card data.

---

## 6. Image Generation Prompts

### For Midjourney/DALL-E (Abstract Backgrounds)

**AI Strategy Pillar:**
```
Abstract digital visualization of neural networks and data flows,
purple and violet gradient, geometric patterns, minimalist,
dark background, professional, no text, 16:9 aspect ratio
```

**Brand Performance Pillar:**
```
Abstract visualization of growth charts and metrics rising upward,
blue and indigo gradient, clean lines, data-inspired shapes,
dark background, corporate professional, no text, 16:9
```

**Competitive Intel Pillar:**
```
Abstract radar visualization with overlapping circles and targeting elements,
orange and red gradient, strategic feel, geometric,
dark background, professional, no text, 16:9
```

**Media Trends Pillar:**
```
Abstract streaming data visualization with flowing particles,
emerald and teal gradient, dynamic movement suggestion,
dark background, modern tech aesthetic, no text, 16:9
```

---

## 7. Tools Recommendation

| Task | Free Option | Paid Option |
|------|-------------|-------------|
| **LinkedIn carousels** | Canva Free | Canva Pro ($13/mo) |
| **Custom thumbnails** | Figma Free | Figma Pro |
| **AI image generation** | Ideogram Free | Midjourney ($10/mo) |
| **Chart images** | Recharts → Screenshot | Flourish, Datawrapper |
| **Video content** | CapCut Free | Descript |
| **OG image generation** | Cloudinary Free | Vercel OG |

---

## 8. Content Calendar Visual Needs

| Day | Content Type | Visual Needed |
|-----|--------------|---------------|
| **Mon** | Weekly digest post | Carousel (10 slides) |
| **Tue** | Top AI Strategy card | Single metric image |
| **Wed** | Top Brand Performance card | Chart visualization |
| **Thu** | Hot Take | Bold quote card |
| **Fri** | Data Pulse (Top 5 list) | Numbered list graphic |

---

## 9. Asset Library to Create

### Immediate (Week 1)
- [ ] Default OG image (1200x630)
- [ ] 4 pillar background images
- [ ] LinkedIn carousel template (Canva)
- [ ] Single post template (Canva)

### Short-term (Week 2-3)
- [ ] 4 AI-generated abstract backgrounds
- [ ] Chart template library (Recharts components)
- [ ] Quote card template
- [ ] Hot Take template

### Medium-term (Month 1)
- [ ] Dynamic OG image generation
- [ ] Automated carousel creation
- [ ] Video intro/outro templates

---

**End of VISUAL_CONTENT_STRATEGY.md**
