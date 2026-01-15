import React, { useState } from 'react';
import { X } from 'lucide-react';

type IntelligenceFramework = {
  id: string;
  label: string;
  actions: string[];
};

export type IntelligencePayload = {
  query: string;
  summary: string;
  keySignals: string[];
  movesForLeaders: string[];
  frameworks?: IntelligenceFramework[];
  followUps?: { label: string; question: string }[];
};

type IntelligenceModalProps = {
  open: boolean;
  payload: IntelligencePayload | null;
  onClose: () => void;
  onFollowUp?: (question: string) => void;
};

// Default frameworks if none provided
const DEFAULT_FRAMEWORKS: IntelligenceFramework[] = [
  {
    id: 'digital-strategy',
    label: 'Digital Strategy',
    actions: [
      'Identify priority customer journeys for AI enhancement.',
      'Map data sources needed for personalization and measurement.',
      'Align AI roadmap with product and engineering stakeholders.'
    ]
  },
  {
    id: 'media-strategy',
    label: 'Media Strategy',
    actions: [
      'Rank channels by AI-readiness (data, measurement, automation).',
      'Test one AI-assisted optimization pilot per quarter.',
      'Define guardrails for brand safety and creative quality.'
    ]
  },
  {
    id: 'cx-strategy',
    label: 'CX Strategy',
    actions: [
      'Audit current customer touchpoints for latency and friction.',
      'Prototype one AI-powered assist experience in a high-friction step.',
      'Define success metrics (NPS, CSAT, resolution time, etc.).'
    ]
  }
];

export const IntelligenceModal: React.FC<IntelligenceModalProps> = ({
  open,
  payload,
  onClose,
  onFollowUp
}) => {
  // Use provided frameworks or fall back to defaults
  const frameworks = payload?.frameworks || DEFAULT_FRAMEWORKS;

  const [activeFrameworkTab, setActiveFrameworkTab] = useState<string | null>(
    frameworks[0]?.id || null
  );

  if (!open || !payload) return null;

  const activeFramework = frameworks.find(f => f.id === activeFrameworkTab);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Dark navy overlay with 60% opacity */}
      <div
        className="absolute inset-0 bg-planner-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content card */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-bureau-border rounded-sm transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-bureau-slate" />
        </button>

        <div className="p-8 md:p-12">
          {/* Top: Query label */}
          <div className="mb-4">
            <p className="text-xs font-mono text-bureau-slate/60 uppercase tracking-wider">
              Your Query
            </p>
            <p className="text-sm text-bureau-ink mt-1 font-medium">
              {payload.query}
            </p>
          </div>

          {/* Big heading */}
          <h1 className="font-display text-4xl md:text-5xl font-black text-bureau-ink uppercase tracking-tight mb-8">
            Intelligence Brief
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content (left side) */}
            <div className="flex-1 space-y-8">
              {/* Section 1: SUMMARY */}
              <section>
                <h2 className="font-display text-xl font-bold text-bureau-ink uppercase tracking-tight mb-4">
                  Summary
                </h2>
                <p className="text-base text-bureau-ink leading-relaxed font-['Roboto']">
                  {payload.summary}
                </p>
              </section>

              {/* Section 2: KEY SIGNALS - Simple list, no icons */}
              {payload.keySignals.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-bureau-ink uppercase tracking-tight mb-4">
                    Key Signals
                  </h2>
                  <ul className="space-y-2 font-['Roboto']">
                    {payload.keySignals.map((signal, index) => (
                      <li key={index} className="text-sm text-slate-900 leading-relaxed">
                        {signal}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Section 3: MOVES FOR LEADERS */}
              {payload.movesForLeaders.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold text-bureau-ink uppercase tracking-tight mb-4">
                    Moves for Leaders
                  </h2>
                  <ul className="space-y-3 font-['Roboto']">
                    {payload.movesForLeaders.map((move, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-bureau-signal font-bold mt-0.5 flex-shrink-0">•</span>
                        <span className="text-base text-bureau-ink leading-relaxed">
                          {move}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Right side panel: Framework tabs (always shown with defaults if needed) */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="sticky top-8 border-2 border-bureau-border rounded-sm bg-bureau-surface p-6">
                <h3 className="font-display text-lg font-bold text-bureau-ink uppercase tracking-tight mb-4">
                  Strategic Frameworks
                </h3>

                {/* Horizontal tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-bureau-border pb-4">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setActiveFrameworkTab(framework.id)}
                      className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors rounded-sm ${
                        activeFrameworkTab === framework.id
                          ? 'bg-bureau-ink text-white'
                          : 'bg-white text-bureau-slate border border-bureau-border hover:border-bureau-signal'
                      }`}
                    >
                      {framework.label}
                    </button>
                  ))}
                </div>

                {/* Framework actions */}
                {activeFramework && (
                  <div>
                    <h4 className="text-xs font-mono text-bureau-slate/60 uppercase tracking-wider mb-3">
                      Actions
                    </h4>
                    <ul className="space-y-3 font-['Roboto']">
                      {activeFramework.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-planner-orange font-bold mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm text-bureau-ink leading-relaxed">
                            {action}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: Continue exploring buttons - only if followUps provided */}
          {payload.followUps && payload.followUps.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-bureau-border">
              <h3 className="font-display text-sm font-bold text-bureau-slate uppercase tracking-tight mb-3">
                Continue exploring
              </h3>
              <div className="flex flex-wrap gap-2">
                {payload.followUps.map((followUp, index) => (
                  <button
                    key={followUp.question}
                    onClick={() => onFollowUp && onFollowUp(followUp.question)}
                    className="px-4 py-2 text-xs font-medium text-bureau-slate bg-white border border-bureau-border hover:border-bureau-signal hover:text-bureau-signal rounded-sm transition-colors font-['Roboto']"
                  >
                    {followUp.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
