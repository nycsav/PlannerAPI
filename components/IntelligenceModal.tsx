import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Download, Share2, Mail, Loader2, FileText, Zap, Target, ExternalLink, Send, BookOpen, MessageCircle, BarChart2, BarChart3, FileSearch, Sparkles } from 'lucide-react';
import { parseMarkdown, parseInlineMarkdown, parsePerplexityMarkdown } from '../utils/markdown';
import { exportIntelligenceBriefToPDF } from '../utils/exportPDF';
import { MetricCard } from './MetricCard';
import { extractMetrics } from '../utils/extractMetrics';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';
import { LoadingSpinner } from './LoadingSpinner';
import { InsightDashboard } from './InsightDashboard';
import { InteractiveDashboard } from './InteractiveDashboard';

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

/**
 * Generate contextual strategic frameworks based on the query and summary
 * This creates tailored actions specific to each intelligence brief
 */
function generateContextualFrameworks(query: string, summary: string, keySignals: string[]): IntelligenceFramework[] {
  const lowerQuery = query.toLowerCase();
  const lowerSummary = summary.toLowerCase();
  const combinedText = `${lowerQuery} ${lowerSummary} ${keySignals.join(' ').toLowerCase()}`;
  
  // Extract key topic from query for personalization
  const topicMatch = query.match(/(?:about|for|on|regarding|with)\s+(.+?)(?:\?|$)/i);
  const topic = topicMatch ? topicMatch[1].trim() : query.replace(/\?$/, '').trim();
  const shortTopic = topic.length > 40 ? topic.substring(0, 40) + '...' : topic;
  
  // Detect primary themes
  const isAI = /\b(ai|artificial intelligence|machine learning|ml|llm|gpt|claude|deepseek|chatbot|automation)\b/i.test(combinedText);
  const isRetailMedia = /\b(retail media|amazon ads|walmart connect|instacart|kroger|commerce media)\b/i.test(combinedText);
  const isAttribution = /\b(attribution|measurement|mmm|media mix|incrementality|roi|roas)\b/i.test(combinedText);
  const isPricing = /\b(pricing|cost|budget|spend|investment|roi)\b/i.test(combinedText);
  const isCompetitive = /\b(compet|rival|market share|positioning|benchmark)\b/i.test(combinedText);
  const isPersonalization = /\b(personali|segment|target|audience|first.party|zero.party|customer data)\b/i.test(combinedText);
  const isContent = /\b(content|creative|campaign|messaging|brand|storytelling)\b/i.test(combinedText);
  const isSearch = /\b(search|seo|sem|google|bing|ai overview|ai mode)\b/i.test(combinedText);
  const isSocial = /\b(social|tiktok|instagram|meta|facebook|influencer|creator)\b/i.test(combinedText);
  const isData = /\b(data|analytics|dashboard|insight|report|metric)\b/i.test(combinedText);
  
  const frameworks: IntelligenceFramework[] = [];
  
  // Framework 1: Implementation/Adoption Strategy (always relevant)
  if (isAI) {
    frameworks.push({
      id: 'implementation',
      label: 'AI Adoption',
      actions: [
        `Assess current tech stack readiness for ${shortTopic}.`,
        `Identify 2-3 pilot use cases where ${shortTopic.includes('AI') ? 'this' : 'AI'} can drive quick wins.`,
        `Build internal capability roadmap with training and hiring priorities.`
      ]
    });
  } else if (isRetailMedia) {
    frameworks.push({
      id: 'implementation',
      label: 'Retail Media Playbook',
      actions: [
        `Map retail media networks by relevance to your category and audience.`,
        `Establish measurement framework connecting retail media to sales lift.`,
        `Negotiate data-sharing agreements for closed-loop attribution.`
      ]
    });
  } else if (isSearch) {
    frameworks.push({
      id: 'implementation',
      label: 'Search Strategy',
      actions: [
        `Audit current search visibility and identify AI Overview opportunities.`,
        `Restructure content for answer-engine optimization (AEO).`,
        `Reallocate budget between traditional SEO/SEM and emerging search formats.`
      ]
    });
  } else {
    frameworks.push({
      id: 'implementation',
      label: 'Implementation',
      actions: [
        `Define success criteria and KPIs for ${shortTopic}.`,
        `Identify quick-win opportunities to demonstrate value within 30 days.`,
        `Establish cross-functional alignment with key stakeholders.`
      ]
    });
  }
  
  // Framework 2: Measurement/ROI Strategy
  if (isAttribution || isPricing) {
    frameworks.push({
      id: 'measurement',
      label: 'Measurement Strategy',
      actions: [
        `Build incrementality testing framework for ${shortTopic}.`,
        `Establish baseline metrics before any changes are implemented.`,
        `Create executive dashboard showing leading and lagging indicators.`
      ]
    });
  } else if (isCompetitive) {
    frameworks.push({
      id: 'competitive',
      label: 'Competitive Response',
      actions: [
        `Map competitor positioning and identify differentiation opportunities.`,
        `Establish competitive monitoring cadence (weekly/monthly).`,
        `Define defensive vs. offensive strategic plays based on findings.`
      ]
    });
  } else {
    frameworks.push({
      id: 'measurement',
      label: 'ROI Framework',
      actions: [
        `Quantify potential impact of ${shortTopic} on key business metrics.`,
        `Establish baseline measurements before implementation.`,
        `Build reporting cadence to track progress and iterate.`
      ]
    });
  }
  
  // Framework 3: Organizational/Operational Strategy
  if (isPersonalization || isData) {
    frameworks.push({
      id: 'data-ops',
      label: 'Data Operations',
      actions: [
        `Audit data sources and identify gaps for ${shortTopic}.`,
        `Establish data governance and privacy compliance protocols.`,
        `Build data activation workflows connecting insights to action.`
      ]
    });
  } else if (isContent || isSocial) {
    frameworks.push({
      id: 'creative-ops',
      label: 'Creative Operations',
      actions: [
        `Develop content playbook tailored to ${shortTopic}.`,
        `Establish creative testing framework with clear success metrics.`,
        `Build approval workflows that balance speed with brand safety.`
      ]
    });
  } else {
    frameworks.push({
      id: 'org-readiness',
      label: 'Org Readiness',
      actions: [
        `Assess team capabilities and identify skill gaps for ${shortTopic}.`,
        `Define RACI matrix for cross-functional initiatives.`,
        `Create change management plan for organizational adoption.`
      ]
    });
  }
  
  return frameworks;
}

