/**
 * CopilotKit Integration Wrapper for Intelligence Briefs
 * 
 * This component wraps the Intelligence Brief with CopilotKit capabilities,
 * enabling AI-powered interactions and MCP tool integrations.
 * 
 * BACKEND REQUIRED:
 * - Firebase Cloud Function: copilotRuntime (functions/src/copilot-runtime.ts)
 * - Environment variable: OPENAI_API_KEY
 */

import React, { useState, useCallback } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { Sparkles, BarChart3, FileSearch, MessageSquare, X, Loader2 } from 'lucide-react';
import { ENDPOINTS } from '../../src/config/api';

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
 * CopilotKit-powered wrapper with real AI integration
 */
export const CopilotBriefWrapper: React.FC<CopilotBriefWrapperProps> = ({
  children,
  briefData,
  runtimeUrl,
  onToolInvoke
}) => {
  const [showChat, setShowChat] = useState(false);

  // Use provided runtime URL or default from config
  const copilotRuntimeUrl = runtimeUrl || ENDPOINTS.copilotRuntime;

  // Handle tool invocation
  const handleToolInvoke = useCallback((toolName: string) => {
    if (onToolInvoke) {
      onToolInvoke(toolName, { briefData });
    } else {
      console.log(`[CopilotKit] Tool invoked: ${toolName}`, briefData);
    }
  }, [briefData, onToolInvoke]);

  // Build context instructions from brief data
  const instructions = `You are a strategic intelligence copilot for marketing and AI strategy leaders.

CURRENT BRIEF CONTEXT:
Query: "${briefData.query}"

Summary: ${briefData.summary}

Key Signals:
${briefData.keySignals.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Moves for Leaders:
${briefData.movesForLeaders.map((m, i) => `${i + 1}. ${m}`).join('\n')}

YOUR ROLE:
- Answer questions about this specific intelligence brief
- Help users understand the strategic implications
- Provide actionable recommendations based on the brief
- Be concise, analytical, and executive-friendly
- Reference specific data points from the brief when relevant

TONE: Professional, direct, no fluff. Write as if advising a CMO.`;

  return (
    <CopilotKit runtimeUrl={copilotRuntimeUrl}>
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
              onClick={() => setShowChat(!showChat)}
              variant="primary"
            />
          </div>
        </div>

        {/* CopilotKit Chat Popup */}
        {showChat && (
          <div className="fixed bottom-4 right-4 z-50">
            <CopilotPopup
              instructions={instructions}
              labels={{
                title: "Brief Copilot",
                initial: "Ask me anything about this intelligence brief...",
                placeholder: "What would you like to know?",
              }}
              defaultOpen={true}
              clickOutsideToClose={false}
              onSetOpen={(open) => {
                if (!open) setShowChat(false);
              }}
            />
          </div>
        )}
      </div>
    </CopilotKit>
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

export default CopilotBriefWrapper;
