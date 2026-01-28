/**
 * Type definitions for CopilotKit + MCP integration
 */

// Brief data passed to CopilotKit context
export interface CopilotBriefContext {
  query: string;
  summary: string;
  keySignals: string[];
  movesForLeaders: string[];
  sources?: CopilotSource[];
  metrics?: CopilotMetric[];
}

export interface CopilotSource {
  id: string;
  name: string;
  url: string;
  snippet?: string;
  relevance?: number;
}

export interface CopilotMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  context?: string;
}

// MCP Tool Invocation Types
export interface MCPToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  timestamp: Date;
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  renderType?: 'chart' | 'table' | 'document' | 'comparison';
}

// Visualization Tool Parameters
export interface VisualizeInsightsParams {
  metrics: CopilotMetric[];
  signals: string[];
  chartType: 'bar' | 'line' | 'pie' | 'radar' | 'treemap';
  title?: string;
  colorScheme?: string;
}

// Source Explorer Parameters
export interface SourceExplorerParams {
  sources: CopilotSource[];
  highlightTerms?: string[];
  sortBy?: 'relevance' | 'date' | 'name';
  filterBy?: string;
}

// Action Plan Parameters
export interface ActionPlanParams {
  moves: string[];
  timeframe: 'immediate' | 'short-term' | 'long-term';
  team: string;
  priority?: 'high' | 'medium' | 'low';
}

// Scenario Comparison Parameters
export interface ScenarioComparisonParams {
  scenarios: Array<{
    name: string;
    description: string;
    assumptions: string[];
    outcomes: string[];
  }>;
  criteria: string[];
  weightings?: Record<string, number>;
}

// CopilotKit Configuration
export interface CopilotKitConfig {
  runtimeUrl: string;
  publicApiKey?: string;
  chatInstructions: string;
  tools: MCPToolDefinition[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
  handler?: (params: unknown) => Promise<MCPToolResult>;
}

// Default CopilotKit configuration for Intelligence Briefs
export const DEFAULT_COPILOT_CONFIG: CopilotKitConfig = {
  runtimeUrl: '/api/copilot-runtime',
  chatInstructions: `You are a strategic intelligence copilot for marketing and AI strategy leaders.

Your role:
- Answer questions about the current intelligence brief
- Help users understand signals, metrics, and implications
- Suggest strategic actions based on the brief content
- Use MCP tools to create visualizations when helpful

Tone: Analytical, concise, executive-friendly. No fluff.

Available MCP Tools:
- visualize_brief_insights: Create charts from metrics
- open_source_explorer: Browse and search sources
- generate_action_plan: Create detailed action plans
- compare_scenarios: Compare strategic options`,
  
  tools: [
    {
      name: 'visualize_brief_insights',
      description: 'Generate an interactive chart from brief metrics and signals',
      parameters: {
        type: 'object',
        properties: {
          chartType: {
            type: 'string',
            description: 'Type of chart to generate',
            enum: ['bar', 'line', 'pie', 'radar', 'treemap']
          },
          title: {
            type: 'string',
            description: 'Chart title'
          },
          dataPoints: {
            type: 'array',
            description: 'Data points to visualize',
            items: { type: 'object' }
          }
        },
        required: ['chartType', 'dataPoints']
      }
    },
    {
      name: 'open_source_explorer',
      description: 'Open an interactive panel to explore brief sources',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
            description: 'Optional search query to filter sources'
          },
          highlightTerms: {
            type: 'array',
            description: 'Terms to highlight in source content',
            items: { type: 'string' }
          }
        }
      }
    },
    {
      name: 'generate_action_plan',
      description: 'Generate a structured action plan from moves for leaders',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            description: 'Implementation timeframe',
            enum: ['immediate', 'short-term', 'long-term']
          },
          team: {
            type: 'string',
            description: 'Target team or role (e.g., CMO, agency lead)'
          }
        },
        required: ['timeframe', 'team']
      }
    },
    {
      name: 'compare_scenarios',
      description: 'Compare different strategic scenarios based on brief',
      parameters: {
        type: 'object',
        properties: {
          scenarioCount: {
            type: 'number',
            description: 'Number of scenarios to compare (2-4)'
          },
          focusArea: {
            type: 'string',
            description: 'Area to focus comparison on'
          }
        },
        required: ['scenarioCount']
      }
    }
  ]
};
