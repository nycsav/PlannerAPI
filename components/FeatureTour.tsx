import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

type TourStep = {
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
};

type FeatureTourProps = {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
};

export const FeatureTour: React.FC<FeatureTourProps> = ({ isOpen, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      title: 'Search for Intelligence',
      description: 'Ask any marketing question and get structured analysis with signals, moves, and sources.',
      target: 'input[placeholder*="What"]',
      position: 'bottom',
    },
    {
      title: 'Fresh Daily Intelligence',
      description: 'New AI-generated market analysis every morning at 6am ET. Scroll down to see today\'s briefings.',
      target: '[class*="DAILY INTELLIGENCE"]',
      position: 'top',
    },
    {
      title: 'Executive Strategy Chat',
      description: 'Click "Ask Strategy Assistant" for conversational analysis and follow-up questions.',
      target: 'button:has-text("Ask Strategy Assistant"), button[class*="planner-navy"]',
      position: 'top',
    },
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updateHighlight = () => {
      try {
        const element = document.querySelector(currentStepData.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightRect(rect);
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (error) {
        console.error('Tour highlight error:', error);
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [currentStep, currentStepData.target, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!highlightRect) return {};

    const padding = 16;
    const tooltipWidth = 320;

    switch (currentStepData.position) {
      case 'bottom':
        return {
          top: highlightRect.bottom + padding,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'top':
        return {
          bottom: window.innerHeight - highlightRect.top + padding,
          left: highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          top: highlightRect.top + highlightRect.height / 2,
          right: window.innerWidth - highlightRect.left + padding,
        };
      case 'right':
        return {
          top: highlightRect.top + highlightRect.height / 2,
          left: highlightRect.right + padding,
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-[300]">
      {/* Backdrop with spotlight */}
      <div className="absolute inset-0 bg-gray-900/80 dark:bg-slate-900/90 backdrop-blur-sm">
        {/* Spotlight cutout (simulated with border) */}
        {highlightRect && (
          <div
            className="absolute pointer-events-none border-4 border-planner-orange rounded-lg transition-all duration-300"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {highlightRect && (
        <div
          className="absolute bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-80 transition-all duration-300"
          style={getTooltipPosition()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx <= currentStep ? 'bg-planner-orange' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>

            {/* Step counter */}
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleNext}
                className="flex-1 bg-planner-orange text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-planner-orange/90 hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Got it <Check className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-600 focus:ring-offset-2 rounded px-2 py-1"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
