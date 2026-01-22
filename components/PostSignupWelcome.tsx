import React, { useState } from 'react';
import { CheckCircle, Sparkles, TrendingUp, Clock, X } from 'lucide-react';

type PostSignupWelcomeProps = {
  userName?: string | null;
  onClose: () => void;
  onStartTour?: () => void;
};

export const PostSignupWelcome: React.FC<PostSignupWelcomeProps> = ({
  userName,
  onClose,
  onStartTour,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <CheckCircle className="w-8 h-8 text-planner-orange" />,
      title: `Welcome, ${userName || 'Executive'}!`,
      description: 'Your account is ready. Here\'s what you can do now:',
      features: [
        { icon: <Sparkles className="w-4 h-4" />, text: 'Ask unlimited strategic questions' },
        { icon: <TrendingUp className="w-4 h-4" />, text: 'Get fresh Daily Intelligence (updated 6am ET)' },
        { icon: <Clock className="w-4 h-4" />, text: 'Save briefs and access them anytime' },
      ],
      cta: 'Show me around',
      secondaryCta: 'Skip tour',
    },
  ];

  const currentStepData = steps[currentStep];

  const handlePrimaryCTA = () => {
    if (onStartTour) {
      onStartTour();
    }
    onClose();
  };

  const handleSecondaryCTA = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bureau-ink/70 backdrop-blur-md"
        onClick={handleSecondaryCTA}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-planner-orange to-bureau-signal" />

        {/* Close button */}
        <button
          onClick={handleSecondaryCTA}
          className="absolute top-6 right-6 text-bureau-slate/40 hover:text-bureau-ink transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-planner-orange/10 rounded-full flex items-center justify-center">
              {currentStepData.icon}
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-bureau-ink mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-bureau-slate">
              {currentStepData.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {currentStepData.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-bureau-surface border border-bureau-border hover:border-bureau-signal/20 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bureau-signal/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <p className="text-sm text-bureau-slate pt-1">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handlePrimaryCTA}
              className="w-full bg-planner-orange text-white py-3 px-6 rounded-lg font-semibold hover:bg-planner-orange/90 transition-all"
            >
              {currentStepData.cta}
            </button>
            <button
              onClick={handleSecondaryCTA}
              className="w-full text-sm text-bureau-slate/60 hover:text-bureau-slate transition-colors"
            >
              {currentStepData.secondaryCta}
            </button>
          </div>

          {/* Trust indicator */}
          <div className="pt-4 border-t border-bureau-border text-center">
            <p className="text-xs text-bureau-slate/60">
              🔒 Free during beta • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
