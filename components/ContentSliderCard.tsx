import React, { useEffect, useRef } from 'react';
import { Brain, TrendingUp, Compass, Radio, ArrowUpRight, Zap } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { PILLAR_CONFIG, Pillar, calculateReadTime, IntelligenceCard } from '../utils/dashboardMetrics';
import { useAnalytics } from '../hooks/useAnalytics';

interface ContentSliderCardProps {
  card: IntelligenceCard;
  onClick: () => void;
  index?: number;
}

// Pillar icons
const PILLAR_ICONS: Record<Pillar, React.ComponentType<{ className?: string }>> = {
  ai_strategy: Brain,
  brand_performance: TrendingUp,
  competitive_intel: Compass,
  media_trends: Radio
};

// Visual themes per pillar - gradient backgrounds for impact
const PILLAR_THEMES: Record<Pillar, {
  gradient: string;
  accent: string;
}> = {
  ai_strategy: {
    gradient: 'from-violet-600 to-purple-700',
    accent: '#7C3AED',
  },
  brand_performance: {
    gradient: 'from-blue-600 to-indigo-700',
    accent: '#2563EB',
  },
  competitive_intel: {
    gradient: 'from-orange-500 to-red-600',
    accent: '#EA580C',
  },
  media_trends: {
    gradient: 'from-emerald-500 to-teal-600',
    accent: '#059669',
  }
};

export const ContentSliderCard: React.FC<ContentSliderCardProps> = ({ card, onClick, index = 0 }) => {
  const config = PILLAR_CONFIG[card.pillar];
  const IconComponent = PILLAR_ICONS[card.pillar];
  const theme = PILLAR_THEMES[card.pillar];
  const readTime = calculateReadTime(card);

  // Analytics
  const { trackCardImpression, trackCardClick } = useAnalytics();
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  // Track impression when card is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedImpression.current && card.id) {
          trackCardImpression(card.id, card.pillar, index, 'slider');
          hasTrackedImpression.current = true;
        }
      },
      { threshold: 0.5 } // 50% visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [card.id, card.pillar, index, trackCardImpression]);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Extract the primary metric for display
  const primaryMetric = card.signals?.[0]?.match(/(\$?[\d.]+[BMK%x]?)/)?.[0] || null;

  const handleClick = () => {
    // Track click before navigating
    if (card.id) {
      trackCardClick(card.id, card.pillar, card.type || 'brief', card.title);
    }
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[300px] group cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Read intelligence: ${card.title}`}
    >
      <div className="
        rounded-2xl overflow-hidden
        bg-white border border-slate-200
        shadow-sm hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
      ">
        {/* Visual Header with Gradient */}
        <div className={`bg-gradient-to-br ${theme.gradient} p-5 relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />

          {/* Pillar badge */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <IconComponent className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {config.label}
              </span>
            </div>
            {card.type === 'hot_take' && (
              <div className="flex items-center gap-1 bg-amber-400 text-amber-900 px-2 py-1 rounded-full">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold uppercase">Hot</span>
              </div>
            )}
          </div>

          {/* Big Metric */}
          {primaryMetric && (
            <div className="relative">
              <div className="text-4xl font-black text-white tracking-tight">
                {primaryMetric}
              </div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">
                Key Metric
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {card.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {card.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium">{formatDate(card.publishedAt)}</span>
              <span>·</span>
              <span>{readTime}m read</span>
            </div>

            {/* Read indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 group-hover:text-white transition-all"
              style={{ backgroundColor: 'transparent' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ backgroundColor: theme.accent }}
              >
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
