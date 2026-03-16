import React from 'react';

interface FooterProps {
  onSignupClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSignupClick }) => {
  return (
    <footer
      className="homepage-footer"
      style={{
        backgroundColor: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          padding: '64px 120px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '48px',
        }}
      >
        {/* Left: Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            signal2noise
          </span>
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
          <button
            type="button"
            onClick={() => onSignupClick?.()}
            style={{
              marginTop: '8px',
              padding: '12px 24px',
              backgroundColor: 'var(--orange)',
              color: 'var(--bg)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              alignSelf: 'flex-start',
            }}
          >
            GET DAILY SIGNALS
          </button>
        </div>

        {/* Center: Platform */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--orange)',
              marginBottom: '8px',
            }}
          >
            PLATFORM
          </span>
          {[
            { label: 'Signals', href: '#recent-signals' },
            { label: 'Pilots', href: '#how-it-works' },
            { label: 'Pricing', href: '#faq' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: 'var(--muted)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--orange)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right: Topics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--orange)',
              marginBottom: '8px',
            }}
          >
            TOPICS
          </span>
          {[
            { label: 'About', href: '#how-it-works', external: false },
            { label: 'LinkedIn', href: 'https://linkedin.com/company/signal2noise', external: true },
            { label: 'Contact', href: 'mailto:hello@ensolabs.ai', external: true },
          ].map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {
                onClick: (e) => {
                  e.preventDefault();
                  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                },
              })}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                color: 'var(--muted)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--orange)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div
        className="homepage-footer-footnote"
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
          © 2026 signal2noise
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
