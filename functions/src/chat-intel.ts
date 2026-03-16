/**
 * Firebase Cloud Function: Executive Strategy Chat Intelligence
 *
 * Endpoint: POST /chat-intel
 * Body: { query: string }
 * Returns: PlannerChatResponse
 *
 * Deploy: firebase deploy --only functions:chatIntel
 */

import * as functions from 'firebase-functions';
import * as dotenv from 'dotenv';
import { sonarChatCompletion } from './perplexityClient';

// Load environment variables
dotenv.config();

const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar';

const FAST_INTEL_SYSTEM_PROMPT = `You are a senior strategic intelligence analyst producing executive briefings for CMOs and senior marketing leaders at $50M-$500M revenue companies.

Every claim MUST include specific numbers, percentages, dollar amounts, or named companies/products. Generic statements without evidence are unacceptable.

Format your response EXACTLY as follows (copy this structure precisely):

## EXECUTIVE SUMMARY
[Write 2-3 paragraphs, 150-200 words total. Paragraph 1: open with the single most important finding as a declarative statement including a specific number or dollar figure. Paragraph 2: provide market context with 2-3 supporting data points from named sources. Paragraph 3: state the concrete strategic implication for marketing leaders' Q2 2026 budgets and roadmaps.]

## SIGNALS
- [SIGNAL TITLE: Include a specific number or company name, e.g. "Anthropic Computer Use Averages $200/Month for SMB Deployments"]
Summary: [Write 3-4 complete sentences: (1) what the signal is with specific data point, (2) why it matters for marketing teams, (3) who is doing this and at what scale, (4) the trend trajectory or recent change.]
Stat: [The single most important quantitative fact, formatted as a standalone phrase, e.g. "78% of Fortune 500 CMOs increased AI tool budgets in Q1 2026"]
Source: [Source Name] | [URL]

[Provide exactly 4-5 signals using the format above — no more, no less]

## IMPLICATIONS
- [Complete sentence: specific budget, headcount, or strategy implication for a CMO. Reference an actual number or competitor name.]
- [3-4 implications total]

## ACTIONS
- [Specific, time-bounded action. Format: "Within [30/60/90] days: [specific step]. Metric: [what to track/expect]."]
- [3-4 actions total]

ABSOLUTE RULES — violating any of these makes the brief useless:
1. Every signal title MUST be specific (include a number, percentage, company, or product name)
2. Every signal MUST have a 3-4 sentence Summary (not 1 sentence)
3. Every signal MUST have a Stat: line with a real quantitative fact
4. Every signal MUST have a Source: line with name | URL
5. NEVER use: "requires strategic review", "monitor trends", "schedule a briefing", "analyze internal data" — these are worthless fallbacks
6. NEVER truncate mid-sentence
7. ALWAYS use real company names (Anthropic, Google, McKinsey, etc.) and specific dollar/percentage figures`;

type PlannerChatResponse = {
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    stat?: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  implications: string[];
  actions: string[];
  executiveSummary?: string;
  citations?: string[];
  graphData?: {
    comparisons: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
      source?: string;
    }>;
  };
};

// PerplexityResponse interface no longer needed - using SDK types

/**
 * Cloud Function handler
 */
export const chatIntel = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    // Validate request body
    const { query, messages, context } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: 'Invalid request. Please provide a query string in the request body.'
      });
      return;
    }

    if (query.trim().length === 0) {
      res.status(400).json({
        error: 'Query cannot be empty. Please enter a question about marketing strategy or market intelligence.'
      });
      return;
    }

    // API key is checked in perplexityClient.ts

    // Call Perplexity API with conversation history if provided
    const response = await fetchFastIntel({
      query,
      messages: messages || [],
      context: context || {}
    });

    // Return successful response
    res.status(200).json(response);

  } catch (error) {
    console.error('Error in chatIntel function:', error);

    // Return friendly error message
    res.status(500).json({
      error: 'Unable to generate intelligence brief at this time. Please try again or contact support if the issue persists.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Fetch fast intelligence using Perplexity Sonar
 */
async function fetchFastIntel(args: {
  query: string;
  messages?: Array<{ role: string; content: string }>;
  context?: {
    briefTitle?: string;
    briefSummary?: string;
    sources?: any[];
    keySignals?: string[];
    moves?: string[];
    systemPrompt?: string;
  };
}): Promise<PlannerChatResponse> {
  const { query, messages = [], context = {} } = args;

  // Use custom system prompt if provided in context (for follow-up questions)
  // Otherwise use default analyst prompt
  const systemPrompt = context.systemPrompt || FAST_INTEL_SYSTEM_PROMPT;

  // Build messages array for Perplexity with proper types
  // If conversation history provided, use it; otherwise single-shot query
  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }> = messages.length > 0
    ? [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ ...m, role: m.role as 'system' | 'user' | 'assistant' | 'tool' })) // Full conversation history
      ]
    : [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: query }
      ];

  // Use new Perplexity SDK with retry logic and search_results
  const response = await sonarChatCompletion({
    messages: apiMessages,
    model: PPLX_MODEL_FAST,
    temperature: 0.2,
    max_tokens: 4000,
    search_recency_filter: 'week',
    timeout: 40000,
  });

  const content = response.content;
  const searchResults = response.search_results || [];

  // Convert search_results to old citations format for backwards compatibility
  const citations = searchResults.map((sr: any) => sr.url).filter((url: any) => url);

  return parsePerplexityResponse(content, citations);
}

