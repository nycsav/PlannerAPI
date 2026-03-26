/**
 * Centralized API Configuration
 *
 * This file provides a single source of truth for all backend API endpoints.
 * This allows easy switching between environments without modifying individual components.
 *
 * Usage:
 *   import { ENDPOINTS } from '../config/api';
 *   fetch(ENDPOINTS.chatIntel, { ... })
 */

/**
 * Backend service URLs
 * Can be overridden with environment variables for multi-environment support
 */
export const API_CONFIG = {
  // Google Cloud Run backend (primary service — plannerapi-prod project)
  cloudRun:
    import.meta.env.VITE_CLOUD_RUN_URL ||
    'https://planners-backend-9036060950.us-central1.run.app',

  // Firebase Cloud Functions (secondary service)
  cloudFunctions:
    import.meta.env.VITE_CLOUD_FUNCTIONS_URL ||
    'https://us-central1-plannerapi-prod.cloudfunctions.net',

  // Perplexity API (third-party)
  perplexity: {
    baseUrl: 'https://api.perplexity.ai',
    model: import.meta.env.VITE_PPLX_MODEL_FAST || 'sonar',
  },

  // Request timeout (milliseconds)
  timeout: 30000,
} as const;

/**
 * Centralized endpoint definitions
 *
 * These endpoints are used throughout the application for API calls.
 * Each endpoint maps to a specific backend service.
 */
