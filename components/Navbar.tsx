
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { useAudience, AudienceType } from '../contexts/AudienceContext';

export const Navbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { audience, setAudience } = useAudience();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const audienceLabels: Record<AudienceType, string> = {
    'CMO': 'CMO',
    'VP_Marketing': 'VP Marketing',
    'Brand_Director': 'Brand Director',
    'Growth_Leader': 'Growth Leader'
  };

  const audienceOptions: AudienceType[] = ['CMO', 'VP_Marketing', 'Brand_Director', 'Growth_Leader'];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-bureau-ink/5 app-padding-x">
      <div className="max-w-wide mx-auto h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-lg">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <Logo variant="terminal" className="h-[32px] md:h-[40px]" />
          </a>

          <div className="hidden lg:flex items-center gap-md border-l border-bureau-ink/10 pl-md">
            <span className="text-xs text-bureau-slate/40">
              {currentTime} UTC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View as dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all"
            >
              <span className="text-xs text-gray-500">View as:</span>
              <span className="font-semibold">{audienceLabels[audience]}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {audienceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setAudience(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        audience === option ? 'bg-bureau-signal/5 text-bureau-signal font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {audienceLabels[option]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="bg-bureau-ink text-white px-6 py-3 text-sm font-semibold hover:bg-bureau-signal transition-all rounded-lg">
            Request Access
          </button>
        </div>
      </div>
    </nav>
  );
};