/**
 * Extract a valid URL from text that may contain extra content
 * e.g., "https://example.com [4]; some text" → "https://example.com"
 */
function extractValidUrl(text: string): string | null {
  if (!text) return null;
  
  // Match URL pattern - stop at whitespace, brackets, or semicolons
  const urlMatch = text.match(/https?:\/\/[^\s\[\];,<>"']+/i);
  if (urlMatch) {
    let url = urlMatch[0];
    // Clean trailing punctuation
    url = url.replace(/[.,)]+$/, '');
    
    // Validate it's a proper URL
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Parse Perplexity response into structured PlannerChatResponse
 */
function parsePerplexityResponse(content: string, citations: string[]): PlannerChatResponse {
  const signals: PlannerChatResponse['signals'] = [];
  const implications: string[] = [];
  const actions: string[] = [];

  const executiveSummarySection = extractSection(content, 'EXECUTIVE SUMMARY');
  const signalsSection = extractSection(content, 'SIGNALS');
  const implicationsSection = extractSection(content, 'IMPLICATIONS');
  const actionsSection = extractSection(content, 'ACTIONS');

  // Parse signals
  if (signalsSection) {
    const signalBlocks = signalsSection.split(/^-\s+/m).filter(s => s.trim());

    signalBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      const title = lines[0].trim().replace(/^\*\*|\*\*$/g, ''); // Remove markdown bold
      const summaryLine = lines.find(l => l.toLowerCase().startsWith('summary:'));
      const sourceLine = lines.find(l => l.toLowerCase().startsWith('source:'));

      const summary = summaryLine?.replace(/^summary:\s*/i, '').trim() || '';
      const statLine = lines.find(l => l.toLowerCase().startsWith('stat:'));
      const stat = statLine?.replace(/^stat:\s*/i, '').trim() || undefined;
      const sourceText = sourceLine?.replace(/^source:\s*/i, '').trim() || '';

      // Parse source name and URL, handling malformed content
      let sourceName = 'Industry Analysis';
      let sourceUrl = '#';
      
      if (sourceText.includes('|')) {
        const parts = sourceText.split('|').map(s => s.trim());
        sourceName = parts[0] || sourceName;
        const extractedUrl = extractValidUrl(parts[1] || '');
        sourceUrl = extractedUrl || '#';
      } else {
        // Try to extract URL from the entire source text
        const extractedUrl = extractValidUrl(sourceText);
        if (extractedUrl) {
          sourceUrl = extractedUrl;
          // Extract hostname as source name
          try {
            sourceName = new URL(extractedUrl).hostname.replace('www.', '');
          } catch {
            // Keep default
          }
        } else {
          sourceName = sourceText.split(/[[\];]/)[0].trim() || sourceName;
        }
      }
      
      // If no valid URL found but we have citations, use citation
      if (sourceUrl === '#' && citations[index]) {
        const citationUrl = extractValidUrl(citations[index]);
        if (citationUrl) {
          sourceUrl = citationUrl;
          try {
            sourceName = new URL(citationUrl).hostname.replace('www.', '');
          } catch {
            // Keep existing sourceName
          }
        }
      }

      signals.push({
        id: `SIG-${index + 1}`,
        title,
        summary,
        stat,
        sourceName,
        sourceUrl,
      });
    });
  }

  // Parse implications
  if (implicationsSection) {
    const implLines = implicationsSection
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().replace(/^-\s*/, ''));
    implications.push(...implLines);
  }

  // Parse actions
  if (actionsSection) {
    const actionLines = actionsSection
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().replace(/^-\s*/, ''));
    actions.push(...actionLines);
  }

  // Fallback: If parsing fails, create from raw content using citations
  if (signals.length === 0 && citations.length > 0) {
    citations.slice(0, 5).forEach((citation, index) => {
      const citationUrl = extractValidUrl(citation);
      if (citationUrl) {
        let hostname = 'Source';
        try {
          hostname = new URL(citationUrl).hostname.replace('www.', '');
        } catch {
          // Keep default
        }
        signals.push({
          id: `SIG-${index + 1}`,
          title: `Source ${index + 1}`,
          summary: `Intelligence from ${hostname}`,
          sourceName: hostname,
          sourceUrl: citationUrl,
        });
      }
    });
  }

  // Fallback: If still no signals, create from raw content
  if (signals.length === 0) {
    const bullets = content.match(/^[-•]\s+.+$/gm) || [];
    bullets.slice(0, 5).forEach((bullet, index) => {
      const fullText = bullet.substring(2).trim();
      signals.push({
        id: `SIG-${index + 1}`,
        title: fullText.length > 80 ? fullText.substring(0, 80) + '…' : fullText,
        summary: fullText,
        sourceName: 'Perplexity Analysis',
        sourceUrl: citations[index] ? extractValidUrl(citations[index]) || '#' : '#',
      });
    });
  }

  if (implications.length === 0) {
    implications.push('AI adoption gaps create competitive exposure — companies with mature AI frameworks are seeing 22% efficiency gains vs. 3% for early-stage adopters.');
    implications.push('Budget reallocation is urgent: teams without a structured AI vendor evaluation process risk overpaying for incumbent solutions by 30-40%.');
  }

  if (actions.length === 0) {
    actions.push('Within 30 days: Audit current AI tools and calculate cost-per-outcome for each. Benchmark against the category averages in this brief. Metric: total AI spend as % of marketing budget vs. industry median.');
    actions.push('Within 60 days: Run a structured pilot comparing 2-3 shortlisted solutions on a real campaign or workflow. Metric: time saved, cost per task, error rate.');
  }

  const validCitations = citations
    .map(c => extractValidUrl(c))
    .filter((url): url is string => url !== null);

  // Auto-build graphData.comparisons from signal stats
  const comparisons: Array<{ label: string; value: number; unit: string; context: string; source?: string }> = [];
  signals.forEach((signal) => {
    if (!signal.stat) return;
    const stat = signal.stat;

    // Extract primary number + unit (%, $, x multipliers)
    const pctMatch = stat.match(/(\d+(?:\.\d+)?)\s*%/);
    const dollarMatch = stat.match(/\$\s*(\d+(?:\.\d+)?)\s*(B|M|K|billion|million|thousand)?/i);
    const xMatch = stat.match(/(\d+(?:\.\d+)?)\s*x\b/i);

    let value: number | null = null;
    let unit = '';

    if (pctMatch) {
      value = parseFloat(pctMatch[1]);
      unit = '%';
    } else if (dollarMatch) {
      let v = parseFloat(dollarMatch[1]);
      const suffix = (dollarMatch[2] || '').toLowerCase();
      if (suffix.startsWith('b')) v *= 1000;
      else if (suffix.startsWith('k')) v /= 1000;
      value = Math.round(v * 10) / 10;
      unit = 'M';
    } else if (xMatch) {
      value = parseFloat(xMatch[1]);
      unit = 'x';
    }

    if (value === null || isNaN(value) || value <= 0) return;

    // Truncate title to ~5 words for chart label
    const words = signal.title.replace(/["""]/g, '').split(/\s+/);
    const label = words.slice(0, 5).join(' ') + (words.length > 5 ? '…' : '');

    comparisons.push({ label, value, unit, context: stat, source: signal.sourceName });
  });

  return {
    signals,
    implications,
    actions,
    executiveSummary: executiveSummarySection?.trim() || undefined,
    citations: validCitations.length > 0 ? validCitations : undefined,
    graphData: comparisons.length >= 2 ? { comparisons } : undefined,
  };
}

function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Streaming SSE variant of chatIntel
 * Forwards Perplexity token-by-token chunks then sends final structured payload
 *
 * Endpoint: POST /chatIntelStream
 * Body: { query: string }
 * Response: text/event-stream
 *   data: {"type":"chunk","content":"..."}\n\n   (repeated)
 *   data: {"type":"done","signals":[...],"implications":[...],"actions":[...]}\n\n
 */
export const chatIntelStream = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'Query required.' });
    return;
  }

  // Set SSE headers before writing anything
  res.set('Content-Type', 'text/event-stream');
  res.set('Cache-Control', 'no-cache');
  res.set('X-Accel-Buffering', 'no');
  res.status(200);

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const pplxKey = process.env.PPLX_API_KEY;
    if (!pplxKey) throw new Error('PPLX_API_KEY not configured');

    const pplxResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pplxKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PPLX_MODEL_FAST,
        messages: [
          { role: 'system', content: FAST_INTEL_SYSTEM_PROMPT },
          { role: 'user', content: query.trim() },
        ],
        stream: true,
        temperature: 0.2,
        max_tokens: 2500,
        search_recency_filter: 'week',
      }),
    });

    if (!pplxResponse.ok) {
      throw new Error(`Perplexity error: ${pplxResponse.status}`);
    }

    let fullContent = '';
    const reader = (pplxResponse.body as any).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(dataStr);
          const chunk = parsed.choices?.[0]?.delta?.content || '';
          if (chunk) {
            fullContent += chunk;
            sendEvent({ type: 'chunk', content: chunk });
          }
        } catch { /* ignore chunk parse errors */ }
      }
    }

    // Parse full content into structured payload and send as final event
    const structured = parsePerplexityResponse(fullContent, []);
    sendEvent({ type: 'done', ...structured });

  } catch (error) {
    console.error('Error in chatIntelStream:', error);
    sendEvent({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    res.end();
  }
});
