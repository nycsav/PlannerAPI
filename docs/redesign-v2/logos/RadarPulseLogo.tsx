import React from 'react'
interface RadarPulseLogoProps {
  size?: number
  variant?: 'full' | 'mark' | 'wordmark'
  simplified?: boolean
}
export function RadarPulseMark({ size = 64, simplified = false }: { size?: number; simplified?: boolean }) {
  if (simplified || size <= 16) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Radar Pulse logo mark">
        <circle cx="32" cy="32" r="12" fill="#f97316" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Radar Pulse logo mark">
      <circle cx="32" cy="32" r="28" stroke="#f97316" strokeWidth="2" opacity="0.2" fill="none" />
      <circle cx="32" cy="32" r="19" stroke="#f97316" strokeWidth="2" opacity="0.5" fill="none" />
      <circle cx="32" cy="32" r="10" fill="#f97316" />
    </svg>
  )
}
export function RadarPulseWordmark() {
  return (
    <div className="inline-flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '2rem', letterSpacing: '0.05em' }}>S2N</span>
      <span style={{ color: '#8b8fa3', fontWeight: 400, fontSize: '0.875rem', letterSpacing: '0.02em' }}>signal2noise</span>
    </div>
  )
}
export function RadarPulseLogo({ size = 64, variant = 'full', simplified = false }: RadarPulseLogoProps) {
  if (variant === 'mark') return <RadarPulseMark size={size} simplified={simplified} />
  if (variant === 'wordmark') return <RadarPulseWordmark />
  return (
    <div className="inline-flex items-center gap-5">
      <RadarPulseMark size={size} simplified={simplified} />
      <RadarPulseWordmark />
    </div>
  )
}
