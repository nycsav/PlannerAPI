import React from 'react';

export interface StatCalloutProps {
  stat?: string;
  label?: string;
  context?: string;
  source?: string;
}

/* All colors hardcoded for dark theme so section is always visible */
const STAT_BG = '#0d1321';
const STAT_TEXT = '#F5F5F5';
const STAT_MUTED = 'rgba(248, 246, 240, 0.7)';
const STAT_ORANGE = '#E67E22';

export const StatCallout: React.FC<StatCalloutProps> = ({
  stat = '78/6',
  label = 'The AI Maturity Gap',
  context = '78% of marketing orgs adopted AI in 2025. Only 6% achieved maturity. The gap creates compounding competitive disadvantage through Q4 2026.',
  source = 'MCKINSEY Q1 2026 MARKETING SURVEY',
}) => {
  return (
    <section
      aria-label={`Key stat: ${label}`}
      style={{
        backgroundColor: STAT_BG,
        padding: '80px 0',
        borderTop: '1px solid rgba(230, 126, 34, 0.2)',
        borderBottom: '1px solid rgba(230, 126, 34, 0.2)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            fontSize: 'clamp(80px, 12vw, 144px)',
            lineHeight: 0.9,
            color: STAT_ORANGE,
            marginBottom: '28px',
          }}
        >
          {stat}
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '32px',
            color: STAT_TEXT,
            marginBottom: '24px',
          }}
        >
          {label}
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '17px',
            lineHeight: 1.8,
            color: STAT_MUTED,
            marginBottom: '24px',
          }}
        >
          {context}
        </p>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: STAT_ORANGE,
          }}
        >
          {source}
        </p>
      </div>
    </section>
  );
};
