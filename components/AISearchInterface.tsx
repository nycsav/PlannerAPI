import React, { useState, useEffect, useRef } from 'react';
import {
  X, Search, TrendingUp, ArrowRight, Copy, RotateCw
} from 'lucide-react';
import { IntelligenceChart } from './IntelligenceChart';
import { useAudience } from '../contexts/AudienceContext';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';

interface AISearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  sourceType?: string;
  data?: {
    summary: string;
    signals: string[];
    sources: string[];
    raw?: any;
  };
}

// Helper functions - outside component for performance
const stripCitations = (text: string) => {
  return text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
};

const extractMetrics = (text: string) => {
  const metrics: Array<{value: string, context: string}> = [];
  const percentPattern = /(\d{2,3}%)\s+([\w\s]{0,50})/gi;
  const matches = [...(text.matchAll(percentPattern) || [])].slice(0, 3);

  matches.forEach((match) => {
    if (match[1] && match[2]) {
      metrics.push({
        value: match[1],
        context: match[2].trim().substring(0, 50)
      });
    }
  });

  return metrics;
};

// Rotating placeholder prompts for inspiration
// Last updated: January 2026
const placeholderPrompts = [
  "How is DeepSeek changing enterprise AI cost calculations?",
  "What's the business case for AI agents over workflows?",
  "How should CMOs respond to Google's AI Mode rollout?",
  "Which brands are winning with AI-powered personalization?",
  "What Q1 2026 retail media benchmarks matter most?",
  "How are marketing teams restructuring for AI-native ops?"
];

const getPlaceholderPrompt = () => {
  const index = Math.floor(Date.now() / 5000) % placeholderPrompts.length;
  return placeholderPrompts[index];
};

// Audience-specific system prompt enhancement
const getAudienceSystemPrompt = (audienceType: 'CMO' | 'VP_Marketing' | 'Brand_Director' | 'Growth_Leader' = 'CMO') => {
  const prompts = {
    'CMO': 'Focus on board-level strategic insights, revenue impact, market positioning, and executive decision frameworks.',
    'VP_Marketing': 'Emphasize tactical execution, team performance, budget allocation, and operational efficiency.',
    'Brand_Director': 'Prioritize brand equity, competitive differentiation, creative strategy, and consumer perception.',
    'Growth_Leader': 'Highlight growth metrics, conversion optimization, acquisition strategies, and scaling tactics.'
  };
  return prompts[audienceType];
};

// Parse summary text into structured sections for better readability
const parseSummaryIntoSections = (content: string): Array<{heading?: string, content: string, isBulletList?: boolean}> => {
  // Remove markdown bold markers
  const cleanContent = content.replace(/\*\*/g, '');

  // Split by common section markers
  const sectionPatterns = [
    /Summary:/gi,
    /Signals:/gi,
    /Moves for leaders:/gi,
    /Key takeaways:/gi,
    /Analysis:/gi,
    /Recommendations:/gi,
    /Next steps:/gi
  ];

  const sections: Array<{heading?: string, content: string, isBulletList?: boolean}> = [];
  let currentText = cleanContent;

  // Find all section markers
  const markers: Array<{index: number, heading: string}> = [];
  sectionPatterns.forEach(pattern => {
    const matches = [...currentText.matchAll(pattern)];
    matches.forEach(match => {
      if (match.index !== undefined) {
        markers.push({
          index: match.index,
          heading: match[0].replace(':', '').trim()
        });
      }
    });
  });

  // Sort markers by position
  markers.sort((a, b) => a.index - b.index);

  if (markers.length === 0) {
    // No sections found, return as single block
    return [{ content: cleanContent }];
  }

  // Extract sections
  markers.forEach((marker, idx) => {
    const start = marker.index + marker.heading.length + 1;
    const end = idx < markers.length - 1 ? markers[idx + 1].index : currentText.length;
    const sectionContent = currentText.substring(start, end).trim();

    if (sectionContent) {
      // Check if content has bullet points
      const hasBullets = /^[-•*]\s/m.test(sectionContent);

      sections.push({
        heading: marker.heading,
        content: sectionContent,
        isBulletList: hasBullets
      });
    }
  });

  // Add any content before first section
  if (markers[0] && markers[0].index > 0) {
    const intro = currentText.substring(0, markers[0].index).trim();
    if (intro) {
      sections.unshift({ content: intro });
    }
  }

  return sections;
};

