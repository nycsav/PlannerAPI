import React from 'react'
import { SearchIcon } from 'lucide-react'
const TRENDING_PILLS = [
  'AI Funding Q1',
  'Enterprise SaaS',
  'Anthropic vs OpenAI',
  'Climate Tech',
  'Semiconductor Wars',
]
export function HeroSearch() {
  return (
    <div className="max-w-3xl mx-auto pt-28 pb-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white text-center tracking-tight">
        What signal are you tracking?
      </h1>
      <p className="text-[#8b8fa3] text-lg text-center mt-4">
        AI-powered competitive intelligence, distilled from 10,000+ sources
      </p>

      <div className="mt-8 h-14 w-full bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.08)] flex items-center px-4 gap-3 transition-all focus-within:border-[rgba(255,255,255,0.2)] focus-within:shadow-[0_0_20px_rgba(249,115,22,0.1)]">
        <SearchIcon size={20} className="text-[#8b8fa3]" />
        <input
          type="text"
          placeholder="Search signals, companies, trends..."
          className="bg-transparent text-[#e8eaed] placeholder:text-[#8b8fa3]/50 flex-1 outline-none h-full"
        />
        <div className="bg-[rgba(255,255,255,0.08)] rounded-md px-2 py-1 text-xs text-[#8b8fa3] font-mono flex items-center justify-center">
          ⌘K
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {TRENDING_PILLS.map((pill) => (
          <button
            key={pill}
            className="bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full px-4 py-1.5 text-sm text-[#8b8fa3] hover:text-white cursor-pointer transition-all"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  )
}
