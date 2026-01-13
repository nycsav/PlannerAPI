
import React, { useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown, Globe, BarChart3, ShieldCheck, Zap } from 'lucide-react';

interface ResponsePreviewProps {
  onExecute: (query: string) => void;
}

export const ResponsePreview: React.FC<ResponsePreviewProps> = ({ onExecute }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const exampleQuery = "What's driving Q1 CPM volatility in retail media?";

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up [animation-delay:400ms]">
      <div className={`bg-white border-2 border-bureau-ink/5 rounded-2xl overflow-hidden transition-all duration-500 shadow-lg ${isExpanded ? 'ring-8 ring-bureau-signal/5 border-bureau-signal' : 'hover:border-bureau-ink/10'}`}>
        
        {/* Header / Trigger (SM/MD Padding) */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-sm md:px-md md:py-sm group text-left"
        >
          <div className="flex items-center gap-sm">
            <div className={`p-sm rounded-lg transition-all duration-500 ${isExpanded ? 'bg-bureau-signal text-white' : 'bg-bureau-ink/5 text-bureau-ink/40'}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-bureau-ink/20 block">Example Output</span>
              <span className="font-display font-bold text-xs md:text-sm text-bureau-ink group-hover:text-bureau-signal italic truncate max-w-[180px] sm:max-w-none block">
                "{exampleQuery}"
              </span>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            <span className="hidden md:block font-mono text-[8px] font-black text-bureau-ink/20 uppercase tracking-[0.2em]">
              {isExpanded ? 'Collapse' : 'Preview'}
            </span>
            <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-bureau-ink/20" />
            </div>
          </div>
        </button>

        {/* Content Section (MD Padding) */}
        <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100 border-t-2 border-bureau-ink/5' : 'max-h-0 opacity-0'}`}>
          <div className="p-md md:p-md lg:p-md space-y-md bg-bureau-surface/30">
            
            <div className="space-y-xs">
              <div className="flex items-center gap-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-bureau-signal animate-pulse"></div>
                <span className="font-mono text-[9px] font-black text-bureau-signal uppercase tracking-widest">Logic_Kernel_v4.2</span>
              </div>
              <p className="font-sans text-xs md:text-sm text-bureau-ink/80 font-medium italic border-l-2 border-bureau-signal/10 pl-sm leading-impeccable">
                Analysis confirms volatility driven by <strong className="text-bureau-ink">buy-side inventory pressure</strong> within retail DSPs. Budget redirection toward authenticated endpoints has created an <span className="text-bureau-signal font-black">18.4%</span> premium above H2 baseline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              {[
                { label: 'CPM Peak', value: '$12.42', icon: <BarChart3 className="w-3 h-3" /> },
                { label: 'Inventory', value: '-12.4%', icon: <Zap className="w-3 h-3" /> },
                { label: 'Fidelity', value: 'High', icon: <ShieldCheck className="w-3 h-3" /> }
              ].map((data, i) => (
                <div key={i} className="p-sm bg-white border border-bureau-ink/5 rounded-xl shadow-sm">
                  <div className="flex items-center gap-xs mb-xs text-bureau-ink/30">
                    <div className="text-bureau-signal">{data.icon}</div>
                    <span className="font-mono text-[8px] font-black uppercase tracking-tight">{data.label}</span>
                  </div>
                  <div className="font-display font-black text-base text-bureau-ink">{data.value}</div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onExecute(exampleQuery)}
              className="w-full btn-intelligence bg-bureau-signal text-white rounded-xl font-mono text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-sm hover:bg-bureau-ink transition-all shadow-xl active:scale-[0.98]"
            >
              Analyze Full Vertical
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
