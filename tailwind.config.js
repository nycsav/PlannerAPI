/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        '2xl': '64px',
        '3xl': '96px',
      },
      maxWidth: {
        'hero': '1000px',
        'content': '1400px',
        'wide': '1400px',
      },
      colors: {
        'planner-navy': '#1B365D',
        'planner-orange': '#FF6B35',
        'planner-offwhite': '#F8F6F0',
        // Keep bureau colors for backward compatibility
        'bureau-surface': '#FFFFFF',
        'bureau-ink': '#0F172A',
        'bureau-signal': '#2563EB',
        'bureau-slate': '#475569',
        'bureau-border': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Roboto', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-lg': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body-base': ['0.9375rem', { lineHeight: '1.6' }],
        'system-xs': ['0.75rem', { lineHeight: '1', letterSpacing: '0.05em' }],
      },
      letterSpacing: {
        'tightest': '-0.04em',
      }
    }
  },
  plugins: [],
}
