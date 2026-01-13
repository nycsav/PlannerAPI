
import React from 'react';
import { ArrowRight, Zap, TrendingUp, Cpu, Hash, Search } from 'lucide-react';

interface FeaturedSectionProps {
  onDiveDeep?: (query: string) => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onDiveDeep }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up [animation-delay:200ms]">
      {/* Column 1: Deep Dive */}
      <div 
        onClick={() => onDiveDeep?.("Conduct a full post-mortem on the death of third-party cookies")}
        className="bg-scandi-navy rounded-sm p-6 flex flex-col justify-between min-h-[280px] group transition-all hover:ring-1 hover:ring-scandi-sienna/50 hover:shadow-card-hover relative overflow-hidden cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-scandi-sienna/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-scandi-sienna/10 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[9px] uppercase tracking-widest-plus text-scandi-sienna font-bold">Deep Dive</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="font-mono text-[9px] uppercase tracking-widest-plus text-white/30">Intelligence Portal</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tightest leading-snug mb-3">
            The Death of Third-Party Cookies: A Post-Mortem.
          </h3>
          <p className="text-white/50 text-xs leading-relaxed line-clamp-3 font-light tracking-normal">
            As Google retreats from total deprecation, we analyze the complex 'consent-first' fallout for H2 attribution.
          </p>
        </div>
        <button className="relative z-10 flex items-center gap-2 text-white font-mono text-[10px] uppercase tracking-widest-plus font-bold hover:text-scandi-sienna transition-colors mt-4 group/link">
          Analyze Portal <Search className="w-3 h-3" />
        </button>
      </div>

      {/* Column 2: Market Signal */}
      <div 
        onClick={() => onDiveDeep?.("Search for related data on Search Volatility and commerce verticals")}
        className="bg-white border border-scandi-navy/10 p-6 rounded-sm flex flex-col justify-between min-h-[280px] hover:shadow-card-hover transition-all duration-500 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-4 h-4 text-scandi-blue group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[9px] uppercase tracking-widest-plus text-scandi-navy/40">Market Signal</span>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest-plus text-scandi-navy/60 mb-1">Search Volatility</h4>
          <p className="text-2xl font-bold text-scandi-navy tracking-tightest">HIGH / 8.4</p>
          <div className="mt-4 flex items-end gap-[2px] h-8">
            {[40, 60, 55, 75, 80, 70, 85, 65, 90, 82].map((h, i) => (
              <div key={i} className="flex-1 bg-scandi-blue/5 rounded-t-[1px] relative overflow-hidden">
                <div className={`w-full bg-scandi-blue origin-bottom animate-draw-bar ${i === 8 ? 'opacity-100' : 'opacity-20'}`} style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}></div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-scandi-navy/5">
          <p className="text-[10px] text-scandi-navy/40 leading-tight font-light tracking-normal flex items-center justify-between group-hover:text-scandi-blue transition-colors">
            Analyze Churn <Search className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Column 3: AI Tooling */}
      <div 
        onClick={() => onDiveDeep?.("Deploy Perplexity Pages for a competitive brand audit")}
        className="bg-scandi-white border border-scandi-navy/5 p-6 rounded-sm flex flex-col justify-between min-h-[280px] hover:shadow-card-hover transition-all duration-500 group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <Cpu className="w-4 h-4 text-scandi-sienna group-hover:rotate-12 transition-transform" />
          <span className="font-mono text-[9px] uppercase tracking-widest-plus text-scandi-navy/40">Workflow Tech</span>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest-plus text-scandi-navy/60 mb-1">Recommendation</h4>
          <p className="text-lg font-bold text-scandi-navy tracking-tightest leading-tight">Perplexity Pages</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse-breathing shadow-active-glow"></span>
            <p className="text-[9px] text-scandi-navy/50 font-mono uppercase tracking-widest-plus">Status: Operational</p>
          </div>
        </div>
        <div className="flex justify-start">
          <button className="text-[9px] font-mono uppercase tracking-widest-plus text-scandi-navy/70 hover:text-scandi-sienna transition-colors flex items-center gap-1 group font-bold">
            Deploy stack <Search className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Column 4: Trending Now */}
      <div className="bg-white border border-scandi-navy/10 p-6 rounded-sm flex flex-col min-h-[280px] hover:shadow-card-hover transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <Hash className="w-4 h-4 text-scandi-navy/40" />
          <span className="font-mono text-[9px] uppercase tracking-widest-plus text-scandi-navy/40">Trending Now</span>
        </div>
        <div className="flex-grow">
          <ul className="space-y-3">
            {[
              { tag: 'PrivacySandbox', count: '14.2k' },
              { tag: 'Q4_AdSpend', count: '8.1k' },
              { tag: 'GenAI_Video', count: '12.4k' },
              { tag: 'RetailMedia', count: '5.9k' }
            ].map((item) => (
              <li key={item.tag} onClick={() => onDiveDeep?.(`Explain the trend: #${item.tag}`)} className="flex items-center justify-between group cursor-pointer">
                <span className="font-mono text-[10px] text-scandi-navy/70 group-hover:text-scandi-blue transition-colors tracking-widest-plus flex items-center gap-1">
                   <span className="opacity-0 group-hover:opacity-100 transition-opacity text-scandi-blue">»</span>
                   #{item.tag}
                </span>
                <span className="font-mono text-[9px] text-scandi-navy/20 tracking-widest-plus group-hover:text-scandi-blue/40 transition-colors">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-4 border-t border-scandi-navy/5">
          <button onClick={() => onDiveDeep?.("Show full signal index for trending advertising hashtags")} className="w-full text-center font-mono text-[9px] uppercase tracking-widest-plus text-scandi-navy/30 hover:text-scandi-navy transition-colors font-bold">
            Full signal index
          </button>
        </div>
      </div>
    </div>
  );
};
