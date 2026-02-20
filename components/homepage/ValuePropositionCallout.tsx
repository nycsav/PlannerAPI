import React from 'react';

export const ValuePropositionCallout: React.FC = () => {
  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'var(--overlay-subtle)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: '4px',
        padding: '1.5rem 2rem',
      }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'var(--accent)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}>
          WHY SIGNAL2NOISE
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1rem',
        }}>
          Three things your current stack doesn&apos;t do
        </h3>
        <ul style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: 0,
          paddingLeft: '1.25rem',
        }}>
          <li style={{ marginBottom: '1rem' }}><strong>Synthesis, not aggregation</strong> — Every other tool gives you more to read. signal2noise gives you three things to act on. McKinsey, Gartner, and Forrester synthesized into a single brief with one clear next move.</li>
          <li style={{ marginBottom: '1rem' }}><strong>Operator speed, not analyst pace</strong> — The AI landscape moves daily. Your weekly newsletter is already three cycles behind. signal2noise runs Monday, Wednesday, Friday so your intelligence stays current.</li>
          <li><strong>Client-ready by default</strong> — Every brief is formatted to drop into a presentation. No reformatting, no rewriting. Signal, implication, move — the exact structure a client room needs.</li>
        </ul>
      </div>
    </section>
  );
};
