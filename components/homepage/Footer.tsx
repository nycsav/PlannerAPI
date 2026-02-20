import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--navy)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '48px 120px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            planner
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--orange)',
            }}
          >
            API
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: 'var(--muted)',
            margin: 0,
          }}
        >
          Old methods. New speed.
        </p>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          padding: '16px 120px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--muted)',
          }}
        >
          © 2026 PlannerAPI
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Strategy as Product, Not Service
        </span>
      </div>
    </footer>
  );
};
