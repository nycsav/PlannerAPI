import React from 'react';

const RECENT_SIGNALS = [
  {
    date: 'Feb 15, 2026',
    title: 'OpenAI Cuts Operator Pricing 40% to Compete with Anthropic',
    summary: 'OpenAI reduced Operator from $200/mo to $120/mo after Anthropic Computer Use captured 23% enterprise market share in 60 days. Procurement teams should renegotiate contracts signed in January.',
    sources: 'OpenAI Pricing Update • Anthropic Q1 Enterprise Report',
  },
  {
    date: 'Feb 12, 2026',
    title: 'McKinsey: Agent Evaluation Requires "Step-Change" in Methodology',
    summary: 'Traditional AI evaluation (accuracy, speed) fails for agentic systems. New framework: task completion rate, error recovery, cost per workflow. Download McKinsey\'s 5-factor agent scorecard.',
    sources: 'McKinsey Digital Quarterly • Anthropic Safety Research',
  },
  {
    date: 'Feb 8, 2026',
    title: 'Google Gemini 2.0 Enables Multimodal Agents Without Fine-Tuning',
    summary: 'Gemini 2.0\'s native multimodality (text, image, video, code) removes fine-tuning bottleneck. Agencies can now deploy custom agents in days vs. months. Lowers barrier for mid-market.',
    sources: 'Google AI Blog • Gartner Magic Quadrant for Enterprise AI',
  },
  {
    date: 'Feb 3, 2026',
    title: 'The 78/6 Gap: AI Adoption Outpaces AI Maturity by 12x',
    summary: '78% of marketing orgs adopted AI in 2025, but only 6% achieved "AI maturity" (McKinsey definition: standardized workflows, ROI measurement, governance). The maturity gap creates competitive advantage window for early movers.',
    sources: 'McKinsey Q1 2026 Marketing Survey',
  },
];

interface RecentSignalsProps {
  onBriefClick?: (signal: typeof RECENT_SIGNALS[0]) => void;
}

export const RecentSignals: React.FC<RecentSignalsProps> = ({ onBriefClick }) => {
  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border-light)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Signals You Would Have Missed This Month
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          Without PlannerAPI, you&apos;d need subscriptions to 10 sources, daily monitoring, and hours of synthesis.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {RECENT_SIGNALS.map((signal, i) => (
            <article
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => onBriefClick?.(signal)}
              onKeyDown={(e) => e.key === 'Enter' && onBriefClick?.(signal)}
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--overlay-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-medium)';
                e.currentTarget.style.borderColor = 'var(--text-muted-20)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-subtle)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--accent)',
                marginBottom: '0.5rem',
              }}>
                {signal.date}
              </p>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--cream)',
                marginBottom: '0.5rem',
              }}>
                {signal.title}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}>
                {signal.summary}
              </p>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.7rem',
                color: 'var(--text-muted-50)',
              }}>
                Sources: {signal.sources}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
