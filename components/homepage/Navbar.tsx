import React from 'react';

interface NavbarProps {
  onSignupClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '60px',
        backgroundColor: 'var(--navy)',
        borderTop: '3px solid var(--orange)',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo wordmark */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          signal2noise
        </span>
      </div>

      {/* Right: CTA */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onSignupClick?.()}
          style={{
            padding: '8px 20px',
            backgroundColor: 'transparent',
            color: 'var(--orange)',
            border: '1px solid var(--orange)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          Get Access
        </button>
      </div>
    </nav>
  );
};
