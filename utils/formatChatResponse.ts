/**
 * Unified Chat Response Formatter
 * 
 * Ensures consistent formatting across all chat modules:
 * - Brief Assistant (IntelligenceModal)
 * - ExecutiveStrategyChat
 * - ConversationalBrief
 * 
 * All modules use the same structured format:
 * - IMPLICATIONS (What this means)
 * - MOVES FOR LEADERS (Actionable steps)
 * - SOURCES (Citations with [1], [2], etc.)
 */

import { parseInlineMarkdown } from './markdown';

export interface StructuredChatResponse {
  implications: string[];
  actions: string[];
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  citations?: string[];
}

/**
 * Format structured chat response into consistent UI sections
 * Used by Brief Assistant and other chat modules
 */
export function formatChatResponseSections(response: StructuredChatResponse) {
  const sections: Array<{
    type: 'implications' | 'actions' | 'sources';
    title: string;
    content: React.ReactNode;
  }> = [];

  // IMPLICATIONS Section
  if (response.implications && response.implications.length > 0) {
    sections.push({
      type: 'implications',
      title: 'Implications',
      content: (
        <ul className="space-y-3">
          {response.implications.map((implication, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-planner-orange font-bold mt-0.5 flex-shrink-0">•</span>
              <span className="text-base text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                {parseInlineMarkdown(implication)}
              </span>
            </li>
          ))}
        </ul>
      )
    });
  }

  // MOVES FOR LEADERS Section
  if (response.actions && response.actions.length > 0) {
    sections.push({
      type: 'actions',
      title: 'Moves for Leaders',
      content: (
        <ul className="space-y-3">
          {response.actions.map((action, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
              <span className="text-base text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
                {parseInlineMarkdown(action)}
              </span>
            </li>
          ))}
        </ul>
      )
    });
  }

  // SOURCES Section
  if (response.signals && response.signals.length > 0) {
    sections.push({
      type: 'sources',
      title: 'Sources',
      content: (
        <div className="flex flex-wrap gap-2">
          {response.signals.map((signal, index) => {
            if (!signal.sourceUrl || signal.sourceUrl === '#') return null;
            
            try {
              const hostname = new URL(signal.sourceUrl).hostname.replace('www.', '');
              return (
                <a
                  key={signal.id || index}
                  href={signal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-planner-orange/10 dark:hover:bg-planner-orange/20 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-planner-orange dark:hover:text-planner-orange transition-colors"
                >
                  <span className="font-mono font-bold">[{index + 1}]</span>
                  <span>{signal.sourceName || hostname}</span>
                  <span aria-hidden="true" className="text-[10px]">↗</span>
                </a>
              );
            } catch {
              return null;
            }
          })}
        </div>
      )
    });
  }

  return sections;
}

/**
 * Format response for display in chat bubbles
 * Converts structured data to formatted markdown text
 */
export function formatChatResponseText(response: StructuredChatResponse): string {
  let text = '';

  // IMPLICATIONS
  if (response.implications && response.implications.length > 0) {
    text += '**Implications:**\n\n';
    response.implications.forEach(impl => {
      text += `• ${impl}\n`;
    });
    text += '\n';
  }

  // MOVES FOR LEADERS
  if (response.actions && response.actions.length > 0) {
    text += '**Moves for Leaders:**\n\n';
    response.actions.forEach(action => {
      text += `• ${action}\n`;
    });
    text += '\n';
  }

  // SOURCES
  if (response.signals && response.signals.length > 0) {
    text += '**Sources:**\n\n';
    response.signals.forEach((signal, index) => {
      if (signal.sourceUrl && signal.sourceUrl !== '#') {
        text += `[${index + 1}] ${signal.sourceName || signal.title}\n`;
      }
    });
  }

  return text.trim();
}
