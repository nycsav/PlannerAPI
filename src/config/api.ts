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
  // Google Cloud Run backend (primary service)
  cloudRun:
    import.meta.env.VITE_CLOUD_RUN_URL ||
    'https://planners-backend-865025512785.us-central1.run.app',

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
   */
  chatIntel: `${API_CONFIG.cloudRun}/chat-intel`,

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
   * Perplexity Search: Perform a Perplexity search
   * Used by: HeroSearch.tsx, AISearchInterface.tsx
   * Method: POST
   * Body: { query: string }
   */
  perplexitySearch: `${API_CONFIG.cloudRun}/perplexity/search`,

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
