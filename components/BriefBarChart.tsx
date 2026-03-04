import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface Comparison {
  label: string;
  value: number;
  unit: string;
  context: string;
  source?: string;
}

interface BriefBarChartProps {
  comparisons: Comparison[];
  query?: string;
}

const ORANGE = '#F97316';
const ORANGE_LIGHT = '#FED7AA';
const BLUE = '#3B82F6';

const formatValue = (value: number, unit: string) => {
  if (unit === 'M') return `$${value}M`;
  if (unit === '%') return `${value}%`;
  if (unit === 'x') return `${value}x`;
  return `${value}${unit}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Comparison;
  return (
    <div className="bg-gray-900 dark:bg-slate-800 border border-gray-700 rounded-lg p-3 max-w-[240px] shadow-xl">
      <p className="text-xs font-bold text-white mb-1">{formatValue(d.value, d.unit)}</p>
      <p className="text-[11px] text-gray-300 leading-snug">{d.context}</p>
      {d.source && (
        <p className="text-[10px] text-gray-500 mt-1 font-mono">{d.source}</p>
      )}
    </div>
  );
};

export const BriefBarChart: React.FC<BriefBarChartProps> = ({ comparisons, query }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize so all bars are on a common 0–100 scale when units differ
  const allSameUnit = comparisons.every(c => c.unit === comparisons[0].unit);
  const maxValue = Math.max(...comparisons.map(c => c.value));

  const data = comparisons.map(c => ({
    ...c,
    displayValue: allSameUnit ? c.value : (c.value / maxValue) * 100,
  }));

  const unit = allSameUnit ? comparisons[0].unit : '%';
  const isPercentage = unit === '%' || !allSameUnit;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800">
        <div className="p-1.5 bg-planner-orange/10 rounded-lg">
          <BarChart3 className="w-4 h-4 text-planner-orange" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
            Data Visualization
          </p>
          {query && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate max-w-[320px]">
              {query}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-planner-orange animate-pulse" />
          <span className="text-[10px] text-gray-400 font-mono">live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={comparisons.length * 48 + 20}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="rgba(148,163,184,0.15)"
            />
            <XAxis
              type="number"
              domain={[0, isPercentage ? 100 : maxValue * 1.1]}
              tickFormatter={(v) => isPercentage ? `${Math.round(v)}%` : formatValue(v, unit)}
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.05)' }} />
            <Bar
              dataKey="displayValue"
              radius={[0, 4, 4, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              label={{
                position: 'right',
                formatter: (_: any, __: any, index: number) =>
                  formatValue(comparisons[index].value, comparisons[index].unit),
                fontSize: 11,
                fontWeight: 700,
                fill: '#F97316',
                fontFamily: 'monospace',
              }}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={hoveredIndex === index ? ORANGE : ORANGE_LIGHT}
                  style={{ transition: 'fill 0.15s ease' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {!allSameUnit && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-2 text-center">
            Normalized to relative scale — hover bars for exact values
          </p>
        )}
      </div>
    </div>
  );
};
