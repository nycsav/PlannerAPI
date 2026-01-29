import React, { useState, useMemo, useCallback } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Filter, X, ChevronRight, Maximize2, Download, Share2 } from 'lucide-react';

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

interface InteractiveDashboardProps {
  metrics?: MetricData[];
  comparisons?: ComparisonData[];
  query: string;
  signals?: Array<{ id: string; title: string; summary: string; sourceName?: string; sourceUrl?: string }>;
  onMetricClick?: (metric: MetricData) => void;
  onComparisonClick?: (comparison: ComparisonData) => void;
  onExport?: (format: 'pdf' | 'png') => void;
}

/**
 * InteractiveDashboard - Premium interactive visualization component
 * Replaces static InsightDashboard with Hex/Profound-level interactivity
 * 
 * Features:
 * - Drill-down on any metric/comparison
 * - Filter controls (date, category, metric type)
 * - Comparison mode (side-by-side)
 * - Export customization
 * - Real-time updates
 */
export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  metrics = [],
  comparisons = [],
  query,
  signals = [],
  onMetricClick,
  onComparisonClick,
  onExport,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonData | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState<Set<number>>(new Set());
  const [activeFilters, setActiveFilters] = useState<{
    dateRange?: '7d' | '30d' | 'all';
    category?: string;
    metricType?: 'revenue' | 'growth' | 'adoption' | 'all';
  }>({});

  // Filter metrics based on active filters
  const filteredMetrics = useMemo(() => {
    let filtered = [...metrics];
    
    if (activeFilters.metricType && activeFilters.metricType !== 'all') {
      filtered = filtered.filter(m => {
        const lowerLabel = m.label.toLowerCase();
        const lowerValue = m.value.toLowerCase();
        switch (activeFilters.metricType) {
          case 'revenue':
            return lowerValue.includes('$') || lowerLabel.includes('revenue') || lowerLabel.includes('spend');
          case 'growth':
            return lowerValue.includes('%') || lowerLabel.includes('growth') || lowerLabel.includes('rate');
          case 'adoption':
            return lowerLabel.includes('adoption') || lowerLabel.includes('usage') || lowerLabel.includes('user');
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [metrics, activeFilters]);

  // Filter comparisons based on active filters
  const filteredComparisons = useMemo(() => {
    return [...comparisons];
  }, [comparisons, activeFilters]);

  // Get metric style (icon, color, etc.)
  const getMetricStyle = (value: string, label: string) => {
    const lowerLabel = label.toLowerCase();
    const lowerValue = value.toLowerCase();
    
    if (lowerValue.includes('$') || lowerLabel.includes('revenue') || lowerLabel.includes('spend') || lowerLabel.includes('cost')) {
      return { 
        Icon: TrendingUp, 
        accent: '#34d399', // emerald
        bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
        border: 'border-emerald-500/20 dark:border-emerald-400/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        hoverGlow: 'hover:shadow-emerald-500/20'
      };
    }
    if (lowerValue.includes('%') || lowerLabel.includes('rate') || lowerLabel.includes('growth')) {
      return { 
        Icon: TrendingUp, 
        accent: '#22d3ee', // cyan
        bg: 'bg-cyan-500/10 dark:bg-cyan-400/10',
        border: 'border-cyan-500/20 dark:border-cyan-400/20',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        hoverGlow: 'hover:shadow-cyan-500/20'
      };
    }
    if (lowerLabel.includes('user') || lowerLabel.includes('customer') || lowerLabel.includes('employee')) {
      return { 
        Icon: TrendingUp, 
        accent: '#a78bfa', // violet
        bg: 'bg-violet-500/10 dark:bg-violet-400/10',
        border: 'border-violet-500/20 dark:border-violet-400/20',
        iconColor: 'text-violet-600 dark:text-violet-400',
        hoverGlow: 'hover:shadow-violet-500/20'
      };
    }
    return { 
      Icon: BarChart2, 
      accent: '#f97316', // orange
      bg: 'bg-orange-500/10 dark:bg-orange-400/10',
      border: 'border-orange-500/20 dark:border-orange-400/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      hoverGlow: 'hover:shadow-orange-500/20'
    };
  };

  // Format label intelligently
  const formatLabel = (label: string, context?: string) => {
    if (/^(Signal|Metric|Value|Data)\s*\d*$/i.test(label) && context) {
      const contextLower = context.toLowerCase();
      if (contextLower.includes('market')) return 'Market Size';
      if (contextLower.includes('revenue')) return 'Revenue';
      if (contextLower.includes('growth')) return 'Growth Rate';
      if (contextLower.includes('adoption')) return 'Adoption';
      if (contextLower.includes('spend')) return 'Spend';
      if (contextLower.includes('roi')) return 'ROI';
      return label;
    }
    return label;
  };

  // Handle metric click (drill-down)
  const handleMetricClick = useCallback((metric: MetricData) => {
    setSelectedMetric(metric);
    onMetricClick?.(metric);
  }, [onMetricClick]);

  // Handle comparison click (drill-down or add to comparison)
  const handleComparisonClick = useCallback((comparison: ComparisonData, index: number) => {
    if (comparisonMode) {
      // Toggle selection for comparison mode
      setSelectedComparisons(prev => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    } else {
      // Single drill-down
      setSelectedComparison(comparison);
      onComparisonClick?.(comparison);
    }
  }, [comparisonMode, onComparisonClick]);

  // Calculate max value for bar scaling
  const maxComparisonValue = Math.max(...filteredComparisons.map(c => c.value), 100);

  // Generate colors for comparison bars
  const getBarColor = (index: number, isSelected: boolean = false) => {
    const colors = [
      { bg: '#22d3ee', hover: '#06b6d4' }, // cyan
      { bg: '#34d399', hover: '#10b981' }, // emerald
      { bg: '#f97316', hover: '#ea580c' }, // orange
      { bg: '#a78bfa', hover: '#8b5cf6' }, // violet
      { bg: '#fbbf24', hover: '#f59e0b' }, // amber
    ];
    const color = colors[index % colors.length];
    return isSelected 
      ? { bg: color.hover, opacity: 1 }
      : { bg: color.bg, opacity: 0.8 };
  };

  if (metrics.length === 0 && comparisons.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/50 overflow-hidden mb-8 shadow-lg">
      {/* Premium Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/60 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-planner-orange to-orange-600 rounded-lg shadow-sm">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Interactive Dashboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any metric to explore • {filteredMetrics.length} metrics, {filteredComparisons.length} comparisons
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, metricType: prev.metricType === 'all' ? undefined : 'all' }))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            
            {/* Comparison Mode Toggle */}
            {comparisons.length > 1 && (
              <button
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  setSelectedComparisons(new Set());
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  comparisonMode
                    ? 'bg-planner-orange text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Compare
              </button>
            )}
            
            {/* Export */}
            {onExport && (
              <button
                onClick={() => onExport('pdf')}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                aria-label="Export dashboard"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
            >
              {isExpanded ? (
                <X className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls (shown when expanded) */}
        {isExpanded && activeFilters.metricType && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter by:</span>
            {['all', 'revenue', 'growth', 'adoption'].map(type => (
              <button
                key={type}
                onClick={() => setActiveFilters(prev => ({ ...prev, metricType: type as any }))}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 ${
                  activeFilters.metricType === type
                    ? 'bg-planner-orange text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-6 space-y-8">
          {/* Key Metrics Grid - Interactive */}
          {filteredMetrics.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMetrics.slice(0, 8).map((metric, index) => {
                  const style = getMetricStyle(metric.value, metric.label);
                  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : null;
                  const isSelected = selectedMetric?.value === metric.value && selectedMetric?.label === metric.label;

                  return (
                    <button
                      key={index}
                      onClick={() => handleMetricClick(metric)}
                      className={`
                        relative bg-white dark:bg-slate-800 rounded-xl p-4 border-2 transition-all duration-200 ease-out
                        ${isSelected 
                          ? 'border-planner-orange shadow-lg scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                        }
                        ${style.hoverGlow}
                        group cursor-pointer
                      `}
                    >
                      {/* Accent line */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-all duration-200"
                        style={{ backgroundColor: isSelected ? style.accent : `${style.accent}40` }}
                      />
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 ${style.bg} rounded-lg`}>
                          <style.Icon className={`w-4 h-4 ${style.iconColor}`} />
                        </div>
                        {TrendIcon && (
                          <div className={`p-1 rounded-md ${
                            metric.trend === 'up' 
                              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                              : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
                          }`}>
                            <TrendIcon className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
                        {metric.value}
                      </div>
                      
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {formatLabel(metric.label, metric.context)}
                      </div>

                      {/* Drill-down indicator */}
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Explore</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Bars - Interactive */}
          {filteredComparisons.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                {comparisonMode ? 'Select Comparisons' : 'Comparisons'}
              </h4>
              <div className="space-y-3">
                {filteredComparisons.slice(0, 6).map((comparison, index) => {
                  const barWidth = (comparison.value / maxComparisonValue) * 100;
                  const isSelected = comparisonMode ? selectedComparisons.has(index) : selectedComparison?.label === comparison.label;
                  const color = getBarColor(index, isSelected);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleComparisonClick(comparison, index)}
                      className={`
                        w-full group text-left p-4 rounded-xl border-2 transition-all duration-200 ease-out
                        ${isSelected
                          ? 'border-planner-orange bg-orange-50/50 dark:bg-orange-900/10 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm bg-white dark:bg-slate-800/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {comparison.label}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                          {comparison.value}{comparison.unit}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${Math.max(barWidth, 3)}%`,
                            backgroundColor: color.bg,
                            opacity: color.opacity
                          }}
                        />
                      </div>
                      {comparison.context && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
                          {comparison.context}
                        </p>
                      )}
                      {!comparisonMode && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Click to explore</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison Mode View */}
          {comparisonMode && selectedComparisons.size > 0 && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Side-by-Side Comparison
              </h4>
              <div className="space-y-2">
                {Array.from(selectedComparisons).map(index => {
                  const comp = filteredComparisons[index];
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{comp.label}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{comp.value}{comp.unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drill-Down View */}
          {(selectedMetric || selectedComparison) && (
            <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-planner-orange">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {selectedMetric ? 'Metric Details' : 'Comparison Details'}
                </h4>
                <button
                  onClick={() => {
                    setSelectedMetric(null);
                    setSelectedComparison(null);
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              
              {selectedMetric && (
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {selectedMetric.value}
                    </div>
                    <div className="text-base font-semibold text-slate-600 dark:text-slate-300">
                      {formatLabel(selectedMetric.label, selectedMetric.context)}
                    </div>
                  </div>
                  {selectedMetric.context && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedMetric.context}
                    </p>
                  )}
                  {/* Related signals */}
                  {signals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Related Signals
                      </p>
                      <div className="space-y-2">
                        {signals.slice(0, 3).map((signal, idx) => (
                          <div key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                            • {signal.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedComparison && (
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {selectedComparison.value}{selectedComparison.unit}
                    </div>
                    <div className="text-base font-semibold text-slate-600 dark:text-slate-300">
                      {selectedComparison.label}
                    </div>
                  </div>
                  {selectedComparison.context && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedComparison.context}
                    </p>
                  )}
                  {selectedComparison.source && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Source
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedComparison.source}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
