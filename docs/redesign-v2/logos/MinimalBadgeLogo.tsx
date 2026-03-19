import React from 'react'
interface MinimalBadgeLogoProps {
  size?: number
}
export function MinimalBadgeMark({ size = 64 }: { size?: number }) {
  const rx = size * 0.2
  const fontSize = size * 0.32
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Minimal Badge logo mark">
      <rect x="2" y="2" width="60" height="60" rx={rx > 12.8 ? 12.8 : rx} fill="#f97316" />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={fontSize > 20 ? 20 : fontSize}>
        S2N
      </text>
    </svg>
  )
}
export function MinimalBadgeWordmark() {
  return (
    <span className="inline-flex items-baseline gap-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem' }}>Signal</span>
      <span style={{ color: '#8b8fa3', fontWeight: 700, fontSize: '1.25rem' }}>2</span>
      <span className="inline-block mx-0.5" style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#f97316', alignSelf: 'center', position: 'relative', top: '-1px' }} />
      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.25rem' }}>Noise</span>
    </span>
  )
}
export function MinimalBadgeLogo({ size = 64 }: MinimalBadgeLogoProps) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <MinimalBadgeMark size={size} />
      <MinimalBadgeWordmark />
    </div>
  )
}
