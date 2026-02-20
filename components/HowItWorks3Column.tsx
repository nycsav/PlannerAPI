import React from 'react';

const BG = '#0A1128';
const ACCENT = '#E67E22';
const TEXT = '#F5F5F5';
const MUTED = 'rgba(245, 245, 245, 0.65)';

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
        backgroundColor: BG,
        padding: '80px 1.5rem 120px',
        borderTop: '1px solid rgba(245,245,245,0.1)',
      }}
    >
      <div
        className="how-it-works-inner"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20 items-start"
          style={{ position: 'relative' }}
        >
          {/* Desktop: horizontal line between columns */}
          <div
            className="hidden md:block absolute top-8 left-0 right-0 h-px"
            style={{
              backgroundColor: 'rgba(245,245,245,0.15)',
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
                  style={{ color: ACCENT }}
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
                  backgroundColor: ACCENT,
                  color: BG,
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
                  color: TEXT,
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
                  color: MUTED,
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
