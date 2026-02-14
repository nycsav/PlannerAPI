import React from 'react';

export interface BriefCardProps {
  title: string;
  pillar: 'Technology' | 'Markets' | 'Defense' | 'Policy';
  summary: string;
  source: string;
  readTime: string;
  date: string;
  index: number;
  onClick?: () => void;
}

const pillarStyles: Record<string, { borderColor: string; labelColor: string }> = {
  Technology: { borderColor: 'rgba(99, 102, 241, 0.5)', labelColor: '#818cf8' },
  Markets: { borderColor: 'rgba(34, 197, 94, 0.5)', labelColor: '#4ade80' },
  Defense: { borderColor: 'rgba(249, 115, 22, 0.5)', labelColor: '#fb923c' },
  Policy: { borderColor: 'rgba(59, 130, 246, 0.5)', labelColor: '#60a5fa' },
};

export const BriefCard: React.FC<BriefCardProps> = ({
  title,
  pillar,
  summary,
  source,
  readTime,
  date,
  onClick,
}) => {
  const style = pillarStyles[pillar] || pillarStyles.Policy;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        backgroundColor: 'rgba(248, 246, 240, 0.03)',
        border: '1px solid rgba(248, 246, 240, 0.1)',
        borderLeft: `3px solid ${style.borderColor}`,
        borderRadius: '4px',
        padding: '1.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(248, 246, 240, 0.2)';
        e.currentTarget.style.backgroundColor = 'rgba(248, 246, 240, 0.06)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(248, 246, 240, 0.1)';
        e.currentTarget.style.backgroundColor = 'rgba(248, 246, 240, 0.03)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: style.labelColor,
        }}>
          {pillar}
        </span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          color: 'rgba(248, 246, 240, 0.5)',
        }}>
          {date} · {readTime}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.35rem',
        fontWeight: 600,
        color: 'var(--cream)',
        lineHeight: 1.3,
        marginBottom: '0.75rem',
      }}>
        {title}
      </h3>

      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.9375rem',
        color: 'rgba(248, 246, 240, 0.7)',
        lineHeight: 1.6,
        marginBottom: '1rem',
      }}>
        {summary}
      </p>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.75rem',
        color: 'rgba(248, 246, 240, 0.5)',
      }}>
        {source}
      </div>
    </article>
  );
};
