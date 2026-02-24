import React from 'react';

/* All colors hardcoded for dark theme so footer is always visible */
const FOOTER_BG = '#0d1321';
const FOOTER_TEXT = '#F5F5F5';
const FOOTER_MUTED = 'rgba(248, 246, 240, 0.7)';
const FOOTER_BORDER = '#1E2A45';

export const Footer: React.FC = () => {
  return (
    <footer
      className="homepage-footer"
      style={{
        backgroundColor: FOOTER_BG,
        borderTop: `1px solid ${FOOTER_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
            className="homepage-footer-brand"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              color: FOOTER_TEXT,
            }}
          >
            signal2noise
          </span>
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: FOOTER_MUTED,
            margin: 0,
          }}
        >
          Old methods. New speed.
        </p>
      </div>
      <div
        className="homepage-footer-footnote"
        style={{
          padding: '16px 120px',
          borderTop: `1px solid ${FOOTER_BORDER}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: FOOTER_MUTED,
          }}
        >
          © 2026 signal2noise
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: FOOTER_MUTED,
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
