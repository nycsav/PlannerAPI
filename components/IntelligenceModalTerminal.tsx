import React, { useState, useMemo } from 'react';
import { X, Download, Share2, Mail, ExternalLink, Send, Loader2 } from 'lucide-react';
import { SignalIcon, RadarIcon, TerminalSharpIcon, ObjectiveIcon, DataIcon, BriefingIcon, ActionArrowIcon, StatusIcon } from './GeometricIcons';
import { StaggeredReveal, TerminalLoadingBars } from './TerminalAnimations';

type IntelligenceFramework = {
  id: string;
  label: string;
  actions: string[];
};

type IntelligenceSignal = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
};

export type IntelligencePayload = {
  query: string;
  summary: string;
  keySignals: string[];
  signals?: IntelligenceSignal[];
  movesForLeaders: string[];
  frameworks?: IntelligenceFramework[];
  followUps?: { label: string; question: string; displayQuery?: string }[];
  graphData?: {
    comparisons?: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
      source?: string;
    }>;
    metrics?: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
    }>;
  };
};

type IntelligenceModalTerminalProps = {
  open: boolean;
  payload: IntelligencePayload | null;
  onClose: () => void;
  onFollowUp?: (question: string, displayQuery?: string) => void;
  isLoading?: boolean;
};

// Generate contextual frameworks (simplified for demo)
function generateContextualFrameworks(query: string, summary: string): IntelligenceFramework[] {
  return [
    {
      id: 'implementation',
      label: 'Implementation',
      actions: [
        'Assess current tech stack readiness',
        'Identify 2-3 pilot use cases for quick wins',
        'Build capability roadmap with training priorities'
      ]
    },
    {
      id: 'measurement',
      label: 'Measurement',
      actions: [
        'Establish baseline metrics before implementation',
        'Create executive dashboard with leading indicators',
        'Define success criteria and KPIs'
      ]
    },
    {
      id: 'org-readiness',
      label: 'Org Readiness',
      actions: [
        'Assess team capabilities and identify skill gaps',
        'Define RACI matrix for cross-functional initiatives',
        'Create change management plan for adoption'
      ]
    }
  ];
}

