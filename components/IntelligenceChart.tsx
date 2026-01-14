import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download } from 'lucide-react';

interface IntelligenceChartProps {
  data: Array<{value: string, context: string}>;
  title?: string;
}

export const IntelligenceChart: React.FC<IntelligenceChartProps> = ({ data, title = "Key Metrics" }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Parse percentage metrics into chart data
  const chartData = data.map((metric, idx) => {
    const numericValue = parseFloat(metric.value.replace('%', ''));
    // Truncate context for chart labels
    const label = metric.context.length > 25
      ? metric.context.substring(0, 22) + '...'
      : metric.context;

    return {
      name: label,
      value: numericValue,
      fullContext: metric.context
    };
  }).filter(d => !isNaN(d.value));

  // Color palette for bars
  const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

  const handleDownload = () => {
    if (!chartRef.current) return;

    // Create canvas from chart SVG
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = svg.clientWidth * 2;
    canvas.height = svg.clientHeight * 2;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `intelligence-chart-${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
          }
        });
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-lg space-y-md">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-black text-bureau-ink italic uppercase tracking-tight">
          {title}
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-xs font-semibold text-bureau-slate hover:text-bureau-signal transition-colors px-3 py-2 border border-gray-200 rounded-lg hover:border-bureau-signal"
        >
          <Download className="w-4 h-4" />
          Download Chart
        </button>
      </div>

      <div ref={chartRef} className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            <YAxis
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#64748B' } }}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: number) => [`${value}%`, 'Value']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullContext;
                }
                return label;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-gray-500 italic border-t border-gray-100 pt-md">
        Data extracted from intelligence brief • Click bars for details
      </div>
    </div>
  );
};
