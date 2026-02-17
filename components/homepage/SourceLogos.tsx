import React from 'react';

export const SourceLogos: React.FC = () => {
  const sources = [
    'McKinsey & Company',
    'Boston Consulting Group',
    'Gartner',
    'Google',
    'Anthropic',
    'OpenAI'
  ];

  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '3rem 1.5rem',
      borderTop: '1px solid rgba(248, 246, 240, 0.08)',
      borderBottom: '1px solid rgba(248, 246, 240, 0.08)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(248, 246, 240, 0.5)',
          marginBottom: '1rem',
        }}>
          Intelligence from tier-1 sources:
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          {sources.map((source, index) => (
            <React.Fragment key={source}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(248, 246, 240, 0.4)',
              }}>
                {source}
              </span>
              {index < sources.length - 1 && (
                <span style={{
                  color: 'rgba(248, 246, 240, 0.2)',
                  fontSize: '0.75rem',
                }}>
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
