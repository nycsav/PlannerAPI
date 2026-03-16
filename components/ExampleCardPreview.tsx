import React from 'react';

interface ExampleCardPreviewProps {
  onAskFollowUp?: () => void;
  label?: string;
}

export const ExampleCardPreview: React.FC<ExampleCardPreviewProps> = ({ onAskFollowUp, label }) => {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-card)',
        padding: '80px 120px',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {label ?? 'EXAMPLE INTELLIGENCE BRIEF'}
        </p>
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(24px, 3vw, 42px)',
            color: 'var(--text)',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          What You Get Daily
        </h2>
        <article
          style={{
            border: '2px solid rgba(230, 126, 34, 0.4)',
            borderRadius: '4px',
            padding: '80px 48px',
            backgroundColor: 'var(--overlay-subtle)',
          }}
        >
          <h3
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '32px',
              color: 'var(--text)',
              lineHeight: 1.3,
              marginBottom: '24px',
            }}
          >
            The 94% Problem: Most Marketing Teams Can&apos;t Evaluate AI Agents
          </h3>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              color: 'var(--muted)',
              lineHeight: 1.8,
              marginBottom: '24px',
            }}
          >
            McKinsey&apos;s Q1 2026 survey shows 78% of marketing orgs adopted AI, but only 6% have frameworks to evaluate agentic systems. Meanwhile, OpenAI Operator and Anthropic Computer Use are in production at Fortune 500 companies—creating a procurement crisis for teams without evaluation criteria.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: 'var(--orange)',
                marginBottom: '12px',
              }}
            >
              SIGNALS
            </p>
            <ul
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: 'var(--muted)',
                lineHeight: 1.7,
                paddingLeft: '20px',
                margin: 0,
                listStyle: 'none',
              }}
            >
              {[
                'OpenAI Operator: $200/mo unlimited browser automation',
                '6% of marketing orgs have agent evaluation frameworks (McKinsey, Jan 2026)',
                'Anthropic Computer Use deployed at 15 F500 companies',
                '22% efficiency gains for AI-mature teams vs. 3% for beginners',
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: '8px', position: 'relative', paddingLeft: '16px' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--orange)' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: 'var(--orange)',
                marginBottom: '8px',
              }}
            >
              YOUR NEXT MOVE
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: 'var(--muted)',
                lineHeight: 1.6,
              }}
            >
              Build a 30-day pilot comparing Operator vs. Computer Use on 3 repetitive tasks. Track cost per task, error rate, setup time. Use findings to build agent procurement criteria before Q2 budget cycle.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {['McKinsey Q1 2026', 'OpenAI Product', 'Anthropic Enterprise'].map((s) => (
              <span
                key={s}
                style={{
                  padding: '6px 12px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--text)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onAskFollowUp}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--orange)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Ask a follow-up question →
          </button>
        </article>
      </div>
    </section>
  );
};
