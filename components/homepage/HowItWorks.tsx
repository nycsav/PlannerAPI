import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Automated Research',
    body: 'Every Mon/Wed/Fri at 6am ET, we scan McKinsey, Gartner, Forrester, BCG, plus OpenAI and Anthropic for the latest reports.',
  },
  {
    number: '02',
    title: 'Cross-Reference & Analyze',
    body: 'At 7am ET, Claude Sonnet synthesizes across sources — matching platform launches to ROI frameworks.',
  },
  {
    number: '03',
    title: '3 Signals, Client-Ready',
    body: 'By 8am ET: 3 intelligence cards with data signals, implications, and next moves. Ready to drop into client presentations.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      style={{
        backgroundColor: 'var(--navy)',
        padding: '80px 120px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        minHeight: '480px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '60px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            margin: 0,
          }}
        >
          The System
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '34px',
            color: 'var(--text)',
            maxWidth: '540px',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          From tier-1 research to client-ready in 90 minutes
        </h2>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'flex', gap: 0 }}>
        {steps.map((step, i) => (
          <div
            key={step.number}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: i === 0 ? '0 40px 0 0' : i === 1 ? '0 40px' : '0 0 0 40px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                fontSize: '40px',
                color: 'var(--orange)',
                lineHeight: 1,
              }}
            >
              {step.number}
            </span>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--muted)',
                margin: 0,
              }}
            >
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
