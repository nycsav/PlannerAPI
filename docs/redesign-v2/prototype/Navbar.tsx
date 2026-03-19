import React from 'react'
import { MoonIcon } from 'lucide-react'
export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <span className="font-bold text-white text-lg tracking-tight">
            Signal
          </span>
          <span className="text-[#8b8fa3] font-normal mx-0.5">2</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mx-0.5"></div>
          <span className="font-bold text-white text-lg tracking-tight">
            Noise
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="text-[#8b8fa3] hover:text-white transition-colors">
            <MoonIcon size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ec4899] flex items-center justify-center text-xs text-white font-medium cursor-pointer">
            SN
          </div>
        </div>
      </div>
    </nav>
  )
}
