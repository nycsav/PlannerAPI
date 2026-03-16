import React from 'react';
import { ThemeToggle } from '../ThemeToggle';

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
        backgroundColor: 'var(--bg)',
        borderTop: '3px solid var(--orange)',
        borderBottom: '1px solid var(--border)',
        boxSizing: 'border-box',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/brand/s2n-logo-v2.svg" alt="signal2noise" style={{ height: '40px', width: 'auto', minWidth: '240px' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {[
          { label: 'SIGNALS', href: '#recent-signals' },
          { label: 'ABOUT', href: '#how-it-works' },
          { label: 'PRICING', href: '#faq' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--nav-link)',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--orange)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--nav-link)'; }}
          >
            {label}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
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
