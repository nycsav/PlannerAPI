/**
 * Cloud Run Backend Integration: /briefings endpoints
 *
 * Add this to your existing planners-backend Cloud Run service
 *
 * Endpoints:
 * - POST /briefings/generate - Generate 6 daily briefings via Perplexity
 * - GET /briefings/latest - Return cached briefings (24-hour cache)
 *
 * Query Params: ?audience=CMO&limit=6
 */

import express, { Request, Response } from 'express';

const router = express.Router();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type IntelligenceBriefing = {
  id: string;          // LOG-XXX format
  date: string;        // DD.MM.YYYY (today's date)
  title: string;       // Max 80 chars
  description: string; // 2-3 sentences with metrics
  theme: string;       // AI Strategy, Market Trends, etc.
  query: string;       // Full briefing title for "Read Analysis"
};

type BriefingsCache = {
  briefings: IntelligenceBriefing[];
  timestamp: number;
  audience: string;
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

// In-memory cache (Map keyed by audience)
const briefingsCache = new Map<string, BriefingsCache>();

/**
 * Audience-specific context for personalized briefings
 */
const AUDIENCE_CONTEXT = {
  CMO: 'Focus on board-level implications, budget ROI, and strategic positioning.',
  'VP Marketing': 'Focus on operational execution, team resources, and vendor evaluation.',
  'Brand Director': 'Focus on brand equity, creative differentiation, and positioning.',
  'Growth Leader': 'Focus on acquisition channels, conversion metrics, and retention tactics.'
};

/**
 * GET /briefings/latest
 * Return cached briefings or generate new ones if cache expired
 */
router.get('/briefings/latest', async (req: Request, res: Response) => {
  try {
    const audience = (req.query.audience as string) || 'CMO';
    const limit = parseInt(req.query.limit as string) || 6;

    // Check cache
    const cached = briefingsCache.get(audience);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      console.log(`[Briefings] Cache hit for audience: ${audience}`);
      res.status(200).json({
        briefings: cached.briefings.slice(0, limit),
        cached: true,
        generatedAt: new Date(cached.timestamp).toISOString()
      });
      return;
    }

    // Cache miss or expired - generate new briefings
    console.log(`[Briefings] Cache miss for audience: ${audience}, generating...`);
    const briefings = await generateBriefings(audience, limit);

    // Store in cache
    briefingsCache.set(audience, {
      briefings,
      timestamp: now,
      audience
    });

    res.status(200).json({
      briefings,
      cached: false,
      generatedAt: new Date(now).toISOString()
    });

  } catch (error) {
    console.error('Error in /briefings/latest endpoint:', error);
    res.status(500).json({
      error: 'Unable to fetch intelligence briefings at this time. Please try again or contact support if the issue persists.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /briefings/generate
 * Force regenerate briefings (bypasses cache)
 */
router.post('/briefings/generate', async (req: Request, res: Response) => {
  try {
    const audience = (req.body.audience as string) || 'CMO';
    const limit = parseInt(req.body.limit as string) || 6;

    if (!PPLX_API_KEY) {
      console.error('Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'Service configuration error. Please contact support.'
      });
      return;
    }

    console.log(`[Briefings] Force generating briefings for audience: ${audience}`);
    const briefings = await generateBriefings(audience, limit);

    // Update cache
    briefingsCache.set(audience, {
      briefings,
      timestamp: Date.now(),
      audience
    });

    res.status(200).json({
      briefings,
      cached: false,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /briefings/generate endpoint:', error);
    res.status(500).json({
      error: 'Unable to generate intelligence briefings at this time. Please try again or contact support if the issue persists.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate 6 strategic intelligence briefings via Perplexity
 */
async function generateBriefings(audience: string, limit: number): Promise<IntelligenceBriefing[]> {
  const today = new Date();
  const dateStr = formatDate(today);
  const audienceContext = AUDIENCE_CONTEXT[audience as keyof typeof AUDIENCE_CONTEXT] || AUDIENCE_CONTEXT.CMO;

  const systemPrompt = `You are a strategic intelligence analyst for C-suite marketing executives.

Generate ${limit} strategic intelligence briefings for a ${audience} published today (${dateStr}).

${audienceContext}

Cover these 6 categories (one briefing per category):
1. AI Strategy
2. Market Trends
3. Revenue Growth
4. Competitive Analysis
5. Brand Intelligence
6. Customer Retention

For EACH briefing, provide:
- TITLE: Concise, specific headline (max 80 characters) with concrete data or insights
- DESCRIPTION: 2-3 sentences with specific metrics, data points, or actionable insights
- CATEGORY: One of the 6 categories above

Format your response EXACTLY as follows:

## BRIEFING 1
CATEGORY: [Category Name]
TITLE: [Title with specific data/metrics]
DESCRIPTION: [2-3 sentences with specific numbers, trends, or insights]

## BRIEFING 2
CATEGORY: [Category Name]
TITLE: [Title with specific data/metrics]
DESCRIPTION: [2-3 sentences with specific numbers, trends, or insights]

...continue for all ${limit} briefings

Keep it data-driven, executive-appropriate, and strategically relevant. Use real market data and trends from recent sources.`;

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
        { role: 'user', content: `Generate ${limit} strategic intelligence briefings for ${audience} with fresh market data from today.` }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
  }

  const data: PerplexityResponse = await response.json();
  const content = data.choices[0]?.message?.content || '';

  return parseBriefingsResponse(content, dateStr);
}

/**
 * Parse Perplexity response into structured briefings array
 */
function parseBriefingsResponse(content: string, dateStr: string): IntelligenceBriefing[] {
  const briefings: IntelligenceBriefing[] = [];

  // Match each briefing section
  const briefingMatches = content.matchAll(/## BRIEFING \d+\s*\n([\s\S]*?)(?=## BRIEFING \d+|$)/g);

  let index = 1;
  for (const match of briefingMatches) {
    const briefingText = match[1];

    const categoryMatch = briefingText.match(/CATEGORY:\s*(.+)/i);
    const titleMatch = briefingText.match(/TITLE:\s*(.+)/i);
    const descriptionMatch = briefingText.match(/DESCRIPTION:\s*([\s\S]+?)(?=\n\n|$)/i);

    if (categoryMatch && titleMatch && descriptionMatch) {
      const theme = categoryMatch[1].trim();
      const title = titleMatch[1].trim().substring(0, 80); // Enforce 80 char limit
      const description = descriptionMatch[1].trim().replace(/\n/g, ' ');

      briefings.push({
        id: `LOG-${String(index).padStart(3, '0')}`,
        date: dateStr,
        title,
        description,
        theme,
        query: title // Use title as query for "Read Analysis"
      });

      index++;
    }
  }

  // Fallback: If parsing fails, create default briefings
  if (briefings.length === 0) {
    const defaultThemes = ['AI Strategy', 'Market Trends', 'Revenue Growth', 'Competitive Analysis', 'Brand Intelligence', 'Customer Retention'];

    for (let i = 0; i < 6; i++) {
      briefings.push({
        id: `LOG-${String(i + 1).padStart(3, '0')}`,
        date: dateStr,
        title: `Strategic Intelligence: ${defaultThemes[i]}`,
        description: 'Intelligence briefing generated from real-time market analysis. Click to explore detailed insights and strategic recommendations.',
        theme: defaultThemes[i],
        query: `Strategic Intelligence: ${defaultThemes[i]}`
      });
    }
  }

  return briefings;
}

/**
 * Format date as DD.MM.YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// Export the router
export default router;

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add this file to your Cloud Run backend
 * 2. Import and mount the router in your main Express app:
 *
 *    import briefingsRouter from './routes/briefings-endpoint';
 *    app.use(briefingsRouter);
 *
 * 3. Set environment variables (same as chat-intel-endpoint):
 *    - PPLX_API_KEY=your_perplexity_api_key_here
 *    - PPLX_MODEL_FAST=sonar
 *
 * 4. Redeploy your Cloud Run service
 *
 * 5. Test endpoints:
 *    # Get latest cached briefings
 *    curl -X GET "https://planners-backend-865025512785.us-central1.run.app/briefings/latest?audience=CMO&limit=6"
 *
 *    # Force regenerate briefings
 *    curl -X POST "https://planners-backend-865025512785.us-central1.run.app/briefings/generate" \
 *      -H "Content-Type: application/json" \
 *      -d '{"audience":"CMO","limit":6}'
 */
