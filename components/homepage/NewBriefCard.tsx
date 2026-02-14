import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share2 } from 'lucide-react';

export interface BriefData {
  id: string;
  title: string;
  summary: string;
  signals?: Array<{
    title: string;
    content: string;
    source?: string;
  }>;
  moves?: Array<{
    title: string;
    content: string;
  }>;
  pillar: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
  source?: string;
  sourceTier?: number;
  date?: string;
  readTime?: string;
}

interface BriefCardProps {
  brief: BriefData;
  onClick?: () => void;
}

const pillarColors = {
  ai_strategy: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  brand_performance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  competitive_intel: 'bg-planner-orange/10 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  media_trends: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

const pillarLabels = {
  ai_strategy: 'AI Strategy',
  brand_performance: 'Brand Performance',
  competitive_intel: 'Competitive Intel',
  media_trends: 'Media Trends',
};

export const NewBriefCard: React.FC<BriefCardProps> = ({ brief, onClick }) => {
  const [showSignals, setShowSignals] = useState(false);
  const [showMoves, setShowMoves] = useState(false);

  return (
    <article className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:border-planner-orange dark:hover:border-planner-orange transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${pillarColors[brief.pillar]}`}>
            {pillarLabels[brief.pillar]}
          </span>
          {brief.date && (
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              {new Date(brief.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-display text-2xl font-bold text-bureau-ink dark:text-dark-ink mb-3 leading-tight hover:text-planner-orange dark:hover:text-planner-orange cursor-pointer transition-colors" onClick={onClick}>
        {brief.title}
      </h3>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {brief.summary}
      </p>

      {brief.signals && brief.signals.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowSignals(!showSignals)}
            className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
          >
            <span className="font-semibold text-bureau-ink dark:text-dark-ink flex items-center gap-2">
              <span className="w-2 h-2 bg-planner-orange rounded-full" />
              {brief.signals.length} Signals
            </span>
            {showSignals ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showSignals && (
            <div className="mt-3 space-y-3 pl-6">
              {brief.signals.map((signal, index) => (
                <div key={index} className="border-l-2 border-planner-orange pl-4 py-2">
                  <h4 className="font-semibold text-bureau-ink dark:text-dark-ink mb-1">
                    {signal.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {signal.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {brief.moves && brief.moves.length > 0 && (
        <div>
          <button
            onClick={() => setShowMoves(!showMoves)}
            className="flex items-center justify-between w-full py-3 px-4 bg-planner-orange/5 dark:bg-planner-orange/10 rounded-lg hover:bg-planner-orange/10 dark:hover:bg-planner-orange/20 transition-colors border border-planner-orange/20"
          >
            <span className="font-semibold text-planner-orange flex items-center gap-2">
              <span className="text-lg">⚡</span>
              Next move
            </span>
            {showMoves ? <ChevronUp size={20} className="text-planner-orange" /> : <ChevronDown size={20} className="text-planner-orange" />}
          </button>

          {showMoves && (
            <div className="mt-3 space-y-3 pl-6">
              {brief.moves.map((move, index) => (
                <div key={index} className="border-l-2 border-planner-orange pl-4 py-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {move.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onClick}
          className="w-full py-3 px-6 bg-planner-orange hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          Read Full Brief
        </button>
      </div>
    </article>
  );
};
