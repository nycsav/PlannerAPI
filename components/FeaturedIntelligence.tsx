import React from 'react';
import { TrendingUp, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { IntelligenceCard, PILLAR_CONFIG } from '../utils/dashboardMetrics';

interface FeaturedIntelligenceProps {
  cards: IntelligenceCard[];
  onCardClick: (card: IntelligenceCard) => void;
}

// Extract numeric data from signals for visualization with improved parsing
const extractChartData = (card: IntelligenceCard, graphData?: any) => {
  const data: { label: string; value: number; color: string; unit: string; displayValue: string; context: string }[] = [];
  const colors = ['#2563EB', '#7C3AED', '#059669', '#EA580C'];

  // Return empty array if no data available
  if (!card && !graphData) return [];

  // If backend provided structured graph data, use it
  if (graphData?.comparisons && Array.isArray(graphData.comparisons) && graphData.comparisons.length > 0) {
    graphData.comparisons.forEach((comp: any, i: number) => {
      if (comp && typeof comp.value === 'number' && !isNaN(comp.value) && comp.value > 0) {
        data.push({
          label: (comp.label || `Item ${i + 1}`).trim(),
          value: comp.value,
          color: colors[i % colors.length],
          unit: (comp.unit || '%').trim(),
          displayValue: `${comp.value.toFixed(1)}${comp.unit || ''}`,
          context: (comp.context || comp.label || '').trim()
        });
      }
    });
    if (data.length > 0) return data;
  }

  if (graphData?.metrics && Array.isArray(graphData.metrics) && graphData.metrics.length > 0) {
    graphData.metrics.forEach((metric: any, i: number) => {
      if (metric && typeof metric.value === 'number' && !isNaN(metric.value) && metric.value > 0) {
        data.push({
          label: (metric.label || `Metric ${i + 1}`).trim(),
          value: metric.value,
          color: colors[i % colors.length],
          unit: (metric.unit || '%').trim(),
          displayValue: `${metric.value.toFixed(1)}${metric.unit || ''}`,
          context: (metric.context || metric.label || '').trim()
        });
      }
    });
    if (data.length > 0) return data;
  }

  // Fallback: Extract from signals with improved parsing
  if (card?.signals && Array.isArray(card.signals)) {
    card.signals.forEach((signal, i) => {
      if (!signal || typeof signal !== 'string') return;

      // Try to extract company/entity comparisons first
      const companyMatch = signal.match(/([A-Z][a-zA-Z\s&]+(?:'s)?)\s+([\d.]+)\s*([%xBMK$]?)/);
      if (companyMatch) {
        const entity = companyMatch[1].trim();
        let value = parseFloat(companyMatch[2]);
        const unit = companyMatch[3] || '%';

        if (isNaN(value) || value <= 0) return;

        // Normalize for visualization
        if (unit === 'B') value = value * 1000;
        else if (unit === 'M') value = value;
        else if (unit === 'K') value = value / 1000;
        else if (unit === 'x') value = value * 10;

        data.push({
          label: entity.length > 15 ? entity.substring(0, 12) + '...' : entity,
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
          const labelMatch = signal.match(/^([^%\d]+)/);
          const label = labelMatch ? labelMatch[1].trim().slice(0, 20) : `Signal ${i + 1}`;
          
          data.push({
            label: label.length > 15 ? label.substring(0, 12) + '...' : label,
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

        const labelMatch = signal.match(/^([^$\d]+)/);
        const label = labelMatch ? labelMatch[1].trim().slice(0, 20) : `Signal ${i + 1}`;
        
        data.push({
          label: label.length > 15 ? label.substring(0, 12) + '...' : label,
          value: value,
          color: colors[i % colors.length],
          unit: `$${suffix}`,
          displayValue: `$${dollarMatch[1]}${suffix}`,
          context: signal
        });
      }
    });
  }

  // Ensure all entries have required properties before returning
  return data
    .filter(d => d && typeof d.value === 'number' && !isNaN(d.value) && d.value > 0 && d.label && d.displayValue)
    .slice(0, 4); // Max 4 bars
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
          // Extract first metric for display
          const metric = card.signals?.[0]?.match(/(\$?[\d.]+[BMK%x]?)/)?.[0];

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
                {metric && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{metric}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-300 uppercase">Key Metric</div>
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
