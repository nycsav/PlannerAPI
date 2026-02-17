import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
    }
  };

  return (
    <section style={{
      padding: '6rem 2rem 5rem',
      backgroundColor: 'var(--navy)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Geometric accent - top right */}
      <div style={{
        position: 'absolute',
        top: '-2rem',
        right: '-2rem',
        width: '400px',
        height: '400px',
        border: '1px solid rgba(248, 246, 240, 0.08)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '2rem',
        right: '4rem',
        width: '120px',
        height: '120px',
        border: '1px solid rgba(248, 246, 240, 0.12)',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '1.5rem',
        }}>
          Vol. 01 — 2026
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 700,
          color: 'var(--cream)',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          marginBottom: '1rem',
        }}>
          Daily intelligence. Zero noise.
        </h1>

        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '1.25rem',
          color: 'rgba(248, 246, 240, 0.75)',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          maxWidth: '560px',
        }}>
          3 signals from tier-1 sources. Real-time AI synthesis. Every morning.
        </p>

        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(248, 246, 240, 0.06)',
            border: '1px solid rgba(248, 246, 240, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need to know?"
              style={{
                flex: 1,
                padding: '1.25rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--cream)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--accent)',
                color: 'var(--navy)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
