import React from 'react';
import { TrendingUp, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { IntelligenceCard, PILLAR_CONFIG } from '../utils/dashboardMetrics';

interface FeaturedIntelligenceProps {
  cards: IntelligenceCard[];
  onCardClick: (card: IntelligenceCard) => void;
}

/**
 * EDITORIAL LOGIC: Only show charts when data is meaningful
 * - Requires 2+ data points with descriptive labels
 * - Rejects generic labels like "Signal 1", "Metric", etc.
 * - Better to show no chart than a confusing one
 */

// Check if a label is meaningful (not generic)
const isGenericLabel = (label: string): boolean => {
  return /^(signal|metric|value|data|item)\s*\d*$/i.test(label.trim());
};

// Extract a meaningful label from signal text
const extractMeaningfulLabel = (signal: string): string | null => {
  // Try to find entity/company names at start
  const entityMatch = signal.match(/^([A-Z][a-zA-Z\s&']+?)\s+(?:[\d$%])/);
  if (entityMatch && entityMatch[1].length > 2 && entityMatch[1].length < 25) {
    return entityMatch[1].trim();
  }
  
  // Try to find descriptive phrase before the number
  const beforeNumber = signal.split(/[\d$%]/)[0].trim();
  if (beforeNumber.length > 3 && beforeNumber.length < 30 && !isGenericLabel(beforeNumber)) {
    const cleaned = beforeNumber.replace(/^(the|a|an|in|of|for|with)\s+/i, '').trim();
    if (cleaned.length > 3) return cleaned;
  }
  
  return null;
};

// Extract numeric data from signals for visualization - WITH QUALITY FILTERING
const extractChartData = (card: IntelligenceCard, graphData?: any) => {
  const data: { label: string; value: number; color: string; unit: string; displayValue: string; context: string }[] = [];
  const colors = ['#2563EB', '#7C3AED', '#059669', '#EA580C'];

  if (!card && !graphData) return [];

  // Priority 1: Use backend graphData - but FILTER for quality
  if (graphData?.comparisons && Array.isArray(graphData.comparisons) && graphData.comparisons.length > 0) {
    graphData.comparisons.forEach((comp: any, i: number) => {
      // SKIP if label is generic
      if (!comp.label || isGenericLabel(comp.label)) return;
      
      if (comp && typeof comp.value === 'number' && !isNaN(comp.value) && comp.value > 0) {
        data.push({
          label: comp.label.trim().substring(0, 18),
          value: comp.value,
          color: colors[i % colors.length],
          unit: (comp.unit || '%').trim(),
          displayValue: `${comp.value.toFixed(1)}${comp.unit || ''}`,
          context: (comp.context || comp.label || '').trim()
        });
      }
    });
    // Only use if we have 2+ quality entries (for comparison)
    if (data.length >= 2) return data.slice(0, 4);
    data.length = 0; // Clear and try signals
  }

  if (graphData?.metrics && Array.isArray(graphData.metrics) && graphData.metrics.length > 0) {
    graphData.metrics.forEach((metric: any, i: number) => {
      // SKIP if label is generic
      if (!metric.label || isGenericLabel(metric.label)) return;
      
      if (metric && typeof metric.value === 'number' && !isNaN(metric.value) && metric.value > 0) {
        data.push({
          label: metric.label.trim().substring(0, 18),
          value: metric.value,
          color: colors[i % colors.length],
          unit: (metric.unit || '%').trim(),
          displayValue: `${metric.value.toFixed(1)}${metric.unit || ''}`,
          context: (metric.context || metric.label || '').trim()
        });
      }
    });
    if (data.length >= 2) return data.slice(0, 4);
    data.length = 0;
  }

  // Priority 2: Extract from signals - ONLY with meaningful labels
  if (card?.signals && Array.isArray(card.signals)) {
    card.signals.forEach((signal, i) => {
      if (!signal || typeof signal !== 'string') return;

      // Get meaningful label first - skip if none
      const label = extractMeaningfulLabel(signal);
      if (!label) return;

      // Try company/entity comparisons
      const companyMatch = signal.match(/([A-Z][a-zA-Z\s&]+(?:'s)?)\s+([\d.]+)\s*([%xBMK$]?)/);
      if (companyMatch) {
        const entity = companyMatch[1].trim();
        let value = parseFloat(companyMatch[2]);
        const unit = companyMatch[3] || '%';

        if (isNaN(value) || value <= 0) return;

        if (unit === 'B') value = value * 1000;
        else if (unit === 'M') value = value;
        else if (unit === 'K') value = value / 1000;
        else if (unit === 'x') value = value * 10;

        data.push({
          label: entity.substring(0, 18),
          value: value,
          color: colors[i % colors.length],
          unit: unit,
          displayValue: `${companyMatch[2]}${unit}`,
          context: signal
        });
        return;
      }

      // Extract percentages
      const percentMatch = signal.match(/([\d.]+)\s*%/);
      if (percentMatch) {
        const value = parseFloat(percentMatch[1]);
        if (!isNaN(value) && value > 0) {
          data.push({
            label: label.substring(0, 18),
            value: value,
            color: colors[i % colors.length],
            unit: '%',
            displayValue: `${value}%`,
            context: signal
          });
        }
        return;
      }

      // Extract dollar amounts
      const dollarMatch = signal.match(/\$([\d.]+)\s*([BMK]?)/);
      if (dollarMatch) {
        let value = parseFloat(dollarMatch[1]);
        const suffix = dollarMatch[2] || '';
        
        if (isNaN(value) || value <= 0) return;

        if (suffix === 'B') value = value * 1000;
        else if (suffix === 'M') value = value;
        else if (suffix === 'K') value = value / 1000;
        
        data.push({
          label: label.substring(0, 18),
          value: value,
          color: colors[i % colors.length],
          unit: `$${suffix}`,
          displayValue: `$${dollarMatch[1]}${suffix}`,
          context: signal
        });
      }
    });
  }

  // QUALITY GATE: Only return data if we have 2+ meaningful entries
  // A chart with 1 bar or generic labels is confusing, not helpful
  const validData = data.filter(d => 
    d && d.value > 0 && d.label && !isGenericLabel(d.label)
  );
  
  return validData.length >= 2 ? validData.slice(0, 4) : [];
};

export const FeaturedIntelligence: React.FC<FeaturedIntelligenceProps> = ({ cards, onCardClick }) => {
  if (cards.length === 0) return null;

  // Get the highest priority card as featured
  const featuredCard = cards[0];
  const chartData = extractChartData(featuredCard, featuredCard.graphData);
  const config = PILLAR_CONFIG[featuredCard.pillar];

  // Get secondary cards (next 2-3 stories)
  const secondaryCards = cards.slice(1, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Featured Card - Large with Chart */}
      <div
        className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:outline-none"
        onClick={() => onCardClick(featuredCard)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCardClick(featuredCard);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Read featured intelligence: ${featuredCard.title}`}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: config.color, color: 'white' }}
              >
                {config.label}
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold uppercase">Chart of the Day</span>
              </div>
            </div>
            <div className="text-slate-300 dark:text-gray-300 text-sm">
              {featuredCard.sourceCount || 8}+ sources analyzed
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">
            {featuredCard.title}
          </h2>

          {/* Summary */}
          <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl">
            {featuredCard.summary}
          </p>

          {/* Chart + Key Signals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chart */}
            {chartData && chartData.length > 0 && chartData.every(d => d && typeof d.value === 'number' && !isNaN(d.value)) && (
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-slate-300">Key Metrics</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.filter(d => d && typeof d.value === 'number' && !isNaN(d.value))} layout="vertical" margin={{ left: 5, right: 30, top: 5, bottom: 5 }}>
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                        tickFormatter={(value) => {
                          // Find the unit from the data
                          const entry = chartData.find(d => Math.abs(d.value - value) < 0.01);
                          if (!entry) return `${value}`;
                          if (entry.unit === '%') return `${value.toFixed(1)}%`;
                          if (entry.unit?.startsWith('$')) return entry.displayValue || `$${value.toFixed(1)}`;
                          return `${value.toFixed(1)}${entry.unit || ''}`;
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={100}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        label={{ 
                          position: 'right', 
                          fill: '#E2E8F0', 
                          fontSize: 11,
                          formatter: (value: number, entry: any) => {
                            // Safely access entry properties with fallbacks
                            if (!entry) return `${value}`;
                            const payload = entry.payload || entry;
                            if (!payload) return `${value}`;
                            return payload.displayValue || `${value.toFixed(1)}${payload.unit || ''}`;
                          }
                        }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key Signals List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-300">Key Signals</span>
              </div>
              {featuredCard.signals?.slice(0, 3).map((signal, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex items-center gap-2 text-blue-400 group-hover:text-blue-300 transition-colors">
            <span className="font-semibold">Read Full Analysis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Secondary Cards Stack */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider mb-4">
          More Intelligence
        </h3>
        {secondaryCards.map((card) => {
          const cardConfig = PILLAR_CONFIG[card.pillar];
          
          // Extract metric ONLY if we can provide meaningful context
          const extractMetricWithContext = (signals: string[], title: string) => {
            if (!signals || signals.length === 0) return null;
            
            // Try to extract metric from title first (most relevant)
            const titleMatch = title.match(/\$?([\d.]+)\s*([BMKTbmkt]?)\s*(%|x)?/i);
            if (titleMatch) {
              const val = `${titleMatch[1]}${(titleMatch[2] || '').toUpperCase()}${titleMatch[3] || ''}`;
              const beforeTitle = title.substring(0, title.indexOf(titleMatch[0])).split(/\s+/).slice(-2).join(' ');
              const afterTitle = title.substring(title.indexOf(titleMatch[0]) + titleMatch[0].length).split(/\s+/).slice(0, 2).join(' ');
              const ctx = `${beforeTitle} ${afterTitle}`.toLowerCase();
              const lbl = determineContextLabel(ctx);
              if (lbl) return { value: val, label: lbl };
            }
            
            const signal = signals[0];
            const match = signal.match(/(\$?[\d.]+\s*[BMKTbmkt]?%?x?)/i);
            if (!match) return null;
            
            const value = match[0].toUpperCase();
            const beforeMatch = signal.substring(0, match.index).split(/\s+/).slice(-3).join(' ').trim();
            const afterMatch = signal.substring((match.index || 0) + match[0].length).split(/\s+/).slice(0, 3).join(' ').trim();
            const context = `${beforeMatch} ${afterMatch}`.toLowerCase();
            
            const label = determineContextLabel(context);
            // Only return if we found a meaningful label
            return label ? { value, label } : null;
          };
          
          // Determine label from context - return null if can't determine
          const determineContextLabel = (ctx: string): string | null => {
            if (ctx.includes('market') && ctx.includes('size')) return 'Market Size';
            if (ctx.includes('market') && ctx.includes('share')) return 'Market Share';
            if (ctx.includes('market')) return 'Market';
            if (ctx.includes('revenue') || ctx.includes('sales')) return 'Revenue';
            if (ctx.includes('growth') || ctx.includes('increase') || ctx.includes('grew')) return 'Growth';
            if (ctx.includes('spend') || ctx.includes('budget')) return 'Spend';
            if (ctx.includes('investment') || ctx.includes('funding')) return 'Investment';
            if (ctx.includes('roi') || ctx.includes('return')) return 'ROI';
            if (ctx.includes('adoption') || ctx.includes('use')) return 'Adoption';
            if (ctx.includes('user') || ctx.includes('customer')) return 'Users';
            if (ctx.includes('save') || ctx.includes('saving')) return 'Savings';
            if (ctx.includes('cost') || ctx.includes('price')) return 'Cost';
            if (ctx.includes('hit') || ctx.includes('reach') || ctx.includes('total')) return 'Total';
            if (ctx.includes('contract') || ctx.includes('deal')) return 'Contracts';
            if (ctx.includes('network') || ctx.includes('platform')) return 'Scale';
            return null; // Don't show metric if no meaningful context
          };
          
          const metricData = extractMetricWithContext(card.signals, card.title);
          const metric = metricData?.value;
          const metricLabel = metricData?.label;

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 ease-out group focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:outline-none"
              onClick={() => onCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCardClick(card);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Read intelligence: ${card.title}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ backgroundColor: `${cardConfig.color}15`, color: cardConfig.color }}
                  >
                    {cardConfig.label}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-planner-orange transition-colors">
                    {card.title}
                  </h4>
                </div>
                {/* Only show metric if we have meaningful context */}
                {metric && metricLabel && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{metric}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-300 uppercase">{metricLabel}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
