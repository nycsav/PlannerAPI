import React, { useState } from 'react';

const TIER_1 = ['McKinsey & Company', 'Gartner', 'Forrester', 'Boston Consulting Group (BCG)', 'Bain & Company', 'Deloitte'];
const TIER_2 = ['OpenAI (product launches, research papers)', 'Anthropic (safety research, enterprise case studies)', 'Google (Gemini updates, AI Overviews data)', 'Meta (Llama research, advertising platform updates)'];

const SOURCE_LOGOS: { name: string; logoUrl: string }[] = [
  { name: 'McKinsey', logoUrl: 'https://logo.clearbit.com/mckinsey.com' },
  { name: 'Gartner', logoUrl: 'https://logo.clearbit.com/gartner.com' },
  { name: 'Forrester', logoUrl: 'https://logo.clearbit.com/forrester.com' },
  { name: 'OpenAI', logoUrl: 'https://logo.clearbit.com/openai.com' },
  { name: 'Anthropic', logoUrl: 'https://logo.clearbit.com/anthropic.com' },
  { name: 'Google', logoUrl: 'https://logo.clearbit.com/google.com' },
];

const SourceLogoItem: React.FC<{ source: { name: string; logoUrl: string } }> = ({ source }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const textStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-muted-50)',
  };
  return imgFailed ? (
    <span style={textStyle}>{source.name}</span>
  ) : (
    <img
      src={source.logoUrl}
      alt={source.name}
      title={source.name}
      style={{
        height: '24px',
        width: 'auto',
        maxWidth: '100px',
        objectFit: 'contain',
        opacity: 0.8,
        filter: 'var(--source-logo-filter)',
      }}
      onError={() => setImgFailed(true)}
    />
  );
};

export const SourceCredibility: React.FC = () => {
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
          Intelligence Sourced From Tier-1 Only
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
        }}>
          We track the agentic platform race (OpenAI, Anthropic, Google) and cross-reference with enterprise adoption data (McKinsey, Gartner, Forrester). You get: what&apos;s shipping, what it costs, what works.
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem 1.5rem',
          marginBottom: '2rem',
        }}>
          {SOURCE_LOGOS.map((source) => (
            <SourceLogoItem key={source.name} source={source} />
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--overlay-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              marginBottom: '0.75rem',
            }}>
              Tier 1: Premier Research
            </p>
            <ul style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              paddingLeft: '1.25rem',
              margin: 0,
            }}>
              {TIER_1.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--overlay-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              marginBottom: '0.75rem',
            }}>
              Tier 2: Platform Research
            </p>
            <ul style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              paddingLeft: '1.25rem',
              margin: 0,
            }}>
              {TIER_2.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.9rem',
          color: 'var(--text-muted-60)',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          Every signal cites tier-1 sources. No aggregated news, no Twitter threads, no speculation. If McKinsey didn&apos;t publish it or OpenAI didn&apos;t ship it, we don&apos;t cover it.
        </p>
      </div>
    </section>
  );
};
