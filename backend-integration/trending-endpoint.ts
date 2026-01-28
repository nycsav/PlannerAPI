/**
 * Cloud Run Backend Integration: /trending endpoints
 *
 * Add this to your existing planners-backend Cloud Run service
 *
 * Endpoint: GET /trending/topics
 * Query Params: ?audience=CMO&limit=6
 * Returns: Trending topics with sample queries for HeroSearch component
 */

import express, { Request, Response } from 'express';

const router = express.Router();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar-pro'; // Use sonar-pro for real-time data
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

type TrendingTopic = {
  label: string;           // "AI Strategy"
  trending: boolean;       // true/false
  sampleQuery: string;     // "How are CMOs using AI to increase ROI?"
};

type TrendingCache = {
  topics: TrendingTopic[];
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
const trendingCache = new Map<string, TrendingCache>();

/**
 * Audience-specific context for trending topics
 */
const AUDIENCE_CONTEXT = {
  CMO: 'Focus on board-level strategic questions about budget allocation, ROI measurement, and competitive positioning.',
  'VP Marketing': 'Focus on operational questions about campaign execution, team efficiency, and technology implementation.',
  'Brand Director': 'Focus on brand strategy questions about differentiation, creative excellence, and brand health.',
  'Growth Leader': 'Focus on growth tactics questions about customer acquisition, retention strategies, and conversion optimization.'
};

/**
 * GET /trending/topics
 * Return cached trending topics or generate new ones if cache expired
 */
router.get('/trending/topics', async (req: Request, res: Response) => {
  try {
    const audience = (req.query.audience as string) || 'CMO';
    const limit = parseInt(req.query.limit as string) || 6;

    // Check cache
    const cached = trendingCache.get(audience);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      console.log(`[Trending] Cache hit for audience: ${audience}`);
      res.status(200).json({
        topics: cached.topics.slice(0, limit),
        cached: true,
        generatedAt: new Date(cached.timestamp).toISOString()
      });
      return;
    }

    // Cache miss or expired - generate new topics
    console.log(`[Trending] Cache miss for audience: ${audience}, generating...`);
    const topics = await generateTrendingTopics(audience, limit);

    // Store in cache
    trendingCache.set(audience, {
      topics,
      timestamp: now,
      audience
    });

    res.status(200).json({
      topics,
      cached: false,
      generatedAt: new Date(now).toISOString()
    });

  } catch (error) {
    console.error('Error in /trending/topics endpoint:', error);
    res.status(500).json({
      error: 'Unable to fetch trending topics at this time. Please try again or contact support if the issue persists.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate trending topics via Perplexity
 */
async function generateTrendingTopics(audience: string, limit: number): Promise<TrendingTopic[]> {
  if (!PPLX_API_KEY) {
    throw new Error('PPLX_API_KEY environment variable not set');
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const audienceContext = AUDIENCE_CONTEXT[audience as keyof typeof AUDIENCE_CONTEXT] || AUDIENCE_CONTEXT.CMO;

  const systemPrompt = `You are a strategic intelligence analyst tracking marketing trends for C-suite executives.

Identify the top ${limit} trending marketing intelligence topics for a ${audience} as of ${today}.

${audienceContext}

Include categories like:
- AI Strategy
- Market Trends
- Revenue Growth
- Competitive Analysis
- Brand Intelligence
- Customer Retention
- Content Strategy
- Digital Transformation

For each topic, provide:
- CATEGORY: The strategic topic category (e.g., "AI Strategy", "Market Trends")
- TRENDING: Whether this topic is currently trending (YES or NO) based on news volume, search trends, and industry discussion
- SAMPLE_QUERY: A specific, executive-level strategic question about this topic (e.g., "How are Fortune 500 CMOs reallocating budget to AI in 2026?")

Format your response EXACTLY as follows:

## TOPIC 1
CATEGORY: [Category Name]
TRENDING: [YES or NO]
SAMPLE_QUERY: [Specific strategic question for ${audience}]

## TOPIC 2
CATEGORY: [Category Name]
TRENDING: [YES or NO]
SAMPLE_QUERY: [Specific strategic question for ${audience}]

...continue for all ${limit} topics

Make the sample queries compelling, specific, and relevant to current market conditions.`;

  // Retry logic with exponential backoff for reliable real-time data
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
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
            { role: 'user', content: `What are the top ${limit} trending marketing intelligence topics for ${audience} right now?` }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          search_recency_filter: 'day', // Real-time data from last 24 hours
          return_citations: true,
        }),
        signal: AbortSignal.timeout(40000), // 40 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Perplexity API error (${response.status}): ${errorText}`);
        
        if (response.status >= 400 && response.status < 500) {
          throw error;
        }
        
        lastError = error;
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
        }
        continue;
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('Invalid Perplexity API response: missing choices');
      }

      const content = data.choices[0]?.message?.content || '';
      
      if (!content || content.trim().length === 0) {
        throw new Error('Perplexity API returned empty content');
      }

      return parseTopicsResponse(content, limit);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
        throw new Error('Request timeout: Please try again.');
      }
      
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(`Failed to fetch trending topics after ${MAX_RETRIES} attempts: ${lastError.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

/**
 * Parse Perplexity response into structured topics array
 */
function parseTopicsResponse(content: string, limit: number): TrendingTopic[] {
  const topics: TrendingTopic[] = [];

  // Match each topic section
  const topicMatches = content.matchAll(/## TOPIC \d+\s*\n([\s\S]*?)(?=## TOPIC \d+|$)/g);

  for (const match of topicMatches) {
    const topicText = match[1];

    const categoryMatch = topicText.match(/CATEGORY:\s*(.+)/i);
    const trendingMatch = topicText.match(/TRENDING:\s*(YES|NO)/i);
    const queryMatch = topicText.match(/SAMPLE_QUERY:\s*(.+)/i);

    if (categoryMatch && trendingMatch && queryMatch) {
      topics.push({
        label: categoryMatch[1].trim(),
        trending: trendingMatch[1].toUpperCase() === 'YES',
        sampleQuery: queryMatch[1].trim()
      });
    }
  }

  // Fallback: If parsing fails, create default topics
  // Last updated: January 2026
  if (topics.length === 0) {
    const defaultTopics = [
      { label: 'AI Strategy', trending: true, sampleQuery: 'How is DeepSeek disrupting enterprise AI pricing for marketing teams?' },
      { label: 'Market Trends', trending: true, sampleQuery: 'What does Google AI Mode mean for 2026 paid search budgets?' },
      { label: 'Revenue Growth', trending: true, sampleQuery: 'Which brands are winning Q1 2026 with AI-powered personalization?' },
      { label: 'Competitive Analysis', trending: true, sampleQuery: 'How are agencies repositioning around AI agents vs automation?' },
      { label: 'Brand Intelligence', trending: false, sampleQuery: 'What zero-party data strategies are driving measurable brand lift?' },
      { label: 'Customer Retention', trending: false, sampleQuery: 'How are AI chatbots impacting customer retention metrics in 2026?' }
    ];

    return defaultTopics.slice(0, limit);
  }

  return topics.slice(0, limit);
}

// Export the router
export default router;

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add this file to your Cloud Run backend
 * 2. Import and mount the router in your main Express app:
 *
 *    import trendingRouter from './routes/trending-endpoint';
 *    app.use(trendingRouter);
 *
 * 3. Set environment variables (same as other endpoints):
 *    - PPLX_API_KEY=your_perplexity_api_key_here
 *    - PPLX_MODEL_FAST=sonar
 *
 * 4. Redeploy your Cloud Run service
 *
 * 5. Test endpoint:
 *    curl -X GET "https://planners-backend-865025512785.us-central1.run.app/trending/topics?audience=CMO&limit=6"
 *
 *    Expected response:
 *    {
 *      "topics": [
 *        {
 *          "label": "AI Strategy",
 *          "trending": true,
 *          "sampleQuery": "How are CMOs using AI to increase ROI?"
 *        },
 *        ...
 *      ],
 *      "cached": false,
 *      "generatedAt": "2026-01-19T12:00:00.000Z"
 *    }
 */
