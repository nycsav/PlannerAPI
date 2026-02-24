import React from 'react';

interface NavbarProps {
  onSignupClick?: () => void;
}

/* Nav: all colors hardcoded so visible regardless of theme/CSS vars */
const NAV_BG = '#0d1321';
const NAV_ORANGE = '#E67E22';

export const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  return (
    <nav
      className="homepage-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '60px',
        backgroundColor: NAV_BG,
        borderTop: `3px solid ${NAV_ORANGE}`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/brand/s2n-logo-v2.svg" alt="signal2noise" style={{ height: '40px', width: 'auto', minWidth: '240px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onSignupClick?.()}
          style={{
            padding: '8px 20px',
            backgroundColor: 'transparent',
            color: NAV_ORANGE,
            border: `1px solid ${NAV_ORANGE}`,
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
