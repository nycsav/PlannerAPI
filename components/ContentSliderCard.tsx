import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, TrendingUp, Compass, Radio, ArrowUpRight, Flame, Users } from 'lucide-react';
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
  media_trends: Radio,
  org_readiness: Users
};

// Discover slider category accent colors (per spec)
const CATEGORY_COLORS: Record<Pillar, string> = {
  ai_strategy: '#22d3ee', // cyan
  brand_performance: '#a78bfa', // violet
  competitive_intel: '#f97316', // orange
  media_trends: '#34d399', // emerald
  org_readiness: '#fbbf24' // amber
};

export const ContentSliderCard: React.FC<ContentSliderCardProps> = ({ card, onClick, index = 0 }) => {
  const config = PILLAR_CONFIG[card.pillar];
  const IconComponent = PILLAR_ICONS[card.pillar];
  const readTime = calculateReadTime(card);
  const accent = CATEGORY_COLORS[card.pillar];
  const [isPressed, setIsPressed] = useState(false);

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

  const isHot = useMemo(() => {
    if (card.type === 'hot_take') return true;
    // If we don't have an explicit isHot, treat stories <24h as hot/trending
    const published = card.publishedAt?.toDate?.();
    if (!published) return false;
    return Date.now() - published.getTime() < 24 * 60 * 60 * 1000;
  }, [card.type, card.publishedAt]);

  // Content guards per spec (frontend enforcement)
  const displayTitle = useMemo(() => {
    const raw = (card.title || '').trim();
    if (raw.length <= 70) return raw;
    const truncated = raw.slice(0, 70);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${(lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trim()}…`;
  }, [card.title]);

  const displayPreview = useMemo(() => {
    const raw = (card.summary || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const hard = raw.length <= 120 ? raw : `${raw.slice(0, 120).trim()}…`;
    // Prefer implication-forward feel; avoid dead-ending on a fact-period when truncated
    if (hard.endsWith('.')) return `${hard.slice(0, -1)}…`;
    return hard;
  }, [card.summary]);

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
      className="flex-shrink-0 group cursor-pointer"
      onClick={() => {
        setIsPressed(true);
        window.setTimeout(() => setIsPressed(false), 110);
        handleClick();
      }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Read intelligence: ${displayTitle}`}
    >
      <div 
        className="
          rounded-2xl overflow-hidden
          border
          bg-[#0b1020]
          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          transition-all duration-200 ease-out
          hover:-translate-y-[4px]
          focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none
        "
        style={{
          borderColor: 'rgba(30, 41, 59, 0.9)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${accent}40`;
          e.currentTarget.style.boxShadow = `0 0 20px ${accent}26, 0 10px 30px rgba(0, 0, 0, 0.35)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
        }}
      >
        {/* Premium editorial card body */}
        <div
          className={`
            p-5 h-full flex flex-col
            ${isPressed ? 'scale-[0.98]' : ''}
          `}
          style={{
            boxShadow: `0 0 0 1px rgba(30,41,59,0.9)`,
          }}
        >
          {/* Top row: Category tag + flame */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider"
              style={{
                borderColor: `${accent}66`,
                color: accent
              }}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </div>

            {/* Flame icon (no text) per spec */}
            {isHot && (
              <Flame
                className="w-4 h-4"
                style={{ color: '#f97316' }}
                aria-label="Trending"
              />
            )}
          </div>

          {/* Headline */}
          <h3
            className="text-[15px] font-black leading-snug mb-3 line-clamp-2 transition-colors duration-200 ease-out group-hover:text-white"
            style={{ color: '#f1f5f9' }}
          >
            {displayTitle}
          </h3>

          {/* Preview */}
          <p className="text-sm leading-relaxed line-clamp-2 mb-5" style={{ color: '#94a3b8' }}>
            {displayPreview}
          </p>

          {/* Optional metric row (only if meaningful) */}
          {primaryMetric && metricLabel && (
            <div className="mt-auto mb-4 flex items-baseline justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                {metricLabel}
              </div>
              <div className="text-lg font-black" style={{ color: '#f1f5f9' }}>
                {primaryMetric}
              </div>
            </div>
          )}

          {/* Footer: date · read time */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800/70">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748b' }}>
              <span>{formatDate(card.publishedAt)}</span>
              <span aria-hidden="true">·</span>
              <span>{readTime}m read</span>
            </div>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-out"
              style={{
                backgroundColor: 'transparent'
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out"
                style={{
                  backgroundColor: `${accent}33`,
                  boxShadow: `0 0 20px ${accent}26`
                }}
              >
                <ArrowUpRight className="w-4 h-4" style={{ color: '#ffffff' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
