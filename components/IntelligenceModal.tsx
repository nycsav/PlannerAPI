import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Download, Share2, Mail, Loader2, FileText, Zap, Target, ExternalLink, Send, BookOpen, MessageCircle, BarChart2, BarChart3, FileSearch, Sparkles, Link, Microscope } from 'lucide-react';
import { BriefBarChart } from './BriefBarChart';
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
  stat?: string;
  sourceName: string;
  sourceUrl: string;
};

/** Enriched signal intelligence fields from getSignalInsight endpoint */
export type SignalInsight = {
  signal_score: number;          // 1–10 importance to CMOs
  signal_type: 'trend' | 'disruption' | 'opportunity' | 'risk';
  why_it_matters: string;        // 2 sentences, marketing-specific
  affected_brands: string[];     // named companies
  data_point: string;            // single key stat
  visual_metaphor: string;       // rocket | warning | dollar | ai | people | globe | chart | target
  linkedin_hook: string;         // opening line for LinkedIn post
};

export type IntelligencePayload = {
  query: string;
  summary: string;
  keySignals: string[];
  signals?: IntelligenceSignal[]; // Full signal objects with sources
  movesForLeaders: string[];
  images?: Array<{ image_url: string; origin_url?: string; title?: string }>;
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
  insight?: SignalInsight;        // Background-enriched intel (optional)
};

type IntelligenceModalProps = {
  open: boolean;
  payload: IntelligencePayload | null;
  onClose: () => void;
  onFollowUp?: (question: string, displayQuery?: string) => void;
  isLoading?: boolean;
  streamingText?: string; // Live SSE token stream shown while loading
  cardId?: string; // Firestore doc ID — enables shareable /brief/:cardId URL
};

/**
 * Generate contextual follow-up questions based on the intelligence brief
 * These appear as clickable chips to guide users toward deeper insights
 */
