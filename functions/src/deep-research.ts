/**
 * Firebase Cloud Functions: Deep Research via Perplexity Agent API
 *
 * Uses the new Perplexity Agent API (/v1/agent) with multi-step
 * reasoning presets for comprehensive competitive intelligence.
 *
 * Endpoints:
 *   POST /deepResearch       — non-streaming, returns full structured payload
 *   POST /deepResearchStream — SSE streaming with real-time token delivery
 *
 * Deploy: firebase deploy --only functions:deepResearch,functions:deepResearchStream
 */

import * as functions from 'firebase-functions';
import * as dotenv from 'dotenv';
import { agentApiCall, agentApiStream, parseSearchResults } from './perplexityClient';
import { handlePreflight, setCorsHeaders } from './utils/cors';

dotenv.config();

type AgentPreset = 'fast-search' | 'pro-search' | 'deep-research' | 'advanced-deep-research';

const DEEP_RESEARCH_INSTRUCTIONS = `You are a senior strategic intelligence analyst producing comprehensive research briefs for CMOs and senior marketing leaders at $50M-$500M revenue companies.

Your research must be:
1. Multi-source: Synthesize findings from at least 5 distinct sources
2. Quantitative: Every claim backed by specific numbers, percentages, or dollar amounts
3. Actionable: Every section ends with a concrete "next move" for marketing leaders
4. Current: Prioritize developments from the past 7 days

Format your response EXACTLY as follows:

## EXECUTIVE SUMMARY
[3-4 paragraphs, 300-400 words. Lead with the single most important finding. Provide market context with 4-5 supporting data points from named sources. State concrete strategic implications for Q2 2026 budgets and roadmaps.]

## DEEP SIGNALS
[For each signal (provide 5-7):]
### [Signal Title — must include a specific number or company name]
**Evidence:** [3-5 sentences with specific data points, named companies, dollar figures]
**Sources:** [List 2-3 specific sources with publication dates]
**Momentum:** [Rising/Stable/Falling] — [1 sentence explaining trajectory]
**Impact Score:** [1-10] — [1 sentence on why this score]
**Your Move:** [1-2 specific, time-bounded actions for a CMO]

## COMPETITIVE LANDSCAPE
[2-3 paragraphs analyzing competitive dynamics. Name specific companies, market share shifts, strategic moves. Include at least 3 data points.]

## IMPLICATIONS
- [5-6 strategic implications, each a complete sentence with specific numbers]

## 30-DAY ACTION PLAN
1. **Week 1:** [Specific action with metric to track]
2. **Week 2:** [Specific action with metric to track]
3. **Week 3:** [Specific action with metric to track]
4. **Week 4:** [Specific action with metric to track]

ABSOLUTE RULES:
1. Every signal MUST have specific numbers, companies, and dates
2. NEVER use vague language: "consider evaluating", "monitor trends", "schedule a briefing"
3. NEVER truncate mid-sentence
4. Use real company names and specific dollar/percentage figures
5. Cite sources by name (McKinsey, Gartner, Forrester, etc.) when available`;

/**
 * Parse Agent API deep research response into structured format
 */
function parseDeepResearchResponse(content: string, searchResults: any[]) {
  const sections: Record<string, string | null> = {};

  for (const name of ['EXECUTIVE SUMMARY', 'DEEP SIGNALS', 'COMPETITIVE LANDSCAPE', 'IMPLICATIONS', '30-DAY ACTION PLAN']) {
    const regex = new RegExp(`## ${name}\\s*([\\s\\S]*?)(?=## [A-Z]|$)`, 'i');
    const match = content.match(regex);
    sections[name] = match ? match[1].trim() : null;
  }

  // Parse deep signals
  const deepSignals: Array<{
    title: string;
    evidence: string;
    sources: string;
    momentum: string;
    impact_score: number;
    your_move: string;
  }> = [];

  if (sections['DEEP SIGNALS']) {
    const signalBlocks = sections['DEEP SIGNALS'].split(/^###\s+/m).filter(s => s.trim());

    for (const block of signalBlocks) {
      const lines = block.split('\n');
      const title = lines[0]?.trim() || '';
      if (!title) continue;

      const extract = (prefix: string): string => {
        const line = lines.find(l => l.toLowerCase().includes(prefix.toLowerCase()));
        return line?.replace(new RegExp(`^\\*\\*${prefix}:?\\*\\*\\s*`, 'i'), '').trim() || '';
      };

      const scoreMatch = extract('Impact Score').match(/(\d+)/);

      deepSignals.push({
        title,
        evidence: extract('Evidence'),
        sources: extract('Sources'),
        momentum: extract('Momentum'),
        impact_score: scoreMatch ? parseInt(scoreMatch[1], 10) : 5,
        your_move: extract('Your Move'),
      });
    }
  }

  // Parse implications
  const implications: string[] = [];
  if (sections['IMPLICATIONS']) {
    const implLines = sections['IMPLICATIONS']
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().replace(/^-\s*/, ''));
    implications.push(...implLines);
  }

  // Parse action plan
  const actionPlan: Array<{ week: string; action: string }> = [];
  if (sections['30-DAY ACTION PLAN']) {
    const planLines = sections['30-DAY ACTION PLAN']
      .split('\n')
      .filter(l => l.trim().match(/^\d+\./));

    for (const line of planLines) {
      const weekMatch = line.match(/\*\*(Week \d+):\*\*\s*(.*)/i);
      if (weekMatch) {
        actionPlan.push({ week: weekMatch[1], action: weekMatch[2].trim() });
      } else {
        actionPlan.push({ week: '', action: line.replace(/^\d+\.\s*/, '').trim() });
      }
    }
  }

  // Parse search results into citations
  const citations = parseSearchResults(searchResults);

  return {
    executiveSummary: sections['EXECUTIVE SUMMARY'] || '',
    deepSignals,
    competitiveLandscape: sections['COMPETITIVE LANDSCAPE'] || '',
    implications,
    actionPlan,
    citations,
    rawContent: content,
  };
}

