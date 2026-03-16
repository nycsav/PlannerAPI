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
      return_images: true,
      return_related_questions: true,
      timeout: 8000,
    });

    const results = (response.results || []).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.snippet || '',
      date: r.date || '',
      og_image: r.og_image || null,
      favicon: r.favicon || null,
      domain: r.domain || (() => { try { return new URL(r.url || '').hostname.replace('www.', ''); } catch { return ''; } })(),
    }));

    const related_questions: string[] = response.related_questions || [];

    res.status(200).json({ results, related_questions, query: query.trim() });

  } catch (error) {
    console.error('Error in perplexitySearchInstant:', error);
    // Return empty results rather than error — instant search is non-critical
    res.status(200).json({ results: [], related_questions: [], query: req.body?.query || '' });
  }
});

/**
 * Endpoint 5: Signal Scores Dashboard
 *
 * Uses sonar-reasoning-pro to return top 5 marketing signals with
 * signal_momentum, scores, delta, top_brand, and 7-day chart_data for sparklines.
 *
 * Usage:
 *   POST /perplexity/signal-scores
 *   Body: {} (no params required)
 *   Returns: { signals: SignalScore[], generated_at: string }
 */
export const getSignalScores = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed. Use POST.' }); return; }

  try {
    const pplxKey = process.env.PPLX_API_KEY;
    if (!pplxKey) throw new Error('PPLX_API_KEY not configured');

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `You are a senior marketing intelligence analyst. Analyze today's top 5 advertising, AI, and marketing signals relevant to CMOs and senior marketing executives. Return a JSON object with a "signals" array:
{
  "signals": [
    {
      "rank": number,
      "topic": string,
      "signal_momentum": "rising" | "stable" | "falling",
      "score_today": number (1-100, represents current signal strength),
      "score_yesterday": number (1-100),
      "delta": number (score_today minus score_yesterday, positive=rising, negative=falling),
      "top_brand": string (most-mentioned brand or company in this signal),
      "chart_data": [number] (exactly 7 numbers, 1-100, representing the signal score over the past 7 days, oldest first, today last)
    }
  ]
}
Score methodology: 100 = breaking industry-wide disruption, 75+ = major strategic shift, 50-74 = significant development, 25-49 = notable trend, 1-24 = emerging signal.
Return ONLY valid JSON. No commentary, no markdown, no <think> blocks.`;

    const raw = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${pplxKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Today is ${today}. Identify the top 5 marketing/AI signals CMOs need to know right now.` },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        search_recency_filter: 'day',
        response_format: { type: 'json_object' },
      }),
    });

    if (!raw.ok) throw new Error(`Perplexity error: ${raw.status}`);
    const json = await raw.json() as any;
    let content: string = json.choices?.[0]?.message?.content || '{}';

    // Strip <think> blocks that sonar-reasoning-pro sometimes emits
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let parsed: { signals: any[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      // If JSON parse fails, return empty
      parsed = { signals: [] };
    }

    res.status(200).json({
      signals: parsed.signals || [],
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in getSignalScores:', error);
    res.status(500).json({ error: 'Unable to fetch signal scores.', signals: [] });
  }
});

/**
 * Endpoint 6: Signal Insight (enriched modal data)
 *
 * Uses sonar-pro JSON mode to enrich a brief with structured insight fields.
 * Call this after the main chatIntel loads, to add signal_score, affected_brands, etc.
 *
 * Usage:
 *   POST /perplexity/signal-insight
 *   Body: { title: string, snippet: string }
 *   Returns: SignalInsight object
 */
export const getSignalInsight = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed. Use POST.' }); return; }

  try {
    const { title, snippet } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'title required.' });
      return;
    }

    const pplxKey = process.env.PPLX_API_KEY;
    if (!pplxKey) throw new Error('PPLX_API_KEY not configured');

    const systemPrompt = `You are a senior marketing intelligence analyst. For the given article title and snippet, return a JSON object with exactly these fields:
{
  "signal_score": number (1-10, importance to CMOs and CX leaders),
  "signal_type": "trend" | "disruption" | "opportunity" | "risk",
  "why_it_matters": string (2 sentences max, specific to marketing executives),
  "affected_brands": [string] (up to 4 named companies explicitly affected),
  "data_point": string (single most important stat or figure, e.g. "78% of CMOs..."),
  "visual_metaphor": string (one word: rocket | warning | dollar | ai | people | globe | chart | target),
  "linkedin_hook": string (compelling opening line for a LinkedIn post, max 20 words)
}
Return ONLY valid JSON.`;

    const raw = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${pplxKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze: ${title} — ${snippet || ''}` },
        ],
        temperature: 0.2,
        max_tokens: 400,
        search_recency_filter: 'week',
        response_format: { type: 'json_object' },
      }),
    });

    if (!raw.ok) throw new Error(`Perplexity error: ${raw.status}`);
    const json = await raw.json() as any;
    const content: string = json.choices?.[0]?.message?.content || '{}';

    let insight: object;
    try {
      insight = JSON.parse(content);
    } catch {
      insight = {};
    }

    res.status(200).json(insight);

  } catch (error) {
    console.error('Error in getSignalInsight:', error);
    res.status(500).json({ error: 'Unable to fetch signal insight.' });
  }
});
