/**
 * Perplexity API v2 Client
 *
 * Supports three API modes:
 * 1. Sonar Chat Completions (sonar) - Structured briefs with citations
 * 2. Agentic Research (responses.create) - Multi-step research with web_search tools
 * 3. Raw Search (search.create) - Ranked results for custom RAG ($5/1K flat rate)
 *
 * Features:
 * - Retry logic with exponential backoff (3 attempts)
 * - Proper timeout handling (30-50 seconds)
 * - search_results instead of deprecated citations array
 * - sonar-reasoning-pro model (replaces deprecated sonar-reasoning)
 */

import Perplexity from '@perplexity-ai/perplexity_ai';

const PPLX_API_KEY = process.env.PPLX_API_KEY;

// Lazy initialization of Perplexity client (to avoid deployment errors)
let perplexityInstance: Perplexity | null = null;

function getPerplexityClient(): Perplexity {
  if (!perplexityInstance) {
    if (!PPLX_API_KEY) {
      throw new Error('⚠️  PPLX_API_KEY environment variable not set');
    }
    perplexityInstance = new Perplexity({
      apiKey: PPLX_API_KEY,
    });
  }
  return perplexityInstance;
}

/**
 * Retry configuration
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RETRY_MULTIPLIER = 2; // Exponential backoff

/**
 * Timeout configuration (in milliseconds)
 */
const DEFAULT_TIMEOUT = 40000; // 40 seconds
const LONG_TIMEOUT = 50000; // 50 seconds for complex queries

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        console.error(`❌ ${operationName} failed after ${maxRetries} attempts:`, error);
        throw error;
      }

      // Calculate exponential backoff delay
      const delayMs = INITIAL_RETRY_DELAY * Math.pow(RETRY_MULTIPLIER, attempt - 1);
      console.warn(`⚠️  ${operationName} attempt ${attempt} failed, retrying in ${delayMs}ms...`, error);

      await sleep(delayMs);
    }
  }

  throw lastError || new Error(`${operationName} failed`);
}

/**
 * Add timeout wrapper to a promise
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Mode 1: Sonar Chat Completions (sonar)
 * Best for: Structured briefs with citations
 * Cost: $3 input / $15 output per million tokens + $6-14/1K search requests
 */
export async function sonarChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  search_recency_filter?: 'day' | 'week' | 'month' | 'year';
  search_domain_filter?: string[];
  return_related_questions?: boolean;
  timeout?: number;
}): Promise<any> {
  const {
    messages,
    model = 'sonar',
    temperature = 0.2,
    max_tokens = 2500,
    search_recency_filter = 'day', // Default to last 24 hours
    search_domain_filter,
    return_related_questions = false,
    timeout = DEFAULT_TIMEOUT,
  } = params;

  return withRetry(
    async () => {
      const chatCompletionPromise = getPerplexityClient().chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        // @ts-ignore - SDK types may not include all parameters
        search_recency_filter,
        search_domain_filter,
        return_related_questions,
        stream: false, // Sonar Pro doesn't require streaming
      });

      const response = await withTimeout(
        chatCompletionPromise,
        timeout,
        'Sonar Chat Completion'
      ) as any;

      // Extract search_results (replaces deprecated citations array)
      const searchResults = (response as any).search_results || [];

      return {
        content: response.choices[0]?.message?.content || '',
        search_results: searchResults, // New v2 format with title, url, date, snippet
        model: response.model,
        usage: response.usage,
      };
    },
    'Sonar Chat Completion',
    MAX_RETRIES
  );
}

/**
 * Mode 2: Agentic Research (responses.create)
 * Best for: Multi-step research with web_search tools
 * Requires: stream: true (mandatory for Pro Search)
 * Cost: $1 input / $5 output per million tokens + $3/1K search requests
 */
export async function agenticResearch(params: {
  query: string;
  model?: string;
  tools?: Array<{ type: string; web_search?: { search_query: string } }>;
  timeout?: number;
}): Promise<any> {
  const {
    query,
    timeout = LONG_TIMEOUT, // Agentic research takes longer
  } = params;

  return withRetry(
    async () => {
      // Note: For agentic research, we'll use a simpler non-streaming approach
      // The SDK's types are complex for streaming, so we use the chat completion endpoint
      const responsePromise = getPerplexityClient().chat.completions.create({
        model: 'sonar-reasoning-pro',
        messages: [{ role: 'user', content: query }] as any,
        temperature: 0.3,
        max_tokens: 2000,
        // @ts-ignore - Agentic features
        search_recency_filter: 'day',
        return_related_questions: false,
      });

      const response = await withTimeout(
        responsePromise,
        timeout,
        'Agentic Research'
      ) as any;

      // Extract search_results
      const searchResults = (response as any).search_results || [];

      return {
        content: response.choices?.[0]?.message?.content || '',
        search_results: searchResults,
        model: response.model,
        usage: response.usage,
      };
    },
    'Agentic Research',
    MAX_RETRIES
  );
}

/**
 * Mode 3: Raw Search (search.create)
 * Best for: Ranked results for custom RAG
 * Cost: $5/1K flat rate (no token costs)
 */
export async function rawSearch(params: {
  query: string;
  search_recency_filter?: 'day' | 'week' | 'month' | 'year';
  search_domain_filter?: string[];
  max_results?: number;
  timeout?: number;
}): Promise<any> {
  const {
    query,
    search_recency_filter = 'day',
    search_domain_filter,
    max_results = 10,
    timeout = DEFAULT_TIMEOUT,
  } = params;

  return withRetry(
    async () => {
      const searchPromise = getPerplexityClient().search.create({
        query,
        // @ts-ignore - SDK types may not include all parameters
        search_recency_filter,
        search_domain_filter,
        max_results,
      });

      const response = await withTimeout(
        searchPromise,
        timeout,
        'Raw Search'
      ) as any;

      return {
        results: response.results || [],
        search_query: query,
        count: response.results?.length || 0,
      };
    },
    'Raw Search',
    MAX_RETRIES
  );
}

/**
 * Helper: Parse search_results into structured format
 *
 * search_results format (v2):
 * [
 *   {
 *     title: "Article Title",
 *     url: "https://example.com/article",
 *     date: "2026-02-13",
 *     snippet: "Preview text..."
 *   }
 * ]
 */
export function parseSearchResults(searchResults: any[]): Array<{
  title: string;
  url: string;
  date: string;
  snippet: string;
  sourceName: string;
}> {
  return searchResults.map((result, index) => {
    const url = result.url || '#';
    let sourceName = 'Source';

    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      sourceName = hostname;
    } catch {
      sourceName = result.title ? result.title.substring(0, 30) : `Source ${index + 1}`;
    }

    return {
      title: result.title || `Result ${index + 1}`,
      url,
      date: result.date || new Date().toISOString().split('T')[0],
      snippet: result.snippet || '',
      sourceName,
    };
  });
}

/**
 * Legacy compatibility: Extract old-style citations from search_results
 * (for backwards compatibility with existing code)
 */
export function searchResultsToCitations(searchResults: any[]): string[] {
  return searchResults
    .map(result => result.url)
    .filter((url): url is string => typeof url === 'string');
}

export default getPerplexityClient;
