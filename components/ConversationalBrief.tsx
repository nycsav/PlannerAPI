/**
 * Conversational Intelligence Brief - Threaded experience like Perplexity
 * Matches inline ExecutiveStrategyChat quality with full conversation support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X, ArrowRight, Copy, RotateCw, Download, Share2, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { parseInlineMarkdown } from '../utils/markdown';
import { useAudience } from '../contexts/AudienceContext';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';

type Message = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  response?: {
    implications: string[];
    actions: string[];
    signals: Array<{
      id: string;
      title: string;
      summary: string;
      sourceName: string;
      sourceUrl: string;
    }>;
  };
  isExpanded?: boolean;
};

interface ConversationalBriefProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

// Generate contextual follow-up questions
const generateFollowUps = (lastResponse?: Message['response']): string[] => {
  if (!lastResponse) {
    return [
      "What competitive threats should we monitor?",
      "Show me emerging trends in our industry",
      "What are the budget implications?"
    ];
  }

  // Extract themes from implications and actions
  const allText = [
    ...(lastResponse.implications || []),
    ...(lastResponse.actions || [])
  ].join(' ').toLowerCase();

  const hasROI = /roi|revenue|budget|cost/i.test(allText);
  const hasAI = /\bai\b|artificial intelligence|automation/i.test(allText);
  const hasCompetitor = /competitor|competitive|market share/i.test(allText);

  const questions = [];

  if (hasROI) questions.push("Break down the financial impact by quarter");
  if (hasAI) questions.push("Which AI tools should we prioritize?");
  if (hasCompetitor) questions.push("How are top 3 competitors responding?");

  // Default fallbacks
  questions.push(
    "What are the implementation risks?",
    "Show me industry benchmarks for comparison",
    "What metrics should we track?"
  );

  return questions.slice(0, 3);
};

export const ConversationalBrief: React.FC<ConversationalBriefProps> = ({
  isOpen,
  onClose,
  initialQuery
}) => {
  const { audience } = useAudience();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Auto-fetch initial query
  useEffect(() => {
    if (isOpen && initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      handleQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
      setMessages([]);
      setInputValue('');
    }
  }, [isOpen]);

  const handleQuery = async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation context
      const conversationContext = messages
        .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const contextQuery = conversationContext
        ? `Previous context:\n${conversationContext}\n\nNew query: ${query}`
        : query;

      const res = await fetchWithTimeout(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: contextQuery, audience }),
        timeout: 30000,
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: query,
        timestamp: Date.now(),
        response: {
          implications: data.implications || [],
          actions: data.actions || [],
          signals: data.signals || []
        },
        isExpanded: true
      };

      setMessages(prev => {
        // Collapse previous messages
        const updated = prev.map(m => ({ ...m, isExpanded: false }));
        return [...updated, assistantMessage];
      });
    } catch (error) {
      console.error('Query failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: query,
        timestamp: Date.now(),
        response: {
          implications: ['Unable to process request. Please try again.'],
          actions: [],
          signals: []
        },
        isExpanded: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleQuery(inputValue.trim());
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInputValue(question);
    // Auto-submit after brief delay so user sees it populate
    setTimeout(() => {
      handleQuery(question);
    }, 200);
  };

  const toggleExpand = (messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, isExpanded: !m.isExpanded } : m
      )
    );
  };

  const copyResponse = (message: Message) => {
    const text = `Query: ${message.content}\n\nSummary:\n${message.response?.implications.join('\n')}\n\nMoves for Leaders:\n${message.response?.actions.join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  const exportThread = () => {
    const threadText = messages
      .map(m => {
        if (m.type === 'user') return `User: ${m.content}`;
        return `Assistant:\nSummary: ${m.response?.implications.join('\n')}\nActions: ${m.response?.actions.join('\n')}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([threadText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligence-brief-${Date.now()}.txt`;
    a.click();
  };

  if (!isOpen) return null;

  const lastAssistantMessage = [...messages].reverse().find(m => m.type === 'assistant');

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col">
        {/* Header with thread actions */}
        <div className="flex items-center justify-between px-lg py-lg border-b border-bureau-border bg-white sticky top-0 z-10">
          <div className="flex items-center gap-md">
            <div className="w-2 h-2 rounded-full bg-bureau-signal animate-pulse" />
            <h2 className="font-display text-lg font-black text-bureau-ink uppercase tracking-tight">
              Intelligence Brief
            </h2>
            {messages.length > 0 && (
              <span className="text-xs text-bureau-slate/60 font-mono">
                {messages.filter(m => m.type === 'assistant').length} {messages.filter(m => m.type === 'assistant').length === 1 ? 'response' : 'responses'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportThread}
              disabled={messages.length === 0}
              className="p-2 hover:bg-bureau-border rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Export thread"
            >
              <Download className="w-4 h-4 text-bureau-slate" />
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
              }}
              className="p-2 hover:bg-bureau-border rounded-sm transition-colors"
              title="Copy link"
            >
              <Share2 className="w-4 h-4 text-bureau-slate" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bureau-border rounded-sm transition-colors"
            >
              <X className="w-5 h-5 text-bureau-slate" />
            </button>
          </div>
        </div>

        {/* Thread content */}
        <div className="flex-1 overflow-y-auto px-lg py-xl space-y-lg bg-bureau-surface">
          {messages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-bureau-slate/40 text-sm italic">No messages yet</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-md">
              {/* User query */}
              {message.type === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-2xl">
                    <div className="bg-bureau-ink text-white rounded-lg px-lg py-md">
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assistant response */}
              {message.type === 'assistant' && message.response && (
                <div className="space-y-md">
                  {/* Collapsed view */}
                  {!message.isExpanded && (
                    <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                      <div className="flex items-start justify-between gap-md">
                        <div className="flex-1">
                          <p className="font-semibold text-bureau-ink mb-2">{message.content}</p>
                          <p className="text-sm text-bureau-slate/70 line-clamp-2">
                            {message.response.implications[0] || 'No summary available'}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleExpand(message.id)}
                          className="flex-shrink-0 p-2 hover:bg-bureau-border rounded-sm transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 text-bureau-slate" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded view */}
                  {message.isExpanded && (
                    <div className="space-y-md">
                      {/* Summary section */}
                      {message.response.implications.length > 0 && (
                        <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                          <div className="flex items-start justify-between mb-md">
                            <h3 className="font-display text-lg font-bold text-bureau-ink uppercase tracking-tight">
                              Summary
                            </h3>
                            {messages.filter(m => m.type === 'assistant').length > 1 && (
                              <button
                                onClick={() => toggleExpand(message.id)}
                                className="p-1 hover:bg-bureau-border rounded-sm transition-colors"
                              >
                                <ChevronUp className="w-4 h-4 text-bureau-slate" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {message.response.implications.map((implication, index) => (
                              <p key={index} className="text-base text-bureau-ink leading-relaxed">
                                {parseInlineMarkdown(implication)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Signals section */}
                      {message.response.signals.length > 0 && (
                        <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                          <h3 className="font-display text-lg font-bold text-bureau-ink uppercase tracking-tight mb-md">
                            Key Signals
                          </h3>
                          <ul className="space-y-0" role="list">
                            {message.response.signals.map((signal, index) => (
                              <li key={signal.id} className="flex items-start gap-3 mb-4 last:mb-0">
                                <span className="text-bureau-signal font-bold mt-0.5 text-lg leading-none flex-shrink-0">•</span>
                                <div className="flex-1">
                                  <span className="text-base text-bureau-ink leading-relaxed">
                                    <strong className="font-bold">{signal.title}.</strong> {parseInlineMarkdown(signal.summary)}
                                    {signal.sourceUrl && signal.sourceUrl !== '#' && (
                                      <a
                                        href={signal.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-xs font-medium text-bureau-signal hover:text-bureau-signal/80 inline-flex items-center gap-1"
                                      >
                                        [{index + 1}]
                                      </a>
                                    )}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Moves for Leaders section */}
                      {message.response.actions.length > 0 && (
                        <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                          <h3 className="font-display text-lg font-bold text-bureau-ink uppercase tracking-tight mb-md">
                            Moves for Leaders
                          </h3>
                          <ul className="space-y-0" role="list">
                            {message.response.actions.map((action, index) => (
                              <li key={index} className="flex items-start gap-3 mb-4 last:mb-0">
                                <span className="text-bureau-signal font-bold mt-0.5 text-lg leading-none flex-shrink-0">•</span>
                                <span className="text-base text-bureau-ink leading-relaxed flex-1">
                                  {parseInlineMarkdown(action)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources section */}
                      {message.response.signals.length > 0 && (
                        <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                          <h3 className="text-xs font-mono text-bureau-slate/60 uppercase tracking-wide mb-sm">
                            Sources
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {message.response.signals.map((signal, index) => (
                              signal.sourceUrl && signal.sourceUrl !== '#' ? (
                                <a
                                  key={signal.id}
                                  href={signal.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-bureau-border hover:bg-bureau-signal/10 rounded-full text-xs font-medium text-bureau-slate hover:text-bureau-signal transition-colors"
                                >
                                  <span>[{index + 1}]</span>
                                  <span>{signal.sourceName}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span
                                  key={signal.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-bureau-border rounded-full text-xs font-medium text-bureau-slate"
                                >
                                  <span>[{index + 1}]</span>
                                  <span>{signal.sourceName}</span>
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Response actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyResponse(message)}
                          className="text-xs text-bureau-slate hover:text-bureau-signal flex items-center gap-1.5 transition-colors font-medium"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy response
                        </button>
                        <button
                          onClick={() => handleQuery(message.content)}
                          className="text-xs text-bureau-slate hover:text-bureau-signal flex items-center gap-1.5 transition-colors font-medium"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                      </div>

                      {/* Continue Exploring - only for most recent response */}
                      {message.id === lastAssistantMessage?.id && (
                        <div className="bg-white border-2 border-bureau-border rounded-sm p-lg shadow-sm">
                          <h3 className="font-display text-lg font-bold text-bureau-ink uppercase tracking-tight mb-md">
                            Continue Exploring
                          </h3>
                          <div className="space-y-2">
                            {generateFollowUps(message.response).map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleFollowUpClick(question)}
                                disabled={isLoading}
                                className="w-full text-left px-4 py-3 text-sm text-bureau-ink border-2 border-bureau-ink/20 hover:border-planner-orange hover:bg-planner-orange/5 rounded-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="flex items-center justify-between">
                                  <span className="font-medium">{question}</span>
                                  <ArrowRight className="w-4 h-4 text-bureau-slate group-hover:text-planner-orange group-hover:translate-x-1 transition-all" />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white border-2 border-bureau-signal/20 rounded-sm p-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-bureau-signal animate-pulse" />
                <span className="text-sm text-bureau-ink font-medium">Analyzing intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky input at bottom */}
        <div className="border-t-2 border-bureau-border px-lg py-md bg-white sticky bottom-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-sm">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a follow-up about this intelligence..."
                disabled={isLoading}
                className="flex-1 px-md py-3 border-2 border-bureau-ink/20 text-base focus:outline-none focus:border-bureau-signal focus:ring-2 focus:ring-bureau-signal/20 disabled:bg-bureau-border/30 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-bureau-ink text-white px-6 py-3 font-semibold hover:bg-planner-orange transition-colors focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] sm:min-w-0"
              >
                {isLoading ? 'Analyzing...' : 'Ask'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
          <p className="text-xs text-bureau-slate/60 mt-2 italic">
            Each follow-up includes context from the full conversation thread
          </p>
        </div>
      </div>
    </div>
  );
};
