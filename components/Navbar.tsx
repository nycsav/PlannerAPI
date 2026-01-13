
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-bureau-ink/5 app-padding-x">
      <div className="max-w-wide mx-auto h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-lg">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <Logo variant="terminal" className="h-[32px] md:h-[40px]" />
          </a>
          
          <div className="hidden lg:flex items-center gap-md border-l border-bureau-ink/10 pl-md">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-bureau-ink/20">
              TERMINAL_UTC {currentTime}
            </span>
          </div>
        </div>

        <button className="bg-bureau-ink text-white btn-intelligence rounded-sm font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-bureau-signal transition-all shadow-lg active:scale-95">
          Access Engine
        </button>
      </div>
    </nav>
  );
};
