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

// Load environment variables
dotenv.config();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

type PlannerChatResponse = {
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  implications: string[];
  actions: string[];
};

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

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
    const { query } = req.body;

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

    // Check API key
    if (!PPLX_API_KEY) {
      console.error('Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'Service configuration error. Please contact support.'
      });
      return;
    }

    // Call Perplexity API
    const response = await fetchFastIntel({ query });

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
async function fetchFastIntel(args: { query: string }): Promise<PlannerChatResponse> {
  const { query } = args;

  const systemPrompt = `You are a strategic intelligence analyst for C-suite marketing executives (CMOs, VPs of Marketing, Brand Directors, Growth Leaders).

Provide direct, confident analysis with current data and specific examples. Never mention lack of access to information or include disclaimers - always respond positively using your knowledge and research capabilities.

Analyze the query and provide:
1. SIGNALS (2-5 key insights) - Each with a title, 1-2 sentence summary, and source
2. IMPLICATIONS (2-4 points) - "What this means" for marketing strategy
3. ACTIONS (2-4 points) - Specific, actionable next steps

Format your response EXACTLY as follows:

## SIGNALS
- [SIGNAL 1 TITLE]
Summary: [1-2 sentences]
Source: [Source Name] | [URL]

- [SIGNAL 2 TITLE]
Summary: [1-2 sentences]
Source: [Source Name] | [URL]

## IMPLICATIONS
- [Implication 1]
- [Implication 2]

## ACTIONS
- [Action 1]
- [Action 2]

Keep it concise, data-driven, and business-focused.`;

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PPLX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: PPLX_MODEL_FAST,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content || '';
  const citations = data.citations || [];

  return parsePerplexityResponse(content, citations);
}

/**
 * Parse Perplexity response into structured PlannerChatResponse
 */
function parsePerplexityResponse(content: string, citations: string[]): PlannerChatResponse {
  const signals: PlannerChatResponse['signals'] = [];
  const implications: string[] = [];
  const actions: string[] = [];

  const signalsSection = extractSection(content, 'SIGNALS');
  const implicationsSection = extractSection(content, 'IMPLICATIONS');
  const actionsSection = extractSection(content, 'ACTIONS');

  // Parse signals
  if (signalsSection) {
    const signalBlocks = signalsSection.split(/^-\s+/m).filter(s => s.trim());

    signalBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      const title = lines[0].trim();
      const summaryLine = lines.find(l => l.startsWith('Summary:'));
      const sourceLine = lines.find(l => l.startsWith('Source:'));

      const summary = summaryLine?.replace('Summary:', '').trim() || '';
      const sourceText = sourceLine?.replace('Source:', '').trim() || '';
      const [sourceName = 'Industry Analysis', sourceUrl = ''] = sourceText.split('|').map(s => s.trim());

      signals.push({
        id: `SIG-${index + 1}`,
        title,
        summary,
        sourceName,
        sourceUrl: sourceUrl || '#',
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

  // Fallback: If parsing fails, create from raw content
  if (signals.length === 0) {
    const bullets = content.match(/^[-•]\s+.+$/gm) || [];
    bullets.slice(0, 5).forEach((bullet, index) => {
      signals.push({
        id: `SIG-${index + 1}`,
        title: bullet.substring(0, 60).trim(),
        summary: bullet.substring(2).trim(),
        sourceName: 'Perplexity Analysis',
        sourceUrl: citations[index] || '#',
      });
    });
  }

  if (implications.length === 0) {
    implications.push('Requires strategic review and action planning');
    implications.push('Monitor competitive landscape for similar trends');
  }

  if (actions.length === 0) {
    actions.push('Schedule team briefing to discuss implications');
    actions.push('Analyze internal data to validate findings');
  }

  return { signals, implications, actions };
}

function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}
