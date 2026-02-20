import React from 'react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onSignupClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onSignupClick }) => {
  return (
    <section
      style={{
        padding: '80px 120px',
        backgroundColor: 'var(--navy)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '32px',
        minHeight: '640px',
        boxSizing: 'border-box',
      }}
    >
      {/* Vol label — top right */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          VOL. 01 — 2026
        </span>
      </div>

      {/* Accent line group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '2px',
            height: '80px',
            backgroundColor: 'var(--orange)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          AGENTIC SHIFT INTELLIGENCE
        </span>
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: '64px',
          lineHeight: 1.1,
          color: 'var(--text)',
          maxWidth: '720px',
          margin: 0,
        }}
      >
        The signal exists. Most teams are still reading noise.
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          lineHeight: 1.7,
          color: 'var(--muted)',
          maxWidth: '580px',
          margin: 0,
        }}
      >
        Marketing orgs adopted AI at 78% in 2025. Only 6% reached maturity. The gap isn&apos;t tools — it&apos;s intelligence. signal2noise delivers 3 daily briefs synthesized from McKinsey, Gartner, and Google so your team moves on signal, not speculation.
      </p>

      {/* Value prop */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--orange)',
          margin: 0,
        }}
      >
        3 SIGNALS DAILY. TIER-1 SOURCES ONLY. ZERO RESEARCH TIME.
      </p>

      {/* CTA group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={() => onSignupClick?.()}
          style={{
            padding: '14px 32px',
            backgroundColor: 'var(--orange)',
            color: 'var(--navy)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          GET DAILY SIGNALS
        </button>
        <button
          type="button"
          onClick={() => onSearch?.('example')}
          style={{
            padding: '14px 32px',
            backgroundColor: 'transparent',
            color: 'var(--orange)',
            border: '1px solid var(--orange)',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          SEE EXAMPLE
        </button>
      </div>

      {/* Bottom divider */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}
        >
          Powered by Tier-1 Research
        </span>
      </div>
    </section>
  );
};
