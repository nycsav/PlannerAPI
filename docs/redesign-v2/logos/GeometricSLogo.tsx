import React from 'react'
interface GeometricSLogoProps {
  size?: number
  variant?: 'full' | 'mark' | 'wordmark'
  background?: 'dark' | 'light'
}
export function GeometricSMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Geometric S logo mark">
      <path
        d="M32 10 A12 12 0 0 0 8 10 A12 12 0 0 0 20 22 L28 26 A12 12 0 0 1 40 38 A12 12 0 0 1 16 38"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
export function GeometricSWordmark({ background = 'dark' }: { background?: 'dark' | 'light' }) {
  const textColor = background === 'dark' ? '#ffffff' : '#0a0e1a'
  return (
    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '1.5rem', color: textColor, letterSpacing: '0.01em' }}>
      signal2noise
    </span>
  )
}
export function GeometricSLogo({ size = 48, variant = 'full', background = 'dark' }: GeometricSLogoProps) {
  if (variant === 'mark') return <GeometricSMark size={size} />
  if (variant === 'wordmark') return <GeometricSWordmark background={background} />
  return (
    <div className="inline-flex items-center gap-4">
      <GeometricSMark size={size} />
      <GeometricSWordmark background={background} />
    </div>
  )
}
