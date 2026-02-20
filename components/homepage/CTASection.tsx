import React from 'react';
import { Sparkles } from 'lucide-react';

interface CTASectionProps {
  onQueryClick?: (query: string) => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onQueryClick }) => {
  const exampleQueries = [
    'Latest AI attribution trends',
    'CMO AI adoption strategies',
    'Marketing automation ROI data'
  ];

  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'var(--overlay-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}>
          <Sparkles
            size={18}
            style={{ color: 'var(--accent)' }}
          />
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--cream)',
            letterSpacing: '-0.02em',
          }}>
            Start your intelligence search
          </h2>
        </div>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--text-muted-60)',
          marginBottom: '1rem',
          maxWidth: '600px',
          margin: '0 auto 1rem',
        }}>
          Try one of these popular queries or ask your own question
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
        }}>
          {exampleQueries.map((query) => (
            <button
              key={query}
              onClick={() => onQueryClick?.(query)}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--overlay-medium)',
                border: '1px solid var(--overlay-border)',
                borderRadius: '50px',
                color: 'var(--cream)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-hover)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-medium)';
                e.currentTarget.style.borderColor = 'var(--overlay-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {query}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
