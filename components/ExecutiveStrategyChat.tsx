/**
 * Executive Strategy Chat Component
 * 24-hour MVP: Single chat panel for strategic intelligence queries
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { parseMarkdown, parseInlineMarkdown } from '../utils/markdown';

const API_ENDPOINT = 'https://planners-backend-865025512785.us-central1.run.app/chat-intel';

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

interface ExecutiveStrategyChatProps {
  externalQuery?: string;
  onExternalQueryProcessed?: () => void;
}

export const ExecutiveStrategyChat: React.FC<ExecutiveStrategyChatProps> = ({
  externalQuery,
  onExternalQueryProcessed
}) => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<ChatState>('idle');
  const [response, setResponse] = useState<PlannerChatResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasBeenUsed, setHasBeenUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === 'success' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state]);

  // Handle external query from hero search
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setQuery(externalQuery);
      // Auto-submit after setting query
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
        onExternalQueryProcessed?.();
      }, 100);
    }
  }, [externalQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setHasBeenUsed(true);
    setState('loading');
    setErrorMessage('');
    setResponse(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      const data: PlannerChatResponse = await res.json();
      setResponse(data);
      setState('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to connect to intelligence service. Please try again.'
      );
      setState('error');
    }
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
      {/* Show input form when retrying after error or when idle after being used */}
      {hasBeenUsed && (state === 'idle' || state === 'error') && (
        <div className="mb-xl">
          <h3 className="font-display text-lg font-bold text-bureau-ink mb-sm uppercase tracking-tight">
            {state === 'error' ? 'Try Another Query' : 'New Question'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-sm">
              <label htmlFor="retry-query" className="sr-only">
                Strategic intelligence query
              </label>
              <input
                ref={inputRef}
                id="retry-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know?"
                className="flex-1 px-md py-3 border-2 border-bureau-ink/20 text-base focus:outline-none focus:border-bureau-signal focus:ring-2 focus:ring-bureau-signal/20"
                aria-label="Enter your strategic intelligence query"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="bg-bureau-ink text-white px-6 py-3 font-semibold hover:bg-bureau-ink/90 active:bg-bureau-ink focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] sm:min-w-0"
              >
                Ask
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </form>
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

      {/* Success State - Display Response */}
      {state === 'success' && response && (
        <div ref={resultsRef} className="space-y-lg" role="region" aria-label="Intelligence results">

          {/* SUMMARY: Executive Takeaway (2-3 sentences, no bullets) */}
          {response.implications.length > 0 && (
            <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
              <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                Summary
              </h3>
              <div className="prose prose-sm max-w-none">
                {response.implications.map((implication, index) => (
                  <p key={index} className="text-base text-bureau-ink leading-relaxed mb-3 last:mb-0">
                    {parseInlineMarkdown(implication)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* KEY SIGNALS: Bulleted list with bold headlines */}
          {response.signals.length > 0 && (
            <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
              <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                Key Signals
              </h3>
              <ul className="space-y-0" role="list">
                {response.signals.map((signal, index) => (
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

          {/* MOVES FOR LEADERS: Actionable directives */}
          {response.actions.length > 0 && (
            <div className="border-2 border-bureau-border bg-white p-lg rounded-sm shadow-sm">
              <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
                Moves for Leaders
              </h3>
              <ul className="space-y-0" role="list">
                {response.actions.map((action, index) => (
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

          {/* SOURCES: Chip badges for citations */}
          {response.signals.length > 0 && (
            <div className="border-t border-bureau-border pt-md">
              <p className="text-xs font-mono text-bureau-slate/60 mb-sm uppercase tracking-wide">Sources</p>
              <div className="flex flex-wrap gap-2">
                {response.signals.map((signal, index) => (
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
                      <span aria-hidden="true">↗</span>
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

          {/* CONTINUE EXPLORING: Follow-up Question Input */}
          <div className="border-t-2 border-bureau-border pt-lg mt-xl">
            <h3 className="font-display text-lg font-bold text-bureau-ink mb-sm uppercase tracking-tight">
              Continue Exploring
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-sm">
                <label htmlFor="followup-query" className="sr-only">
                  Follow-up question
                </label>
                <input
                  ref={inputRef}
                  id="followup-query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Dig deeper into this analysis..."
                  className="flex-1 px-md py-3 border-2 border-bureau-ink/20 text-base focus:outline-none focus:border-bureau-signal focus:ring-2 focus:ring-bureau-signal/20"
                  aria-label="Enter your follow-up question"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="bg-bureau-ink text-white px-6 py-3 font-semibold hover:bg-bureau-ink/90 active:bg-bureau-ink focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] sm:min-w-0"
                >
                  Ask
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
