import React from 'react';

export const SocialProof: React.FC = () => {
  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border-light)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1rem',
        }}>
          Used By Strategists At
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          lineHeight: 1.7,
          fontStyle: 'italic',
        }}>
          No testimonials. No case studies. No fake social proof.
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--text-muted-60)',
          lineHeight: 1.7,
          marginTop: '0.5rem',
        }}>
          Just tier-1 research, synthesized daily, ready for client work.
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1rem',
          color: 'var(--cream)',
          lineHeight: 1.7,
          marginTop: '0.75rem',
        }}>
          Try it. If the intelligence isn&apos;t better than your current research process, unsubscribe.
        </p>
      </div>
    </section>
  );
};
