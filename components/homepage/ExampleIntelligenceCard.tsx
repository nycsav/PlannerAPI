import React from 'react';

interface ExampleIntelligenceCardProps {
  onAskFollowUp?: () => void;
}

export const ExampleIntelligenceCard: React.FC<ExampleIntelligenceCardProps> = ({ onAskFollowUp }) => {
  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--text-muted-45)',
          marginBottom: '1rem',
        }}>
          Example Intelligence Card
        </p>
        <article style={{
          backgroundColor: 'var(--overlay-subtle)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '4px solid #818cf8',
          borderRadius: '4px',
          padding: '1.5rem',
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.35rem',
            fontWeight: 600,
            color: 'var(--cream)',
            lineHeight: 1.3,
            marginBottom: '1rem',
          }}>
            The 94% Problem: Most Marketing Teams Can&apos;t Evaluate AI Agents
          </h3>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '1rem',
          }}>
            McKinsey&apos;s Q1 2026 survey shows 78% of marketing orgs adopted AI, but only 6% have frameworks to evaluate agentic systems. Meanwhile, OpenAI Operator ($200/mo unlimited tasks) and Anthropic Computer Use are in production at Fortune 500 companies—creating a procurement crisis for teams without evaluation criteria.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              marginBottom: '0.5rem',
            }}>
              SIGNALS
            </p>
            <ul style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              paddingLeft: '1.25rem',
              margin: 0,
            }}>
              <li>OpenAI Operator costs $200/month for unlimited browser automation tasks</li>
              <li>Only 6% of marketing organizations have agent evaluation frameworks (McKinsey, Jan 2026)</li>
              <li>Anthropic Computer Use deployed at 15 F500 companies for desktop automation</li>
              <li>22% efficiency gains reported by AI-mature marketing teams vs. 3% for beginners</li>
            </ul>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              marginBottom: '0.5rem',
            }}>
              YOUR NEXT MOVE
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              Build a 30-day pilot comparing Operator vs. Computer Use on 3 repetitive tasks: (1) Competitor monitoring, (2) Data entry, (3) Report generation. Track cost per task vs. human baseline, error rate, setup time. Use findings to build agent procurement criteria before Q2 budget cycle.
            </p>
          </div>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.7rem',
            color: 'var(--text-muted-50)',
            marginBottom: '1rem',
          }}>
            Sources: McKinsey Q1 2026 Marketing AI Survey • OpenAI Product Launch • Anthropic Enterprise Case Studies
          </p>
          <button
            type="button"
            onClick={onAskFollowUp}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Ask a follow-up question →
          </button>
        </article>
      </div>
    </section>
  );
};
