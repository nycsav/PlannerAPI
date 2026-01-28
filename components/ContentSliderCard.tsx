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

  // Extract the primary metric ONLY if we can provide meaningful context
  // Better to show no metric than a confusing one
  const extractMetricWithContext = (signals: string[], title: string) => {
    if (!signals || signals.length === 0) return null;
    
    // First, try to extract metric that's mentioned in the title (most relevant)
    const titleMatch = title.match(/\$?([\d.]+)\s*([BMKTbmkt]?)\s*(%|x)?/i);
    if (titleMatch) {
      const value = `${titleMatch[1]}${(titleMatch[2] || '').toUpperCase()}${titleMatch[3] || ''}`;
      
      // Get context from title around the number
      const beforeTitle = title.substring(0, title.indexOf(titleMatch[0])).split(/\s+/).slice(-2).join(' ');
      const afterTitle = title.substring(title.indexOf(titleMatch[0]) + titleMatch[0].length).split(/\s+/).slice(0, 2).join(' ');
      
      const label = determineLabel(`${beforeTitle} ${afterTitle}`);
      if (label !== 'Key Metric') {
        return { value: titleMatch[0].includes('$') ? value : `${value}`, label };
      }
    }
    
    const signal = signals[0];
    const match = signal.match(/(\$?[\d.]+\s*[BMKTbmkt]?%?x?)/i);
    if (!match) return null;
    
    const value = match[0].toUpperCase();
    
    // Extract context words around the metric
    const beforeMatch = signal.substring(0, match.index).split(/\s+/).slice(-3).join(' ').trim();
    const afterMatch = signal.substring((match.index || 0) + match[0].length).split(/\s+/).slice(0, 3).join(' ').trim();
    
    const label = determineLabel(`${beforeMatch} ${afterMatch}`);
    
    // QUALITY GATE: Only return if we have a meaningful label
    // If label is still "Key Metric", don't show it - it adds no value
    if (label === 'Key Metric') return null;
    
    return { value, label };
  };
  
  // Determine meaningful label from context
  const determineLabel = (context: string): string => {
    const c = context.toLowerCase();
    
    if (c.includes('market') && c.includes('size')) return 'Market Size';
    if (c.includes('market') && c.includes('share')) return 'Market Share';
    if (c.includes('market')) return 'Market';
    if (c.includes('revenue') || c.includes('sales')) return 'Revenue';
    if (c.includes('growth') || c.includes('increase') || c.includes('grew')) return 'Growth';
    if (c.includes('spend') || c.includes('budget')) return 'Spend';
    if (c.includes('investment') || c.includes('funding')) return 'Investment';
    if (c.includes('roi') || c.includes('return')) return 'ROI';
    if (c.includes('adoption') || c.includes('using') || c.includes('use')) return 'Adoption';
    if (c.includes('user') || c.includes('customer')) return 'Users';
    if (c.includes('save') || c.includes('saving')) return 'Savings';
    if (c.includes('cost') || c.includes('price')) return 'Cost';
    if (c.includes('hit') || c.includes('reach') || c.includes('total')) return 'Total';
    if (c.includes('contract') || c.includes('deal')) return 'Contracts';
    if (c.includes('higher') || c.includes('better') || c.includes('improve')) return 'Improvement';
    if (c.includes('network') || c.includes('platform')) return 'Scale';
    
    // If no specific match, don't show a generic label
    return 'Key Metric';
  };
  
  const metricData = extractMetricWithContext(card.signals, card.title);
  const primaryMetric = metricData?.value || null;
  const metricLabel = metricData?.label || null;

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
        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
        shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600
        transition-all duration-200 ease-out
        focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:outline-none
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

          {/* Big Metric - Only show if we have meaningful context */}
          {primaryMetric && metricLabel && (
            <div className="relative">
              <div className="text-4xl font-black text-white tracking-tight">
                {primaryMetric}
              </div>
              <div className="text-xs text-white/70 uppercase tracking-wider mt-1">
                {metricLabel}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-planner-orange transition-colors">
            {card.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-4">
            {card.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">{formatDate(card.publishedAt)}</span>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <span>{readTime}m read</span>
            </div>

            {/* Read indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-300 group-hover:text-white transition-all duration-200"
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
