import React from 'react'
import { TrendingUpIcon, MoreHorizontalIcon } from 'lucide-react'
const SOURCES = [
  { color: '#3b82f6', initials: 'MC' },
  { color: '#f97316', initials: 'FO' },
  { color: '#22c55e', initials: 'BI' },
]
export function HeroCard() {
  return (
    <div className="col-span-1 md:col-span-2 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.01] hover:border-[rgba(255,255,255,0.15)] relative flex flex-col h-full">
      {/* Hover Menu */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors">
          <MoreHorizontalIcon size={16} />
        </button>
      </div>

      {/* Gradient Image Placeholder */}
      <div className="h-48 w-full bg-gradient-to-br from-blue-600/80 to-purple-600/80 relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs uppercase tracking-wider text-[#f97316] font-medium mb-2">
          MARKET SHIFT
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          OpenAI's Enterprise Push Reshapes the B2B AI Landscape
        </h2>
        <p className="text-sm text-[#8b8fa3] line-clamp-2 mb-4 flex-1">
          Major enterprise contracts signal a fundamental shift in how companies
          adopt AI infrastructure. Revenue projections revised upward across the sector.
        </p>

        {/* Sources */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-1">
            {SOURCES.map((source, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#0a0e1a]"
                style={{ backgroundColor: source.color }}
              >
                {source.initials}
              </div>
            ))}
          </div>
          <span className="text-xs text-[#8b8fa3] ml-1">+4 sources</span>
        </div>

        {/* Score Section */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-[#8b8fa3]">Signal Score</span>
          <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
            <div className="w-[87%] h-full rounded-full bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#22c55e]"></div>
          </div>
          <span className="text-sm font-semibold text-white">87</span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="bg-[rgba(34,197,94,0.15)] text-[#22c55e] rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
            <TrendingUpIcon size={12} />
            Rising
          </div>
          <span className="text-xs text-[#8b8fa3]">2 hours ago</span>
        </div>
      </div>
    </div>
  )
}
