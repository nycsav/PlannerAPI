/**
 * Executive Strategy Chat Component
 * 24-hour MVP: Single chat panel for strategic intelligence queries
 */

import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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

export const ExecutiveStrategyChat: React.FC = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<ChatState>('idle');
  const [response, setResponse] = useState<PlannerChatResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

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
      console.error('Error fetching intelligence:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to connect to intelligence service. Please try again.'
      );
      setState('error');
    }
  };

  return (
    <div className="w-full max-w-wide mx-auto app-padding-x py-2xl">
      {/* Header */}
      <div className="mb-lg">
        <h2 className="font-display text-3xl md:text-4xl font-black text-bureau-ink italic uppercase tracking-tight mb-sm">
          Executive Strategy Intelligence
        </h2>
        <p className="text-base text-bureau-slate/70">
          Ask questions about marketing trends, competitive intelligence, or strategic opportunities.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-xl">
        <div className="flex flex-col sm:flex-row gap-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are the latest trends in AI-driven personalization?"
            className="flex-1 px-md py-3 border border-bureau-ink/20 text-base focus:outline-none focus:border-bureau-signal"
            disabled={state === 'loading'}
          />
          <button
            type="submit"
            disabled={state === 'loading' || !query.trim()}
            className="bg-bureau-ink text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {state === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Get Intelligence
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {state === 'loading' && (
        <div className="border border-bureau-border bg-white p-lg">
          <div className="flex items-center gap-3 text-bureau-slate">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analyzing market intelligence...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="border border-red-200 bg-red-50 p-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Unable to Generate Intelligence</h3>
              <p className="text-sm text-red-700">{errorMessage}</p>
              <button
                onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="mt-3 text-sm font-semibold text-red-900 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State - Display Response */}
      {state === 'success' && response && (
        <div className="space-y-lg">
          {/* Signals Section */}
          <div className="border border-bureau-border bg-white p-lg">
            <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
              Signals
            </h3>
            <div className="space-y-md">
              {response.signals.map((signal) => (
                <div key={signal.id} className="border-l-2 border-bureau-signal pl-md">
                  <div className="flex items-start justify-between gap-md mb-2">
                    <h4 className="font-semibold text-bureau-ink">{signal.title}</h4>
                    <span className="text-xs font-mono text-bureau-slate/60 flex-shrink-0">
                      {signal.id}
                    </span>
                  </div>
                  <p className="text-sm text-bureau-slate/80 mb-2">{signal.summary}</p>
                  <a
                    href={signal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-bureau-signal hover:underline inline-flex items-center gap-1"
                  >
                    Source: {signal.sourceName}
                    {signal.sourceUrl !== '#' && <span>↗</span>}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Implications Section */}
          <div className="border border-bureau-border bg-white p-lg">
            <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
              What This Means
            </h3>
            <ul className="space-y-2">
              {response.implications.map((implication, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-bureau-signal font-bold mt-1">•</span>
                  <span className="text-sm text-bureau-slate/80">{implication}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions Section */}
          <div className="border border-bureau-border bg-white p-lg">
            <h3 className="font-display text-xl font-bold text-bureau-ink mb-md uppercase tracking-tight">
              Suggested Actions
            </h3>
            <ul className="space-y-2">
              {response.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-bureau-ink font-bold mt-1">{index + 1}.</span>
                  <span className="text-sm text-bureau-slate/80">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