export const IntelligenceModalTerminal: React.FC<IntelligenceModalTerminalProps> = ({
  open,
  payload,
  onClose,
  onFollowUp,
  isLoading = false
}) => {
  const frameworks = useMemo(() => {
    if (payload?.frameworks && payload.frameworks.length > 0) {
      return payload.frameworks;
    }
    if (payload?.query && payload?.summary) {
      return generateContextualFrameworks(payload.query, payload.summary);
    }
    return [];
  }, [payload?.query, payload?.summary, payload?.frameworks]);

  const [activeFrameworkTab, setActiveFrameworkTab] = useState<string | null>(
    frameworks[0]?.id || null
  );

  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [showAnalysisRequest, setShowAnalysisRequest] = useState(false);

  if (!open) return null;

  const activeFramework = frameworks.find(f => f.id === activeFrameworkTab);

  // Export handlers (simplified)
  const handleDownloadPDF = () => {
    console.log('Export PDF');
  };

  const handleCopyToClipboard = () => {
    console.log('Copy to clipboard');
  };

  const handleShareLinkedIn = () => {
    console.log('Share to LinkedIn');
  };

  const handleEmail = () => {
    console.log('Email brief');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
      {/* Dark overlay with grain texture */}
      <div
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Terminal window */}
      <div className="relative bg-[#0a0e1a] w-full h-full md:h-[90vh] md:max-w-[1600px] md:rounded-none overflow-hidden border-0 md:border-2 border-[#1a2332] shadow-2xl flex flex-col">

        {/* Terminal header bar */}
        <div className="relative bg-gradient-to-r from-[#0f1419] to-[#131921] border-b border-[#1a2332] px-4 py-3 flex items-center justify-between">
          {/* Live indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                LIVE FEED
              </span>
            </div>

            <div className="font-mono text-xs text-slate-500 uppercase tracking-wider">
              INTEL.TERM.v2.1
            </div>
          </div>

          {/* Terminal actions */}
          <div className="flex items-center gap-2">
            {payload && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  className="p-2 hover:bg-slate-800/50 rounded transition-colors"
                  aria-label="Download PDF"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={handleShareLinkedIn}
                  className="p-2 hover:bg-slate-800/50 rounded transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={handleEmail}
                  className="p-2 hover:bg-slate-800/50 rounded transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}

            <div className="w-px h-4 bg-slate-700 mx-1" />

            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Grid pattern background overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #60A5FA 1px, transparent 1px),
              linear-gradient(to bottom, #60A5FA 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Loading state */}
        {isLoading && !payload && (
          <div className="flex-1 flex items-center justify-center">
            <TerminalLoadingBars label="Analyzing intelligence stream..." />
          </div>
        )}

        {/* Main content */}
        {payload && !isLoading && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-6 md:p-12">

              {/* Query header with classification style */}
              <div className="mb-8 pb-6 border-b border-[#1a2332]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded mb-3">
                      <span className="font-mono text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                        QUERY REF
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        #{Math.random().toString(36).substr(2, 8).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="font-mono text-sm text-slate-400 leading-relaxed max-w-3xl">
                      {payload.query}
                    </h2>
                  </div>

                  {/* Timestamp */}
                  <div className="font-mono text-xs text-slate-600 text-right">
                    <div>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</div>
                    <div>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC</div>
                  </div>
                </div>

                <h1 className="font-mono text-3xl md:text-5xl font-black text-white uppercase tracking-tight">
                  INTELLIGENCE BRIEF
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main content column */}
                <div className="lg:col-span-8 space-y-8">

                  {/* Summary section */}
                  <StaggeredReveal delay={100}>
                    <section className="relative border-l-2 border-blue-500/50 pl-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 border-2 border-blue-500 bg-[#0a0e1a] rounded-full" />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                          <DataIcon size={14} className="text-white" />
                        </div>
                        <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ▸ SUMMARY
                        </h2>
                      </div>

                      <div className="font-mono text-sm text-slate-300 leading-relaxed space-y-3">
                        {payload.summary.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  </StaggeredReveal>

                  {/* Key Signals section */}
                  {payload.keySignals.length > 0 && (
                    <StaggeredReveal delay={200}>
                      <section className="relative border-l-2 border-orange-500/50 pl-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 border-2 border-orange-500 bg-[#0a0e1a] rounded-full" />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                          <SignalIcon size={14} className="text-white" />
                        </div>
                        <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ▸ KEY SIGNALS
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {payload.keySignals.map((signal, index) => (
                          <div
                            key={index}
                            className="group relative bg-slate-900/30 border border-slate-800/50 hover:border-orange-500/30 rounded p-4 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-xs font-bold text-orange-500 shrink-0 mt-0.5">
                                [{(index + 1).toString().padStart(2, '0')}]
                              </span>
                              <p className="font-mono text-sm text-slate-300 leading-relaxed flex-1">
                                {signal}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </StaggeredReveal>
                  )}

                  {/* Moves for Leaders section */}
                  {payload.movesForLeaders.length > 0 && (
                    <StaggeredReveal delay={300}>
                      <section className="relative border-l-2 border-emerald-500/50 pl-6">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 border-2 border-emerald-500 bg-[#0a0e1a] rounded-full" />

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded flex items-center justify-center">
                          <ActionArrowIcon size={14} className="text-white" />
                        </div>
                        <h2 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                          ▸ MOVES FOR LEADERS
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {payload.movesForLeaders.map((move, index) => (
                          <div
                            key={index}
                            className="group relative bg-slate-900/30 border border-slate-800/50 hover:border-emerald-500/30 rounded p-4 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-emerald-400">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="font-mono text-sm text-slate-300 leading-relaxed flex-1">
                                {move}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </StaggeredReveal>
                  )}
                </div>

                {/* Sidebar column */}
                <div className="lg:col-span-4 space-y-6">

                  {/* Strategic Frameworks */}
                  <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800/50">
                      <TerminalSharpIcon size={16} className="text-purple-400" />
                      <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Strategic Frameworks
                      </h3>
                    </div>

                    {/* Framework tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {frameworks.map((framework) => (
                        <button
                          key={framework.id}
                          onClick={() => setActiveFrameworkTab(framework.id)}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded transition-all ${
                            activeFrameworkTab === framework.id
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 hover:border-purple-500/30'
                          }`}
                        >
                          {framework.label}
                        </button>
                      ))}
                    </div>

                    {/* Framework actions */}
                    {activeFramework && (
                      <div className="space-y-2">
                        {activeFramework.actions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-slate-900/50 border border-slate-800/50 rounded text-xs"
                          >
                            <span className="font-mono text-purple-400 shrink-0">▸</span>
                            <span className="font-mono text-slate-400 leading-relaxed">{action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {payload.signals && payload.signals.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800/50">
                        <DataIcon size={16} className="text-blue-400" />
                        <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Sources
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {payload.signals.filter(s => s.sourceUrl && s.sourceUrl !== '#').map((signal, index) => (
                          <a
                            key={signal.id || index}
                            href={signal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-3 p-3 bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/30 rounded transition-all"
                          >
                            <span className="font-mono text-[10px] font-bold text-blue-400 shrink-0 mt-0.5">
                              [{index + 1}]
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-xs text-slate-300 truncate group-hover:text-blue-400 transition-colors">
                                {signal.sourceName || signal.title}
                              </p>
                              <p className="font-mono text-[10px] text-slate-600 truncate">
                                {new URL(signal.sourceUrl).hostname}
                              </p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Additional Analysis */}
                  <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <RadarIcon size={16} className="text-emerald-400" />
                      <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Request Analysis
                      </h3>
                    </div>

                    {!showAnalysisRequest ? (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => setShowAnalysisRequest(true)}
                          className="w-full text-left p-3 bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/30 rounded transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <ActionArrowIcon size={12} className="text-emerald-400" />
                            <span className="font-mono text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                              Competitive Landscape
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={() => setShowAnalysisRequest(true)}
                          className="w-full text-left p-3 bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/30 rounded transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <ActionArrowIcon size={12} className="text-emerald-400" />
                            <span className="font-mono text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                              Financial Impact
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={() => setShowAnalysisRequest(true)}
                          className="w-full text-left p-3 bg-slate-900/50 border border-slate-800/50 hover:border-emerald-500/30 rounded transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <ActionArrowIcon size={12} className="text-emerald-400" />
                            <span className="font-mono text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                              Custom Request
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={followUpInput}
                          onChange={(e) => setFollowUpInput(e.target.value)}
                          placeholder="Describe analysis request..."
                          className="w-full h-24 px-3 py-2 bg-slate-950/50 border border-slate-800/50 rounded font-mono text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAnalysisRequest(false)}
                            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded font-mono text-[10px] text-slate-400 hover:text-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={!followUpInput.trim() || followUpLoading}
                            className="flex-1 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                          >
                            {followUpLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                <span>Submit</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
