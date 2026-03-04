/**
 * Perplexity API v2 Endpoints
 *
 * Four API modes:
 * 1. POST /perplexity/search - Sonar Chat Completions (sonar)
 * 2. POST /perplexity/research - Agentic Research (sonar-reasoning-pro)
 * 3. POST /perplexity/raw-search - Raw Search (ranked results for RAG)
 * 4. POST /perplexity/search-instant - Raw Search fast path for autocomplete (<500ms)
 */

import * as functions from 'firebase-functions';
import { sonarChatCompletion, agenticResearch, rawSearch, parseSearchResults } from './perplexityClient';

/**
 * Endpoint 1: Sonar Chat Completions
 *
 * Best for: Structured briefs with citations
 * Cost: $3 input / $15 output per million tokens + $6-14/1K search requests
 *
 * Usage:
 *   POST /perplexity/search
 *   Body: {
 *     query: string,
 *     context?: object,
 *     search_recency_filter?: 'day' | 'week' | 'month' | 'year'
 *   }
 */
export const perplexitySearch = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { query, context, search_recency_filter = 'week' } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Invalid request. Please provide a query string.' });
      return;
    }

    // Build system prompt based on context
    const systemPrompt = context?.systemPrompt || `You are a strategic intelligence analyst for C-suite marketing executives.
Provide direct, confident analysis with current data and specific examples.
Format your response with clear sections: SIGNALS, IMPLICATIONS, and ACTIONS.

CRITICAL: Every bullet point must be a complete, finished sentence. Never truncate or cut off content mid-sentence. Ensure each signal, implication, and action is fully articulated.`;

    const response = await sonarChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      search_recency_filter,
      temperature: 0.2,
      max_tokens: 2500,
    });

    // Parse search_results into structured format
    const parsedResults = parseSearchResults(response.search_results || []);

    res.status(200).json({
      content: response.content,
      search_results: parsedResults,
      model: response.model,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Error in perplexitySearch:', error);
    res.status(500).json({
      error: 'Unable to complete search at this time.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Endpoint 2: Agentic Research
 *
 * Best for: Multi-step research with web_search tools
 * Cost: $1 input / $5 output per million tokens + $3/1K search requests
 * Requires: stream: true (mandatory)
 *
 * Usage:
 *   POST /perplexity/research
 *   Body: {
 *     query: string,
 *     model?: string (default: 'sonar-reasoning-pro')
 *   }
 */
export const perplexityResearch = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { query, model } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Invalid request. Please provide a query string.' });
      return;
    }

    const response = await agenticResearch({
      query,
      model: model || 'sonar-reasoning-pro',
      timeout: 50000, // 50 second timeout for deep research
    });

    // Parse search_results
    const parsedResults = parseSearchResults(response.search_results || []);

    res.status(200).json({
      content: response.content,
      search_results: parsedResults,
      model: response.model,
      chunks: response.chunks,
    });

  } catch (error) {
    console.error('Error in perplexityResearch:', error);
    res.status(500).json({
      error: 'Unable to complete research at this time.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Endpoint 3: Raw Search
 *
 * Best for: Ranked results for custom RAG
 * Cost: $5/1K flat rate (no token costs)
 *
 * Usage:
 *   POST /perplexity/raw-search
 *   Body: {
 *     query: string,
 *     max_results?: number (default: 10),
 *     search_recency_filter?: 'day' | 'week' | 'month' | 'year'
 *   }
 */
export const perplexityRawSearch = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { query, max_results = 10, search_recency_filter = 'week' } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Invalid request. Please provide a query string.' });
      return;
    }

    const response = await rawSearch({
      query,
      max_results,
      search_recency_filter,
      timeout: 30000, // 30 second timeout for raw search
    });

    res.status(200).json({
      results: response.results,
      count: response.count,
      search_query: response.search_query,
    });

  } catch (error) {
    console.error('Error in perplexityRawSearch:', error);
    res.status(500).json({
      error: 'Unable to complete search at this time.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Endpoint 4: Instant Search (fast path for autocomplete/search dropdown)
 *
 * Uses rawSearch (Perplexity Search API) — ~358ms median vs 1.5s for chat completions
 *
 * Usage:
 *   POST /perplexity/search-instant
 *   Body: { query: string }
 *   Returns: { results: Array<{ title, url, snippet, date }>, query }
 */
export const perplexitySearchInstant = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query required.' });
      return;
    }

    const response = await rawSearch({
      query: query.trim(),
      search_recency_filter: 'day',
      max_results: 5,
      timeout: 8000,
    });

    const results = (response.results || []).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.snippet || '',
      date: r.date || '',
    }));

    res.status(200).json({ results, query: query.trim() });

  } catch (error) {
    console.error('Error in perplexitySearchInstant:', error);
    // Return empty results rather than error — instant search is non-critical
    res.status(200).json({ results: [], query: req.body?.query || '' });
  }
});
