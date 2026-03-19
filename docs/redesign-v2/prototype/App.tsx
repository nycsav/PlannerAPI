import React from 'react'
import { Navbar } from './components/Navbar'
import { HeroSearch } from './components/HeroSearch'
import { SignalFeed } from './components/SignalFeed'
export function App() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] font-sans selection:bg-[#f97316]/30">
      <Navbar />
      <main className="pt-16">
        <HeroSearch />
        <SignalFeed />
      </main>
    </div>
  )
}
