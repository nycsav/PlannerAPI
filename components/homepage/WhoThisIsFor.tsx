import React from 'react';
import { Target, Search, User } from 'lucide-react';

const audiences = [
  {
    icon: Target,
    title: 'CMO',
    badge: 'CMO',
    description: 'You\'re fielding board questions about AI ROI before your team has the data. signal2noise gives you the McKinsey and Gartner anchors to answer with confidence, not speculation.',
    useCase: '',
  },
  {
    icon: Search,
    title: 'Agency Strategist',
    badge: 'Strategy',
    description: 'Your clients are asking which AI agents to buy. signal2noise tracks the competitive landscape daily so you\'re the one who already knows — before they ask.',
    useCase: '',
  },
  {
    icon: User,
    title: 'Head of Marketing Technology',
    badge: 'Martech',
    description: 'You\'re evaluating 40 vendors with overlapping claims. signal2noise cuts through with independent tier-1 benchmarks and real adoption data.',
    useCase: '',
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
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'var(--accent)',
          textAlign: 'center',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}>
          BUILT FOR
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          Intelligence for the people responsible for decisions
        </h2>
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
              {a.useCase ? (
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--text-muted-60)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}>
                  Use case: {a.useCase}
                </p>
              ) : null}
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
};
