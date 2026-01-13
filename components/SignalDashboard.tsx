
import React, { useState } from 'react';
import { Command, Zap, FlaskConical, Share2, Activity, Terminal, Globe, Cpu, Sparkles, Database, Brain } from 'lucide-react';

interface SignalDashboardProps {
  onSearch: (q: string) => void;
}

export const SignalDashboard: React.FC<SignalDashboardProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const clusters = [
    { label: "CREATIVE FATIGUE", pillar: "Brand & Content", heat: "High" },
    { label: "ATTRIBUTION DRIFT", pillar: "AI Workflows", heat: "Stable" },
    { label: "TALENT RE-INDEXING", pillar: "Careers & Skills", heat: "Accelerating" }
  ];

  const IntelligenceMetric = ({ label, value, sources, heatColor }: { label: string, value: string, sources: string[], heatColor: string }) => (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-scandi-navy/5 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[9px] uppercase tracking-widest text-scandi-navy/40 font-black">{label}</span>
        <div className="flex gap-1">
          {sources.map(s => (
            <div key={s} className="w-4 h-4 rounded-full bg-scandi-navy/5 flex items-center justify-center border border-white">
              <span className="text-[6px] font-black text-scandi-navy/30">{s[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tightest leading-none text-scandi-navy font-sans uppercase">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${heatColor} animate-pulse`}></div>
        <span className="font-mono text-[8px] uppercase tracking-widest font-black text-scandi-navy/30">Live Signal</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-2 border-scandi-navy/5 rounded-2xl shadow-xl overflow-hidden mb-12 relative">
      {/* System Status Line */}
      <div className="bg-scandi-navy/5 px-6 py-2.5 flex justify-between items-center border-b border-scandi-navy/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-scandi-blue" />
            <span className="font-mono text-[9px] uppercase font-black text-scandi-navy/60 tracking-widest">Logic Engine: Active</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 border-l border-scandi-navy/10 pl-4">
             <div className="flex items-center gap-2">
               <Database className="w-3 h-3 text-scandi-navy/20" />
               <span className="font-mono text-[9px] uppercase font-black text-scandi-navy/20 tracking-widest">Index: 4.2M Signals</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase font-black text-scandi-navy/40 tracking-[0.2em]">Strategy Sandbox v0.9</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-scandi-navy/5">
        
        {/* Column 1: AI Reasoning Entry */}
        <div className="lg:w-[40%] p-8 space-y-8 bg-scandi-white/30">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-scandi-blue" />
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-scandi-navy font-black">Hypothesis Sandbox</h2>
              </div>
              <Sparkles className="w-4 h-4 text-scandi-sienna animate-pulse" />
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); onSearch(query); }} className="relative group">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Stress-test a briefing hypothesis..." 
                className="w-full bg-white border-2 border-scandi-navy/5 rounded-xl pl-5 pr-14 py-5 text-sm font-bold shadow-sm focus:border-scandi-blue/20 focus:ring-4 focus:ring-scandi-blue/5 outline-none transition-all placeholder:text-scandi-navy/20"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-scandi-navy text-white rounded-lg hover:bg-scandi-blue transition-all shadow-lg active:scale-95">
                <Command className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-1 gap-2">
              {clusters.map(cluster => (
                <button 
                  key={cluster.label} 
                  onClick={() => onSearch(cluster.label)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-scandi-navy/5 bg-white hover:border-scandi-blue/30 hover:bg-scandi-blue/[0.02] transition-all text-left group/cluster"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-scandi-navy font-black group-hover/cluster:text-scandi-blue">{cluster.label}</span>
                    <span className="font-mono text-[7px] uppercase text-scandi-navy/30 tracking-widest mt-0.5">{cluster.pillar}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-scandi-navy/5 font-mono text-[8px] uppercase font-black text-scandi-navy/40">
                    {cluster.heat}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Performance Clusters */}
        <div className="lg:flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <IntelligenceMetric 
            label="Market Signal Heat" 
            value="Volatile" 
            sources={['Perplexity', 'Gemini']} 
            heatColor="bg-scandi-sienna"
          />
          <IntelligenceMetric 
            label="Briefing Velocity" 
            value="84.2ms" 
            sources={['Claude']} 
            heatColor="bg-green-500"
          />
          <IntelligenceMetric 
            label="Talent Alpha" 
            value="+22.5%" 
            sources={['LinkedIn', 'Perplexity']} 
            heatColor="bg-scandi-blue"
          />
          <IntelligenceMetric 
            label="Brand Persistence" 
            value="High" 
            sources={['Gemini']} 
            heatColor="bg-scandi-blue"
          />
        </div>

        {/* Column 3: The Scenario Lab */}
        <div className="lg:w-[25%] p-8 bg-scandi-navy text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-scandi-sienna/10 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse"></div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-scandi-sienna" />
              <h2 className="font-mono text-[10px] uppercase font-black tracking-widest text-scandi-sienna">Scenario Lab</h2>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed font-medium">
              Validate Q4 spend elasticity against a 100% cookie-less baseline.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest font-black">
                <span>Simulation Confidence</span>
                <span>88%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-scandi-sienna w-[88%] shadow-[0_0_10px_#F97316]"></div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onSearch("Deploy full-vertical cookie-less simulation")}
            className="relative z-10 flex items-center justify-between w-full group pt-8 mt-10 border-t border-white/5 hover:text-scandi-sienna transition-all"
          >
            <span className="text-[10px] font-mono uppercase font-black tracking-[0.2em] text-white/30 group-hover:text-white transition-all">
              Execute Model
            </span>
            <Share2 className="w-4 h-4 text-scandi-sienna group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