export const ENDPOINTS = {
  /**
   * Chat Intelligence: Streaming intelligence generation
   * Used by: App.tsx, ConversationalBrief.tsx, ExecutiveStrategyChat.tsx
   * Method: POST
   * Body: { query: string, audience: string }
   * 
   * Using Cloud Functions endpoint for reliable source extraction
   */
  chatIntel: `${API_CONFIG.cloudFunctions}/chatIntel`,

  /**
   * Trending Topics: Fetch trending topics for a given audience
   * Used by: HeroSearch.tsx
   * Method: GET
   * Query: ?audience=CMO&limit=6
   */
  trendingTopics: `${API_CONFIG.cloudRun}/trending/topics`,

  /**
   * Briefings: Fetch latest briefings
   * Used by: App.tsx
   * Method: GET
   * Query: ?audience=CMO&limit=6
   */
  briefingsLatest: `${API_CONFIG.cloudRun}/briefings/latest`,

  /**
   * Perplexity Search: Perform a Perplexity search (full sonar-pro brief)
   * Used by: TestNewHomepage.tsx (on card open), AISearchInterface.tsx
   * Method: POST
   * Body: { query: string }
   */
  perplexitySearch: `${API_CONFIG.cloudRun}/perplexity/search`,

  /**
   * Perplexity Search Instant: Standalone Search API for fast results list
   * Used by: HeroSection search bar (before full sonar-pro is requested)
   * Method: POST
   * Body: { query: string }
   * Returns: { results: Array<{ title, url, snippet, date }>, query }
   */
  perplexitySearchInstant: `${API_CONFIG.cloudFunctions}/perplexitySearchInstant`,

  /**
   * Chat Simple: Simple follow-up question processing
   * Used by: IntelligenceModal.tsx
   * Method: POST
   * Body: { query: string }
   */
  chatSimple: `${API_CONFIG.cloudFunctions}/chatSimple`,

  /**
   * Perplexity API: External third-party API
   * Used by: utils/perplexityClient.ts
   */
  perplexityAPI: `${API_CONFIG.perplexity.baseUrl}/chat/completions`,

  /**
   * CopilotKit Runtime: AI copilot for intelligence briefs
   * Used by: IntelligenceModal.tsx, CopilotBriefWrapper.tsx
   * Method: POST
   * Body: CopilotKit protocol messages
   */
  copilotRuntime: `${API_CONFIG.cloudFunctions}/copilotRuntime`,

  /**
   * Chat Intel (Cloud Run): Structured intelligence brief via /chat-intel on Cloud Run
   * Used by: TestNewHomepage.tsx hero search bar (legacy)
   * Method: POST
   * Body: { query: string, audience?: string }
   * Returns: { signals: IntelligenceSignal[], implications: string[], actions: string[] }
   */
  chatIntelSearch: `${API_CONFIG.cloudRun}/chat-intel`,

  /**
   * Chat Intel Stream: SSE streaming version of chatIntel (Firebase Function)
   * Used by: TestNewHomepage.tsx hero search bar (replaces chatIntelSearch)
   * Method: POST
   * Body: { query: string }
   * Response: text/event-stream
   *   data: {"type":"chunk","content":"..."}  (repeated per token)
   *   data: {"type":"done","signals":[...],"implications":[...],"actions":[...]}
   */
  chatIntelStream: `${API_CONFIG.cloudFunctions}/chatIntelStream`,

  /**
   * CopilotKit Health: Health check endpoint
   * Used by: diagnostics
   * Method: GET
   */
  copilotHealth: `${API_CONFIG.cloudFunctions}/copilotHealth`,

  /**
   * Signal Scores Dashboard: Top 5 marketing signals with 7-day sparkline data
   * Used by: SignalDashboard component
   * Method: POST
   * Body: {}
   * Returns: { signals: SignalScore[], generated_at: string }
   */
  getSignalScores: `${API_CONFIG.cloudFunctions}/getSignalScores`,

  /**
   * Source Reports: Latest Notion research entries for a given source
   * Used by: SourceLogosMinimal (popover on source pill click)
   * Method: POST
   * Body: { source: string }
   * Returns: { reports: NotionReport[], notionDbUrl: string }
   */
  getSourceReports: `${API_CONFIG.cloudFunctions}/getSourceReports`,

  /**
   * Signal Insight: Enriched modal data for a single brief
   * Used by: IntelligenceModal (background enrichment)
   * Method: POST
   * Body: { title: string, snippet: string }
   * Returns: { signal_score, signal_type, why_it_matters, affected_brands, data_point, visual_metaphor, linkedin_hook }
   */
  getSignalInsight: `${API_CONFIG.cloudFunctions}/getSignalInsight`,

  /**
   * Deep Research: Comprehensive multi-step research via Perplexity Agent API
   * Uses deep-research preset (10 reasoning steps, web_search + fetch_url tools)
   * Used by: IntelligenceModal (Deep Research mode), future standalone page
   * Method: POST
   * Body: { query: string, preset?: 'fast-search'|'pro-search'|'deep-research'|'advanced-deep-research', previous_response_id?: string }
   * Returns: { executiveSummary, deepSignals[], competitiveLandscape, implications[], actionPlan[], citations[], response_id, usage }
   */
  deepResearch: `${API_CONFIG.cloudFunctions}/deepResearch`,

  /**
   * Deep Research Stream: SSE streaming variant of deepResearch
   * Used by: IntelligenceModal (Deep Research mode with live streaming)
   * Method: POST
   * Body: { query: string, preset?: string }
   * Response: text/event-stream
   *   data: {"type":"status","message":"Starting deep-research..."}\n\n
   *   data: {"type":"chunk","content":"..."}\n\n  (repeated)
   *   data: {"type":"done","executiveSummary":"...","deepSignals":[...],...}\n\n
   */
  deepResearchStream: `${API_CONFIG.cloudFunctions}/deepResearchStream`,

  /**
   * Chat Thread Create: Create or append to a conversation thread
   * Used by: IntelligenceModal (conversation persistence)
   * Method: POST
   * Body: { threadId?: string, cardId?: string, topic: string, message: { role, content } }
   * Returns: { threadId: string, messageCount: number }
   */
  chatThreadCreate: `${API_CONFIG.cloudFunctions}/chatThreadCreate`,

  /**
   * Chat Thread Get: Retrieve a conversation thread
   * Used by: IntelligenceModal (restore thread on reopen)
   * Method: POST
   * Body: { threadId: string }
   * Returns: ChatThread object
   */
  chatThreadGet: `${API_CONFIG.cloudFunctions}/chatThreadGet`,
} as const;

/**
 * Request configuration
 * Use this for consistent fetch options across the app
 */
export const REQUEST_CONFIG = {
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * Helper function to create a fetch with timeout
 * Usage:
 *   const response = await fetchWithTimeout(ENDPOINTS.chatIntel, { ... })
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms to ${url}`);
    }
    throw error;
  }
}
