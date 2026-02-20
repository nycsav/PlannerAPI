import React from 'react';

export interface ExampleCardProps {
  title: string;
  summary: string;
  signals: string[];
  nextMove: string;
  sources: string[];
}

export const ExampleCard: React.FC<ExampleCardProps> = ({
  title,
  summary,
  signals,
  nextMove,
  sources,
}) => {
  return (
    <section
      aria-label="Example intelligence brief"
      style={{
        backgroundColor: 'var(--navy)',
        padding: '80px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
      }}
    >
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--orange)',
          alignSelf: 'center',
        }}
      >
        Example Intelligence Brief
      </p>
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          padding: '64px',
          border: '2px solid rgba(230, 126, 34, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: '28px',
            lineHeight: 1.3,
            color: 'var(--text)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--muted)',
            margin: 0,
          }}
        >
          {summary}
        </p>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            margin: 0,
          }}
        >
          Signals
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {signals.map((signal, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid var(--orange)',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                  flexShrink: 0,
                  marginTop: '5px',
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                }}
              >
                {signal}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            margin: 0,
          }}
        >
          Next Move
        </p>
        <div
          style={{
            borderLeft: '2px solid var(--orange)',
            paddingLeft: '16px',
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {nextMove}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sources.map((src) => (
            <span
              key={src}
              style={{
                padding: '4px 10px',
                fontSize: '9px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--orange)',
                border: '1px solid rgba(230, 126, 34, 0.4)',
                backgroundColor: 'rgba(230, 126, 34, 0.05)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
