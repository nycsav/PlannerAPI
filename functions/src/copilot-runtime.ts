/**
 * CopilotKit Runtime - Firebase Cloud Function
 * 
 * Handles CopilotKit AI interactions for Intelligence Briefs
 * Supports both OpenAI and OpenRouter (OpenAI-compatible API)
 * 
 * Configuration:
 * - For OpenAI: Set OPENAI_API_KEY
 * - For OpenRouter: Set OPENROUTER_API_KEY (uses OpenRouter by default if set)
 */

import * as functions from 'firebase-functions';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';

// Determine which provider to use (OpenRouter preferred if available)
const useOpenRouter = !!(process.env.OPENROUTER_API_KEY || functions.config().openrouter?.api_key);

// Initialize OpenAI-compatible client
const openai = new OpenAI({
  apiKey: useOpenRouter 
    ? (process.env.OPENROUTER_API_KEY || functions.config().openrouter?.api_key)
    : (process.env.OPENAI_API_KEY || functions.config().openai?.api_key),
  baseURL: useOpenRouter 
    ? 'https://openrouter.ai/api/v1'
    : undefined, // Uses default OpenAI URL
  defaultHeaders: useOpenRouter 
    ? {
        'HTTP-Referer': 'https://plannerapi.com',
        'X-Title': 'PlannerAPI Intelligence Brief',
      }
    : undefined,
});

// Model configuration - GPT-4o-mini for cost efficiency
// OpenRouter model: openai/gpt-4o-mini
// Direct OpenAI model: gpt-4o-mini
const MODEL = useOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

console.log(`[CopilotKit] Using ${useOpenRouter ? 'OpenRouter' : 'OpenAI'} with model: ${MODEL}`);

// Type definitions for action parameters
interface VisualizeParams {
  chartType: string;
  title?: string;
}

interface ActionPlanParams {
  timeframe: string;
  team: string;
}

// CopilotKit runtime configuration
const runtime = new CopilotRuntime({
  actions: [
    {
      name: 'visualize_brief_insights',
      description: 'Generate a visualization from the brief metrics and signals',
      parameters: [
        {
          name: 'chartType',
          type: 'string',
          description: 'Type of chart: bar, line, pie, radar',
          required: true,
        },
        {
          name: 'title',
          type: 'string',
          description: 'Title for the visualization',
          required: false,
        },
      ],
      handler: async (params: VisualizeParams) => {
        const { chartType, title } = params;
        // This triggers frontend visualization
        return {
          success: true,
          action: 'show_visualization',
          chartType,
          title: title || 'Brief Insights',
        };
      },
    },
    {
      name: 'generate_action_plan',
      description: 'Create a detailed action plan from the brief recommendations',
      parameters: [
        {
          name: 'timeframe',
          type: 'string',
          description: 'Timeframe: immediate, short-term, long-term',
          required: true,
        },
        {
          name: 'team',
          type: 'string',
          description: 'Target team or role',
          required: true,
        },
      ],
      handler: async (params: ActionPlanParams) => {
        const { timeframe, team } = params;
        return {
          success: true,
          action: 'show_action_plan',
          timeframe,
          team,
        };
      },
    },
  ],
});

// Create the service adapter with cost-efficient model
const serviceAdapter = new OpenAIAdapter({ 
  openai: openai as any,
  model: MODEL,
});

/**
 * CopilotKit Runtime HTTP Endpoint
 * 
 * POST /copilotRuntime
 * Body: CopilotKit protocol messages
 */
export const copilotRuntime = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
  })
  .https.onRequest(async (req, res) => {
    // CORS handling
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Use CopilotKit's Node HTTP endpoint handler
      const handler = copilotRuntimeNodeHttpEndpoint({
        endpoint: '/copilotRuntime',
        runtime,
        serviceAdapter,
      });

      // Create a mock Node.js request/response for the handler
      await handler(req as any, res as any);
    } catch (error) {
      console.error('[CopilotKit Runtime Error]', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

/**
 * Simple health check endpoint
 */
export const copilotHealth = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'ok', 
    service: 'copilot-runtime',
    timestamp: new Date().toISOString()
  });
});
