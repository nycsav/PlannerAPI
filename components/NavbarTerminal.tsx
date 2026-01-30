import React from 'react';
import { Terminal, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarTerminalProps {
  onSignupClick?: () => void;
}

export const NavbarTerminal: React.FC<NavbarTerminalProps> = ({ onSignupClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-sm border-b border-slate-800/50">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo + Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-white uppercase tracking-tight">
                    PLANNERAPI
                  </span>
                  <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded">
                    <span className="font-mono text-[8px] font-bold text-orange-400 uppercase tracking-widest">
                      BETA
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-px h-6 bg-slate-700" />
              <div className="font-mono text-xs text-slate-600">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'UTC'
                })} UTC
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-800/50 rounded transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* CTA */}
            <button
              onClick={onSignupClick}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center gap-2"
            >
              <span>CREATE FREE ACCOUNT</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