// Extract source citations from content for credibility
const extractSources = (content: string): string[] => {
  const sources = new Set<string>();

  // Common research/data sources to look for
  const sourcePatterns = [
    /SAP Emarsys/gi,
    /Morning Consult/gi,
    /Gartner/gi,
    /Forrester/gi,
    /McKinsey/gi,
    /BCG/gi,
    /Deloitte/gi,
    /PwC/gi,
    /Accenture/gi,
    /eMarketer/gi,
    /Statista/gi,
    /Nielsen/gi,
    /Kantar/gi,
    /IDC/gi,
    /Adobe/gi,
    /Salesforce/gi,
    /HubSpot/gi,
    /Meta/gi,
    /Google/gi,
    /Amazon/gi,
    /Walmart/gi,
    /Target/gi
  ];

  sourcePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => sources.add(match));
    }
  });

  // Always include base sources
  sources.add('Perplexity AI');
  sources.add('PlannerAPI Intelligence');

  return Array.from(sources).slice(0, 6); // Limit to 6 sources
};

// Generate contextual follow-up questions based on response content
const getRelatedQuestions = (content: string): string[] => {
  // Extract key themes from content
  const hasAttribution = /attribution/i.test(content);
  const hasAI = /\bai\b|artificial intelligence/i.test(content);
  const hasROI = /roi|return|revenue/i.test(content);
  const hasData = /data|analytics/i.test(content);
  const hasRetail = /retail|amazon|walmart/i.test(content);
  const hasCookie = /cookie|privacy|tracking/i.test(content);

  const allQuestions = [
    // Attribution related
    ...(hasAttribution ? [
      "What are the most effective attribution models for 2026?",
      "How do leading brands measure cross-channel attribution?"
    ] : []),
    // AI related
    ...(hasAI ? [
      "What AI tools are CMOs prioritizing for marketing operations?",
      "How can we measure ROI from AI marketing investments?"
    ] : []),
    // ROI related
    ...(hasROI ? [
      "Break down the revenue impact by channel allocation",
      "What are industry benchmarks for marketing ROI in our sector?"
    ] : []),
    // Data related
    ...(hasData ? [
      "Compare first-party vs third-party data strategies",
      "What data governance frameworks should we implement?"
    ] : []),
    // Retail media
    ...(hasRetail ? [
      "How should we allocate budget to retail media networks?",
      "What are the performance benchmarks for retail media?"
    ] : []),
    // Privacy/cookies
    ...(hasCookie ? [
      "What privacy-first measurement solutions are leading in 2026?",
      "How are brands building zero-party data strategies?"
    ] : []),
    // Default fallbacks
    "What competitive threats should we monitor?",
    "Show me emerging trends in our industry",
    "What are the budget implications of this analysis?"
  ];

  // Return first 3 unique questions
  return [...new Set(allQuestions)].slice(0, 3);
};

