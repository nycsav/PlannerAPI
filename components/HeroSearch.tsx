
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, CornerDownRight, ShieldCheck, Database, TrendingUp, MessageSquare } from 'lucide-react';
import { TrustStrip } from './TrustStrip';
import { TypewriterText } from './TypewriterText';
import { useAudience } from '../contexts/AudienceContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Dynamic state
  const [searchPlaceholders, setSearchPlaceholders] = useState<string[]>(DEFAULT_PLACEHOLDERS);
  const [categories, setCategories] = useState<Array<{ label: string; trending: boolean }>>(DEFAULT_CATEGORIES);

  // Fetch trending topics on mount and when audience changes
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

  // Debounced search suggestions - filter trending topics or fetch from Perplexity
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        // First, try to filter existing trending topics for instant suggestions
        const queryLower = query.toLowerCase();
        const filteredFromTrending = searchPlaceholders
          .filter(placeholder => 
            placeholder.toLowerCase().includes(queryLower) && 
            placeholder.toLowerCase() !== queryLower
          )
          .slice(0, 5);

        if (filteredFromTrending.length > 0) {
          setSuggestions(filteredFromTrending);
          setShowSuggestions(true);
        }

        // Also try to fetch real-time suggestions from Perplexity via backend (if endpoint supports it)
        try {
          const audienceFormatted = audience.replace(/_/g, ' ');
          const res = await fetchWithTimeout(
            `${ENDPOINTS.trendingTopics}?audience=${encodeURIComponent(audienceFormatted)}&query=${encodeURIComponent(query)}&limit=5`,
            { timeout: 3000 }
          );

          if (res.ok) {
            const data = await res.json();
            // If backend returns suggestions, use those (more accurate)
            if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
              setSuggestions(data.suggestions);
              setShowSuggestions(true);
            }
          }
        } catch (backendError) {
          // Backend might not support query parameter yet - that's okay, use filtered results
          console.debug('[HeroSearch] Backend suggestions not available, using filtered trending topics');
        }
      } catch (error) {
        // Silently fail - suggestions are optional enhancement
        console.debug('[HeroSearch] Suggestions generation failed:', error);
      }
    }, 400); // 400ms debounce for responsive feel

    return () => clearTimeout(debounceTimer);
  }, [query, audience, searchPlaceholders]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        summary: "I had trouble getting that intelligence. Could you try again?", 
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
      // Don't clear input - let users see what they searched and modify it
      inputRef.current?.focus();
    }
  };

  // Ensure input is always editable - runtime check on mount only
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      // Force input to be editable - remove any restrictions
      input.readOnly = false;
      input.disabled = false;
      input.removeAttribute('readonly');
      input.removeAttribute('readOnly');
      input.removeAttribute('disabled');
      input.tabIndex = 0;
      
      // Ensure contentEditable is not set (which could interfere)
      input.removeAttribute('contentEditable');
    }
  }, []); // Empty dependency array - only run on mount

  return (
    <div className="w-full flex flex-col items-center space-y-lg">
      
      <div className="text-center space-y-sm">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-gray-100 leading-tight tracking-tight" style={{ fontStyle: 'italic', fontWeight: 900 }}>
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
            className="text-bureau-signal dark:text-planner-orange"
            style={{ fontStyle: 'italic', fontWeight: 900 }}
          />
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl font-normal max-w-3xl mx-auto pt-md leading-relaxed">
          Real-time market analysis and competitive intelligence for CMOs, VP Marketing, Brand Directors, and Growth Leaders driving measurable business outcomes.
        </p>
      </div>

      <div className="w-full flex flex-col gap-md">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div 
            className="relative flex items-center bg-white dark:bg-slate-800/50 border border-gray-300/60 dark:border-slate-600/50 rounded-2xl p-1 shadow-sm focus-within:ring-4 focus-within:ring-bureau-signal/10 dark:focus-within:ring-planner-orange/20 focus-within:border-bureau-signal/60 dark:focus-within:border-planner-orange/60 transition-all duration-200"
          >
            <div className="pl-md text-gray-900 dark:text-gray-100 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  // Fully editable - user can type any keywords
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  // Handle Escape key
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setQuery('');
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }
                  // Handle arrow keys for suggestions navigation
                  if (e.key === 'ArrowDown' && suggestions.length > 0 && showSuggestions) {
                    e.preventDefault();
                    const firstSuggestion = suggestionsRef.current?.querySelector('button');
                    if (firstSuggestion) {
                      (firstSuggestion as HTMLElement).focus();
                    }
                  }
                }}
                placeholder={searchPlaceholders[placeholderIndex]}
                className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-bold px-md py-4 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 outline-none font-mono tracking-tight cursor-text selection:bg-bureau-signal/20 dark:selection:bg-planner-orange/20"
                autoComplete="off"
                aria-label="Search for intelligence insights"
                aria-describedby="search-hint"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-controls="search-suggestions"
              />

              {/* Real-time suggestions dropdown from Perplexity */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  id="search-suggestions"
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/50 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(suggestion);
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                        // Auto-submit on selection
                        trackSearch(suggestion, 'hero-suggestion');
                        onSearch(suggestion);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) next.focus();
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prev = e.currentTarget.previousElementSibling as HTMLElement;
                          if (prev) prev.focus();
                          else inputRef.current?.focus();
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                          inputRef.current?.focus();
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          setQuery(suggestion);
                          setShowSuggestions(false);
                          trackSearch(suggestion, 'hero-suggestion');
                          onSearch(suggestion);
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700 focus:bg-gray-50 dark:focus:bg-slate-700 focus:outline-none border-b border-gray-100/50 dark:border-slate-700/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear button - show when there's text */}
            {query && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="mr-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-1"
                aria-label="Clear search"
                tabIndex={0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <button
              type="submit"
              className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-planner-orange dark:to-planner-navy text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
              disabled={loading || !query.trim()}
              aria-label={loading ? 'Searching...' : 'Search for intelligence'}
            >
              <span>{loading ? 'Analyzing...' : 'SEARCH'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p id="search-hint" className="sr-only">
            Type your search query or click a category below. Press Escape to clear. You can edit any pre-filled text.
          </p>
        </form>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 px-sm text-center">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1FB6FF" />
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#1FB6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Powered by Perplexity AI</span>
          </div>
          <span className="hidden md:inline text-gray-300 dark:text-slate-500">•</span>
          <p className="text-sm text-gray-600 dark:text-gray-300">
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
                // Populate input with category label so user can edit it
                setQuery(item.label);
                // Focus input so user can immediately edit
                setTimeout(() => {
                  inputRef.current?.focus();
                  // Select all text so user can easily replace it
                  inputRef.current?.select();
                }, 0);
                // Also trigger search immediately
                console.log('[HeroSearch] Category clicked:', item.label);
                onSearch(item.label);
              }}
              className="group px-4 py-2.5 border border-gray-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-bureau-signal/60 dark:hover:border-planner-orange/60 hover:bg-bureau-signal dark:hover:bg-planner-orange hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm dark:hover:shadow-planner-orange/10 hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
            >
              {item.trending && <TrendingUp className="w-3.5 h-3.5 text-bureau-signal dark:text-planner-orange group-hover:text-white" />}
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
