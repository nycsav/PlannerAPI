import React from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, MoreHorizontalIcon } from 'lucide-react'

export interface StandardCardProps {
  title: string
  summary: string
  score: number
  momentum: 'Surging' | 'Rising' | 'Stable' | 'Falling'
  positive: boolean | null
  timestamp: string
  sparklineData: { value: number }[]
}

const MOCK_SOURCES = [
  { color: '#3b82f6', initials: 'TC' },
  { color: '#8b5cf6', initials: 'WSJ' },
  { color: '#f97316', initials: 'BB' },
]

export function StandardCard({ title, summary, score, momentum, positive, timestamp, sparklineData }: StandardCardProps) {
  const getMomentumColor = () => {
    if (positive === true) return 'text-[#22c55e] bg-[rgba(34,197,94,0.15)]'
    if (positive === false) return 'text-[#ef4444] bg-[rgba(239,68,68,0.15)]'
    return 'text-[#8b8fa3] bg-[rgba(255,255,255,0.08)]'
  }
  const MomentumIcon = () => {
    if (positive === true) return <TrendingUpIcon size={12} />
    if (positive === false) return <TrendingDownIcon size={12} />
    return <MinusIcon size={12} />
  }

  return (
    <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.01] hover:border-[rgba(255,255,255,0.15)] relative flex flex-col h-full">
      {/* Hover Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors">
          <MoreHorizontalIcon size={16} />
        </button>
      </div>

      {/* Sparkline */}
      <div className="h-[60px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorSparkline-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#f97316"
              strokeWidth={1.5}
              fillOpacity={1}
              fill={`url(#colorSparkline-${title.replace(/\s+/g, '')})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-[#e8eaed] mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-[#8b8fa3] line-clamp-1 mb-3">{summary}</p>

        {/* Sources */}
        <div className="flex gap-1.5 mb-auto">
          {MOCK_SOURCES.map((source, i) => (
            <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: source.color }}>
              {source.initials}
            </div>
          ))}
        </div>

        {/* Score Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#8b8fa3] uppercase tracking-wider">Signal Strength</span>
            <span className="text-xs font-semibold text-white">{score}</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#22c55e]" style={{ width: `${score}%` }}></div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center mt-3">
          <div className={`rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1 ${getMomentumColor()}`}>
            <MomentumIcon />
            {momentum}
          </div>
          <span className="text-xs text-[#8b8fa3]">{timestamp}</span>
        </div>
      </div>
    </div>
  )
}
