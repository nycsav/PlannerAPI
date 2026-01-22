
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, CornerDownRight, ShieldCheck, Database, TrendingUp, MessageSquare } from 'lucide-react';
import { TrustStrip } from './TrustStrip';
import { TypewriterText } from './TypewriterText';
import { useAudience } from '../contexts/AudienceContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ENDPOINTS, fetchWithTimeout } from '../config/api';

interface HeroSearchProps {
  onSearch: (q: string, data?: any) => void;
  onOpenChat?: (query?: string) => void;
}

// Default fallback placeholders
const DEFAULT_PLACEHOLDERS = [
  "What's driving the $4.2B shift in attribution spend?",
  "How are competitors using AI to increase retention 23%?",
  "Show me retail media ROI benchmarks for 2026",
  "Which brands are winning with first-party data strategies?",
  "Break down the business case for cookieless attribution",
  "What marketing automation ROI can I present to the board?"
];

// Default fallback categories
const DEFAULT_CATEGORIES = [
  { label: 'AI Strategy', trending: true },
  { label: 'Market Trends', trending: true },
  { label: 'Brand Intelligence', trending: false },
  { label: 'Revenue Growth', trending: true },
  { label: 'Competitive Analysis', trending: false },
  { label: 'Customer Retention', trending: false }
];

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onOpenChat }) => {
  const { audience } = useAudience();
  const { trackSearch, trackCategoryClick } = useAnalytics();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic state
  const [searchPlaceholders, setSearchPlaceholders] = useState<string[]>(DEFAULT_PLACEHOLDERS);
  const [categories, setCategories] = useState<Array<{ label: string; trending: boolean }>>(DEFAULT_CATEGORIES);

  // Fetch trending topics on mount
  useEffect(() => {
    fetchTrending();
  }, [audience]);

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchPlaceholders]);

  const fetchTrending = async () => {
    try {
      // Convert audience format from VP_Marketing to "VP Marketing"
      const audienceFormatted = audience.replace(/_/g, ' ');

      const res = await fetchWithTimeout(
        `${ENDPOINTS.trendingTopics}?audience=${encodeURIComponent(audienceFormatted)}&limit=6`,
        { timeout: 30000 }
      );

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();

      if (data.topics && data.topics.length > 0) {
        setSearchPlaceholders(data.topics.map((t: any) => t.sampleQuery));
        setCategories(data.topics.map((t: any) => ({ label: t.label, trending: t.trending })));
      }
    } catch (error) {
      console.error('Failed to fetch trending topics, using defaults:', error);
      // Keep defaults on error
    }
  };

  const runPerplexitySearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const resp = await fetchWithTimeout(
        ENDPOINTS.perplexitySearch,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          timeout: 30000,
        }
      );

      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      const data = await resp.json();
      
      // Enhanced parsing for better structure
      const sections = data.answer?.split('##') || [];
      
      // Extract Summary (first section after title)
      let summary = '';
      if (sections.length > 1) {
        summary = sections[1].split('\n').filter((l: string) => l.trim() && !l.includes('##')).join(' ').trim();
      } else {
        summary = data.answer || '';
      }
      
      // Extract Signals (look for bullet points in any section)
      const signals: string[] = [];
      const bulletRegex = /^[-*•]\s+(.+)$/gm;
      let match;
      while ((match = bulletRegex.exec(data.answer || '')) !== null) {
        signals.push(match[1].trim());
      }
      
      // Extract sources from raw data if available
      const sources = data.raw?.citations || ['Perplexity', 'PlannerAPI_Node'];
      
      const parsedData = {
        summary: summary.substring(0, 500), // Limit summary length
        signals: signals.slice(0, 5), // Top 5 signals
        sources: sources,
        raw: data // Keep raw for debugging
      };

      onSearch(q, parsedData);
    } catch (e) {
      console.error(e);
      onSearch(q, { 
        summary: "Error retrieving intelligence. Please retry or contact support.", 
        signals: [],
        sources: ['Error']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      // Track search query
      trackSearch(query.trim(), 'hero');
      // Trigger intelligence modal with search query
      console.log('[HeroSearch] Search submitted:', query.trim());
      onSearch(query.trim());
      setQuery(''); // Clear input after search
      inputRef.current?.blur();
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-lg">
      
      <div className="text-center space-y-sm">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-bureau-ink leading-tight tracking-tight" style={{ fontStyle: 'italic', fontWeight: 900 }}>
          STRATEGIC INTELLIGENCE FOR<br />
          <TypewriterText
            phrases={[
              'MARKETING LEADERS',
              'GROWTH TEAMS',
              'AGENCY STRATEGISTS',
              'CX EXECUTIVES',
              'BRAND DIRECTORS',
            ]}
            typingSpeed={50}
            deletingSpeed={30}
            pauseDuration={2000}
            className="text-bureau-signal"
            style={{ fontStyle: 'italic', fontWeight: 900 }}
          />
        </h1>
        <p className="text-bureau-slate text-lg md:text-xl font-normal max-w-3xl mx-auto pt-md leading-relaxed">
          Real-time market analysis and competitive intelligence for CMOs, VP Marketing, Brand Directors, and Growth Leaders driving measurable business outcomes.
        </p>
      </div>

      <div className="w-full flex flex-col gap-md">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="relative flex items-center bg-white border border-bureau-ink rounded-sm p-1 shadow-sm focus-within:ring-4 focus-within:ring-bureau-signal/5">
            <div className="pl-md text-bureau-ink">
              <Search className="w-5 h-5" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholders[placeholderIndex]}
              className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-bold px-md py-4 text-bureau-ink placeholder:text-bureau-ink/40 outline-none font-mono tracking-tight"
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-bureau-ink to-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all font-semibold"
              disabled={loading}
            >
              <span>{loading ? 'Analyzing...' : 'SEARCH'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 px-sm text-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1FB6FF" />
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#1FB6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Powered by Perplexity AI</span>
          </div>
          <span className="hidden md:inline text-gray-300">•</span>
          <p className="text-sm text-bureau-slate/60">
            Trusted by Fortune 500 marketing teams
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-md">
          {categories.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                // Track category click
                trackCategoryClick(item.label, 'hero');
                // Trigger intelligence modal for category search
                console.log('[HeroSearch] Category clicked:', item.label);
                onSearch(item.label);
              }}
              className="group px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-semibold text-gray-700 hover:border-bureau-signal hover:bg-bureau-signal hover:text-white transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {item.trending && <TrendingUp className="w-3.5 h-3.5 text-bureau-signal group-hover:text-white" />}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Strip */}
      <TrustStrip />
    </div>
  );
};
