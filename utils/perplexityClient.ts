/**
 * Perplexity Sonar API Client
 * MVP: Uses only sonar-fast model for quick intelligence responses
 */

import { ENDPOINTS } from '../config/api';

const PPLX_API_KEY = import.meta.env.VITE_PPLX_API_KEY;
const PPLX_MODEL_FAST = import.meta.env.VITE_PPLX_MODEL_FAST || 'sonar';

export type PlannerChatResponse = {
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  implications: string[]; // "What this means"
  actions: string[];      // "Suggested actions"
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
 * Fetch fast intelligence using Perplexity Sonar
 * Returns structured insights for C-suite marketing executives
 */
export async function fetchFastIntel(args: { query: string }): Promise<PlannerChatResponse> {
  const { query } = args;

  if (!PPLX_API_KEY) {
    throw new Error('Missing VITE_PPLX_API_KEY environment variable');
  }

  // Enhanced system prompt for executive intelligence
  const systemPrompt = `You are a strategic intelligence analyst for C-suite marketing executives (CMOs, VPs of Marketing, Brand Directors, Growth Leaders).

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

  try {
    const response = await fetch(ENDPOINTS.perplexityAPI, {
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
        temperature: 0.2, // Lower for more focused, factual responses
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

    // Parse the structured response
    return parsePerplexityResponse(content, citations);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch intelligence: ${error.message}`);
    }
    throw new Error('Failed to fetch intelligence: Unknown error');
  }
}

/**
 * Parse Perplexity response into structured PlannerChatResponse
 */
function parsePerplexityResponse(content: string, citations: string[]): PlannerChatResponse {
  const signals: PlannerChatResponse['signals'] = [];
  const implications: string[] = [];
  const actions: string[] = [];

  // Split content into sections
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
        sourceUrl: sourceUrl || '#', // Default to # if no URL
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
    // Extract bullet points from content as fallback signals
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

/**
 * Extract a section from markdown-formatted content
 */
function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}
