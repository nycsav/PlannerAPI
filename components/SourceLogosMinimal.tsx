import React from 'react';

const BG = '#0A1128';
const ACCENT = '#E67E22';
const TEXT = '#F5F5F5';
const MUTED = 'rgba(245, 245, 245, 0.65)';

const TIER_1 = ['McKinsey', 'Gartner', 'Forrester', 'BCG', 'Bain', 'Deloitte'];
const TIER_2 = ['OpenAI', 'Anthropic', 'Google AI', 'Meta'];

export const SourceLogosMinimal: React.FC = () => {
  return (
    <section
      id="sources"
      style={{
        backgroundColor: BG,
        padding: '80px 1.5rem',
        borderTop: '1px solid rgba(245,245,245,0.1)',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: '32px',
          }}
        >
          Tier-1 & Tier-2 Sources
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 16px', marginBottom: '24px' }}>
          {TIER_1.map((name) => (
            <span
              key={name}
              style={{
                padding: '8px 16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: TEXT,
                border: '1px solid rgba(245,245,245,0.2)',
                borderRadius: 0,
              }}
            >
              {name}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 16px', marginBottom: '32px' }}>
          {TIER_2.map((name) => (
            <span
              key={name}
              style={{
                padding: '8px 16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: TEXT,
                border: '1px solid rgba(245,245,245,0.2)',
                borderRadius: 0,
              }}
            >
              {name}
            </span>
          ))}
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: MUTED,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          If procurement and the C-suite won&apos;t cite it, we don&apos;t cover it.
        </p>
      </div>
    </section>
  );
};
