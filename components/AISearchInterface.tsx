import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, TrendingUp, ArrowRight, Copy, RotateCw
} from 'lucide-react';

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

export const AISearchInterface: React.FC<AISearchInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  initialQuery, 
  sourceType = 'Perplexity', 
  data 
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'assistant';
    content: string;
    metrics?: Array<{value: string, context: string}>;
    signals?: string[];
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    // Initialize conversation with first response
    if (data && conversationHistory.length === 0) {
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

  // Strip citation brackets for clean display
  const stripCitations = (text: string) => {
    return text.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
  };

  // Extract key metrics - minimal approach
  const extractMetrics = (text: string) => {
    const metrics: Array<{value: string, context: string}> = [];
    const percentPattern = /(\d{2,3}%)\s+([\w\s]{0,25})/gi;
    const matches = [...(text.matchAll(percentPattern) || [])].slice(0, 3);
    
    matches.forEach((match) => {
      if (match[1] && match[2]) {
        metrics.push({ 
          value: match[1], 
          context: match[2].trim().substring(0, 20)
        });
      }
    });
    
    return metrics;
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    
    setConversationHistory(prev => [
      ...prev,
      { type: 'user', content: followUpQuery }
    ]);
    
    setIsLoadingFollowUp(true);
    
    try {
      const resp = await fetch(
        'https://planners-backend-865025512785.us-central1.run.app/perplexity/search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: `${query}. Follow-up: ${followUpQuery}` 
          }),
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
        
        {/* Minimal header */}
        <div className="flex items-center justify-between px-lg py-md border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <span className="text-sm font-medium text-gray-900">Intelligence Brief</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-lg py-lg space-y-lg">
          
          {/* Conversation thread */}
          {conversationHistory.map((message, i) => (
            <div key={i} className="space-y-md">
              
              {/* User message */}
              {message.type === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-2xl text-right">
                    <div className="inline-block text-xs text-gray-400 mb-1">You</div>
                    <div className="bg-gray-50 rounded-lg px-md py-sm text-sm text-gray-900">
                      {message.content}
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI message */}
              {message.type === 'assistant' && (
                <div className="space-y-md">
                  
                  {/* Metrics - only show once */}
                  {message.metrics && message.metrics.length > 0 && i === 0 && (
                    <div className="flex gap-md">
                      {message.metrics.map((metric, idx) => (
                        <div key={idx} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-md py-md">
                          <div className="text-2xl font-semibold text-gray-900 mb-1">{metric.value}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">{metric.context}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Response text */}
                  <div className="max-w-full">
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      AI response
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    {i === conversationHistory.length - 1 && (
                      <div className="flex items-center gap-2 mt-md">
                        <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                          <RotateCw className="w-3 h-3" />
                          Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Signals - only show once */}
                  {message.signals && message.signals.length > 0 && i === 0 && (
                    <div className="space-y-xs mt-md">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-sm">Key Signals</div>
                      {message.signals.map((signal, idx) => (
                        <div key={idx} className="flex gap-sm items-start py-sm border-b border-gray-100 last:border-0">
                          <span className="text-xs text-gray-400 font-mono flex-shrink-0 w-4">{idx + 1}</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{signal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Loading */}
          {isLoadingFollowUp && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
              Processing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Source attribution - minimal */}
        {data?.sources && conversationHistory.length <= 1 && (
          <div className="px-lg pb-md">
            <div className="flex gap-xs">
              {data.sources.map((source, i) => (
                <span key={i} className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleFollowUp} className="border-t border-gray-100 px-lg py-md bg-white">
          <div className="flex items-end gap-sm">
            <input
              type="text"
              value={followUpQuery}
              onChange={(e) => setFollowUpQuery(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isLoadingFollowUp}
              className="flex-1 bg-white border border-gray-200 rounded-lg px-md py-sm text-sm focus:outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
            />
            <button 
              type="submit"
              disabled={isLoadingFollowUp || !followUpQuery.trim()}
              className="p-sm bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-xs">
            Press Enter to send
          </div>
        </form>
      </div>
    </div>
  );
};

