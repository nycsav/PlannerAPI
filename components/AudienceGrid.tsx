import React, { useState } from 'react';

const BG = '#0A1128';
const ACCENT = '#E67E22';
const TEXT = '#F5F5F5';
const MUTED = 'rgba(245, 245, 245, 0.65)';

const cards = [
  {
    icon: '🎯',
    title: 'Agency Strategists',
    subtitle: 'Strategy & Planning',
    useCase:
      "Client asks: 'Should we build or buy AI agents?' You forward PlannerAPI's latest Operator vs. Computer Use comparison with cost analysis.",
  },
  {
    icon: '🔬',
    title: 'Research Teams',
    subtitle: 'Brand & Marketing Research',
    useCase:
      "CMO asks: 'How do we measure brand lift when 40% of searches show AI summaries?' You cite Gartner's new attribution model from this week's intelligence.",
  },
  {
    icon: '💼',
    title: 'Independent Consultants',
    subtitle: 'Marketing Consultants',
    useCase:
      "Retainer client asks: 'What's new in marketing AI?' You forward this week's 3 signals—billed as ongoing competitive intelligence.",
  },
  {
    icon: '🏢',
    title: 'Agency Leadership',
    subtitle: 'Owners & VPs',
    useCase:
      "OpenAI drops Operator pricing 40%. You immediately audit which clients are overpaying for incumbent solutions and pitch cost-optimization projects.",
  },
];

export const AudienceGrid: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section
      id="who-this-is-for"
      style={{
        backgroundColor: BG,
        padding: '80px 1.5rem 120px',
        borderTop: '1px solid rgba(245,245,245,0.1)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card, i) => {
            const isExpanded = expanded === i;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="sm:block hidden"
                style={{
                  textAlign: 'left',
                  padding: '48px',
                  backgroundColor: 'rgba(245,245,245,0.04)',
                  border: '1px solid rgba(245,245,245,0.12)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minHeight: isExpanded ? '220px' : '160px',
                  transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isExpanded ? '0 0 24px rgba(230, 126, 34, 0.15)' : 'none',
                }}
                onMouseEnter={() => setExpanded(i)}
                onMouseLeave={() => setExpanded(null)}
              >
                <span style={{ fontSize: '64px', lineHeight: 1, marginBottom: '16px', display: 'block' }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: TEXT,
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  {card.title}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: MUTED,
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {card.subtitle}
                </span>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    color: MUTED,
                    maxHeight: isExpanded ? '120px' : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.2s ease',
                  }}
                >
                  {card.useCase}
                </div>
              </button>
            );
          })}
        </div>
        {/* Mobile: stacked, tap to expand (only one at a time) */}
        <div className="sm:hidden flex flex-col gap-3">
          {cards.map((card, i) => {
            const isExpanded = expanded === i;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setExpanded(isExpanded ? null : i)}
                style={{
                  textAlign: 'left',
                  padding: '32px',
                  backgroundColor: 'rgba(245,245,245,0.04)',
                  border: `1px solid ${isExpanded ? ACCENT : 'rgba(245,245,245,0.12)'}`,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <span style={{ fontSize: '48px', lineHeight: 1, marginBottom: '12px', display: 'block' }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: TEXT,
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  {card.title}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.8125rem',
                    color: MUTED,
                    display: 'block',
                    marginBottom: '0.75rem',
                  }}
                >
                  {card.subtitle}
                </span>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    lineHeight: 1.45,
                    color: MUTED,
                    maxHeight: isExpanded ? '200px' : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.25s ease-in-out',
                  }}
                >
                  {card.useCase}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
