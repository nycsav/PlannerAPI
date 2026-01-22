import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

type WelcomeTooltipProps = {
  onDismiss: () => void;
};

export const WelcomeTooltip: React.FC<WelcomeTooltipProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in after brief delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200); // Wait for fade out
  };

  return (
    <div
      className={`absolute top-full left-0 right-0 mt-4 mx-auto max-w-xl z-50 transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-white border-2 border-planner-orange rounded-xl shadow-xl p-6 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-bureau-slate/40 hover:text-bureau-ink transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-planner-orange/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-planner-orange" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-lg font-bold text-bureau-ink mb-2">
              Get Strategic Intelligence in Seconds
            </h3>
            <p className="text-sm text-bureau-slate mb-4">
              Ask any marketing question and get structured analysis with signals, recommended moves, and sources. Try:{' '}
              <span className="text-bureau-ink font-medium">"What's driving the $4.2B shift in attribution spend?"</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDismiss}
                className="text-sm font-semibold text-planner-orange hover:text-planner-orange/80 transition-colors"
              >
                Got it
              </button>
              <span className="text-xs text-bureau-slate/60">
                Press Enter to search
              </span>
            </div>
          </div>
        </div>

        {/* Arrow pointing up to search box */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="w-6 h-6 bg-white border-t-2 border-l-2 border-planner-orange transform rotate-45" />
        </div>
      </div>
    </div>
  );
};
