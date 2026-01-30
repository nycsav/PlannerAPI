import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, TrendingUp, ChevronRight } from 'lucide-react';
import { useAudience } from '../contexts/AudienceContext';

interface HeroSearchTerminalProps {
  onSearch: (q: string, data?: any) => void;
}

// Default placeholders
const DEFAULT_PLACEHOLDERS = [
  "How is DeepSeek disrupting enterprise AI pricing strategies?",
  "What's the ROI case for AI agents vs traditional automation?",
  "Show me Q1 2026 retail media spend benchmarks by vertical",
  "Which brands are gaining share with zero-party data strategies?",
  "How are CMOs restructuring teams for AI-native marketing?",
];

const DEFAULT_CATEGORIES = [
  { label: 'AI STRATEGY', trending: true },
  { label: 'MARKET TRENDS', trending: true },
  { label: 'BRAND INTEL', trending: false },
  { label: 'REVENUE GROWTH', trending: true },
  { label: 'COMPETITIVE', trending: false },
];

export const HeroSearchTerminal: React.FC<HeroSearchTerminalProps> = ({ onSearch }) => {
  const { audience } = useAudience();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % DEFAULT_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const searchQuery = query.trim() || DEFAULT_PLACEHOLDERS[placeholderIndex];
    if (searchQuery) {
      setLoading(true);
      onSearch(searchQuery);
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8">

      {/* Header */}
      <div className="text-center space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest">
            LIVE INTELLIGENCE TERMINAL
          </span>
        </div>

        <h1 className="font-mono text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">
          REAL-TIME MARKETING INTELLIGENCE
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
            POWERED BY PERPLEXITY AI
          </span>
        </h1>

        <p className="font-mono text-sm md:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Search the marketing and advertising industry in real-time. Live data from 1,000+ sources, tailored for brand marketers and advertising strategists.
        </p>

      </div>

      {/* Search terminal */}
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center bg-slate-900/50 border-2 border-slate-800/50 rounded overflow-hidden focus-within:border-blue-500/50 transition-all duration-200">

            {/* Terminal prompt indicator */}
            <div className="pl-4 pr-2 text-blue-400 font-mono text-sm shrink-0">
              <Terminal className="w-4 h-4" />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={DEFAULT_PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-transparent border-none focus:ring-0 font-mono text-sm md:text-base px-2 py-4 text-white placeholder:text-slate-600 outline-none"
                autoComplete="off"
                aria-label="Search intelligence"
              />
            </div>

            {/* Execute button */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <span>ANALYZING</span>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </>
              ) : (
                <>
                  <span>EXECUTE</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {DEFAULT_CATEGORIES.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setQuery(item.label);
                inputRef.current?.focus();
              }}
              className="group px-4 py-2 border border-slate-800/50 bg-slate-900/30 hover:border-blue-500/50 hover:bg-blue-500/10 rounded font-mono text-xs text-slate-400 hover:text-blue-400 uppercase tracking-wider transition-all flex items-center gap-2"
            >
              {item.trending && (
                <TrendingUp className="w-3 h-3 text-blue-400" />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500/20 border border-blue-500/30 rounded flex items-center justify-center">
            <Search className="w-3 h-3 text-blue-400" />
          </div>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            Powered by Perplexity AI
          </span>
        </div>

        <span className="hidden md:inline text-slate-800">|</span>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            Real-time data from 1,000+ sources
          </span>
        </div>
      </div>
    </div>
  );
};
