import React from 'react';
import { Target, Search, User, Building2 } from 'lucide-react';

const audiences = [
  {
    icon: Target,
    title: 'Agency Strategy & Planning',
    badge: 'Strategy',
    description: 'Cross-reference OpenAI vs. Anthropic for client recommendations. Use McKinsey ROI benchmarks in pitch decks. Stay ahead of procurement questions.',
    useCase: 'Client asks: "Should we build or buy AI agents?" You forward signal2noise's latest Operator vs. Computer Use comparison with cost analysis.',
  },
  {
    icon: Search,
    title: 'Brand & Marketing Research',
    badge: 'Research',
    description: 'Track measurement methodology shifts (attribution post-AI Overviews), competitive intelligence tools, performance frameworks.',
    useCase: 'CMO asks: "How do we measure brand lift when 40% of searches show AI summaries?" You cite Gartner\'s new attribution model from this week\'s intelligence.',
  },
  {
    icon: User,
    title: 'Independent Marketing Consultants',
    badge: 'Consulting',
    description: 'Productize your AI expertise. Forward intelligence cards to clients. Build thought leadership without research overhead.',
    useCase: 'Retainer client asks: "What\'s new in marketing AI?" You forward this week\'s 3 signals—billed as "ongoing competitive intelligence."',
  },
  {
    icon: Building2,
    title: 'Agency Owners & VPs',
    badge: 'Leadership',
    description: 'Understand platform shifts before they disrupt your service mix. Track consolidation trends, pricing changes, enterprise adoption patterns.',
    useCase: 'OpenAI drops Operator pricing 40%. You immediately audit which clients are overpaying for incumbent solutions and pitch cost-optimization projects.',
  },
];

export const WhoThisIsFor: React.FC = () => {
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
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}>
          Built for Strategists, Not Executives
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          textAlign: 'center',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}>
          You&apos;re the one clients ask: &quot;Which AI agent should we buy?&quot; You&apos;re the one writing the RFP criteria. You&apos;re the one who needs data, not hype.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {audiences.map((a, i) => {
            const IconComponent = a.icon;
            return (
            <div
              key={i}
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--overlay-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <IconComponent size={20} style={{ color: 'var(--accent)' }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                  padding: '0.25rem 0.5rem',
                  border: '1px solid var(--accent)',
                  borderRadius: '4px',
                }}>
                  {a.badge}
                </span>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--cream)',
                }}>
                  {a.title}
                </h3>
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '0.75rem',
              }}>
                {a.description}
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                color: 'var(--text-muted-60)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}>
                Use case: {a.useCase}
              </p>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
};
