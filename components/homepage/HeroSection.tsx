import React, { useState } from 'react';
import { trackCTAClick } from '../../src/utils/tracking';

type SearchResult = { title: string; url: string; snippet: string; date?: string };

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onInstantSearch?: (query: string) => void;
  onSignupClick?: () => void;
  searchResults?: SearchResult[];
  isSearching?: boolean;
}

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
    const q = query.trim() || 'Ask: What should CMOs prioritize for AI in Q2 2026?';
    if (!query.trim()) setQuery(q);
    trackCTAClick('ai_search', 'homepage_hero');
    onSearch?.(q);
  };

  return (
    <section
      style={{
        padding: '80px 120px',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '32px',
        minHeight: '640px',
        boxSizing: 'border-box',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--text)',
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
            backgroundColor: 'var(--orange)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: 'var(--text)',
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
          color: 'var(--text)',
          maxWidth: '720px',
          margin: 0,
        }}
      >
        Track the agentic shift before your clients ask
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '18px',
          lineHeight: 1.7,
          color: 'var(--muted)',
          maxWidth: '580px',
          margin: 0,
        }}
      >
        Marketing teams are buying AI agents, not point solutions. OpenAI Operator, Anthropic Computer Use, Google Gemini — which one delivers ROI?
      </p>
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--orange)',
          margin: 0,
        }}
      >
        3 SIGNALS DAILY · CLIENTS READY · ZERO RESEARCH TIME
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
            backgroundColor: 'var(--orange)',
            color: 'var(--bg)',
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
            color: 'var(--orange)',
            border: '1px solid var(--orange)',
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

      {/* AI Search Bar */}
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
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-input)',
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
              color: 'var(--text)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              padding: '14px 16px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 24px',
              backgroundColor: 'var(--orange)',
              color: 'var(--bg)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
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
            color: 'var(--muted)',
          }}
        >
          {isSearching ? 'Searching...' : 'Powered by Perplexity · Real-time intelligence from 1,000+ sources'}
        </span>
      </form>

      {/* Instant search results */}
      {searchResults && searchResults.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-input)',
            marginTop: '-24px',
          }}
        >
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--border)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
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
                borderBottom: i < Math.min(searchResults.length, 5) - 1 ? '1px solid var(--border)' : 'none',
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
                  color: 'var(--text)',
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
                  color: 'var(--muted)',
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
          borderTop: '1px solid var(--border)',
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
            color: 'var(--muted)',
          }}
        >
          Powered by Tier-1 Research
        </span>
      </div>
    </section>
  );
};
