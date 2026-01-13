
import React from 'react';
import { Search, MessageSquare, ArrowRight, FileText, Clock, Hash } from 'lucide-react';

interface IntelligenceCardProps {
  id: string;
  date: string;
  title: string;
  description: string;
  tag?: string;
  onDeepResearch?: (query: string, source: 'Claude' | 'Perplexity' | 'Gemini') => void;
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({ id, date, title, description, tag, onDeepResearch }) => {
  return (
    <div className="bg-white border border-bureau-border rounded-sm hover:border-bureau-ink flex flex-col h-full relative group">
      {/* Card Header */}
      <div className="px-md py-sm border-b border-bureau-border bg-bureau-ink/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <Hash className="w-3 h-3 text-bureau-slate/40" />
          <span className="font-mono text-system-xs font-bold text-bureau-slate/60 uppercase">Dossier: {id}</span>
        </div>
        <div className="flex items-center gap-xs">
           <Clock className="w-3 h-3 text-bureau-slate/40" />
           <span className="font-mono text-system-xs font-bold text-bureau-slate/60 uppercase">{date}</span>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-md md:p-md lg:p-md flex-grow space-y-md">
        <div className="space-y-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-bureau-signal"></div>
            <span className="font-mono text-system-xs font-bold text-bureau-signal uppercase tracking-widest">{tag || "Strategic Report"}</span>
          </div>
          <h3 className="font-display text-display-md font-black text-bureau-ink uppercase italic leading-tight tracking-tight">
            {title}
          </h3>
        </div>

        <div className="relative">
          <p className="font-sans text-body-base text-bureau-slate font-medium leading-relaxed line-clamp-4">
            {description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-md bg-white border-t border-bureau-border mt-auto">
        <div className="flex items-center justify-between gap-sm">
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeepResearch?.(`Analyze brief: ${title}`, 'Claude'); }}
              className="w-10 h-10 border border-bureau-border hover:bg-bureau-ink hover:text-white flex items-center justify-center"
              title="Draft Brief"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeepResearch?.(`Verify sources for: ${title}`, 'Perplexity'); }}
              className="w-10 h-10 border border-bureau-border hover:bg-bureau-ink hover:text-white flex items-center justify-center"
              title="Verify Sources"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => onDeepResearch?.(`Strategic breakdown: ${title}`, 'Perplexity')}
            className="btn-action flex items-center gap-2 text-bureau-ink hover:text-bureau-signal"
          >
            Review Full Analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
