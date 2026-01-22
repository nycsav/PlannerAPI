import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PillarDistribution, PILLAR_CONFIG, Pillar } from '../utils/dashboardMetrics';

interface PillarDistributionChartProps {
  data: PillarDistribution[];
  onPillarClick?: (pillar: Pillar) => void;
  selectedPillar?: Pillar | null;
  showLegend?: boolean;
}

export const PillarDistributionChart: React.FC<PillarDistributionChartProps> = ({
  data,
  onPillarClick,
  selectedPillar,
  showLegend = true
}) => {
  // Filter out pillars with 0 count for cleaner chart
  const chartData = data.filter(d => d.count > 0);
  const totalCount = chartData.reduce((sum, d) => sum + d.count, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-bureau-slate/50 text-sm">
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-bureau-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-bureau-ink">{data.label}</p>
          <p className="text-sm text-bureau-slate">
            {data.count} cards ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy }: any) => {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-bureau-ink"
      >
        <tspan x={cx} dy="-0.5em" className="text-3xl font-bold">{totalCount}</tspan>
        <tspan x={cx} dy="1.5em" className="text-xs fill-bureau-slate">cards</tspan>
      </text>
    );
  };

  return (
    <div className="bg-white border border-bureau-border rounded-lg p-4">
      <h3 className="font-display text-lg font-black text-bureau-ink uppercase tracking-tight mb-4">
        Content by Pillar
      </h3>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              labelLine={false}
              label={renderCustomLabel}
              onClick={(data) => onPillarClick?.(data.pillar)}
              style={{ cursor: onPillarClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.pillar}
                  fill={entry.color}
                  opacity={selectedPillar && selectedPillar !== entry.pillar ? 0.3 : 1}
                  stroke={selectedPillar === entry.pillar ? '#1B365D' : 'transparent'}
                  strokeWidth={selectedPillar === entry.pillar ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item) => (
            <button
              key={item.pillar}
              onClick={() => onPillarClick?.(item.pillar)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                onPillarClick ? 'hover:bg-bureau-surface cursor-pointer' : ''
              } ${selectedPillar === item.pillar ? 'bg-bureau-surface' : ''}`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-bureau-ink truncate">
                  {item.label}
                </p>
                <p className="text-xs text-bureau-slate/70">
                  {item.count} ({item.percentage}%)
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
