// Terminal-style animations and effects
// Scanline overlay, staggered reveals, typing cursor, etc.

import React, { useEffect, useState } from 'react';

// Scanline overlay - CRT terminal effect
export const ScanlineOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => (
  <div
    className="fixed inset-0 pointer-events-none z-[999]"
    style={{
      background: `repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, ${opacity}) 0px,
        transparent 1px,
        transparent 2px,
        rgba(0, 0, 0, ${opacity}) 3px
      )`,
      animation: 'scanline 8s linear infinite',
    }}
  >
    <style>{`
      @keyframes scanline {
        0% { transform: translateY(0); }
        100% { transform: translateY(4px); }
      }
    `}</style>
  </div>
);

// Typing cursor effect for loading states
export const TypingCursor: React.FC<{ text: string; className?: string }> = ({
  text,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [text]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayText}
      <span
        className="inline-block w-2 h-4 bg-current ml-1 align-middle"
        style={{ opacity: showCursor ? 1 : 0 }}
      />
    </span>
  );
};

// Staggered fade-in for sections
export const StaggeredReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`${className} transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Terminal-style loading bars
export const TerminalLoadingBars: React.FC<{
  count?: number;
  className?: string;
  label?: string;
}> = ({ count = 5, className = '', label = 'Loading...' }) => (
  <div className={`flex flex-col items-center gap-4 ${className}`}>
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-1 h-8 bg-blue-500/30 rounded-sm"
          style={{
            animation: 'terminalPulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
    {label && (
      <span className="font-mono text-xs text-blue-400 uppercase tracking-widest">
        {label}
      </span>
    )}
    <style>{`
      @keyframes terminalPulse {
        0%, 100% {
          opacity: 0.3;
          transform: scaleY(0.5);
        }
        50% {
          opacity: 1;
          transform: scaleY(1);
        }
      }
    `}</style>
  </div>
);

// Data stream effect - numbers scrolling
export const DataStream: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [streams, setStreams] = useState<string[]>([]);

  useEffect(() => {
    const generateStream = () => {
      const chars = '01';
      return Array.from({ length: 20 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    };

    const interval = setInterval(() => {
      setStreams(prev => {
        const newStreams = [...prev];
        if (newStreams.length >= 5) newStreams.shift();
        newStreams.push(generateStream());
        return newStreams;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      {streams.map((stream, i) => (
        <div
          key={i}
          className="font-mono text-[8px] text-blue-500/20 leading-tight animate-in fade-in slide-in-from-top"
          style={{ animationDuration: '100ms' }}
        >
          {stream}
        </div>
      ))}
    </div>
  );
};

// Glitch effect for emphasis
export const GlitchText: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}> = ({ children, className = '', intensity = 'low' }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchIntervals = {
      low: 5000,
      medium: 3000,
      high: 1000
    };

    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 100);
    }, glitchIntervals[intensity]);

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <span
      className={`relative ${className}`}
      style={{
        transform: isGlitching ? `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)` : 'none',
        transition: 'transform 50ms'
      }}
    >
      {children}
    </span>
  );
};

// Terminal boot sequence (for loading screen)
export const BootSequence: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);

  const bootLines = [
    'INITIALIZING INTELLIGENCE TERMINAL...',
    'LOADING CORE SYSTEMS...',
    'CONNECTING TO PERPLEXITY FEEDS...',
    'ESTABLISHING SECURE CONNECTION...',
    'SYSTEM READY'
  ];

  useEffect(() => {
    if (currentLine < bootLines.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [currentLine, bootLines.length, onComplete]);

  return (
    <div className="font-mono text-xs text-emerald-400 space-y-1">
      {bootLines.slice(0, currentLine).map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-emerald-500">▸</span>
          <span>{line}</span>
          {i === currentLine - 1 && (
            <span className="w-2 h-3 bg-emerald-400 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};
