
import React from 'react';
import { Zap, TrendingUp, ArrowUpRight, Activity, Terminal, ShieldAlert } from 'lucide-react';

export type TelemetryVariant = 'ticker' | 'matrix' | 'hud';

interface SignalItem {
  label: string;
  value: string;
  trend: string;
  status: 'critical' | 'nominal' | 'warning' | 'stable';
  icon: React.ReactNode;
}

const signals: SignalItem[] = [
  { label: "CPM", value: "+18.4%", trend: "VOLATILE", status: 'critical', icon: <TrendingUp className="w-3 h-3" /> },
  { label: "ATTENTION", value: "92.4%", trend: "PEAK", status: 'nominal', icon: <Zap className="w-3 h-3" /> },
  { label: "TALENT", value: "SHIFT", trend: "ACCELERATING", status: 'warning', icon: <Terminal className="w-3 h-3" /> },
  { label: "LATENCY", value: "142ms", trend: "OPTIMAL", status: 'stable', icon: <Activity className="w-3 h-3" /> },
  { label: "YIELD", value: "-2.1%", trend: "DRIFT", status: 'warning', icon: <ShieldAlert className="w-3 h-3" /> },
  { label: "REACH", value: "4.2M", trend: "INDEXED", status: 'stable', icon: <ArrowUpRight className="w-3 h-3" /> }
];

interface SignalTelemetryProps {
  variant?: TelemetryVariant;
  onSignalClick: (q: string) => void;
}

export const SignalTelemetry: React.FC<SignalTelemetryProps> = ({ variant = 'ticker', onSignalClick }) => {
  const getStatusStyles = (status: SignalItem['status']) => {
    switch (status) {
      case 'critical': return 'text-bureau-critical bg-bureau-critical/5 border-bureau-critical/10';
      case 'nominal': return 'text-bureau-nominal bg-bureau-nominal/5 border-bureau-nominal/10';
      case 'warning': return 'text-bureau-warning bg-bureau-warning/5 border-bureau-warning/10';
      default: return 'text-bureau-signal bg-bureau-signal/5 border-bureau-signal/10';
    }
  };

  // Fix: Added key to the props type definition for the inner component to satisfy TypeScript's JSX validation
  const SignalBadge = ({ signal, className = "" }: { signal: SignalItem, className?: string, key?: React.Key }) => (
    <button 
      onClick={() => onSignalClick(`Analyze the ${signal.trend} shift in ${signal.label} metrics`)}
      className={`group flex items-center gap-3 px-4 py-2 border rounded-xl transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 bg-white whitespace-nowrap snap-center ${className}`}
    >
      <div className={`p-1.5 rounded-lg ${getStatusStyles(signal.status).split(' ')[0]} bg-current/10`}>
        {signal.icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-black text-bureau-ink/40 uppercase tracking-tight">{signal.label}</span>
        <span className="font-display font-black text-sm text-bureau-ink tracking-tightest">{signal.value}</span>
      </div>
      <div className={`font-mono text-[9px] font-black uppercase tracking-tighter px-1.5 rounded-md ${getStatusStyles(signal.status)}`}>
        {signal.trend}
      </div>
    </button>
  );

  return (
    <div className="w-full relative overflow-hidden py-4">
      {/* Mobile Swipe Container */}
      <div className="flex md:hidden overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 gap-4 pb-2">
        {signals.map((s, i) => (
          <SignalBadge key={i} signal={s} className="min-w-[160px]" />
        ))}
      </div>

      {/* Desktop Ticker */}
      <div className="hidden md:flex items-center gap-6 animate-ticker hover:[animation-play-state:paused] whitespace-nowrap">
        {[...signals, ...signals].map((s, i) => (
          <SignalBadge key={i} signal={s} />
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 45s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
