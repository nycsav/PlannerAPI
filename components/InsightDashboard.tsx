import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Activity, DollarSign, Percent, Users, Hash } from 'lucide-react';

interface MetricData {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  context?: string;
}

interface ComparisonData {
  label: string;
  value: number;
  unit: string;
  context: string;
  source?: string;
}

interface InsightDashboardProps {
  metrics?: MetricData[];
  comparisons?: ComparisonData[];
  query: string;
  onClose?: () => void;
}

/**
 * InsightDashboard - Premium visualization component for Intelligence Briefs
 * Shows KPI cards and comparison charts extracted from the brief content
 */
export const InsightDashboard: React.FC<InsightDashboardProps> = ({
  metrics = [],
  comparisons = [],
  query,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get appropriate icon and accent color for metric type
  const getMetricStyle = (value: string, label: string) => {
    const lowerLabel = label.toLowerCase();
    const lowerValue = value.toLowerCase();
    
    if (lowerValue.includes('$') || lowerLabel.includes('revenue') || lowerLabel.includes('spend') || lowerLabel.includes('cost')) {
      return { 
        Icon: DollarSign, 
        accent: 'from-emerald-500 to-teal-400',
        bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    if (lowerValue.includes('%') || lowerLabel.includes('rate') || lowerLabel.includes('growth')) {
      return { 
        Icon: Percent, 
        accent: 'from-blue-500 to-indigo-400',
        bg: 'bg-blue-500/10 dark:bg-blue-400/10',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    }
    if (lowerLabel.includes('user') || lowerLabel.includes('customer') || lowerLabel.includes('employee')) {
      return { 
        Icon: Users, 
        accent: 'from-violet-500 to-purple-400',
        bg: 'bg-violet-500/10 dark:bg-violet-400/10',
        iconColor: 'text-violet-600 dark:text-violet-400'
      };
    }
    if (lowerValue.includes('x')) {
      return { 
        Icon: Activity, 
        accent: 'from-amber-500 to-orange-400',
        bg: 'bg-amber-500/10 dark:bg-amber-400/10',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    }
    return { 
      Icon: Hash, 
      accent: 'from-slate-500 to-gray-400',
      bg: 'bg-slate-500/10 dark:bg-slate-400/10',
      iconColor: 'text-slate-600 dark:text-slate-400'
    };
  };

  // Generate colors for comparison bars
  const getBarColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-blue-500 to-blue-400',
      'bg-gradient-to-r from-emerald-500 to-emerald-400',
      'bg-gradient-to-r from-amber-500 to-amber-400',
      'bg-gradient-to-r from-violet-500 to-violet-400',
      'bg-gradient-to-r from-rose-500 to-rose-400',
    ];
    return colors[index % colors.length];
  };

  // Calculate max value for comparison bar scaling
  const maxComparisonValue = Math.max(...comparisons.map(c => c.value), 100);

  // If no data to show, return null
  if (metrics.length === 0 && comparisons.length === 0) {
    return null;
  }

  // Clean up label for display
  const formatLabel = (label: string, context?: string) => {
    // Use context if it's more descriptive
    if (context && context.length > label.length && context.length < 60) {
      return context;
    }
    return label;
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-900/50 border border-slate-200/60 dark:border-slate-700/40 overflow-hidden mb-6 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-bureau-signal to-bureau-signal/80 dark:from-planner-orange dark:to-planner-orange/80 rounded-lg shadow-sm">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Insight Dashboard
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Key metrics extracted from this brief
            </p>
          </div>
        </div>
        <div className="p-1.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2">
          {/* KPI Cards */}
          {metrics.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {metrics.slice(0, 6).map((metric, index) => {
                  const { Icon, bg, iconColor, accent } = getMetricStyle(metric.value, metric.label);
                  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : null;
                  const trendColor = metric.trend === 'up' 
                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                    : metric.trend === 'down' 
                      ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' 
                      : '';

                  return (
                    <div
                      key={index}
                      className="relative bg-white dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-all hover:shadow-md group overflow-hidden"
                    >
                      {/* Subtle gradient accent line */}
                      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} opacity-60`} />
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-1.5 ${bg} rounded-lg`}>
                          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        </div>
                        {TrendIcon && (
                          <div className={`p-1 rounded-md ${trendColor}`}>
                            <TrendIcon className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                        {metric.value}
                      </div>
                      
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {formatLabel(metric.label, metric.context)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Bars */}
          {comparisons.length > 0 && (
            <div className={metrics.length > 0 ? 'mt-5' : ''}>
              <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Comparisons
              </h4>
              <div className="space-y-2.5">
                {comparisons.slice(0, 5).map((comparison, index) => {
                  const barWidth = (comparison.value / maxComparisonValue) * 100;
                  
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {comparison.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                          {comparison.value}{comparison.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getBarColor(index)} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(barWidth, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              From: <span className="italic">"{query.length > 40 ? query.substring(0, 40) + '...' : query}"</span>
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <Activity className="w-3 h-3" />
              <span>Auto-extracted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
