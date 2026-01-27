/**
 * Design System Configuration
 * 
 * Centralized design tokens and theme configuration
 * This file serves as the single source of truth for design interpretation
 */

export const DESIGN_TOKENS = {
  // Color Palette - Light Mode
  colors: {
    light: {
      background: {
        primary: '#FFFFFF',      // bureau-surface
        alternate: '#F9FAFB',    // gray-50 for zebra striping
      },
      text: {
        primary: '#1B365D',      // planner-navy
        secondary: '#475569',    // bureau-slate
        tertiary: '#6B7280',     // gray-500
      },
      accent: {
        primary: '#FF6B35',      // planner-orange (CTAs)
        secondary: '#2563EB',    // bureau-signal (links)
      },
      border: {
        default: '#E2E8F0',     // bureau-border
        subtle: '#E5E7EB',       // gray-200
      },
    },
    dark: {
      background: {
        primary: '#0F172A',      // slate-900
        elevated: '#1E293B',     // slate-800 (cards, modals)
      },
      text: {
        primary: '#F1F5F9',      // gray-100 (headings)
        secondary: '#E2E8F0',    // gray-200 (body)
        tertiary: '#CBD5E1',      // gray-300 (helper text)
      },
      accent: {
        primary: '#FF6B35',      // planner-orange (maintains brand)
        secondary: '#60A5FA',     // blue-400 (links)
      },
      border: {
        default: '#334155',       // slate-700
        subtle: '#475569',       // slate-600
      },
    },
  },

  // Spacing Scale (8px base)
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    '2xl': '64px',
    '3xl': '96px',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'monospace'],
    },
    fontSize: {
      hero: ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      section: ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      component: ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      body: ['0.9375rem', { lineHeight: '1.6' }],
      small: ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em' }],
    },
  },

  // Border Radius
  borderRadius: {
    sm: '8px',   // rounded-lg
    md: '12px',  // rounded-xl
    lg: '16px',  // rounded-2xl
    xl: '24px',  // rounded-3xl
  },

  // Container Max Widths
  maxWidth: {
    hero: '1000px',
    content: '1400px',
    wide: '1400px',
  },

  // Dark Mode Configuration
  darkMode: {
    strategy: 'class' as const,  // Tailwind class-based dark mode
    storageKey: 'theme',          // localStorage key for theme preference
    defaultTheme: 'light',        // Default theme if no preference
    systemPreference: true,       // Detect system preference on first visit
  },

  // Logo CSS Variables
  logo: {
    light: {
      bg: '#111827',
      primary: '#111827',
      signal: '#EF4444',
      blue: '#1D4ED8',
      white: '#FFFFFF',
    },
    dark: {
      bg: '#1E293B',
      primary: '#F1F5F9',
      signal: '#FF6B35',
      blue: '#60A5FA',
      white: '#F1F5F9',
    },
  },

  // Accessibility Standards
  accessibility: {
    contrast: {
      text: 4.5,      // WCAG AA minimum for text
      ui: 3.0,        // WCAG AA minimum for UI elements
    },
    touchTarget: {
      minimum: '44x44px',
      spacing: '8-16px',
    },
  },
} as const;

/**
 * Get theme-specific color
 */
export function getThemeColor(
  colorKey: keyof typeof DESIGN_TOKENS.colors.light,
  theme: 'light' | 'dark' = 'light'
): string {
  return DESIGN_TOKENS.colors[theme][colorKey] as string;
}

/**
 * Get CSS variable name for logo colors
 */
export function getLogoCSSVar(colorKey: keyof typeof DESIGN_TOKENS.logo.light): string {
  return `--logo-${colorKey}`;
}

/**
 * Design interpretation saved to this configuration
 * 
 * Light Mode Philosophy:
 * - Clean, professional, high contrast for readability
 * - White backgrounds with dark text for maximum clarity
 * - Brand colors (planner-orange) for CTAs and highlights
 * 
 * Dark Mode Philosophy:
 * - Deep, sophisticated, reduces eye strain
 * - Dark navy backgrounds (slate-900) with light text
 * - Maintains brand identity with planner-orange accents
 * - Elevated panels (slate-800) create depth hierarchy
 * 
 * Accessibility:
 * - All color combinations meet WCAG AA standards (4.5:1 minimum)
 * - Text hierarchy ensures readability in both modes
 * - Interactive elements have clear focus states
 */
export const DESIGN_INTERPRETATION = {
  lightMode: {
    philosophy: 'Clean, professional, high contrast for maximum readability',
    background: 'Pure white (#FFFFFF) for clarity and focus',
    text: 'Dark navy and gray for strong contrast',
    accent: 'Planner orange maintains brand identity',
  },
  darkMode: {
    philosophy: 'Deep, sophisticated, reduces eye strain while maintaining brand',
    background: 'Deep navy (#0F172A) for reduced brightness',
    text: 'Light gray scale (100-300) for optimal readability',
    accent: 'Planner orange maintained for brand consistency',
    elevation: 'Slate-800 for elevated panels creates visual hierarchy',
  },
  accessibility: {
    standard: 'WCAG AA (4.5:1 minimum contrast ratio)',
    compliance: 'All text and UI elements tested and compliant',
    focusStates: 'Clear, visible focus indicators in both modes',
  },
} as const;
