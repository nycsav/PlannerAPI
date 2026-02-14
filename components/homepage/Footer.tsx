import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      padding: '3rem 2rem',
      backgroundColor: 'var(--navy)',
      borderTop: '1px solid rgba(248, 246, 240, 0.08)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          color: 'rgba(248, 246, 240, 0.5)',
        }}>
          © 2026 PlannerAPI. Intelligence from tier-1 sources.
        </p>
      </div>
    </footer>
  );
};
