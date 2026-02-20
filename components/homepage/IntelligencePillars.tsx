import React from 'react';

const PILLARS = [
  {
    title: 'AI Strategy & Adoption',
    color: '#818cf8',
    description: 'OpenAI vs. Anthropic platform comparisons, McKinsey maturity frameworks, enterprise implementation costs, ROI benchmarks.',
    example: '"Operator vs. Computer Use: Which agent architecture fits mid-market budgets?"',
  },
  {
    title: 'Brand Performance & Measurement',
    color: '#60a5fa',
    description: 'Attribution models post-AI Overviews, brand lift studies, competitive intelligence tools, performance measurement frameworks.',
    example: '"Google AI Overviews now on 40% of commercial queries—new attribution methodology required"',
  },
  {
    title: 'Competitive Intelligence',
    color: '#E67E22',
    description: 'Market shifts, competitor moves, M&A implications, platform consolidation trends, agency restructuring.',
    example: '"WPP cuts 15K roles while investing $300M in AI—what independents should do differently"',
  },
  {
    title: 'Media & Platform Trends',
    color: '#34d399',
    description: 'Ad format updates, platform policy changes, targeting capability shifts, creative production automation.',
    example: '"Meta\'s AI ad creative generator reduces production cost by 60%—but quality concerns emerge"',
  },
];

export const IntelligencePillars: React.FC = () => {
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
          Four Intelligence Pillars
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          Every signal fits one of four strategic frameworks—mapped to your client work.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {PILLARS.map((p, i) => (
            <div
              key={i}
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--overlay-subtle)',
                borderLeft: `4px solid ${p.color}`,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--cream)',
                marginBottom: '0.5rem',
              }}>
                {p.title}
              </h3>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '0.5rem',
              }}>
                {p.description}
              </p>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.8rem',
                color: 'var(--text-muted-60)',
                fontStyle: 'italic',
              }}>
                Example: {p.example}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
