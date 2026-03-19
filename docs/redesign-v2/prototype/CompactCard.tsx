import React from 'react'
import { MoreHorizontalIcon } from 'lucide-react'

export interface CompactCardProps {
  title: string
  summary: string
  score: number
  timestamp: string
}

const MOCK_SOURCES = [
  { color: '#10b981', initials: 'FT' },
  { color: '#6366f1', initials: 'R' },
]

export function CompactCard({ title, summary, score, timestamp }: CompactCardProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#f97316] overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.01] hover:border-[rgba(255,255,255,0.15)] hover:border-l-[#f97316] relative flex p-4 h-full">
      {/* Hover Menu */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors">
          <MoreHorizontalIcon size={16} />
        </button>
      </div>

      {/* Left: Score */}
      <div className="min-w-[60px] flex items-start justify-center pt-1">
        <span className="text-3xl font-bold text-[#f97316]">{score}</span>
      </div>

      {/* Right: Content */}
      <div className="flex-1 ml-3 flex flex-col">
        <h3 className="text-base font-semibold text-[#e8eaed] mb-1 pr-6">{title}</h3>
        <p className="text-sm text-[#8b8fa3] line-clamp-2 mb-3 flex-1">{summary}</p>

        {/* Bottom Row */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex gap-1">
            {MOCK_SOURCES.map((source, i) => (
              <div key={i} className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: source.color }}>
                {source.initials}
              </div>
            ))}
          </div>
          <span className="text-xs text-[#8b8fa3]">{timestamp}</span>
        </div>
      </div>
    </div>
  )
}