function generateContextualFollowUps(query: string, summary: string, keySignals: string[]): string[] {
  const lowerQuery = query.toLowerCase();
  const lowerSummary = summary.toLowerCase();
  const combinedText = `${lowerQuery} ${lowerSummary}`;

  const suggestions: string[] = [];

  // Extract main topic from query
  const topicMatch = query.match(/(?:about|for|on|regarding|with)\s+(.+?)(?:\?|$)/i);
  const topic = topicMatch ? topicMatch[1].trim() : query.replace(/\?$/, '').trim();

  // Detect themes and generate relevant questions
  const isAI = /\b(ai|artificial intelligence|machine learning|ml|llm|gpt|claude|deepseek|automation)\b/i.test(combinedText);
  const isRetailMedia = /\b(retail media|amazon ads|walmart connect|commerce media)\b/i.test(combinedText);
  const isAttribution = /\b(attribution|measurement|mmm|media mix|incrementality)\b/i.test(combinedText);
  const isCompetitive = /\b(compet|rival|market share|positioning)\b/i.test(combinedText);
  const isBudget = /\b(budget|cost|spend|investment|roi|pricing)\b/i.test(combinedText);

  // Generate 3-4 contextual questions
  if (isAI) {
    suggestions.push(`What are the implementation costs for ${topic}?`);
    suggestions.push(`Which vendors or platforms should we evaluate?`);
    suggestions.push(`What ROI can we expect in the first 6 months?`);
  } else if (isRetailMedia) {
    suggestions.push(`How does this compare to traditional display advertising?`);
    suggestions.push(`What attribution challenges should we prepare for?`);
    suggestions.push(`Which retail media networks have the best performance?`);
  } else if (isAttribution) {
    suggestions.push(`What measurement frameworks are recommended?`);
    suggestions.push(`How do we get executive buy-in for this approach?`);
    suggestions.push(`What are the implementation timelines?`);
  } else if (isCompetitive) {
    suggestions.push(`Who are the top 3 competitors in this space?`);
    suggestions.push(`What differentiates the market leaders?`);
    suggestions.push(`What moves should we make to defend our position?`);
  } else if (isBudget) {
    suggestions.push(`How should we reallocate budget based on this?`);
    suggestions.push(`What are the opportunity costs if we don't act?`);
    suggestions.push(`What quick wins can we achieve within 30 days?`);
  } else {
    // Generic but contextual fallbacks
    suggestions.push(`What are the budget implications?`);
    suggestions.push(`How does this compare to our competitors?`);
    suggestions.push(`What should our first step be?`);
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

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
  isLoading = false,
  streamingText = '',
  cardId,
}) => {
  console.log('[IntelligenceModal] Rendered with open:', open, 'isLoading:', isLoading, 'hasPayload:', !!payload, 'payload:', payload);
  console.log('[IntelligenceModal] Perplexity endpoint:', ENDPOINTS.perplexitySearch);

  // Display payload: synced from props, updated by follow-up API responses (must be declared first)
  const [displayPayload, setDisplayPayload] = useState<IntelligencePayload | null>(payload);

  // Sync displayPayload when payload prop changes (e.g. new card opened, initial load)
  // Also clear conversation history for new cards
  useEffect(() => {
    setDisplayPayload(payload);
    // Clear conversation when opening a new card
    if (payload) {
      setFollowUpMessages([]);
    }
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

  // Follow-up chat state with thread persistence
  const [followUpMessages, setFollowUpMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Dashboard visualization state
  const [showDashboard, setShowDashboard] = useState(false);

  // Background signal insight enrichment
  const [insight, setInsight] = useState<SignalInsight | null>(null);
  useEffect(() => {
    if (!payload?.query) { setInsight(null); return; }
    // If insight already embedded in payload, use it directly
    if (payload.insight) { setInsight(payload.insight); return; }
    setInsight(null);
    const title = payload.signals?.[0]?.title || payload.query;
    const snippet = payload.summary?.slice(0, 300) || '';
    const controller = new AbortController();
    fetch(ENDPOINTS.getSignalInsight, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, snippet }),
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: SignalInsight | null) => { if (data?.signal_score) setInsight(data); })
      .catch(() => {/* non-critical */});
    return () => controller.abort();
  }, [payload?.query]);

  // Quick chat modal state
  const [showQuickChat, setShowQuickChat] = useState(false);

  // Deep Research state (Perplexity Agent API)
  const [deepResearchData, setDeepResearchData] = useState<any>(null);
  const [deepResearchLoading, setDeepResearchLoading] = useState(false);
  const [deepResearchStreaming, setDeepResearchStreaming] = useState('');
  const [showDeepResearch, setShowDeepResearch] = useState(false);

  const handleDeepResearch = useCallback(async () => {
    const query = displayPayload?.query || payload?.query;
    if (!query) return;
    setShowDeepResearch(true);
    setDeepResearchLoading(true);
    setDeepResearchStreaming('');
    setDeepResearchData(null);

    try {
      const res = await fetch(ENDPOINTS.deepResearchStream, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, preset: 'deep-research' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'chunk') {
              accumulated += parsed.content;
              setDeepResearchStreaming(accumulated);
            } else if (parsed.type === 'done') {
              setDeepResearchData(parsed);
              setDeepResearchLoading(false);
            } else if (parsed.type === 'error') {
              console.error('[DeepResearch] Error:', parsed.message);
              setDeepResearchLoading(false);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      console.error('[DeepResearch] Stream error:', err);
      setDeepResearchLoading(false);
    }
  }, [displayPayload?.query, payload?.query]);

  // Reset deep research when card changes
  useEffect(() => {
    setDeepResearchData(null);
    setDeepResearchStreaming('');
    setShowDeepResearch(false);
    setDeepResearchLoading(false);
  }, [payload?.query]);

  // Reset thread when a new card/query opens
  useEffect(() => {
    setFollowUpMessages([]);
    setThreadId(null);
    setFollowUpInput('');
  }, [payload?.query]);

  // Auto-scroll to latest message in conversation
  useEffect(() => {
    if (followUpMessages.length > 0) {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUpMessages]);



  // Extract metrics from summary for visualization
  const metrics = useMemo(() => {
    const p = displayPayload ?? payload;
    if (!p?.summary) return [];
    return extractMetrics(p.summary);
  }, [displayPayload?.summary, payload?.summary]);

  // Generate contextual follow-up suggestions
  const followUpSuggestions = useMemo(() => {
    const p = displayPayload ?? payload;
    if (!p?.query || !p?.summary) return [];
    return generateContextualFollowUps(p.query, p.summary, p.keySignals || []);
  }, [displayPayload?.query, displayPayload?.summary, displayPayload?.keySignals, payload?.query, payload?.summary, payload?.keySignals]);

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

    markdown += `\n---\nGenerated by signal2noise\n`;

    navigator.clipboard.writeText(markdown);
  };

  const handleShareLinkedIn = () => {
    // LinkedIn share best practice: copy text and open LinkedIn
    handleCopyToClipboard();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(linkedInUrl, '_blank');
    alert('Content copied to clipboard. Paste it in your LinkedIn post!');
  };

  const handleCopyLink = () => {
    const url = cardId
      ? `https://signals.ensolabs.ai/brief/${cardId}`
      : window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // Brief visual feedback without alert
      const btn = document.getElementById('copy-link-btn');
      if (btn) {
        btn.setAttribute('title', 'Copied!');
        setTimeout(() => btn.setAttribute('title', 'Copy shareable link'), 1500);
      }
    });
  };

  const handleEmail = () => {
    if (!effectivePayload) return;
    const subject = encodeURIComponent(`Intelligence Brief: ${effectivePayload.query}`);
    const body = encodeURIComponent(
      `Intelligence Brief\n\nQuery: ${effectivePayload.query}\n\nSummary:\n${effectivePayload.summary}\n\n---\nGenerated by signal2noise`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleFollowUpSubmit = async () => {
    const question = followUpInput.trim();
    if (!question) return;
    if (followUpLoading) return;

    // Add user message to conversation immediately
    const userMessage = { role: 'user' as const, content: question };
    setFollowUpMessages(prev => [...prev, userMessage]);

    setFollowUpInput('');
    setFollowUpLoading(true);

    // Persist user message to thread (fire-and-forget)
    const persistMessage = async (msg: { role: string; content: string }, currentThreadId: string | null) => {
      try {
        const resp = await fetch(ENDPOINTS.chatThreadCreate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: currentThreadId,
            cardId: cardId,
            topic: effectivePayload?.query || question,
            message: msg,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (!currentThreadId && data.threadId) {
            setThreadId(data.threadId);
            return data.threadId;
          }
        }
      } catch { /* non-critical — thread persistence is best-effort */ }
      return currentThreadId;
    };

    const newThreadId = await persistMessage(userMessage, threadId);

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

      const rawText = data.answer ?? data.content ?? '';

      // Format the response for conversational display
      let formattedResponse = '';

      const summaryMatch = rawText.match(/Summary:\s*\n\n(.+?)(?=\n\nSignals:|$)/s);
      if (summaryMatch) {
        formattedResponse += `**Summary**\n\n${summaryMatch[1].trim()}\n\n`;
      }

      const signalsMatch = rawText.match(/Signals:\s*\n((?:[-*•]\s+.+\n?)+)/);
      if (signalsMatch) {
        formattedResponse += `**Key Signals**\n\n${signalsMatch[1].trim()}\n\n`;
      }

      const movesMatch = rawText.match(/Moves for leaders:\s*\n((?:[-*•]\s+.+\n?)+)/);
      if (movesMatch) {
        formattedResponse += `**Actions**\n\n${movesMatch[1].trim()}`;
      }

      if (!formattedResponse) {
        formattedResponse = rawText;
      }

      // Add assistant message to conversation
      const assistantMessage = { role: 'assistant' as const, content: formattedResponse };
      setFollowUpMessages(prev => [...prev, assistantMessage]);

      // Persist assistant response to thread
      persistMessage(assistantMessage, newThreadId);

      if (onFollowUp) onFollowUp(question);
    } catch (error) {
      console.error('[Follow-up] API error:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Unable to get intelligence for that question. Please try again.'
      };
      setFollowUpMessages(prev => [...prev, errorMessage]);
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

            {/* Live streaming preview — replaces skeleton when tokens arrive */}
            {streamingText ? (
              <div className="mt-8 font-mono text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-slate-800/60 rounded-xl p-6 border border-gray-200/60 dark:border-slate-700/50 max-h-72 overflow-y-auto">
                {streamingText}
                <span className="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle rounded-sm" />
              </div>
            ) : (
              <div className="mt-12">
                <LoadingSpinner size="md" text="Analyzing intelligence..." />
              </div>
            )}
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
          {/* Sources badge - Always visible */}
          {effectivePayload && (() => {
            const validSignals = effectivePayload.signals?.filter(signal => signal.sourceUrl && signal.sourceUrl !== '#') || [];
            const sourceCount = validSignals.length;

            return (
              <button
                onClick={() => document.querySelector('[data-section="sources-detail"]')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 dark:bg-violet-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-violet-600 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-violet-400 focus:ring-offset-2"
                title="View research sources"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-bold">{sourceCount}</span>
              </button>
            );
          })()}

          {/* Deep Research button — triggers Perplexity Agent API multi-step research */}
          {effectivePayload && !deepResearchLoading && (
            <button
              onClick={handleDeepResearch}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${
                showDeepResearch
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20'
              }`}
              title="Deep Research — comprehensive 10-step analysis via Perplexity Agent API"
            >
              <Microscope className="w-4 h-4" />
              Deep Research
            </button>
          )}
          {deepResearchLoading && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Researching...
            </div>
          )}

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
                id="copy-link-btn"
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Copy shareable link"
                title="Copy shareable link"
              >
                <Link className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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

              {/* Verdict headline — first signal title or query */}
              <p className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em] mb-3">
                Intelligence Brief
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-2 max-w-3xl">
                {effectivePayload?.signals?.[0]?.title || effectivePayload?.query || 'Intelligence Brief'}
              </h1>

              {/* Sources Banner - Always Visible */}
              {(() => {
                const validSignals = effectivePayload.signals?.filter(signal => signal.sourceUrl && signal.sourceUrl !== '#') || [];
                const sourceCount = validSignals.length;

                return (
                  <div className="mt-8 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-violet-50 dark:from-slate-800/60 dark:to-slate-700/60 rounded-xl border-2 border-blue-200/50 dark:border-violet-500/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 dark:bg-violet-500 rounded-lg shadow-sm">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Powered by Perplexity Research
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {sourceCount > 0 ? `${sourceCount} sources analyzed` : 'Real-time intelligence synthesis'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => document.querySelector('[data-section="sources-detail"]')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-violet-400 hover:bg-blue-100 dark:hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                    >
                      <span>View Sources</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}
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
              {/* Image grid — 2-column with captions */}
              {effectivePayload.images && effectivePayload.images.length > 0 && (
                <div className={`grid gap-4 ${effectivePayload.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {effectivePayload.images.slice(0, 4).map((img, i) => (
                    <figure key={i} className="group">
                      <a
                        href={img.origin_url || img.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-gray-200/60 dark:border-slate-700/50 hover:border-planner-orange/40 transition-colors"
                      >
                        <img
                          src={img.image_url}
                          alt={img.title || ''}
                          className="w-full object-cover"
                          style={{ maxHeight: effectivePayload.images!.length === 1 ? '320px' : '180px' }}
                          onError={(e) => { (e.currentTarget.closest('figure') as HTMLElement).style.display = 'none'; }}
                        />
                      </a>
                      {img.title && (
                        <figcaption className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono leading-snug">
                          {img.title}
                          {img.origin_url && (
                            <a href={img.origin_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-planner-orange hover:underline">
                              Source ↗
                            </a>
                          )}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}

              {/* Section 1: SUMMARY */}
              {effectivePayload.summary && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      Executive Summary
                    </h2>
                  </div>
                  <div className="font-sans text-base text-gray-800 dark:text-gray-200 leading-[1.8] prose prose-slate dark:prose-invert max-w-prose">
                    {parseMarkdown(effectivePayload.summary)}
                  </div>
                  {/* Pull quote — extract first sentence containing a stat */}
                  {(() => {
                    const sentences = effectivePayload.summary.split(/(?<=[.!?])\s+/);
                    const statSentence = sentences.find(s => /\d+%|\$\d+|\d+x\s|\d+\s*(billion|million|thousand)/i.test(s));
                    if (!statSentence || statSentence.length < 40) return null;
                    return (
                      <blockquote className="mt-6 pl-5 border-l-4 border-planner-orange">
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug italic">
                          "{statSentence.replace(/^["']|["']$/g, '').trim()}"
                        </p>
                      </blockquote>
                    );
                  })()}
                </section>
              )}

              {/* Section 1b: SIGNAL INSIGHT PANEL — enriched via getSignalInsight */}
              {insight && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Header bar */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md"
                        style={{
                          backgroundColor: insight.signal_type === 'risk' ? 'rgba(239,68,68,0.12)' :
                            insight.signal_type === 'disruption' ? 'rgba(230,126,34,0.12)' :
                            insight.signal_type === 'opportunity' ? 'rgba(34,197,94,0.12)' : 'rgba(96,165,250,0.12)',
                          color: insight.signal_type === 'risk' ? '#ef4444' :
                            insight.signal_type === 'disruption' ? '#E67E22' :
                            insight.signal_type === 'opportunity' ? '#22c55e' : '#60a5fa',
                        }}
                      >
                        {insight.signal_type.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Signal Score
                      </span>
                    </div>
                    {/* Score badge */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-4 rounded-sm"
                            style={{
                              backgroundColor: i < insight.signal_score
                                ? (insight.signal_score >= 8 ? '#ef4444' : insight.signal_score >= 6 ? '#E67E22' : '#60a5fa')
                                : 'var(--border)',
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                        {insight.signal_score}/10
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4 bg-white dark:bg-slate-800/30">
                    {/* Why it matters */}
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-planner-orange mb-1">Why It Matters</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight.why_it_matters}</p>
                    </div>

                    {/* Data point + affected brands row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {insight.data_point && (
                        <div className="px-4 py-3 rounded-lg bg-planner-orange/8 dark:bg-planner-orange/10 border-l-2 border-planner-orange">
                          <p className="font-mono text-xs uppercase tracking-widest text-planner-orange mb-1">Key Stat</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{insight.data_point}</p>
                        </div>
                      )}
                      {insight.affected_brands?.length > 0 && (
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Affected</p>
                          <div className="flex flex-wrap gap-2">
                            {insight.affected_brands.map((brand) => (
                              <span
                                key={brand}
                                className="px-2 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LinkedIn hook */}
                    {insight.linkedin_hook && (
                      <div className="flex items-start gap-3 pt-1">
                        <div className="flex-shrink-0 mt-0.5 p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">LinkedIn Hook</p>
                          <p className="text-sm italic text-gray-600 dark:text-gray-400">"{insight.linkedin_hook}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 1c: DATA VISUALIZATION — auto-generated from signal stats */}
              {effectivePayload.graphData?.comparisons && effectivePayload.graphData.comparisons.length >= 2 && (
                <BriefBarChart
                  comparisons={effectivePayload.graphData.comparisons}
                  query={effectivePayload.query}
                />
              )}

              {/* Section 2: INTELLIGENCE SIGNALS — full article cards */}
              {(effectivePayload.signals && effectivePayload.signals.length > 0) && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-planner-orange to-orange-600 rounded-xl shadow-sm">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                        Intelligence Signals
                      </h2>
                    </div>
                    {(metrics.length > 0 || effectivePayload.graphData?.comparisons?.length) && (
                      <button
                        onClick={() => setShowDashboard(!showDashboard)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          showDashboard
                            ? 'bg-planner-orange text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        {showDashboard ? 'Hide Chart' : 'Visualize'}
                      </button>
                    )}
                  </div>

                  {showDashboard && (
                    <InteractiveDashboard
                      metrics={metrics.map(m => ({ value: m.value, label: m.label || 'Metric', trend: m.trend, context: m.context }))}
                      comparisons={effectivePayload.graphData?.comparisons}
                      query={effectivePayload.query}
                      signals={effectivePayload.signals || []}
                      onMetricClick={(metric) => { console.log('[Dashboard] metric:', metric); }}
                      onComparisonClick={(comparison) => { console.log('[Dashboard] comparison:', comparison); }}
                      onExport={(format) => { console.log('[Dashboard] export:', format); }}
                    />
                  )}

                  <div className="space-y-4">
                    {effectivePayload.signals.map((signal, index) => {
                      let hostname = '';
                      try { hostname = new URL(signal.sourceUrl).hostname.replace('www.', ''); } catch { hostname = signal.sourceName; }
                      const digDeeperQ = `Tell me more about: ${signal.title}`;
                      return (
                        <article
                          key={signal.id || index}
                          className="group p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-planner-orange/40 dark:hover:border-planner-orange/40 hover:shadow-lg bg-white dark:bg-slate-800/50 transition-all duration-200"
                        >
                          {/* Signal header */}
                          <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-planner-orange/10 dark:bg-planner-orange/20 text-planner-orange text-xs font-bold flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <h3 className="font-sans text-base font-bold text-gray-900 dark:text-gray-100 leading-snug flex-1">
                              {signal.title}
                            </h3>
                          </div>

                          {/* Signal summary — the meat */}
                          {signal.summary && signal.summary !== signal.title && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-[1.75] mb-3 ml-9">
                              {signal.summary}
                            </p>
                          )}

                          {/* Stat callout */}
                          {signal.stat && (
                            <div className="ml-9 mb-3 px-3 py-2 rounded-lg bg-planner-orange/8 dark:bg-planner-orange/10 border-l-2 border-planner-orange">
                              <p className="text-sm font-semibold text-planner-orange">
                                {signal.stat}
                              </p>
                            </div>
                          )}

                          {/* Footer: source + dig deeper */}
                          <div className="ml-9 flex items-center justify-between gap-2 mt-1">
                            {signal.sourceUrl && signal.sourceUrl !== '#' ? (
                              <a
                                href={signal.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-planner-orange transition-colors"
                              >
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
                                  className="w-3.5 h-3.5 rounded-sm opacity-70"
                                  alt=""
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <span className="font-mono">{signal.sourceName || hostname}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{signal.sourceName}</span>
                            )}
                            {onFollowUp && (
                              <button
                                onClick={() => onFollowUp(digDeeperQ)}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-planner-orange hover:text-orange-600 transition-all duration-150"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Dig deeper →
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Section 2b: WHAT THIS MEANS — implications */}
              {effectivePayload.keySignals.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                      What This Means
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {effectivePayload.keySignals.map((signal, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{parseInlineMarkdown(signal)}</p>
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

              {/* Sources section — compact list */}
              <div data-section="sources-detail" className="mt-6 rounded-xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h3 className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Sources
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Verified by Perplexity</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {(() => {
                    const validSignals = effectivePayload.signals?.filter(s => s.sourceUrl && s.sourceUrl !== '#') || [];
                    const sourcesToShow = validSignals.length > 0 ? validSignals : [{
                      id: 'perplexity-fallback', title: 'Perplexity Research', summary: '', stat: undefined,
                      sourceName: 'Perplexity AI', sourceUrl: 'https://www.perplexity.ai',
                    }];
                    return sourcesToShow.map((signal, index) => {
                      let hostname = '';
                      try { hostname = new URL(signal.sourceUrl).hostname.replace('www.', ''); } catch { hostname = signal.sourceUrl; }
                      const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
                      return (
                        <a
                          key={signal.id || index}
                          href={signal.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4 shrink-0">{index + 1}</span>
                          <img src={favicon} alt="" className="w-4 h-4 rounded-sm opacity-70 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-planner-orange truncate leading-snug">
                              {signal.sourceName || hostname}
                            </p>
                            <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500 truncate">{hostname}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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

          {/* Deep Research Panel — Perplexity Agent API multi-step results */}
          {showDeepResearch && (
            <section data-section="deep-research" className="mt-12 pt-8 border-t-2 border-orange-300/40 dark:border-orange-500/30">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Microscope className="w-6 h-6 text-orange-500" />
                  <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                    Deep Research
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300">
                    AGENT API
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  10-step multi-source analysis via <span className="font-semibold text-orange-600 dark:text-orange-400">Perplexity Deep Research</span>
                </p>
              </div>

              {/* Streaming text while loading */}
              {deepResearchLoading && deepResearchStreaming && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {deepResearchStreaming}
                    <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-0.5" />
                  </div>
                </div>
              )}

              {/* Loading state without stream content yet */}
              {deepResearchLoading && !deepResearchStreaming && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Running multi-step research...</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take 30-60 seconds</p>
                  </div>
                </div>
              )}

              {/* Structured deep research results */}
              {deepResearchData && (
                <div className="space-y-8">
                  {/* Executive Summary */}
                  {deepResearchData.executiveSummary && (
                    <div className="p-6 bg-orange-50/50 dark:bg-orange-500/5 rounded-xl border border-orange-200/50 dark:border-orange-500/20">
                      <h4 className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-3">Executive Summary</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {deepResearchData.executiveSummary}
                      </div>
                    </div>
                  )}

                  {/* Deep Signals */}
                  {deepResearchData.deepSignals?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Deep Signals ({deepResearchData.deepSignals.length})</h4>
                      <div className="space-y-4">
                        {deepResearchData.deepSignals.map((signal: any, i: number) => (
                          <div key={i} className="p-5 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight flex-1">{signal.title}</h5>
                              <div className="flex items-center gap-2 ml-3 shrink-0">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                  signal.momentum?.toLowerCase().includes('rising')
                                    ? 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400'
                                    : signal.momentum?.toLowerCase().includes('falling')
                                    ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-gray-500/15 text-gray-700 dark:text-gray-400'
                                }`}>
                                  {signal.momentum || 'Stable'}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300">
                                  {signal.impact_score}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{signal.evidence}</p>
                            {signal.your_move && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Your Move: </span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{signal.your_move}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitive Landscape */}
                  {deepResearchData.competitiveLandscape && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Competitive Landscape</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {deepResearchData.competitiveLandscape}
                      </div>
                    </div>
                  )}

                  {/* 30-Day Action Plan */}
                  {deepResearchData.actionPlan?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">30-Day Action Plan</h4>
                      <div className="space-y-3">
                        {deepResearchData.actionPlan.map((step: any, i: number) => (
                          <div key={i} className="flex gap-3 items-start p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                            <span className="shrink-0 w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <div>
                              {step.week && <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{step.week}: </span>}
                              <span className="text-sm text-gray-700 dark:text-gray-300">{step.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  {deepResearchData.citations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Sources ({deepResearchData.citations.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {deepResearchData.citations.map((cite: any, i: number) => (
                          <a
                            key={i}
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {cite.sourceName || cite.title || new URL(cite.url).hostname.replace('www.', '')}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Follow-up Chat Section - Conversational Interface */}
          <section data-section="follow-up" className="mt-12 pt-8 border-t-2 border-gray-200/60 dark:border-slate-700/50">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-bureau-signal dark:text-planner-orange" />
                <h3 className="font-display text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                  Conversation
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Continue the conversation with <span className="font-semibold text-bureau-signal dark:text-planner-orange">Perplexity</span> to explore this topic deeper.
              </p>
            </div>

            {/* Conversation History */}
            {followUpMessages.length > 0 && (
              <div className="mb-6 space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
                {followUpMessages.map((msg, index) => {
                  const safeContent = typeof msg.content === 'string'
                    ? msg.content
                    : (msg.content as any)?.text || JSON.stringify(msg.content);

                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center shadow-sm">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] ${
                          msg.role === 'user'
                            ? 'bg-planner-orange text-white rounded-2xl px-4 py-3 shadow-md'
                            : 'bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4 shadow-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm leading-relaxed font-sans">{safeContent}</p>
                        ) : (
                          <div className="text-sm leading-relaxed text-gray-900 dark:text-gray-100 prose prose-sm dark:prose-invert max-w-none">
                            {parsePerplexityMarkdown(safeContent)}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-planner-orange to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-bold">You</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {followUpLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4">
                      <LoadingSpinner size="sm" text="Analyzing..." />
                    </div>
                  </div>
                )}
                {/* Scroll anchor */}
                <div ref={conversationEndRef} />
              </div>
            )}

            {/* Contextual Follow-Up Suggestions - Only show if no conversation started */}
            {followUpMessages.length === 0 && followUpSuggestions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setFollowUpInput(suggestion)}
                      disabled={followUpLoading}
                      className="group flex items-center gap-2 px-4 py-2.5 text-sm text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-planner-orange dark:hover:border-planner-orange hover:bg-orange-50 dark:hover:bg-slate-700/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-violet-500 group-hover:text-planner-orange flex-shrink-0" />
                      <span className="text-gray-900 dark:text-gray-100 leading-snug">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                placeholder={followUpMessages.length > 0 ? "Continue the conversation..." : "e.g., What are the budget implications? How does this compare to competitors?"}
                disabled={followUpLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-300 focus:outline-none focus:border-bureau-signal dark:focus:border-planner-orange focus:ring-2 focus:ring-bureau-signal/20 dark:focus:ring-planner-orange/20 disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed font-sans text-base transition-all duration-200"
              />
              <button
                type="submit"
                disabled={followUpLoading}
                style={{ cursor: 'pointer' }}
                className="px-6 py-3 bg-planner-orange text-white rounded-lg hover:bg-orange-600 hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
