/**
 * Executive Strategy Chat Component
 * 24-hour MVP: Single chat panel for strategic intelligence queries
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { parseMarkdown, parseInlineMarkdown } from '../utils/markdown';
import { useAudience } from '../contexts/AudienceContext';
import { ENDPOINTS, fetchWithTimeout } from '../src/config/api';

type PlannerChatResponse = {
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  implications: string[];
  actions: string[];
};

type ChatState = 'idle' | 'loading' | 'success' | 'error';

type ConversationTurn = {
  query: string;
  response: PlannerChatResponse;
  timestamp: Date;
};

interface ExecutiveStrategyChatProps {
  externalQuery?: string;
  onExternalQueryProcessed?: () => void;
}

export const ExecutiveStrategyChat: React.FC<ExecutiveStrategyChatProps> = ({
  externalQuery,
  onExternalQueryProcessed
}) => {
  const { audience } = useAudience();

  const [query, setQuery] = useState('');
  const [state, setState] = useState<ChatState>('idle');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasBeenUsed, setHasBeenUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === 'success' && conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [conversation]);

  // Handle external query from hero search
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      console.log('[ExecutiveStrategyChat] Received external query:', externalQuery);
      setQuery(externalQuery);
      // Auto-submit the external query directly (don't wait for state update)
      setTimeout(() => {
        try {
          console.log('[ExecutiveStrategyChat] Auto-submitting external query');
          submitQuery(externalQuery);
          onExternalQueryProcessed?.();
        } catch (error) {
          console.error('[ExecutiveStrategyChat] Error auto-submitting:', error);
        }
      }, 100);
    }
  }, [externalQuery]);

  // Core submission logic extracted to handle both form submit and external queries
  const submitQuery = async (queryText: string) => {
    console.log('[ExecutiveStrategyChat] submitQuery called with:', queryText);

    if (!queryText.trim()) {
      console.log('[ExecutiveStrategyChat] Query is empty, returning');
      return;
    }

    setHasBeenUsed(true);
    setState('loading');
    setErrorMessage('');
    setQuery(''); // Clear input immediately

    try {
      // Convert audience format from VP_Marketing to "VP Marketing"
      const audienceFormatted = audience.replace(/_/g, ' ');

      console.log('[ExecutiveStrategyChat] Fetching from API:', ENDPOINTS.chatIntel);

      const res = await fetchWithTimeout(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText.trim(),
          audience: audienceFormatted
        }),
        timeout: 30000,
      });

      console.log('[ExecutiveStrategyChat] API response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      const data: PlannerChatResponse = await res.json();
      console.log('[ExecutiveStrategyChat] Successfully received data');

      // Append to conversation history instead of replacing
      setConversation(prev => [...prev, {
        query: queryText.trim(),
        response: data,
        timestamp: new Date()
      }]);

      setState('success');
    } catch (error) {
      console.error('[ExecutiveStrategyChat] Error in submitQuery:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to connect to intelligence service. Please try again.'
      );
      setState('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ExecutiveStrategyChat] handleSubmit called with query:', query);
    await submitQuery(query);
  };

  const handleRetry = () => {
    setState('idle');
    setErrorMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-wide mx-auto app-padding-x py-2xl">
      {/* Conversation History - Shows all previous queries and responses */}
      {conversation.length > 0 && (
        <div className="space-y-lg mb-xl" role="region" aria-label="Conversation history">
          {conversation.map((turn, index) => (
            <div key={index} className="space-y-md">
              {/* Query */}
              <div className="border-l-4 border-bureau-signal pl-md py-sm">
                <p className="text-xs font-mono text-bureau-slate/60 uppercase tracking-wide mb-1">Your Query</p>
                <p className="text-base font-medium text-bureau-ink">{turn.query}</p>
              </div>

              {/* Response */}
              <div className="space-y-lg">
                {/* SUMMARY */}
                {turn.response.implications.length > 0 && (
                  <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
                    <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                      Summary
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {turn.response.implications.map((implication, idx) => (
                        <p key={idx} className="text-base text-bureau-ink leading-relaxed mb-3 last:mb-0">
                          {parseInlineMarkdown(implication)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* KEY SIGNALS */}
                {turn.response.signals.length > 0 && (
                  <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
                    <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                      Key Signals
                    </h3>
                    <ul className="space-y-0" role="list">
                      {turn.response.signals.map((signal, idx) => (
                        <li key={signal.id} className="flex items-start gap-3 mb-4 last:mb-0">
                          <span className="text-bureau-signal font-bold mt-0.5 text-lg leading-none flex-shrink-0">•</span>
                          <div className="flex-1">
                            <span className="text-base text-bureau-ink leading-relaxed">
                              <strong className="font-bold">{parseInlineMarkdown(signal.title)}.</strong> {parseInlineMarkdown(signal.summary)}
                              {signal.sourceUrl && signal.sourceUrl !== '#' && (
                                <a
                                  href={signal.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-xs font-medium text-bureau-signal hover:text-bureau-signal/80 inline-flex items-center gap-1"
                                >
                                  [{idx + 1}]
                                </a>
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* MOVES FOR LEADERS */}
                {turn.response.actions.length > 0 && (
                  <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
                    <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                      Moves for Leaders
                    </h3>
                    <ul className="space-y-0" role="list">
                      {turn.response.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3 mb-4 last:mb-0">
                          <span className="text-bureau-signal font-bold mt-0.5 text-lg leading-none flex-shrink-0">•</span>
                          <span className="text-base text-bureau-ink leading-relaxed flex-1">
                            {parseInlineMarkdown(action)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* SOURCES */}
                {turn.response.signals.length > 0 && (
                  <div className="border-t border-bureau-border pt-md">
                    <p className="text-xs font-mono text-bureau-slate/60 mb-sm uppercase tracking-wide">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {turn.response.signals.map((signal, idx) => (
                        signal.sourceUrl && signal.sourceUrl !== '#' ? (
                          <a
                            key={signal.id}
                            href={signal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-bureau-border hover:bg-bureau-signal/10 rounded-full text-xs font-medium text-bureau-slate hover:text-bureau-signal transition-colors"
                          >
                            <span>[{idx + 1}]</span>
                            <span>{signal.sourceName}</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider between conversation turns (except last) */}
              {index < conversation.length - 1 && (
                <div className="border-t-2 border-bureau-border pt-lg mt-lg" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {state === 'loading' && (
        <div
          className="border-2 border-bureau-signal/20 bg-bureau-signal/5 p-lg rounded-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 text-bureau-ink">
            <Loader2 className="w-5 h-5 animate-spin text-bureau-signal" aria-hidden="true" />
            <span className="text-sm font-medium">Analyzing market intelligence...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div
          id="error-message"
          className="border-2 border-red-300 bg-red-50 p-lg rounded-sm mb-xl"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Unable to Generate Intelligence</h3>
              <p className="text-sm text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Form - Always visible after conversation starts or for first query */}
      <div className={conversation.length > 0 ? "border-t-2 border-bureau-border pt-lg" : ""}>
        <h3 className="font-display text-lg font-bold text-bureau-ink mb-sm uppercase tracking-tight">
          {conversation.length > 0 ? 'Continue Exploring' : 'Ask a Question'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-sm">
            <label htmlFor="chat-query" className="sr-only">
              Strategic intelligence query
            </label>
            <input
              ref={inputRef}
              id="chat-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={conversation.length > 0 ? "Dig deeper into this analysis..." : "What would you like to know?"}
              className="flex-1 px-md py-3 border-2 border-bureau-ink/20 text-base focus:outline-none focus:border-bureau-signal focus:ring-2 focus:ring-bureau-signal/20"
              aria-label="Enter your strategic intelligence query"
              disabled={state === 'loading'}
            />
            <button
              type="submit"
              disabled={!query.trim() || state === 'loading'}
              className="bg-bureau-ink text-white px-6 py-3 font-semibold hover:bg-bureau-ink/90 active:bg-bureau-ink focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] sm:min-w-0"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  Ask
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Scroll anchor for conversation */}
      <div ref={conversationEndRef} />
    </div>
  );
};
