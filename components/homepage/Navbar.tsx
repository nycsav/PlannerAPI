import React from 'react';

interface NavbarProps {
  onSignupClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2rem',
      backgroundColor: 'var(--navy)',
      borderBottom: '1px solid rgba(248, 246, 240, 0.1)',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--cream)',
        letterSpacing: '-0.02em',
      }}>
        PlannerAPI
      </div>
      <button
        type="button"
        onClick={() => onSignupClick?.()}
        style={{
          padding: '0.625rem 1.25rem',
          backgroundColor: 'var(--accent)',
          color: 'var(--navy)',
          border: 'none',
          borderRadius: '4px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
        }}
        onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        Get Started
      </button>
    </nav>
  );
};
