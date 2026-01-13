
import React from 'react';
import { HelpCircle, ChevronRight, Search, BarChart3, MessageSquare } from 'lucide-react';

export const MethodologyGuide: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { 
          icon: <Search className="w-4 h-4" />, 
          title: "Ingest Signals", 
          text: "Real-time indexing of 4.2M global advertising data points across social, programmatic, and retail networks." 
        },
        { 
          icon: <MessageSquare className="w-4 h-4" />, 
          title: "Prompt Synthesis", 
          text: "Deep-research mode powered by Claude and Perplexity to distill raw data into strategic briefs." 
        },
        { 
          icon: <BarChart3 className="w-4 h-4" />, 
          title: "Visualize & Export", 
          text: "Instantly generate data visualizations or pivot existing charts to validate your tactical hypotheses." 
        }
      ].map((step, i) => (
        <div key={i} className="flex gap-4 p-5 bg-white border border-scandi-navy/5 rounded-sm group hover:border-scandi-blue/20 transition-all">
          <div className="flex-shrink-0 w-10 h-10 bg-scandi-navy/5 rounded-full flex items-center justify-center text-scandi-navy group-hover:bg-scandi-blue/10 group-hover:text-scandi-blue transition-colors">
            {step.icon}
          </div>
          <div>
            <h4 className="font-mono text-[10px] uppercase font-black tracking-widest-plus text-scandi-navy mb-1">{step.title}</h4>
            <p className="text-[11px] leading-relaxed text-scandi-navy/50 font-medium">{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
