
import React from 'react';
import { Search, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

interface IntelligenceCardProps {
  id: string;
  date: string;
  title: string;
  description: string;
  tag?: string;
  onDeepResearch?: (query: string, source: 'Claude' | 'Perplexity' | 'Gemini') => void;
}

// Dynamic color mapping for categories
const getCategoryColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    'AI Strategy': 'from-purple-500 to-pink-500',
    'Revenue Growth': 'from-emerald-500 to-teal-500',
    'Market Trends': 'from-blue-500 to-cyan-500',
    'Competitive Analysis': 'from-orange-500 to-red-500',
    'Brand Intelligence': 'from-indigo-500 to-purple-500',
    'Customer Retention': 'from-green-500 to-emerald-500',
  };
  return colorMap[tag] || 'from-blue-500 to-purple-500';
};

const getCategoryBg = (tag: string) => {
  const bgMap: Record<string, string> = {
    'AI Strategy': 'bg-purple-50 text-purple-700 border-purple-200',
    'Revenue Growth': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Market Trends': 'bg-blue-50 text-blue-700 border-blue-200',
    'Competitive Analysis': 'bg-orange-50 text-orange-700 border-orange-200',
    'Brand Intelligence': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Customer Retention': 'bg-green-50 text-green-700 border-green-200',
  };
  return bgMap[tag] || 'bg-blue-50 text-blue-700 border-blue-200';
};

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({ id, date, title, description, tag, onDeepResearch }) => {
  const gradientClass = getCategoryColor(tag || '');
  const categoryClass = getCategoryBg(tag || '');

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 flex flex-col h-full relative group">
      {/* Card Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-600">{id}</span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      {/* Card Body */}
      <div className="px-6 pb-6 flex-grow space-y-4">
        {/* Category Tag - More prominent */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${categoryClass}`}>
            {tag || "Strategic Report"}
          </span>
        </div>

        {/* Title - Bolder, more dynamic */}
        <h3 className="font-display text-2xl font-black text-gray-900 leading-tight group-hover:text-bureau-signal transition-colors italic">
          {title}
        </h3>

        {/* Description - Better readability */}
        <p className="text-base text-gray-600 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Card Footer - Modern action buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDeepResearch?.(`Analyze brief: ${title}`, 'Claude'); }}
              className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 flex items-center justify-center transition-all"
              title="Analyze with Claude"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeepResearch?.(`Verify sources for: ${title}`, 'Perplexity'); }}
              className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 flex items-center justify-center transition-all"
              title="Research with Perplexity"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              console.log('[IntelligenceCard] Read Analysis clicked for:', title);
              onDeepResearch?.(`Strategic breakdown: ${title}`, 'Perplexity');
            }}
            className="text-sm font-bold flex items-center gap-2 px-5 py-2.5 rounded-lg bg-bureau-ink text-white hover:bg-gray-800 transition-all"
          >
            Read Analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
