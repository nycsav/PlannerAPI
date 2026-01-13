
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, CornerDownRight, ShieldCheck, Database } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (q: string, data?: any) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runPerplexitySearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(
        'https://planners-backend-865025512785.us-central1.run.app/perplexity/search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
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
      runPerplexitySearch(query);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-lg">
      
      <div className="text-center space-y-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-system-xs font-bold text-bureau-slate uppercase tracking-[0.2em] opacity-40">System_Interface // Node_Alpha</span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl lg:text-display-xl font-black text-bureau-ink uppercase italic leading-none tracking-tight">
          Strategic Intelligence <br className="hidden sm:block" />
          <span className="text-bureau-signal not-italic">Synthesis Node.</span>
        </h1>
        <p className="text-bureau-slate text-base md:text-lg font-medium max-w-2xl mx-auto pt-sm">
          Real-time market intelligence for agency strategists, planners, and brand marketing leaders navigating AI transformation.
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
              placeholder="Query strategic signal index..."
              className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg font-bold px-md py-4 text-bureau-ink placeholder:text-bureau-ink/20 outline-none"
            />

            <button
              type="submit"
              className="bg-bureau-ink text-white btn-action flex items-center gap-2 hover:bg-bureau-signal disabled:opacity-50"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : 'Inquire'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex flex-col md:flex-row items-center justify-between gap-sm px-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-bureau-slate/40" />
              <span className="font-mono text-[9px] font-bold text-bureau-slate/40 uppercase tracking-widest">
                Enterprise_Verified_SLA
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-bureau-border pl-4">
              <Database className="w-3.5 h-3.5 text-bureau-slate/40" />
              <span className="font-mono text-[9px] font-bold text-bureau-slate/40 uppercase tracking-widest">
                4.2M Indexed Signals
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CornerDownRight className="w-3 h-3 text-bureau-signal" />
            <span className="font-mono text-[9px] font-bold text-bureau-signal uppercase tracking-widest">
              Status: Operational_UTC_{new Date().getHours()}:00
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-md">
          {['CPM Volatility', 'Retail Media Yield', 'Cookie Deprecation', 'Talent Index'].map((q) => (
            <button 
              key={q}
              onClick={() => { setQuery(q); runPerplexitySearch(q); }}
              className="px-md py-2 border border-bureau-border bg-white font-mono text-system-xs font-bold text-bureau-slate uppercase tracking-tight hover:border-bureau-ink transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
