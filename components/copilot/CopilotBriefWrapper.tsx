/**
 * CopilotKit Integration Wrapper for Intelligence Briefs
 * 
 * This component wraps the Intelligence Brief with CopilotKit capabilities,
 * enabling AI-powered interactions and MCP tool integrations.
 * 
 * SETUP REQUIRED:
 * 1. Install: npm install @copilotkit/react-core @copilotkit/react-ui
 * 2. Set up /api/copilot-runtime endpoint
 * 3. Configure MCP tools in backend
 * 
 * Until CopilotKit is installed, this exports placeholder components
 * that render children without CopilotKit functionality.
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, BarChart3, FileSearch, MessageSquare, X, Loader2 } from 'lucide-react';

// Types for Intelligence Brief data
export interface BriefData {
  query: string;
  summary: string;
  keySignals: string[];
  movesForLeaders: string[];
  sources?: Array<{
    sourceName: string;
    sourceUrl: string;
  }>;
}

// Types for MCP Tool definitions
export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

// Available MCP Tools for Intelligence Briefs
export const BRIEF_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'visualize_brief_insights',
    description: 'Generate interactive visualizations from brief metrics and signals',
    parameters: {
      metrics: 'Array of extracted metrics',
      signals: 'Key signals to visualize',
      chartType: 'bar | line | pie | radar'
    }
  },
  {
    name: 'open_source_explorer',
    description: 'Open an interactive source explorer with document previews',
    parameters: {
      sources: 'Array of source documents',
      highlightTerms: 'Terms to highlight in sources'
    }
  },
  {
    name: 'generate_action_plan',
    description: 'Generate a detailed action plan from moves for leaders',
    parameters: {
      moves: 'Array of strategic moves',
      timeframe: 'Implementation timeframe',
      team: 'Target team or role'
    }
  },
  {
    name: 'compare_scenarios',
    description: 'Compare different strategic scenarios based on brief insights',
    parameters: {
      scenarios: 'Array of scenario definitions',
      criteria: 'Comparison criteria'
    }
  }
];

// Props for CopilotKit wrapper
interface CopilotBriefWrapperProps {
  children: React.ReactNode;
  briefData: BriefData;
  runtimeUrl?: string;
  onToolInvoke?: (toolName: string, params: unknown) => void;
}

/**
 * Placeholder wrapper that works without CopilotKit installed.
 * Replace with actual CopilotKit integration when ready.
 */
export const CopilotBriefWrapper: React.FC<CopilotBriefWrapperProps> = ({
  children,
  briefData,
  onToolInvoke
}) => {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Placeholder tool invocation (will be replaced by CopilotKit)
  const handleToolInvoke = useCallback((toolName: string) => {
    if (onToolInvoke) {
      onToolInvoke(toolName, { briefData });
    } else {
      console.log(`[CopilotKit] Tool invoked: ${toolName}`, briefData);
    }
  }, [briefData, onToolInvoke]);

  // Placeholder chat submit (will be replaced by CopilotKit)
  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    // Placeholder response - will be replaced by CopilotKit runtime
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `[CopilotKit not configured] To enable AI responses, set up the /api/copilot-runtime endpoint. Your question: "${userMessage}"` 
      }]);
      setIsProcessing(false);
    }, 500);
  }, [chatInput, isProcessing]);

  return (
    <div className="relative">
      {/* Main content */}
      {children}

      {/* Copilot Action Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/60 dark:to-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            AI Actions
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
            Powered by CopilotKit
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <CopilotActionButton
            icon={<BarChart3 className="w-3.5 h-3.5" />}
            label="Visualize signals"
            onClick={() => handleToolInvoke('visualize_brief_insights')}
          />
          <CopilotActionButton
            icon={<FileSearch className="w-3.5 h-3.5" />}
            label="Explore sources"
            onClick={() => handleToolInvoke('open_source_explorer')}
          />
          <CopilotActionButton
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Ask about brief"
            onClick={() => setShowChat(true)}
            variant="primary"
          />
        </div>
      </div>

      {/* Copilot Chat Panel */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="font-semibold text-white">Brief Copilot</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Ask questions about this intelligence brief</p>
                  <p className="text-xs mt-1">e.g., "What's the key takeaway?" or "Summarize the risks"</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about this brief..."
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isProcessing}
                  className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Action Button Component
interface CopilotActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
  disabled?: boolean;
}

export const CopilotActionButton: React.FC<CopilotActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false
}) => {
  const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = variant === 'primary'
    ? "bg-violet-500 hover:bg-violet-600 text-white shadow-sm"
    : "bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * COPILOTKIT INTEGRATION TEMPLATE
 * 
 * When CopilotKit is installed, replace CopilotBriefWrapper with:
 * 
 * ```tsx
 * import { CopilotKit } from '@copilotkit/react-core';
 * import { CopilotChat, CopilotPopup } from '@copilotkit/react-ui';
 * import '@copilotkit/react-ui/styles.css';
 * 
 * export const CopilotBriefWrapper: React.FC<CopilotBriefWrapperProps> = ({
 *   children,
 *   briefData,
 *   runtimeUrl = '/api/copilot-runtime'
 * }) => {
 *   return (
 *     <CopilotKit runtimeUrl={runtimeUrl}>
 *       <CopilotContextProvider briefData={briefData}>
 *         {children}
 *         <CopilotActionBar />
 *         <CopilotPopup 
 *           instructions={`You are a strategic intelligence copilot. 
 *             Context: ${briefData.summary}
 *             Use MCP tools for visualizations.`}
 *           labels={{
 *             title: "Brief Copilot",
 *             initial: "Ask about this intelligence brief..."
 *           }}
 *         />
 *       </CopilotContextProvider>
 *     </CopilotKit>
 *   );
 * };
 * ```
 */

export default CopilotBriefWrapper;
