import React from 'react';
import { DollarSign, Percent, Users, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ExtractedMetric } from '../utils/extractMetrics';

interface MetricsSummaryProps {
  metrics: ExtractedMetric[];
  layout?: 'row' | 'grid';
  maxMetrics?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  dollar: DollarSign,
  percent: Percent,
  users: Users,
  target: Target
};

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
  neutral: { icon: Minus, color: 'text-bureau-slate', bg: 'bg-bureau-surface' }
};

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  metrics,
  layout = 'row',
  maxMetrics = 5
}) => {
  const displayMetrics = metrics.slice(0, maxMetrics);

  if (displayMetrics.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-bureau-border rounded-lg p-4">
      <h3 className="font-display text-lg font-black text-bureau-ink uppercase tracking-tight mb-4">
        Key Metrics
      </h3>

      <div className={`${
        layout === 'row'
          ? 'flex flex-wrap gap-3'
          : 'grid grid-cols-2 md:grid-cols-3 gap-3'
      }`}>
        {displayMetrics.map((metric, index) => {
          const IconComponent = metric.icon ? ICON_MAP[metric.icon] : Target;
          const trendConfig = TREND_CONFIG[metric.trend || 'neutral'];
          const TrendIcon = trendConfig.icon;

          return (
            <div
              key={`${metric.value}-${index}`}
              className="flex items-center gap-3 bg-bureau-surface/50 rounded-lg p-3 flex-1 min-w-[140px]"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${trendConfig.bg} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className={`w-5 h-5 ${trendConfig.color}`} />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-bureau-ink">
                    {metric.value}
                  </span>
                  <TrendIcon className={`w-4 h-4 ${trendConfig.color}`} />
                </div>
                <p className="text-xs text-bureau-slate/70 truncate">
                  {metric.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-bureau-slate/50 mt-3 italic">
        Metrics extracted from intelligence briefs
      </p>
    </div>
  );
};
