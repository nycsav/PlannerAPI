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
      padding: '4rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'rgba(248, 246, 240, 0.03)',
        border: '1px solid rgba(248, 246, 240, 0.1)',
        borderRadius: '12px',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
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
          color: 'rgba(248, 246, 240, 0.6)',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
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
                backgroundColor: 'rgba(248, 246, 240, 0.06)',
                border: '1px solid rgba(248, 246, 240, 0.15)',
                borderRadius: '50px',
                color: 'var(--cream)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 246, 240, 0.1)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(248, 246, 240, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(248, 246, 240, 0.15)';
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