const MetricsGrid = ({
  metrics
}: {
  metrics: Array<{ value: string; label?: string; context?: string }>;
}) => {
  // Only show metrics that have a clear value and enough context to be read in full (no incomplete boxes)
  const completeMetrics = (metrics || [])
    .filter((m) => {
      const val = (m.value || '').trim();
      const ctx = (m.context ?? '').trim();
      return val.length > 0 && ctx.length > 10;
    })
    .slice(0, 4);

  if (completeMetrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {completeMetrics.map((metric, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-planner-orange/10 to-planner-orange/5 border border-planner-orange/20 rounded-xl p-5 backdrop-blur-sm"
        >
          <div className="text-3xl font-bold text-planner-navy dark:text-white mb-2 break-words">
            {metric.value}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed break-words">
            {metric.context ?? ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export const IntelligenceModal: React.FC<IntelligenceModalProps> = ({
  open,
  payload,
  onClose,
  onFollowUp,
  isLoading = false
}) => {
  console.log('[IntelligenceModal] Rendered with open:', open, 'isLoading:', isLoading, 'hasPayload:', !!payload, 'payload:', payload);
  console.log('[IntelligenceModal] Perplexity endpoint:', ENDPOINTS.perplexitySearch);

  // Display payload: synced from props, updated by follow-up API responses (must be declared first)
  const [displayPayload, setDisplayPayload] = useState<IntelligencePayload | null>(payload);

  // Sync displayPayload when payload prop changes (e.g. new card opened, initial load)
  useEffect(() => {
    setDisplayPayload(payload);
  }, [payload]);

  // Generate contextual frameworks based on the query and content
  // Use provided frameworks from API if available, otherwise generate dynamically
  const frameworks = useMemo(() => {
    const p = displayPayload ?? payload;
    if (p?.frameworks && p.frameworks.length > 0) {
      return p.frameworks;
    }
    if (p?.query && p?.summary) {
      return generateContextualFrameworks(
        p.query,
        p.summary,
        p.keySignals || []
      );
    }
    // Fallback for loading state
    return [
      { id: 'loading-1', label: 'Strategy', actions: ['Loading...'] },
      { id: 'loading-2', label: 'Measurement', actions: ['Loading...'] },
      { id: 'loading-3', label: 'Operations', actions: ['Loading...'] }
    ];
  }, [displayPayload?.query, displayPayload?.summary, displayPayload?.keySignals, displayPayload?.frameworks, payload?.query, payload?.summary, payload?.keySignals, payload?.frameworks]);

  const [activeFrameworkTab, setActiveFrameworkTab] = useState<string | null>(
    frameworks[0]?.id || null
  );

  // Follow-up chat state
  const [followUpMessages, setFollowUpMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Dashboard visualization state
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Quick chat modal state
  const [showQuickChat, setShowQuickChat] = useState(false);



  // Extract metrics from summary for visualization
  const metrics = useMemo(() => {
    const p = displayPayload ?? payload;
    if (!p?.summary) return [];
    return extractMetrics(p.summary);
  }, [displayPayload?.summary, payload?.summary]);

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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  // Early return AFTER all hooks are called
  if (!open) {
    console.log('[IntelligenceModal] Returning null because open is false');
    return null;
  }

  const activeFramework = frameworks.find(f => f.id === activeFrameworkTab);
  const effectivePayload = displayPayload ?? payload;

  // Export functions
  const handleDownloadPDF = () => {
    if (!effectivePayload) return;
    try {
      exportIntelligenceBriefToPDF({
        query: effectivePayload.query,
        summary: effectivePayload.summary,
        keySignals: effectivePayload.keySignals,
        movesForLeaders: effectivePayload.movesForLeaders,
        signals: effectivePayload.signals,
        frameworks: frameworks,
        metrics: metrics.length > 0 ? metrics : undefined,
        comparisons: effectivePayload.graphData?.comparisons,
        followUpMessages: followUpMessages.length > 0 ? followUpMessages : undefined
      });
      // Optional: Show success notification
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCopyToClipboard = () => {
    if (!effectivePayload) return;
    let markdown = `# Intelligence Brief\n\n**Query:** ${effectivePayload.query}\n\n`;
    markdown += `## Summary\n${effectivePayload.summary}\n\n`;

    if (effectivePayload.keySignals.length > 0) {
      markdown += `## Key Signals\n`;
      effectivePayload.keySignals.forEach(signal => {
        markdown += `- ${signal}\n`;
      });
      markdown += `\n`;
    }

    if (effectivePayload.movesForLeaders.length > 0) {
      markdown += `## Moves for Leaders\n`;
      effectivePayload.movesForLeaders.forEach(move => {
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
    if (!effectivePayload) return;
    const subject = encodeURIComponent(`Intelligence Brief: ${effectivePayload.query}`);
    const body = encodeURIComponent(
      `Intelligence Brief\n\nQuery: ${effectivePayload.query}\n\nSummary:\n${effectivePayload.summary}\n\n---\nGenerated by PlannerAPI`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFollowUpSubmit = async () => {
    const question = followUpInput.trim();
    if (!question) return;
    if (followUpLoading) return;

    // Need current payload for context (displayPayload or payload)
    const currentPayload = displayPayload ?? payload;
    if (!currentPayload) return;

    setFollowUpInput('');
    setFollowUpLoading(true);

    try {
      const resp = await fetchWithTimeout(
        ENDPOINTS.perplexitySearch,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: question }),
          timeout: 40000,
        }
      );

      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      const data = await resp.json();

      // Support both content (Cloud Run/Cloud Functions) and answer (legacy) formats
      const rawText = data.content ?? data.answer ?? '';
      const sections = rawText.split('##') || [];

      let summary = '';
      if (sections.length > 1) {
        summary = sections[1].split('\n').filter((l: string) => l.trim() && !l.includes('##')).join(' ').trim();
      } else {
        summary = rawText;
      }

      const movesForLeaders: string[] = [];
      const movesSection = sections.find((s: string) =>
        s.toLowerCase().includes('action') ||
        s.toLowerCase().includes('move') ||
        s.toLowerCase().includes('recommend')
      );
      if (movesSection) {
        const moveRegex = /^[-*•]\s+(.+)$/gm;
        let moveMatch;
        while ((moveMatch = moveRegex.exec(movesSection)) !== null) {
          movesForLeaders.push(moveMatch[1].trim());
        }
      }

      const keySignals: string[] = [];
      const nonMovesSections = sections.filter((s: string) => s !== movesSection);
      const nonMovesText = nonMovesSections.join('\n');
      const bulletRegex = /^[-*•]\s+(.+)$/gm;
      let match;
      while ((match = bulletRegex.exec(nonMovesText)) !== null) {
        const signal = match[1].trim();
        if (!keySignals.includes(signal) && !movesForLeaders.includes(signal)) {
          keySignals.push(signal);
        }
      }

      const citations = data.search_results ?? data.raw?.citations ?? [];
      const signals: IntelligenceSignal[] = Array.isArray(citations)
        ? citations.map((c: any, i: number) => ({
            id: `source-${i}`,
            title: c.title || c.source || `Source ${i + 1}`,
            summary: c.snippet || c.summary || '',
            sourceName: c.source ?? c.title ?? `Source ${i + 1}`,
            sourceUrl: c.url ?? c.sourceUrl ?? '#',
          }))
        : [];

      const newPayload: IntelligencePayload = {
        query: question,
        summary: summary.substring(0, 800),
        keySignals: keySignals.slice(0, 5),
        signals,
        movesForLeaders: movesForLeaders.length > 0 ? movesForLeaders.slice(0, 3) : [
          'Review the key signals and assess impact on your current strategy',
          'Identify quick-win opportunities to implement within 30 days',
          'Establish measurement framework to track progress',
        ],
      };

      setDisplayPayload(newPayload);
      if (onFollowUp) onFollowUp(question);
    } catch (error) {
      console.error('[Follow-up] API error:', error);
      setDisplayPayload({
        query: question,
        summary: 'Unable to get intelligence for that question. Please try again.',
        keySignals: [],
        movesForLeaders: [],
      });
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
          {/* Export buttons - only show when we have content to export */}
          {effectivePayload && (
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

        {/* Main content - only show when we have payload (from props or follow-up response) */}
        {effectivePayload && !isLoading && (
          <div className="p-8 md:p-12 lg:p-16">
            {/* Premium Header Section */}
            <div className="mb-12 pb-8 border-b border-slate-200/60 dark:border-slate-700/50">
              {/* Query badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Your Query
                </span>
              </div>
              <p className="font-sans text-lg text-gray-900 dark:text-gray-100 font-medium leading-relaxed mb-6">
                {effectivePayload.query}
              </p>

              {/* Big heading with premium spacing */}
              <h1 className="font-display text-5xl md:text-6xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight leading-tight">
                Intelligence Brief
              </h1>
            </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Main content (left side) */}
            <div className="flex-1 space-y-10">
              {/* Metrics Grid - Show key data points at top */}
              {metrics.length > 0 && (
                <div className="mb-8">
                  <MetricsGrid metrics={metrics} />
                </div>
              )}
              {/* Section 1: SUMMARY - Premium Design */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Summary
                  </h2>
                </div>
                <div className="font-sans text-lg text-gray-900 dark:text-gray-100 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                  {parseMarkdown(effectivePayload.summary)}
                </div>
              </section>

              {/* Section 2: KEY SIGNALS - Premium Design */}
                {effectivePayload.keySignals.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gradient-to-br from-planner-orange to-orange-600 rounded-xl shadow-sm">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                        Key Signals
                      </h2>
                    </div>
                    {/* Visualize Trends Button - Premium Style */}
                    {(metrics.length > 0 || effectivePayload.graphData?.comparisons?.length) && (
                      <button
                        onClick={() => setShowDashboard(!showDashboard)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 shadow-sm ${
                          showDashboard
                            ? 'bg-planner-orange text-white shadow-lg scale-[1.02]'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-md'
                        }`}
                      >
                        <BarChart2 className="w-4 h-4" />
                        {showDashboard ? 'Hide Dashboard' : 'Visualize Signals'}
                      </button>
                    )}
                  </div>
                  
                  {/* Interactive Dashboard - Premium Hex/Profound-style */}
                  {showDashboard && (
                    <InteractiveDashboard
                      metrics={metrics.map(m => ({
                        value: m.value,
                        label: m.label || 'Metric',
                        trend: m.trend,
                        context: m.context
                      }))}
                      comparisons={effectivePayload.graphData?.comparisons}
                      query={effectivePayload.query}
                      signals={effectivePayload.signals || []}
                      onMetricClick={(metric) => {
                        console.log('[InteractiveDashboard] Metric clicked:', metric);
                        // Could open drill-down modal or expand section
                      }}
                      onComparisonClick={(comparison) => {
                        console.log('[InteractiveDashboard] Comparison clicked:', comparison);
                        // Could show detailed comparison view
                      }}
                      onExport={(format) => {
                        console.log('[InteractiveDashboard] Export requested:', format);
                        // Trigger export with selected visualizations
                      }}
                    />
                  )}
                  
                  {/* Signal Cards - Premium Expandable Design */}
                  <div className="space-y-3">
                    {effectivePayload.keySignals.map((signal, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md bg-white dark:bg-slate-800/50 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-planner-orange mt-2 shrink-0" />
                          <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                            {parseInlineMarkdown(signal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 3: MOVES FOR LEADERS - Premium Design */}
              {effectivePayload.movesForLeaders.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      Moves for Leaders
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {effectivePayload.movesForLeaders.map((move, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md bg-white dark:bg-slate-800/50 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                            {parseInlineMarkdown(move)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right side panel: Strategic Frameworks - Premium Design */}
            <div className="lg:w-[420px] flex-shrink-0">
              <div className="sticky top-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200/60 dark:border-slate-700/50 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-sm">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Strategic Frameworks
                  </h3>
                </div>

                {/* Premium Framework Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-700/50">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => setActiveFrameworkTab(framework.id)}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2 ${
                        activeFrameworkTab === framework.id
                          ? 'bg-planner-orange text-white shadow-lg scale-[1.02]'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-slate-600 hover:border-planner-orange hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/80'
                      }`}
                    >
                      {framework.label}
                    </button>
                  ))}
                </div>

                {/* Framework Actions - Premium Card Design */}
                {activeFramework && (
                  <div className="space-y-4">
                    <h4 className="font-display text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                      Actions
                    </h4>
                    <div className="space-y-3">
                      {activeFramework.actions.map((action, index) => (
                        <div
                          key={index}
                          className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md bg-white dark:bg-slate-800/50 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                              {parseInlineMarkdown(action)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sources section - ALWAYS shown below Strategic Frameworks */}
              <div data-section="sources" className="mt-6 border-2 border-gray-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-bureau-signal dark:text-planner-orange" />
                  <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Sources
                  </h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    // Always show sources section - extract from signals or show placeholder
                    const validSignals = effectivePayload.signals?.filter(signal => signal.sourceUrl && signal.sourceUrl !== '#') || [];
                    
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

              {/* Quick Actions Bar */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Quick Actions
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                      showDashboard
                        ? 'bg-violet-500 text-white'
                        : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{showDashboard ? 'Hide' : 'Visualize'} signals</span>
                  </button>
                  <button
                    onClick={() => document.querySelector('[data-section="sources"]')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-all duration-200"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Explore sources</span>
                  </button>
                  <button
                    onClick={() => setShowQuickChat(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500 hover:bg-violet-600 text-white transition-all duration-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ask about brief</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related section - Perplexity-style follow-up questions */}
          {effectivePayload.followUps && effectivePayload.followUps.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200/60 dark:border-slate-700/50">
              <h3 className="font-display text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-6">
                Related
              </h3>
              <div className="space-y-3">
                {effectivePayload.followUps.map((followUp, index) => (
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
          <section data-section="follow-up" className="mt-12 pt-8 border-t-2 border-gray-200/60 dark:border-slate-700/50">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
                <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                  Ask a Follow-Up
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ask a follow-up question to get a new intelligence brief with updated insights powered by <span className="font-semibold text-bureau-signal dark:text-planner-orange">Perplexity</span>.
                The modal will refresh with new summary, signals, and recommendations.
              </p>
            </div>


            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (followUpInput.trim() && !followUpLoading) {
                  handleFollowUpSubmit();
                }
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && followUpInput.trim() && !followUpLoading) {
                    e.preventDefault();
                    handleFollowUpSubmit();
                  }
                }}
                placeholder="e.g., What are the budget implications? How does this compare to competitors?"
                disabled={followUpLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:border-bureau-signal dark:focus:border-planner-orange focus:ring-2 focus:ring-bureau-signal/20 dark:focus:ring-planner-orange/20 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed font-sans text-base transition-all duration-200"
              />
              <button
                type="submit"
                style={{ cursor: 'pointer' }}
                className="px-6 py-3 bg-planner-orange text-white rounded-lg hover:bg-orange-600 hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2"
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
            </form>
          </section>
          </div>
        )}

        {/* Quick Chat Modal - Powered by existing follow-up system */}
        {showQuickChat && effectivePayload && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      Brief Assistant
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ask questions about this intelligence brief
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickChat(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {followUpMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Start by asking a question about this brief
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Examples: "What are the key metrics?" or "What should I prioritize?"
                    </p>
                  </div>
                ) : (
                  followUpMessages.map((msg, index) => {
                    // Safety check: ensure content is always a string
                    const safeContent = typeof msg.content === 'string' 
                      ? msg.content 
                      : (msg.content as any)?.text || JSON.stringify(msg.content);
                    
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] ${
                            msg.role === 'user'
                              ? 'bg-violet-500 text-white rounded-2xl px-4 py-3'
                              : 'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-0'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <p className="text-sm leading-relaxed font-sans">{safeContent}</p>
                          ) : (
                            <div className="p-4 space-y-6">
                              {/* Parse structured response with consistent sections */}
                              <div className="font-sans text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                                {parsePerplexityMarkdown(safeContent)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {followUpLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                      <LoadingSpinner size="sm" text="Analyzing intelligence..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && followUpInput.trim() && !followUpLoading) {
                        e.preventDefault();
                        handleFollowUpSubmit();
                      }
                    }}
                    placeholder="Ask a question about this brief..."
                    disabled={followUpLoading}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleFollowUpSubmit}
                    style={{ cursor: 'pointer' }}
                    className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2"
                  >
                    {followUpLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
// Cache bust: 1769032959