export const AISearchInterface: React.FC<AISearchInterfaceProps> = ({
  isOpen,
  onClose,
  initialQuery,
  sourceType = 'Perplexity',
  data
}) => {
  const { audience } = useAudience();
  const [query, setQuery] = useState(initialQuery || '');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    metrics?: Array<{value: string, context: string}>;
    signals?: string[];
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  // Auto-fetch data if opened without data but with query
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isOpen && initialQuery && !data && !hasInitialized.current) {
        hasInitialized.current = true;
        setIsLoadingInitial(true);

        try {
          // Enhance initial query with audience-specific context
          const audienceContext = getAudienceSystemPrompt(audience);
          const enhancedInitialQuery = `Context: ${audienceContext}\n\nQuery: ${initialQuery}`;

          const resp = await fetchWithTimeout(
            ENDPOINTS.perplexitySearch,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: enhancedInitialQuery }),
              timeout: 30000,
            }
          );

          if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
          const fetchedData = await resp.json();

          // Parse response
          const sections = fetchedData.answer?.split('##') || [];
          let summary = '';
          if (sections.length > 1) {
            summary = sections[1].split('\n').filter((l: string) => l.trim() && !l.includes('##')).join(' ').trim();
          } else {
            summary = fetchedData.answer || '';
          }

          const signals: string[] = [];
          const bulletRegex = /^[-*•]\s+(.+)$/gm;
          let match;
          while ((match = bulletRegex.exec(fetchedData.answer || '')) !== null) {
            signals.push(match[1].trim());
          }

          const metrics = extractMetrics(summary);

          setConversationHistory([
            {
              type: 'assistant',
              content: stripCitations(summary),
              metrics: metrics,
              signals: signals.slice(0, 5)
            }
          ]);
        } catch (e) {
          console.error('Failed to fetch initial data:', e);
          setConversationHistory([
            {
              type: 'assistant',
              content: 'Error retrieving intelligence. Please retry or contact support.',
              metrics: [],
              signals: []
            }
          ]);
        } finally {
          setIsLoadingInitial(false);
        }
      }
    };

    if (isOpen) {
      fetchInitialData();
    } else {
      // Reset when closed
      hasInitialized.current = false;
      setConversationHistory([]);
    }
  }, [isOpen, initialQuery, data]);

  useEffect(() => {
    // Initialize conversation with first response if data provided
    if (data && conversationHistory.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const metrics = extractMetrics(data.summary);
      setConversationHistory([
        {
          type: 'assistant',
          content: stripCitations(data.summary),
          metrics: metrics,
          signals: data.signals
        }
      ]);
    }
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;

    setConversationHistory(prev => [
      ...prev,
      { type: 'user', content: followUpQuery }
    ]);

    setIsLoadingFollowUp(true);

    try {
      // Enhance query with audience-specific context
      const audienceContext = getAudienceSystemPrompt(audience);
      const enhancedQuery = `Context: ${audienceContext}\n\nOriginal query: ${query}\n\nFollow-up: ${followUpQuery}`;

      const resp = await fetchWithTimeout(
        ENDPOINTS.perplexitySearch,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: enhancedQuery
          }),
          timeout: 30000,
        }
      );

      if (!resp.ok) throw new Error(`Backend error: ${resp.status}`);
      
      const newData = await resp.json();
      const cleanText = newData.answer
        .replace(/\*\*Summary:\*\*/gi, '')
        .replace(/\*\*Signals:\*\*/gi, '')
        .replace(/##\s*Summary/gi, '')
        .replace(/\*\*/g, '')
        .trim();
      
      const summaryMatch = cleanText.match(/^(.+?)(?=\n[-•*]|\n\n|$)/s);
      const summary = summaryMatch ? summaryMatch[1].trim() : cleanText.substring(0, 600);
      
      setConversationHistory(prev => [
        ...prev,
        { type: 'assistant', content: stripCitations(summary) }
      ]);
      
    } catch (e) {
      console.error('Follow-up failed:', e);
      setConversationHistory(prev => [
        ...prev,
        { type: 'assistant', content: 'Unable to process request. Please try again.' }
      ]);
    } finally {
      setIsLoadingFollowUp(false);
      setFollowUpQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Minimal backdrop */}
      <div className="absolute inset-0 bg-black/5" onClick={onClose}></div>
      
      {/* Clean drawer */}
      <div className="relative w-full max-w-3xl bg-white h-full shadow-lg border-l border-gray-200 flex flex-col">
        
        {/* Enhanced header */}
        <div className="flex items-center justify-between px-lg py-lg border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-bureau-signal"></div>
            <span className="text-base font-semibold text-bureau-ink">Intelligence Brief</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-lg py-xl space-y-xl bg-gray-50">
          
          {/* Conversation thread */}
          {conversationHistory.map((message, i) => (
            <div key={i} className="space-y-md">
              
              {/* User message */}
              {message.type === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-2xl text-right">
                    <div className="inline-block text-xs text-gray-400 mb-2">You</div>
                    <div className="bg-bureau-ink text-white rounded-lg px-md py-md text-base">
                      {message.content}
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI message - Conversational design */}
              {message.type === 'assistant' && (
                <div className="space-y-lg">

                  {/* Clean, formatted response with proper sections */}
                  <div className="bg-white rounded-lg p-lg shadow-sm border border-gray-100">
                    {parseSummaryIntoSections(message.content).map((section, idx) => (
                      <div key={idx} className={idx > 0 ? "mt-lg pt-lg border-t border-gray-100" : ""}>
                        {section.heading && (
                          <h4 className="text-sm font-bold text-bureau-ink uppercase tracking-wide mb-3">
                            {section.heading}
                          </h4>
                        )}

                        {/* Render as bullet list if it has bullets */}
                        {section.isBulletList ? (
                          <div className="space-y-3">
                            {section.content.split(/(?=^[-•*]\s)/m).filter(line => line.trim()).map((bullet, bIdx) => {
                              const cleanBullet = bullet.replace(/^[-•*]\s+/, '').trim();
                              return cleanBullet ? (
                                <div key={bIdx} className="flex gap-3 items-start">
                                  <span className="text-bureau-signal flex-shrink-0 mt-1">•</span>
                                  <span className="text-sm text-gray-700 leading-relaxed">{cleanBullet}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div className="text-base leading-relaxed text-gray-700 space-y-3">
                            {section.content.split('\n').filter(line => line.trim()).map((paragraph, pIdx) => (
                              <p key={pIdx}>{paragraph.trim()}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Inline actions */}
                    {i === conversationHistory.length - 1 && (
                      <div className="flex items-center gap-3 pt-md mt-lg border-t border-gray-100">
                        <button className="text-xs text-gray-500 hover:text-bureau-signal flex items-center gap-1.5 transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                        <button className="text-xs text-gray-500 hover:text-bureau-signal flex items-center gap-1.5 transition-colors">
                          <RotateCw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1. Key signals first - organized and clean */}
                  {message.signals && message.signals.length > 0 && i === 0 && (
                    <div className="bg-white rounded-lg p-lg shadow-sm border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-md">Key Signals</h3>
                      <div className="space-y-md">
                        {message.signals.map((signal, idx) => (
                          <div key={idx} className="flex gap-3 items-start group">
                            <span className="text-sm font-bold text-bureau-signal flex-shrink-0 min-w-[20px]">{idx + 1}</span>
                            <span className="text-sm text-gray-700 leading-relaxed">{signal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Related questions - pre-populate on click */}
                  {i === 0 && (
                    <div className="bg-white rounded-lg p-lg shadow-sm border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-md">Continue exploring</h3>
                      <div className="space-y-2">
                        {getRelatedQuestions(message.content).map((question, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              setFollowUpQuery(question);
                              // Focus input so user can edit/send
                              setTimeout(() => {
                                const input = document.querySelector<HTMLInputElement>('input[placeholder*="follow-up"]');
                                input?.focus();
                              }, 100);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-bureau-signal transition-all group"
                          >
                            <span className="flex items-center justify-between">
                              <span>{question}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-bureau-signal group-hover:translate-x-1 transition-all" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Sources for credibility */}
                  {i === 0 && (
                    <div className="bg-white rounded-lg p-lg shadow-sm border border-gray-100">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-md">Sources</h3>
                      <div className="flex flex-wrap gap-2">
                        {extractSources(message.content).map((source, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-xs text-gray-600 rounded-md border border-gray-200 font-medium">
                            {source}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3 italic">
                        Research compiled from multiple industry sources and real-time data
                      </p>
                    </div>
                  )}

                  {/* 4. Chart data at bottom */}
                  {message.metrics && message.metrics.length > 0 && i === 0 && (
                    <IntelligenceChart data={message.metrics} title="Chart data" />
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Initial Loading */}
          {isLoadingInitial && conversationHistory.length === 0 && (
            <div className="bg-white rounded-lg p-lg space-y-md shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-bureau-signal animate-pulse"></div>
                <span className="text-sm text-gray-600 font-semibold">Analyzing intelligence sources...</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-2 bg-gray-100 rounded animate-pulse w-5/6"></div>
                <div className="h-2 bg-gray-100 rounded animate-pulse w-4/6"></div>
              </div>
            </div>
          )}

          {/* Follow-up Loading */}
          {isLoadingFollowUp && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
              Processing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input with placeholder prompts */}
        <form onSubmit={handleFollowUp} className="border-t border-gray-100 px-lg py-md bg-white">
          <div className="flex items-end gap-sm">
            <input
              type="text"
              value={followUpQuery}
              onChange={(e) => setFollowUpQuery(e.target.value)}
              placeholder={getPlaceholderPrompt()}
              disabled={isLoadingFollowUp || isLoadingInitial}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-md py-sm text-sm focus:outline-none focus:border-gray-400 disabled:opacity-50 transition-colors placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoadingFollowUp || isLoadingInitial || !followUpQuery.trim()}
              className="p-sm bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-xs">
            Press Enter to send • Try asking about trends, competitors, or strategy
          </div>
        </form>
      </div>
    </div>
  );
};

