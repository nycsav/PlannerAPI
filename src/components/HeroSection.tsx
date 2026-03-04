import React, { useState } from 'react';
import { ENDPOINTS } from '../config/api';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onSeeExample?: () => void;
  trendingTopics?: { topic: string; description: string }[];
}

interface SearchResult {
  query: string;
  answer: string;
  citations: Array<{ url: string; title?: string }>;
  images: Array<{ image_url: string; title?: string }>;
}

const SearchModal: React.FC<{ result: SearchResult; onClose: () => void }> = ({ result, onClose }) => {
  const parseSections = (text: string) => {
    // Strip markdown bold markers (**) — API returns "**Summary:**", "**Signals:**", etc.
    const clean = text.replace(/\*\*/g, '');

    const summaryMatch = clean.match(/Summary:\s*(.+?)(?=\n\s*\n|\n\s*Signals:|\n\s*Moves for leaders:|$)/is);
    const signalsMatch = clean.match(/Signals:\s*([\s\S]+?)(?=\n\s*Moves for leaders:|$)/i);
    const movesMatch = clean.match(/Moves for leaders:\s*([\s\S]+?)$/i);

    const parseList = (raw?: string) =>
      (raw ?? '').split('\n')
        .map(l => l.replace(/^[-•\d.]+\s*/, '').trim())
        .filter(Boolean);

    return {
      summary: summaryMatch?.[1]?.trim() ?? '',
      signals: parseList(signalsMatch?.[1]),
      moves: parseList(movesMatch?.[1]),
    };
  };

  const { summary, signals, moves } = parseSections(result.answer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,17,40,0.92)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] max-h-[85vh] overflow-y-auto flex flex-col gap-5"
        style={{ background: '#0D1631', border: '1px solid #E67E22', borderLeft: '4px solid #E67E22', padding: '32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: '#E67E22', fontWeight: 700 }}>
            Intelligence Brief
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] bg-transparent border-none cursor-pointer"
            style={{ color: '#7A8BA0' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Query as title */}
        <h2
          className="m-0 text-[18px] leading-[1.3]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5', fontWeight: 700 }}
        >
          {result.query}
        </h2>

        {/* Summary */}
        {summary && (
          <p className="font-sans text-[14px] leading-[1.7] m-0" style={{ color: '#B8C5D0' }}>
            {summary}
          </p>
        )}

        {/* Signals */}
        {signals.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: '#E67E22' }}>Signals</p>
            {signals.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[10px] mt-[3px]" style={{ color: '#E67E22' }}>›</span>
                <p className="font-sans text-[13px] leading-[1.6] m-0" style={{ color: '#B8C5D0' }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Moves */}
        {moves.length > 0 && (
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: '#E67E22' }}>Actions</p>
            {moves.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[10px] mt-[3px]" style={{ color: '#E67E22' }}>→</span>
                <p className="font-sans text-[13px] leading-[1.6] m-0 font-medium" style={{ color: i === 0 ? '#F5F5F5' : '#B8C5D0' }}>
                  {m}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Citations */}
        {result.citations.length > 0 && (
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: '#7A8BA0' }}>Sources</p>
            {result.citations.slice(0, 5).map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] underline truncate"
                style={{ color: '#7A8BA0' }}
              >
                [{i + 1}] {c.title || c.url}
              </a>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
          <span className="font-mono text-[10px]" style={{ color: '#7A8BA0' }}>Powered by Perplexity sonar-pro</span>
        </div>
      </div>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onSeeExample, trendingTopics = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q || searching) return;

    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(ENDPOINTS.perplexitySearch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error('[Search] Failed:', err);
      setSearchError('Search unavailable — try again shortly.');
    } finally {
      setSearching(false);
    }
  };

  const fillTopic = (topic: string) => setSearchQuery(topic);

  return (
    <>
      <section className="w-full min-h-[640px] bg-p-navy px-6 py-10 md:px-[60px] md:py-[60px] lg:px-[120px] lg:py-[80px] flex flex-col items-start gap-8 box-border">
        {/* VOL. 01 label — top right */}
        <div className="w-full flex justify-end">
          <span className="font-mono text-[10px] text-p-muted uppercase tracking-widest">
            VOL. 01 — 2026
          </span>
        </div>

        {/* Accent line group */}
        <div className="flex items-center gap-3">
          <div className="w-[2px] h-20 bg-p-orange flex-shrink-0" />
          <span className="font-mono text-[10px] text-p-muted uppercase tracking-widest">
            Agentic Shift Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-p-text font-bold text-[36px] md:text-[48px] lg:text-[64px] leading-[1.1] m-0 max-w-[720px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Track the agentic shift before your clients ask
        </h1>

        {/* Subheadline */}
        <p
          className="font-sans text-[18px] leading-[1.7] m-0 max-w-[580px]"
          style={{ color: '#B8C5D0' }}
        >
          Marketing teams are buying AI agents, not point solutions. OpenAI Operator,
          Anthropic Computer Use, Google Gemini — which one delivers ROI?
        </p>

        {/* Value prop */}
        <p
          className="font-mono text-[11px] uppercase m-0 tracking-[0.15em]"
          style={{ color: '#E67E22', fontWeight: 700 }}
        >
          3 Signals Daily. Client-Ready. Zero Research Time.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-[580px] flex flex-col gap-3">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Ask about AI strategy, media trends, measurement..."
              className="flex-1 bg-transparent text-[#F5F5F5] font-mono text-[12px] px-4 py-3 outline-none transition-colors"
              style={{ border: '1px solid #2A3F5F', borderRight: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#E67E22')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2A3F5F')}
            />
            <button
              type="button"
              disabled={searching || !searchQuery.trim()}
              onClick={handleSearch}
              className="font-mono text-[11px] uppercase tracking-wide bg-transparent px-5 py-3 cursor-pointer transition-colors disabled:opacity-40"
              style={{ color: '#E67E22', border: '1px solid #2A3F5F', borderLeft: 'none' }}
            >
              {searching ? '...' : 'Search →'}
            </button>
          </div>

          {searchError && (
            <p className="font-mono text-[10px] m-0" style={{ color: '#EF4444' }}>{searchError}</p>
          )}

          {trendingTopics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trendingTopics.slice(0, 4).map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillTopic(t.topic)}
                  className="font-mono text-[9px] uppercase border bg-transparent px-3 py-1 cursor-pointer transition-colors hover:border-p-orange hover:text-p-orange"
                  style={{ color: '#7A8BA0', borderColor: '#2A3F5F' }}
                >
                  {t.topic}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CTA group — stacked on mobile, row on tablet+ */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onGetStarted?.()}
            className="font-mono font-bold text-[12px] uppercase tracking-wide bg-p-orange text-p-navy px-8 py-[14px] border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            Get Daily Signals
          </button>
          <button
            type="button"
            onClick={() => onSeeExample?.()}
            className="font-mono text-[12px] uppercase tracking-wide text-p-orange border border-p-orange bg-transparent px-8 py-[14px] cursor-pointer hover:bg-p-orange hover:text-p-navy transition-colors"
          >
            See Example →
          </button>
        </div>

        {/* Bottom divider */}
        <div className="w-full border-t border-p-border pt-4 flex justify-center mt-auto">
          <span className="font-mono text-[10px] uppercase tracking-widest text-p-muted">
            Powered by Tier-1 Research
          </span>
        </div>
      </section>

      {searchResult && (
        <SearchModal result={searchResult} onClose={() => setSearchResult(null)} />
      )}
    </>
  );
};
