import React, { useState } from 'react';
import { trackCTAClick } from '../../src/utils/tracking';

type SearchResult = { title: string; url: string; snippet: string; date?: string };

interface HeroSectionProps {
  onSearch?: (query: string) => void;         // full sonar-pro brief (result click)
  onInstantSearch?: (query: string) => void;  // Search API (form submit)
  onSignupClick?: () => void;
  searchResults?: SearchResult[];
  isSearching?: boolean;
}

/* Hero: all colors hardcoded for dark theme so section is always visible */
const HERO_BG = '#0d1321';
const HERO_TEXT = '#F5F5F5';
const HERO_MUTED = 'rgba(248, 246, 240, 0.7)';
const HERO_ORANGE = '#E67E22';
const HERO_BORDER = '#1E2A45';

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onInstantSearch,
  onSignupClick,
  searchResults,
  isSearching,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    trackCTAClick('ai_search', 'homepage_hero');
    // ASK opens the intelligence modal directly via /chat-intel
    onSearch?.(q);
  };

  return (
    <section
      style={{
        padding: '80px 120px',
        backgroundColor: HERO_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '32px',
        minHeight: '640px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: HERO_TEXT,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          VOL. 01 — 2026
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '2px',
            height: '80px',
            backgroundColor: HERO_ORANGE,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: HERO_TEXT,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          AGENTIC SHIFT INTELLIGENCE
        </span>
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: '64px',
          lineHeight: 1.1,
          color: HERO_TEXT,
          maxWidth: '720px',
          margin: 0,
        }}
      >
        The signal exists. Most teams are still reading noise.
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          lineHeight: 1.7,
          color: HERO_MUTED,
          maxWidth: '580px',
          margin: 0,
        }}
      >
        Marketing orgs adopted AI at 78% in 2025. Only 6% reached maturity. The gap isn&apos;t tools — it&apos;s intelligence. signal2noise delivers 3 daily briefs synthesized from McKinsey, Gartner, and Google so your team moves on signal, not speculation.
      </p>
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: HERO_ORANGE,
          margin: 0,
        }}
      >
        3 SIGNALS DAILY. TIER-1 SOURCES ONLY. ZERO RESEARCH TIME.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={() => {
            trackCTAClick('get_daily_signals', 'homepage_hero');
            onSignupClick?.();
          }}
          style={{
            padding: '14px 32px',
            backgroundColor: HERO_ORANGE,
            color: HERO_BG,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          GET DAILY SIGNALS
        </button>
        <button
          type="button"
          onClick={() => {
            trackCTAClick('see_example', 'homepage_hero');
            onSearch?.('example');
          }}
          style={{
            padding: '14px 32px',
            backgroundColor: 'transparent',
            color: HERO_ORANGE,
            border: `1px solid ${HERO_ORANGE}`,
            cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          SEE EXAMPLE
        </button>
      </div>
      {/* AI Search Bar — Perplexity-powered */}
      <form
        onSubmit={handleSearch}
        style={{
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            border: `1px solid ${HERO_BORDER}`,
            backgroundColor: '#0A0F1E',
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: What should CMOs prioritize for AI in Q2 2026?"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: HERO_TEXT,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              padding: '14px 16px',
            }}
          />
          <button
            type="submit"
            disabled={!query.trim()}
            style={{
              padding: '14px 24px',
              backgroundColor: HERO_ORANGE,
              color: HERO_BG,
              border: 'none',
              cursor: query.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              opacity: query.trim() ? 1 : 0.5,
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
          >
            Ask →
          </button>
        </div>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: HERO_MUTED,
          }}
        >
          {isSearching ? 'Searching...' : 'Powered by Perplexity · Real-time intelligence from 1,000+ sources'}
        </span>
      </form>

      {/* Instant search results — shown before full sonar-pro brief loads */}
      {searchResults && searchResults.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            border: `1px solid ${HERO_BORDER}`,
            backgroundColor: '#0A0F1E',
            marginTop: '-24px', // tight with search form
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${HERO_BORDER}`,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: HERO_MUTED,
            }}
          >
            {searchResults.length} results · click to generate full brief
          </div>
          {searchResults.slice(0, 5).map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSearch?.(result.title)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: i < Math.min(searchResults.length, 5) - 1 ? `1px solid ${HERO_BORDER}` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'block',
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: HERO_TEXT,
                  marginBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {result.title}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: HERO_MUTED,
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}
              >
                {result.snippet}
              </div>
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          width: '100%',
          borderTop: `1px solid ${HERO_BORDER}`,
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: HERO_MUTED,
          }}
        >
          Powered by Tier-1 Research
        </span>
      </div>
    </section>
  );
};
