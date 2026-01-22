
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'terminal' | 'compass' | 'pivot';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8", variant = 'terminal', showText = true }) => {
  const colors = {
    primary: '#111827', // Bureau Ink
    signal: '#EF4444',  // Signal Red
    blue: '#1D4ED8',    // Bureau Signal Blue
  };

  const TerminalLogo = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="2" fill={colors.primary} />
        <path d="M12 14L20 20L12 26" stroke={colors.signal} strokeWidth="4" strokeLinecap="square" />
        <line x1="22" y1="28" x2="30" y2="28" stroke="white" strokeWidth="4" />
      </svg>
      {showText && (
        <span className="font-display text-xl md:text-2xl font-extrabold tracking-tightest uppercase italic text-bureau-ink" style={{ fontStyle: 'italic' }}>
          PLANNER<span className="text-bureau-signal not-italic font-extrabold ml-0.5" style={{ fontStyle: 'normal' }}>API</span>
        </span>
      )}
    </div>
  );

  const CompassLogo = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke={colors.primary} strokeWidth="1.5" />
        <path d="M14 26L26 14M26 14H18M26 14V22" stroke={colors.signal} strokeWidth="3" strokeLinecap="square" strokeLinejoin="bevel" />
        <circle cx="20" cy="20" r="3" fill={colors.primary} />
      </svg>
      {showText && (
        <span className="font-display font-black tracking-tightest uppercase text-bureau-ink">
          PLANNER<span className="font-mono font-bold text-bureau-slate tracking-widest ml-1 text-sm">/API</span>
        </span>
      )}
    </div>
  );

  const PivotLogo = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-full aspect-square">
        <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 36H36V4" stroke={colors.primary} strokeWidth="1" strokeDasharray="2 2" />
          <path d="M4 36C4 36 12 28 24 24C36 20 36 4 36 4" stroke={colors.blue} strokeWidth="3" />
          <path d="M30 4H36V10" stroke={colors.signal} strokeWidth="3" strokeLinecap="square" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-black tracking-tightest uppercase text-bureau-ink text-lg">PLANNER</span>
          <span className="font-mono font-bold text-[10px] uppercase tracking-[0.4em] text-bureau-signal">INTELLIGENCE_API</span>
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'compass': return <CompassLogo />;
    case 'pivot': return <PivotLogo />;
    default: return <TerminalLogo />;
  }
};
