/**
 * Cloud Run Backend Integration: /chat-intel endpoint
 *
 * Add this to your existing planners-backend Cloud Run service
 *
 * Endpoint: POST /chat-intel
 * Body: { query: string }
 * Returns: PlannerChatResponse
 */

import express, { Request, Response } from 'express';

const router = express.Router();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

type IntelligenceFramework = {
  id: string;
  label: string;
  actions: string[];
};

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
  frameworks?: IntelligenceFramework[];
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
 * POST /chat-intel
 * Generate strategic intelligence brief
 */
/**
 * Audience-specific context for personalized responses
 */
const AUDIENCE_CONTEXT = {
  CMO: 'Focus on board-level implications, budget ROI, and strategic positioning.',
  'VP Marketing': 'Focus on operational execution, team resources, and vendor evaluation.',
  'Brand Director': 'Focus on brand equity, creative differentiation, and positioning.',
  'Growth Leader': 'Focus on acquisition channels, conversion metrics, and retention tactics.'
};

router.post('/chat-intel', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { query, audience } = req.body;

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

    // Call Perplexity API with audience context
    const response = await fetchFastIntel({ query, audience: audience || 'CMO' });

    // Return successful response
    res.status(200).json(response);

  } catch (error) {
    console.error('Error in /chat-intel endpoint:', error);

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
async function fetchFastIntel(args: { query: string; audience: string }): Promise<PlannerChatResponse> {
  const { query, audience } = args;
  const audienceContext = AUDIENCE_CONTEXT[audience as keyof typeof AUDIENCE_CONTEXT] || AUDIENCE_CONTEXT.CMO;

  const systemPrompt = `You are a strategic intelligence analyst for a ${audience} and other C-suite marketing executives.

${audienceContext}

Analyze the query and provide:
1. SIGNALS (2-5 key insights) - Each with a title, 1-2 sentence summary, and source
2. IMPLICATIONS (2-4 points) - "What this means" for marketing strategy
3. ACTIONS (2-4 points) - Specific, actionable next steps
4. FRAMEWORKS (2-3 relevant strategic frameworks) - Based on the query topic, suggest context-specific frameworks with actionable steps

Based on the query topic, suggest 2-3 relevant strategic frameworks from categories like:
- Digital Strategy
- Media Strategy
- CX Strategy
- Data Strategy
- Content Strategy
- Brand Strategy
- Growth Strategy
- Product Marketing

For each framework, provide 3 specific, actionable steps tailored to this query.

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

## FRAMEWORKS
### [Framework 1 Name] (e.g., Digital Strategy)
- [Actionable step 1 specific to this query]
- [Actionable step 2 specific to this query]
- [Actionable step 3 specific to this query]

### [Framework 2 Name] (e.g., Media Strategy)
- [Actionable step 1 specific to this query]
- [Actionable step 2 specific to this query]
- [Actionable step 3 specific to this query]

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
  const frameworks: IntelligenceFramework[] = [];

  const signalsSection = extractSection(content, 'SIGNALS');
  const implicationsSection = extractSection(content, 'IMPLICATIONS');
  const actionsSection = extractSection(content, 'ACTIONS');
  const frameworksSection = extractSection(content, 'FRAMEWORKS');

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

  // Parse frameworks
  if (frameworksSection) {
    const frameworkBlocks = frameworksSection.split(/^###\s+/m).filter(f => f.trim());

    frameworkBlocks.forEach((block) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      // First line is the framework name
      const label = lines[0].trim().replace(/\(.*\)/, '').trim();
      const id = label.toLowerCase().replace(/\s+/g, '-');

      // Rest are action items (lines starting with -)
      const frameworkActions = lines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.trim().replace(/^-\s*/, ''));

      if (frameworkActions.length > 0) {
        frameworks.push({
          id,
          label,
          actions: frameworkActions
        });
      }
    });
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

  // Return with frameworks (optional field - frontend will fall back to defaults if empty)
  return {
    signals,
    implications,
    actions,
    frameworks: frameworks.length > 0 ? frameworks : undefined
  };
}

function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// Export the router
export default router;

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add this file to your Cloud Run backend
 * 2. Import and mount the router in your main Express app:
 *
 *    import chatIntelRouter from './routes/chat-intel-endpoint';
 *    app.use(chatIntelRouter);
 *
 * 3. Set environment variables:
 *    - PPLX_API_KEY=your_perplexity_api_key_here
 *    - PPLX_MODEL_FAST=sonar
 *
 * 4. Redeploy your Cloud Run service
 *
 * 5. Test endpoint:
 *    curl -X POST https://planners-backend-865025512785.us-central1.run.app/chat-intel \
 *      -H "Content-Type: application/json" \
 *      -d '{"query":"How are CMOs reallocating budget to AI in 2026?"}'
 */
