
import React from 'react';
import { FlaskConical, Zap, ArrowRight, Share2 } from 'lucide-react';

export const ExperimentSection: React.FC<{ onRun: (q: string) => void }> = ({ onRun }) => {
  const experiments = [
    {
      title: "Cookie-less Spend Simulation",
      desc: "Test your Q3 budget against a 100% cookie-less vertical baseline. Identify attribution risk areas.",
      query: "Run retail vertical cookie-less media simulation for Q3 spend"
    },
    {
      title: "Content Fatigue Forecaster",
      desc: "Predict creative saturation points based on current attention yield drift for video formats.",
      query: "Predict creative saturation points for video assets in lifestyle vertical"
    },
    {
      title: "Talent Gap Analysis",
      desc: "Stress-test your team's skill index against the latest AI Orchestration hiring signals.",
      query: "Analyze team skill gaps for agency AI automation roles"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 px-1 border-b border-scandi-navy/5 pb-4">
        <FlaskConical className="w-5 h-5 text-scandi-sienna" />
        <h2 className="text-xl font-black text-scandi-navy tracking-tightest uppercase">Experiments & Scenarios</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiments.map((exp, i) => (
          <div key={i} className="bg-scandi-navy text-white rounded-2xl p-10 space-y-8 group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="space-y-4 relative z-10">
              <h3 className="text-lg font-black tracking-tightest uppercase">{exp.title}</h3>
              <p className="text-[12px] text-white/50 leading-relaxed font-medium">
                {exp.desc}
              </p>
            </div>
            
            <button 
              onClick={() => onRun(exp.query)}
              className="flex items-center justify-between w-full group/btn pt-8 mt-10 border-t border-white/5 hover:text-scandi-sienna transition-all"
            >
              <span className="text-[10px] font-mono uppercase font-black tracking-widest text-white/30 group-hover/btn:text-white">Run Scenario</span>
              <div className="p-2.5 bg-white/5 rounded-xl group-hover/btn:bg-scandi-sienna group-hover/btn:text-white transition-all shadow-lg">
                <Zap className="w-4 h-4 fill-current" />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
