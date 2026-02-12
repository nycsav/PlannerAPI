# Design Tokens - PlannerAPI

**Date:** January 25, 2026  
**Status:** ✅ Complete  
**Purpose:** Centralized design tokens for consistent styling across the application

---

## 🎨 Color Tokens

### Light Mode Colors

```javascript
// Primary Colors
'planner-navy': '#1B365D',      // Primary dark, headings
'planner-orange': '#FF6B35',     // Accent, CTAs, highlights
'planner-offwhite': '#F8F6F0',   // Alternate backgrounds

// Bureau System Colors
'bureau-surface': '#FFFFFF',     // Main backgrounds
'bureau-ink': '#0F172A',         // Primary text
'bureau-signal': '#2563EB',      // Links, interactive elements
'bureau-slate': '#475569',       // Secondary text
'bureau-border': '#E2E8F0',      // Borders, dividers
```

### Dark Mode Colors

```javascript
// Backgrounds
'dark-surface': '#0F172A',       // slate-900 - Main background
'dark-ink': '#F8FAFC',            // slate-50 - Primary text
'dark-slate': '#CBD5E1',          // slate-300 - Secondary text
'dark-border': '#1E293B',         // slate-800 - Borders

// Tailwind Standard (Preferred)
'slate-900': '#0F172A',           // Main dark background
'slate-800': '#1E293B',           // Elevated panels
'slate-700': '#334155',           // Borders (with opacity)
'gray-100': '#F1F5F9',            // Primary text in dark mode
'gray-200': '#E2E8F0',            // Secondary text in dark mode
'gray-300': '#CBD5E1',            // Tertiary text in dark mode
'blue-400': '#60A5FA',            // Links in dark mode
```

### CSS Variables (Logo Colors)

```css
/* Light Mode */
:root {
  --logo-bg: #111827;
  --logo-primary: #111827;
  --logo-signal: #EF4444;
  --logo-blue: #1D4ED8;
  --logo-white: #FFFFFF;
}

/* Dark Mode */
html.dark {
  --logo-bg: #1E293B;
  --logo-primary: #F1F5F9;
  --logo-signal: #FF6B35;
  --logo-blue: #60A5FA;
  --logo-white: #F1F5F9;
}
```

---

## 📏 Spacing Scale

Based on 8px base unit:

```javascript
xs: '8px',    // 0.5rem
sm: '16px',   // 1rem
md: '24px',   // 1.5rem
lg: '32px',   // 2rem
xl: '48px',   // 3rem
2xl: '64px',  // 4rem
3xl: '96px',  // 6rem
```

**Usage:**
- Section padding: `py-2xl` (64px vertical)
- Component gaps: `gap-md` (24px)
- Inline spacing: `gap-sm` (16px)
- Stacked content: `space-y-lg` (32px)

---

## 🔤 Typography Scale

### Display Headings (Outfit, Black, Uppercase)

```javascript
'hero': 'text-4xl md:text-6xl lg:text-7xl',  // 56-72px
'section': 'text-3xl md:text-4xl',            // 36-48px
'component': 'text-xl',                       // 20px
```

### Body Text (Inter/Roboto)

```javascript
'primary': 'text-base',    // 16px, line-height: 1.6
'secondary': 'text-sm',    // 14px, helper text
'micro': 'text-xs',        // 12px, timestamps, IDs
```

### Monospace (Roboto Mono)

```javascript
'technical': 'text-xs font-mono',  // 12px, IDs, codes
'button': 'text-xs uppercase tracking-wide',  // 10-12px, CTAs
```

---

## 📐 Container Max Widths

```javascript
'hero': '1000px',      // Focused attention
'content': '1400px',   // Briefings, results
'wide': '1400px',      // Full-width sections
```

---

## 🎯 Border Radius

```javascript
'sm': '8px',      // rounded-lg
'md': '12px',     // rounded-xl
'lg': '16px',     // rounded-2xl
'xl': '24px',     // rounded-3xl
```

**Usage:**
- Cards: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-lg` or `rounded-xl`
- Modals: `rounded-2xl`
- Inputs: `rounded-lg`

---

## 🌓 Dark Mode Patterns

### Background Pattern
```tsx
className="bg-white dark:bg-slate-900"
```

### Text Pattern
```tsx
className="text-gray-900 dark:text-gray-100"  // Headings
className="text-gray-700 dark:text-gray-200"   // Body
className="text-gray-600 dark:text-gray-300"  // Secondary
```

### Border Pattern
```tsx
className="border border-gray-200/60 dark:border-slate-700/50"
```

### Elevated Panel Pattern
```tsx
className="bg-white dark:bg-slate-800"
```

### Interactive Element Pattern
```tsx
className="bg-bureau-signal dark:bg-planner-orange text-white"
```

---

## 🎨 Opacity Values

```javascript
'full': '1',      // 100%
'90': '0.9',      // 90%
'80': '0.8',      // 80%
'60': '0.6',      // 60% (borders)
'50': '0.5',      // 50% (subtle borders)
'40': '0.4',      // 40%
'20': '0.2',      // 20% (focus rings)
'10': '0.1',      // 10% (subtle backgrounds)
```

**Usage:**
- Borders: `/60` or `/50` for subtlety
- Backgrounds: `/90` for semi-transparent overlays
- Focus rings: `/20` for subtle highlights

---

## 🔄 Transition Timing

**Note:** Currently disabled globally per design system requirements.

When re-enabled:
```javascript
'fast': '150ms',      // Quick interactions
'normal': '200ms',    // Standard transitions
'slow': '300ms',      // Deliberate animations
```

**Easing:**
- `ease-out` - Natural deceleration
- `ease-in-out` - Smooth start and end

---

## 📱 Responsive Breakpoints

```javascript
'sm': '640px',    // Small tablets
'md': '768px',    // Tablets
'lg': '1024px',   // Laptops
'xl': '1280px',   // Desktops
'2xl': '1536px',  // Large desktops
```

---

## ♿ Accessibility Tokens

### Contrast Ratios (WCAG AA Minimum)

```javascript
'text-primary': '4.5:1',      // Minimum for body text
'text-heading': '4.5:1',      // Minimum for headings
'ui-element': '3:1',          // Minimum for UI elements
```

### Touch Targets

```javascript
'minimum': '44x44px',         // All interactive elements
'spacing': '8-16px',          // Gap between touch targets
```

### Focus States

```tsx
className="focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
```

---

## 🎯 Usage Guidelines

### When to Use Each Color

**Primary Actions:**
- Light Mode: `planner-orange` background, white text
- Dark Mode: `planner-orange` background, white text (maintains brand)

**Links:**
- Light Mode: `bureau-signal` (#2563EB)
- Dark Mode: `blue-400` (#60A5FA) for better contrast

**Text Hierarchy:**
- Headings: Always highest contrast (gray-900 / gray-100)
- Body: Medium contrast (gray-700 / gray-200)
- Secondary: Lower contrast (gray-600 / gray-300)

**Borders:**
- Always use opacity (`/50` or `/60`) for subtlety
- Light: `gray-200/60`
- Dark: `slate-700/50`

---

## 📝 Implementation Notes

1. **Always provide dark mode variants** for new components
2. **Test contrast ratios** in both light and dark modes
3. **Use Tailwind standard colors** (`slate`, `gray`) for dark mode consistency
4. **Maintain brand colors** (`planner-orange`) in both modes
5. **Use opacity** for borders and subtle backgrounds
6. **Test on real devices** to ensure readability

---

**Status:** ✅ All design tokens documented and ready for use across the application.
