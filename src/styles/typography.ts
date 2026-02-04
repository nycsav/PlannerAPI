/**
 * Unified Typography System for PlannerAPI
 *
 * Usage:
 * import { getTypographyClasses } from '@/styles/typography';
 * <h1 className={getTypographyClasses('display')}>Heading</h1>
 */

export const typography = {
  // Display (Hero headlines)
  display: {
    size: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl',
    weight: 'font-black',
    lineHeight: 'leading-tight',
    tracking: 'tracking-tight',
    family: 'font-display'
  },

  // H1 (Page titles)
  h1: {
    size: 'text-3xl sm:text-4xl lg:text-5xl',
    weight: 'font-bold',
    lineHeight: 'leading-tight',
    tracking: 'tracking-tight'
  },

  // H2 (Section headings)
  h2: {
    size: 'text-2xl sm:text-3xl lg:text-4xl',
    weight: 'font-bold',
    lineHeight: 'leading-snug',
    tracking: 'tracking-tight'
  },

  // H3 (Card titles, subsection headings)
  h3: {
    size: 'text-xl sm:text-2xl',
    weight: 'font-semibold',
    lineHeight: 'leading-snug'
  },

  // H4 (Small headings)
  h4: {
    size: 'text-lg sm:text-xl',
    weight: 'font-semibold',
    lineHeight: 'leading-normal'
  },

  // Body Large (Intro paragraphs, emphasis)
  bodyLarge: {
    size: 'text-lg sm:text-xl',
    weight: 'font-normal',
    lineHeight: 'leading-relaxed'
  },

  // Body (Default text)
  body: {
    size: 'text-base',
    weight: 'font-normal',
    lineHeight: 'leading-relaxed'
  },

  // Body Small (Secondary text)
  bodySmall: {
    size: 'text-sm',
    weight: 'font-normal',
    lineHeight: 'leading-normal'
  },

  // Caption (Metadata, timestamps, labels)
  caption: {
    size: 'text-xs sm:text-sm',
    weight: 'font-normal',
    lineHeight: 'leading-tight'
  },

  // Label (Buttons, badges, tags)
  label: {
    size: 'text-sm sm:text-base',
    weight: 'font-semibold',
    lineHeight: 'leading-none'
  },

  // Overline (Small caps, category labels)
  overline: {
    size: 'text-xs',
    weight: 'font-semibold',
    lineHeight: 'leading-tight',
    tracking: 'tracking-wider uppercase'
  }
};

/**
 * Helper function to combine typography styles into a single className string
 */
export const getTypographyClasses = (variant: keyof typeof typography): string => {
  const styles = typography[variant];
  return Object.values(styles).join(' ');
};

/**
 * Type-safe typography variants
 */
export type TypographyVariant = keyof typeof typography;
