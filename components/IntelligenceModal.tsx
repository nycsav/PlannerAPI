import React, { useState, useMemo, useEffect } from 'react';
import { X, Download, Share2, Mail, Loader2, FileText, Zap, Target, ExternalLink, Send, BookOpen, MessageCircle } from 'lucide-react';
import { parseMarkdown, parseInlineMarkdown, parsePerplexityMarkdown } from '../utils/markdown';
import { exportIntelligenceBriefToPDF } from '../utils/exportPDF';
import { MetricCard } from './MetricCard';
import { extractMetrics } from '../utils/extractMetrics';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';
import { LoadingSpinner } from './LoadingSpinner';

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
  signals?: IntelligenceSignal[]; // Full signal objects with sources
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

type IntelligenceModalProps = {
  open: boolean;
  payload: IntelligencePayload | null;
  onClose: () => void;
  onFollowUp?: (question: string, displayQuery?: string) => void;
  isLoading?: boolean;
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
  onFollowUp,
  isLoading = false
}) => {
  console.log('[IntelligenceModal] Rendered with open:', open, 'isLoading:', isLoading, 'hasPayload:', !!payload, 'payload:', payload);

  // Use provided frameworks or fall back to defaults
  const frameworks = payload?.frameworks || DEFAULT_FRAMEWORKS;

  const [activeFrameworkTab, setActiveFrameworkTab] = useState<string | null>(
    frameworks[0]?.id || null
  );

  // Follow-up chat state
  const [followUpMessages, setFollowUpMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Extract metrics from summary for visualization
  const metrics = useMemo(() => {
    if (!payload?.summary) return [];
    return extractMetrics(payload.summary);
  }, [payload?.summary]);

  // Log when payload changes (must be before early return)
  useEffect(() => {
    if (payload) {
      console.log('[IntelligenceModal] Payload received:', {
        query: payload.query,
        hasSummary: !!payload.summary,
        summaryLength: payload.summary?.length || 0,
        signalsCount: payload.keySignals?.length || 0,
        movesCount: payload.movesForLeaders?.length || 0
      });
    }
  }, [payload]);

  // Early return AFTER all hooks are called
  if (!open) {
    console.log('[IntelligenceModal] Returning null because open is false');
    return null;
  }

  const activeFramework = frameworks.find(f => f.id === activeFrameworkTab);

  // Export functions
  const handleDownloadPDF = () => {
    if (!payload) return; // Guard against null payload
    try {
      exportIntelligenceBriefToPDF({
        query: payload.query,
        summary: payload.summary,
        keySignals: payload.keySignals,
        movesForLeaders: payload.movesForLeaders,
        signals: payload.signals,
        frameworks: frameworks
      });
      // Optional: Show success notification
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!payload) return; // Guard against null payload
    // Format as markdown for clipboard
    let markdown = `# Intelligence Brief\n\n**Query:** ${payload.query}\n\n`;
    markdown += `## Summary\n${payload.summary}\n\n`;

    if (payload.keySignals.length > 0) {
      markdown += `## Key Signals\n`;
      payload.keySignals.forEach(signal => {
        markdown += `- ${signal}\n`;
      });
      markdown += `\n`;
    }

    if (payload.movesForLeaders.length > 0) {
      markdown += `## Moves for Leaders\n`;
      payload.movesForLeaders.forEach(move => {
        markdown += `- ${move}\n`;
      });
    }

    markdown += `\n---\nGenerated by PlannerAPI\n`;

    navigator.clipboard.writeText(markdown);
  };

  const handleShareLinkedIn = () => {
    // LinkedIn share best practice: copy text and open LinkedIn
    handleCopyToClipboard();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, '_blank');
    alert('Content copied to clipboard. Paste it in your LinkedIn post!');
  };

  const handleEmail = () => {
    if (!payload) return; // Guard against null payload
    // Format for email
    const subject = encodeURIComponent(`Intelligence Brief: ${payload.query}`);
    const body = encodeURIComponent(
      `Intelligence Brief\n\nQuery: ${payload.query}\n\nSummary:\n${payload.summary}\n\n---\nGenerated by PlannerAPI`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpInput.trim() || !payload || followUpLoading) return;

    const newMessages = [...followUpMessages, { role: 'user' as const, content: followUpInput }];
    setFollowUpMessages(newMessages);
    const currentInput = followUpInput;
    setFollowUpInput('');
    setFollowUpLoading(true);

    try {
      // Build contextual query in a natural, conversational way
      const contextualQuery = `Based on this intelligence about "${payload.query}", ${currentInput}`;

      // Call Firebase Cloud Function for follow-up questions
      const response = await fetchWithTimeout(ENDPOINTS.chatSimple, {
        timeout: 40000, // Increased timeout for real-time data
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: contextualQuery
        }),
        timeout: 30000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Follow-up] API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Follow-up] Raw response data:', data);
      console.log('[Follow-up] data.response type:', typeof data?.response);
      console.log('[Follow-up] data.response value:', data?.response);

      // Extract response text - chatSimple returns {response: string, citations: array}
      let responseText: string = '';

      // Direct extraction since we know the backend format
      if (data && data.response) {
        responseText = String(data.response);
        console.log('[Follow-up] Extracted from data.response:', responseText.substring(0, 100));
      } else if (typeof data === 'string') {
        responseText = data;
        console.log('[Follow-up] Data was already a string');
      } else {
        // Fallback: try other fields or stringify
        responseText = data?.message || data?.content || data?.text || JSON.stringify(data, null, 2);
        console.log('[Follow-up] Used fallback extraction');
      }

      // Absolute final safety: ensure string type
      const finalText = String(responseText || 'No response received');
      console.log('[Follow-up] FINAL TEXT:', finalText.substring(0, 150));

      setFollowUpMessages([...newMessages, { role: 'assistant' as const, content: finalText }]);
    } catch (error) {
      console.error('Follow-up error:', error);
      setFollowUpMessages([...newMessages, {
        role: 'assistant' as const,
        content: 'I had trouble processing that question. Could you try rephrasing it?'
      }]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Dark navy overlay with 60% opacity */}
      <div
        className="absolute inset-0 bg-gray-900/60 dark:bg-slate-900/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border border-gray-100/60 dark:border-slate-700/50 animate-in zoom-in-95 duration-200">
        {/* Loading state - show skeleton if no payload yet */}
        {isLoading && !payload && (
          <div className="p-8 md:p-12 animate-in fade-in duration-200">
            {/* Skeleton for query */}
            <div className="mb-6">
              <div className="h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-24 mb-3 animate-shimmer"></div>
              <div className="h-5 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-3/4 animate-shimmer"></div>
            </div>

            {/* Skeleton for heading */}
            <div className="h-14 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-1/2 mb-10 animate-shimmer"></div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main content skeleton */}
              <div className="flex-1 space-y-8">
                {/* Summary skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-6 bg-gray-200/60 dark:bg-slate-700/60 rounded animate-shimmer"></div>
                    <div className="h-6 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-32 animate-shimmer"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-full animate-shimmer"></div>
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-5/6 animate-shimmer"></div>
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-4/6 animate-shimmer"></div>
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-full animate-shimmer"></div>
                  </div>
                </div>

                {/* Signals skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-6 bg-gray-200/60 dark:bg-slate-700/60 rounded animate-shimmer"></div>
                    <div className="h-6 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-36 animate-shimmer"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-gray-200/60 dark:bg-slate-700/60 rounded-full mt-2 animate-shimmer"></div>
                      <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg flex-1 animate-shimmer"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-gray-200/60 dark:bg-slate-700/60 rounded-full mt-2 animate-shimmer"></div>
                      <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg flex-1 animate-shimmer"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 bg-gray-200/60 dark:bg-slate-700/60 rounded-full mt-2 animate-shimmer"></div>
                      <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-4/5 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar skeleton */}
              <div className="lg:w-96 space-y-6">
                <div className="border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                  <div className="h-7 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-48 mb-6 animate-shimmer"></div>
                  <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200/60 dark:border-slate-700/50">
                    <div className="h-9 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-36 animate-shimmer"></div>
                    <div className="h-9 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-36 animate-shimmer"></div>
                  </div>
                  <div className="h-5 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-24 mb-4 animate-shimmer"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-full animate-shimmer"></div>
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-5/6 animate-shimmer"></div>
                    <div className="h-4 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-4/6 animate-shimmer"></div>
                  </div>
                </div>
                
                {/* Sources skeleton */}
                <div className="border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-5 w-5 bg-gray-200/60 dark:bg-slate-700/60 rounded animate-shimmer"></div>
                    <div className="h-7 bg-gray-200/60 dark:bg-slate-700/60 rounded-lg w-32 animate-shimmer"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-200/60 dark:bg-slate-700/60 rounded-xl animate-shimmer"></div>
                    <div className="h-16 bg-gray-200/60 dark:bg-slate-700/60 rounded-xl animate-shimmer"></div>
                    <div className="h-16 bg-gray-200/60 dark:bg-slate-700/60 rounded-xl animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading indicator at bottom */}
            <div className="mt-12">
              <LoadingSpinner size="md" text="Analyzing intelligence..." />
            </div>
          </div>
        )}

        {/* Loading overlay for follow-up questions (when payload exists) */}
        {isLoading && payload && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center rounded-lg animate-in fade-in duration-200">
            <div className="text-center max-w-md px-8">
              <LoadingSpinner size="xl" />
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4">Creating Your Intelligence Brief</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">Gathering the latest data and insights... This usually takes 6-8 seconds.</p>
            </div>
          </div>
        )}

        {/* Top right actions */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          {/* Export buttons - only show when payload exists */}
          {payload && (
            <>
              <button
                onClick={handleDownloadPDF}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Download PDF"
                title="Download PDF"
              >
                <Download className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleEmail}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Email this brief"
                title="Email this brief"
              >
                <Mail className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </>
          )}

          {/* Close button - always visible */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 ml-2 border-l border-gray-200 dark:border-slate-700 pl-4 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Main content - only show when we have payload */}
        {payload && !isLoading && (
          <div className="p-8 md:p-12">
            {/* Top: Query label */}
            <div className="mb-6">
              <p className="font-display text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-2">
                Your Query
              </p>
              <p className="font-sans text-base text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                {payload.query}
              </p>
            </div>

          {/* Big heading */}
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-12">
            Intelligence Brief
          </h1>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main content (left side) */}
            <div className="flex-1 space-y-10">
              {/* Section 1: SUMMARY */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
                  <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Summary
                  </h2>
                </div>
                <div className="font-sans text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                  {parseMarkdown(payload.summary)}
                </div>
              </section>

              {/* Section 2: KEY SIGNALS */}
              {payload.keySignals.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
                    <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      Key Signals
                    </h2>
                  </div>
                  <ul className="space-y-3 font-sans">
                    {payload.keySignals.map((signal, index) => (
                      <li key={index} className="text-base text-gray-900 dark:text-gray-100 leading-relaxed flex items-start gap-2">
                        <span className="text-bureau-signal dark:text-planner-orange font-bold mt-0.5 shrink-0">•</span>
                        <span>{parseInlineMarkdown(signal)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Section 3: MOVES FOR LEADERS */}
              {payload.movesForLeaders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
                    <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      Moves for Leaders
                    </h2>
                  </div>
                  <ul className="space-y-3 font-sans">
                    {payload.movesForLeaders.map((move, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-bureau-signal dark:text-planner-orange font-bold mt-0.5 flex-shrink-0">•</span>
                        <span className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                          {parseInlineMarkdown(move)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Right side panel: Framework tabs (always shown with defaults if needed) */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="sticky top-8 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-6">
                  Strategic Frameworks
                </h3>

                {/* Horizontal tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200/60 dark:border-slate-700/50 pb-4">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setActiveFrameworkTab(framework.id)}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-1 ${
                        activeFrameworkTab === framework.id
                          ? 'bg-gray-900 dark:bg-planner-orange text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 hover:border-bureau-signal dark:hover:border-planner-orange hover:shadow-sm'
                      }`}
                    >
                      {framework.label}
                    </button>
                  ))}
                </div>

                {/* Framework actions */}
                {activeFramework && (
                  <div>
                    <h4 className="font-display text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                      Actions
                    </h4>
                    <ul className="space-y-3 font-sans">
                      {activeFramework.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-bureau-signal dark:text-planner-orange font-bold mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                            {parseInlineMarkdown(action)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sources section - ALWAYS shown below Strategic Frameworks */}
              <div className="mt-6 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-bureau-signal dark:text-planner-orange" />
                  <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Sources
                  </h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    // Always show sources section - extract from signals or show placeholder
                    const validSignals = payload.signals?.filter(signal => signal.sourceUrl && signal.sourceUrl !== '#') || [];
                    
                    if (validSignals.length === 0) {
                      // No valid sources - show helpful message
                      return (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-700 dark:text-gray-200 italic">
                            Sources will be provided when available from intelligence analysis.
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                            All intelligence briefs include source citations from Perplexity research.
                          </p>
                        </div>
                      );
                    }
                    
                    return validSignals.map((signal, index) => {
                      let hostname = '';
                      try {
                        hostname = new URL(signal.sourceUrl).hostname;
                      } catch {
                        hostname = signal.sourceUrl;
                      }

                      return (
                        <a
                          key={signal.id || index}
                          href={signal.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 p-3 rounded-xl border border-gray-200/60 dark:border-slate-700/50 hover:border-bureau-signal/60 dark:hover:border-planner-orange/60 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-1"
                        >
                          <span className="font-mono text-xs font-bold text-bureau-signal dark:text-planner-orange shrink-0 mt-0.5">
                            [{index + 1}]
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-bureau-signal dark:group-hover:text-planner-orange line-clamp-2 mb-1">
                              {signal.sourceName || signal.title || signal.sourceUrl}
                            </p>
                            <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
                              {hostname}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-bureau-signal dark:group-hover:text-planner-orange shrink-0 mt-1" />
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Related section - Perplexity-style follow-up questions */}
          {payload.followUps && payload.followUps.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200/60 dark:border-slate-700/50">
              <h3 className="font-display text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-6">
                Related
              </h3>
              <div className="space-y-3">
                {payload.followUps.map((followUp, index) => (
                  <button
                    key={followUp.question || index}
                    onClick={() => onFollowUp && onFollowUp(followUp.question, followUp.displayQuery)}
                    className="w-full text-left flex items-start gap-3 p-4 rounded-xl border border-gray-200/60 dark:border-slate-700/50 hover:border-bureau-signal dark:hover:border-planner-orange hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                  >
                    <span className="text-bureau-signal dark:text-planner-orange mt-0.5 text-lg font-bold flex-shrink-0">→</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-bureau-signal dark:group-hover:text-planner-orange leading-relaxed">
                      {followUp.displayQuery || followUp.question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Chat Section */}
          <section className="mt-12 pt-8 border-t-2 border-gray-200/60 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
              <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                Ask a Follow-Up
              </h3>
            </div>

            {/* Conversation thread */}
            {followUpMessages.length > 0 && (
              <div className="space-y-6 mb-8 max-h-[600px] overflow-y-auto pr-2">
                {followUpMessages.map((msg, i) => {
                  // Safety check: ensure content is always a string
                  let safeContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2);

                  // For assistant messages, add line breaks before bold section headers for better readability
                  if (msg.role === 'assistant') {
                    // Add line break before **Header**: patterns (common in Perplexity responses)
                    safeContent = safeContent.replace(/\. (\*\*[^*]+\*\*:?)/g, '.\n\n$1');
                    // Also handle cases where bold headers start sentences
                    safeContent = safeContent.replace(/([.!?])\s+(\*\*[^*]+\*\*:?)/g, '$1\n\n$2');
                  }

                  return (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-gray-900 dark:bg-planner-orange text-white px-5 py-3 rounded-lg'
                          : 'bg-white dark:bg-slate-800 px-0 py-0'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="font-sans text-base text-gray-900 dark:text-gray-100 leading-relaxed space-y-3">
                            {parseMarkdown(safeContent)}
                          </div>
                        ) : (
                          <p className="font-sans text-base leading-relaxed">{safeContent}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {followUpLoading && (
                  <div className="flex justify-center py-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200/60 dark:border-slate-700/50 shadow-sm">
                      <LoadingSpinner size="sm" text="Finding the latest insights..." />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !followUpLoading && handleFollowUpSubmit()}
                placeholder="Ask a follow-up..."
                disabled={followUpLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:border-bureau-signal dark:focus:border-planner-orange focus:ring-2 focus:ring-bureau-signal/20 dark:focus:ring-planner-orange/20 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed font-sans text-base transition-all duration-200"
              />
              <button
                onClick={handleFollowUpSubmit}
                disabled={!followUpInput.trim() || followUpLoading}
                className="px-6 py-3 bg-planner-orange text-white rounded-lg hover:bg-orange-600 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2"
              >
                {followUpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin-smooth" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </section>
          </div>
        )}
      </div>
    </div>
  );
};
// Cache bust: 1769032958
