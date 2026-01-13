
import React from 'react';
import { Hash, ChevronRight, TrendingUp, Cpu, Users, Palette, Activity, ShieldCheck, Target, Eye } from 'lucide-react';

interface ThreadSidebarProps {
  activeThread: string;
  onThreadChange: (thread: string) => void;
}

export const ThreadSidebar: React.FC<ThreadSidebarProps> = ({ activeThread, onThreadChange }) => {
  const themes = [
    { name: "All Intelligence", icon: <Hash className="w-3.5 h-3.5" /> },
    { name: "Cookies & Privacy", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { name: "Retail Media", icon: <Target className="w-3.5 h-3.5" /> },
    { name: "AI Creative", icon: <Palette className="w-3.5 h-3.5" /> },
    { name: "Attention & Outcomes", icon: <Eye className="w-3.5 h-3.5" /> },
    { name: "Talent & Skills", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-10 flex-shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-6 px-1 border-b border-scandi-navy/5 pb-2">
          <h3 className="font-mono text-[9px] uppercase font-black tracking-[0.2em] text-scandi-navy/40">Active Themes</h3>
        </div>
        <nav className="space-y-1">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => onThreadChange(theme.name)}
              className={`w-full group flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left border ${
                activeThread === theme.name 
                ? 'bg-scandi-navy border-scandi-navy text-white shadow-xl shadow-scandi-navy/20 translate-x-1' 
                : 'bg-white border-transparent hover:bg-scandi-navy/[0.02] hover:border-scandi-navy/5 text-scandi-navy/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${activeThread === theme.name ? 'text-white' : 'text-scandi-navy/20'} group-hover:text-scandi-blue transition-colors`}>
                  {theme.icon}
                </div>
                <span className={`text-[12px] font-bold tracking-tight ${activeThread === theme.name ? 'text-white' : 'group-hover:text-scandi-navy'}`}>
                  {theme.name}
                </span>
              </div>
              <ChevronRight className={`w-3 h-3 transition-transform ${activeThread === theme.name ? 'translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-scandi-navy/5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-scandi-blue" />
          <span className="font-mono text-[9px] uppercase font-black tracking-widest text-scandi-navy/60">System Feed</span>
        </div>
        <p className="text-[10px] leading-relaxed text-scandi-navy/40 font-medium italic">
          "Engine synced with latest market data 6 min ago."
        </p>
      </div>
    </aside>
  );
};
