import React from 'react'
interface SignalWaveLogoProps {
  size?: number
  variant?: 'full' | 'mark' | 'wordmark'
  background?: 'dark' | 'light'
}
export function SignalWaveMark({ size = 48 }: { size?: number }) {
  const scale = size / 48
  const w = 120 * scale
  const h = 48 * scale
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Signal Wave logo mark"
    >
      <circle cx="16" cy="24" r="12" fill="#f97316" />
      <path
        d="M30 24 C38 8, 50 8, 58 24 C66 40, 78 40, 86 24"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M30 24 C36 12, 45 12, 51 24 C57 36, 66 36, 72 24"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M30 24 C34 16, 40 16, 44 24 C48 32, 54 32, 58 24"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
    </svg>
  )
}
export function SignalWaveWordmark({ background = 'dark' }: { background?: 'dark' | 'light' }) {
  const textColor = background === 'dark' ? '#ffffff' : '#0a0e1a'
  return (
    <span className="inline-flex items-baseline gap-0" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span style={{ color: textColor, fontWeight: 700, fontSize: '1.5rem' }}>Signal</span>
      <span style={{ color: '#8b8fa3', fontWeight: 700, fontSize: '1.5rem' }}>2</span>
      <span className="inline-block mx-0.5" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f97316', alignSelf: 'center', position: 'relative', top: '-1px' }} />
      <span style={{ color: textColor, fontWeight: 700, fontSize: '1.5rem' }}>Noise</span>
    </span>
  )
}
export function SignalWaveLogo({ size = 48, variant = 'full', background = 'dark' }: SignalWaveLogoProps) {
  if (variant === 'mark') return <SignalWaveMark size={size} />
  if (variant === 'wordmark') return <SignalWaveWordmark background={background} />
  return (
    <div className="inline-flex items-center gap-4">
      <SignalWaveMark size={size} />
      <SignalWaveWordmark background={background} />
    </div>
  )
}
