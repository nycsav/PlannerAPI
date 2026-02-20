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
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1rem',
        }}>
          The Question You&apos;re Getting Asked
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.1rem',
          color: 'var(--cream)',
          fontStyle: 'italic',
          marginBottom: '1rem',
        }}>
          &quot;Should we buy AI agents or build them?&quot;
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--text-muted-60)',
          marginBottom: '0.75rem',
        }}>
          The Answer Requires:
        </p>
        <ul style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '1rem',
          paddingLeft: '1.25rem',
        }}>
          <li><strong>What&apos;s shipping:</strong> OpenAI Operator vs. Anthropic Computer Use vs. Google Gemini</li>
          <li><strong>What enterprises are buying:</strong> Gartner procurement data, implementation costs</li>
          <li><strong>What actually works:</strong> McKinsey ROI studies, real-world performance benchmarks</li>
        </ul>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.95rem',
          color: 'var(--cream)',
          fontWeight: 600,
        }}>
          PlannerAPI tracks all three. You get the synthesis, not the research.
        </p>
      </div>
    </section>
  );
};
