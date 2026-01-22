import React from 'react';
import { TrendingUp, ArrowRight, Zap, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { IntelligenceCard, PILLAR_CONFIG } from '../utils/dashboardMetrics';

interface FeaturedIntelligenceProps {
  cards: IntelligenceCard[];
  onCardClick: (card: IntelligenceCard) => void;
}

// Extract numeric data from signals for visualization
const extractChartData = (card: IntelligenceCard) => {
  const data: { label: string; value: number; color: string }[] = [];
  const colors = ['#2563EB', '#7C3AED', '#059669', '#EA580C'];

  card.signals?.forEach((signal, i) => {
    // Extract numbers and their context
    const match = signal.match(/(\$?[\d.]+)([BMK%]?)/);
    if (match) {
      let value = parseFloat(match[1]);
      const suffix = match[2];

      // Normalize values for visualization
      if (suffix === 'B') value = value * 100;
      else if (suffix === 'M') value = value * 10;
      else if (suffix === 'K') value = value;
      else if (suffix === '%') value = value;

      // Extract a short label from the signal
      const labelMatch = signal.match(/^([^$\d]+)/);
      const label = labelMatch ? labelMatch[1].trim().slice(0, 20) : `Signal ${i + 1}`;

      data.push({
        label: label.length > 15 ? label.slice(0, 15) + '...' : label,
        value: Math.min(value, 100), // Cap for visualization
        color: colors[i % colors.length]
      });
    }
  });

  return data.slice(0, 4); // Max 4 bars
};

export const FeaturedIntelligence: React.FC<FeaturedIntelligenceProps> = ({ cards, onCardClick }) => {
  if (cards.length === 0) return null;

  // Get the highest priority card as featured
  const featuredCard = cards[0];
  const chartData = extractChartData(featuredCard);
  const config = PILLAR_CONFIG[featuredCard.pillar];

  // Get secondary cards (next 2-3 stories)
  const secondaryCards = cards.slice(1, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Featured Card - Large with Chart */}
      <div
        className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => onCardClick(featuredCard)}
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
            <div className="text-slate-400 text-sm">
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
            {chartData.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-slate-300">Key Metrics</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={80}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          More Intelligence
        </h3>
        {secondaryCards.map((card) => {
          const cardConfig = PILLAR_CONFIG[card.pillar];
          // Extract first metric for display
          const metric = card.signals?.[0]?.match(/(\$?[\d.]+[BMK%x]?)/)?.[0];

          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all group"
              onClick={() => onCardClick(card)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ backgroundColor: `${cardConfig.color}15`, color: cardConfig.color }}
                  >
                    {cardConfig.label}
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h4>
                </div>
                {metric && (
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-slate-900">{metric}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Key Metric</div>
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