/**
 * Non-streaming deep research endpoint
 *
 * POST /deepResearch
 * Body: {
 *   query: string,
 *   preset?: 'fast-search' | 'pro-search' | 'deep-research' | 'advanced-deep-research',
 *   previous_response_id?: string
 * }
 */
export const deepResearch = functions.runWith({ timeoutSeconds: 300, memory: '512MB' }).https.onRequest(async (req, res) => {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      const {
        query,
        preset = 'deep-research',
        previous_response_id,
      } = req.body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        res.status(400).json({ error: 'Query required.' });
        return;
      }

      const validPresets: AgentPreset[] = ['fast-search', 'pro-search', 'deep-research', 'advanced-deep-research'];
      const selectedPreset: AgentPreset = validPresets.includes(preset) ? preset : 'deep-research';

      // Configure tools with domain filtering for high-quality sources
      const tools: any[] = [
        {
          type: 'web_search' as const,
          search_recency_filter: 'week' as const,
          max_tokens_per_page: 4000,
        },
        { type: 'fetch_url' as const },
      ];

      const response = await agentApiCall({
        input: query.trim(),
        preset: selectedPreset,
        instructions: DEEP_RESEARCH_INSTRUCTIONS,
        tools,
        temperature: 0.2,
        max_output_tokens: 10000,
        previous_response_id,
        timeout: 180000, // 3 min for deep research
      });

      const parsed = parseDeepResearchResponse(
        response.output_text,
        response.search_results
      );

      res.status(200).json({
        ...parsed,
        response_id: response.id,
        preset: selectedPreset,
        usage: response.usage,
        status: response.status,
      });
    } catch (error) {
      console.error('Error in deepResearch:', error);
      res.status(500).json({
        error: 'Unable to complete deep research at this time.',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
});

/**
 * SSE streaming deep research endpoint
 *
 * POST /deepResearchStream
 * Body: {
 *   query: string,
 *   preset?: 'fast-search' | 'pro-search' | 'deep-research' | 'advanced-deep-research'
 * }
 * Response: text/event-stream
 *   data: {"type":"chunk","content":"..."}\n\n
 *   data: {"type":"done","executiveSummary":"...","deepSignals":[...],...}\n\n
 */
export const deepResearchStream = functions.runWith({ timeoutSeconds: 300, memory: '512MB' }).https.onRequest(async (req, res) => {
    setCorsHeaders(res, 'POST, OPTIONS', 'Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const { query, preset = 'deep-research' } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query required.' });
      return;
    }

    const validPresets: AgentPreset[] = ['fast-search', 'pro-search', 'deep-research', 'advanced-deep-research'];
    const selectedPreset: AgentPreset = validPresets.includes(preset) ? preset : 'deep-research';

    // Set SSE headers
    res.set('Content-Type', 'text/event-stream');
    res.set('Cache-Control', 'no-cache');
    res.set('X-Accel-Buffering', 'no');
    res.status(200);

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Send initial status event
      sendEvent({ type: 'status', message: `Starting ${selectedPreset} research...`, preset: selectedPreset });

      const pplxResponse = await agentApiStream({
        input: query.trim(),
        preset: selectedPreset,
        instructions: DEEP_RESEARCH_INSTRUCTIONS,
        tools: [
          {
            type: 'web_search' as const,
            search_recency_filter: 'week' as const,
            max_tokens_per_page: 4000,
          },
          { type: 'fetch_url' as const },
        ],
        temperature: 0.2,
        max_output_tokens: 10000,
      });

      let fullContent = '';
      const reader = (pplxResponse.body as any).getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush remaining buffer
          if (buffer.trim()) {
            const remaining = buffer.trim();
            if (remaining.startsWith('data: ') && remaining.slice(6).trim() !== '[DONE]') {
              try {
                const parsed = JSON.parse(remaining.slice(6).trim());
                const delta = parsed.delta || '';
                if (delta && parsed.type === 'response.output_text.delta') {
                  fullContent += delta;
                  sendEvent({ type: 'chunk', content: delta });
                }
              } catch { /* ignore parse errors */ }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);

            // Handle Agent API SSE event types
            if (parsed.type === 'response.output_text.delta') {
              const delta = parsed.delta || '';
              if (delta) {
                fullContent += delta;
                sendEvent({ type: 'chunk', content: delta });
              }
            } else if (parsed.type === 'response.completed') {
              // Final event — extract usage
              sendEvent({ type: 'status', message: 'Research complete. Structuring results...' });
            }
          } catch { /* ignore chunk parse errors */ }
        }
      }

      // Parse accumulated content into structured payload
      const structured = parseDeepResearchResponse(fullContent, []);
      sendEvent({
        type: 'done',
        ...structured,
        preset: selectedPreset,
      });

    } catch (error) {
      console.error('Error in deepResearchStream:', error);
      sendEvent({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      res.end();
    }
});
