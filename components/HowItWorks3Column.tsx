import React from 'react';

const steps = [
  {
    badge: '01',
    title: 'Automated Research',
    description:
      'Mon/Wed/Fri at 6am ET we scan McKinsey, Gartner, Forrester, BCG, OpenAI, Anthropic, Google for latest reports and launches.',
  },
  {
    badge: '02',
    title: 'Cross-Reference & Analyze',
    description:
      'Daily at 7am ET Claude synthesizes across sources. Example: OpenAI Operator → McKinsey agent frameworks → ROI comparison.',
  },
  {
    badge: '03',
    title: '3 Signals, Client-Ready',
    description:
      'By 8am ET you have 3 intelligence cards with signals, implications, and next moves. Ready for client presentations.',
  },
];

export const HowItWorks3Column: React.FC = () => {
  return (
    <section
      id="how-it-works"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '80px 120px',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div
        className="how-it-works-inner"
        style={{ maxWidth: '1100px', margin: '0 auto' }}
      >
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--orange)',
              marginBottom: '16px',
            }}
          >
            THE SYSTEM
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '36px',
              lineHeight: 1.2,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            From tier-1 research to client-ready in 90 minutes
          </h2>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20 items-start"
          style={{ position: 'relative' }}
        >
          {/* Desktop: horizontal line between columns */}
          <div
            className="hidden md:block absolute top-8 left-0 right-0 h-px"
            style={{
              backgroundColor: 'var(--border-subtle)',
              width: '66%',
              left: '16.66%',
            }}
            aria-hidden
          />
          {steps.map((step, i) => (
            <div
              key={step.badge}
              className="flex flex-col md:items-center text-center md:pt-0 pt-6 first:pt-0"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {/* Mobile: arrow between steps */}
              {i > 0 && (
                <div
                  className="md:hidden flex justify-center mb-4 -mt-2"
                  style={{ color: 'var(--orange)' }}
                  aria-hidden
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              )}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '0',
                  backgroundColor: 'var(--orange)',
                  color: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  marginBottom: '1rem',
                  flexShrink: 0,
                }}
              >
                {step.badge}
              </div>
              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: 'var(--text)',
                  marginBottom: '0.5rem',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9375rem',
                  lineHeight: 1.5,
                  color: 'var(--muted)',
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
