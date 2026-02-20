import React from 'react';

const TIER1 = ['McKinsey', 'Gartner', 'Forrester', 'BCG', 'Bain', 'Deloitte'];
const TIER2 = ['OpenAI', 'Anthropic', 'Google AI', 'Meta AI'];

const pillBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 14px',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export const SourceLogos: React.FC = () => {
  return (
    <section
      style={{
        backgroundColor: 'var(--navy)',
        padding: '60px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        minHeight: '280px',
        boxSizing: 'border-box',
      }}
    >
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Tier-1 Intelligence Sources
      </p>

      {/* Tier 1 row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        {TIER1.map((name) => (
          <span
            key={name}
            style={{
              ...pillBase,
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            {name}
          </span>
        ))}
      </div>

      {/* Tier 2 row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        {TIER2.map((name) => (
          <span
            key={name}
            style={{
              ...pillBase,
              color: 'var(--orange)',
              border: '1px solid rgba(230, 126, 34, 0.4)',
              backgroundColor: 'rgba(230, 126, 34, 0.05)',
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
};
