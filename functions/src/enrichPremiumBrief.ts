/**
 * Premium Brief Enrichment with Claude Opus 4.6
 *
 * Uses the highest quality Claude model (Opus 4.6) for premium content enrichment.
 * This function consumes API credits but provides superior reasoning and synthesis.
 *
 * Use cases:
 * - Notion Research Inbox → Premium Library briefs
 * - LinkedIn post generation (highest visibility)
 * - Strategic playbook content
 *
 * Cost: ~$0.50-1.00 per brief (vs $0.10-0.20 with Sonnet)
 * Quality: Best reasoning, nuanced synthesis, executive-level writing
 */

import { Anthropic } from '@anthropic-ai/sdk';
import * as functions from 'firebase-functions';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

interface PremiumBriefInput {
  title: string;
  source: string;
  excerpt: string;
  sourceUrl: string;
  pillar: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
}

interface EnrichedBrief {
  summary: string;
  signals: string[];
  moves: string[];
}

/**
 * Enrich a premium brief using Claude Opus 4.6
 *
 * This function applies the signal2noise editorial voice (EDITORIAL_VOICE.md)
 * and content framework (DAILY_INTEL_FRAMEWORK.md) to produce McKinsey-level
 * strategic intelligence.
 */
export async function enrichBriefWithOpus(input: PremiumBriefInput): Promise<EnrichedBrief> {
  console.log(`[Opus 4.6] Enriching brief: ${input.title} from ${input.source}`);

  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-20250514', // Opus 4 - highest quality
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are an executive intelligence analyst for CMOs, VP Marketing, and Brand Directors at $50-500M companies.

EDITORIAL VOICE:
- Analytical (lead with data, not opinion)
- Pragmatic (every insight → "what to do Monday")
- Concise (2-3 sentences per section max)
- Direct (name winners/losers, call out tradeoffs)
- Credible (cite recognizable sources)

PROHIBITIONS:
- No emojis
- No hype phrases ("revolutionary", "game-changing")
- No vague recommendations ("consider evaluating")

SOURCE: ${input.source} (Tier 1-3 research)
PILLAR: ${input.pillar}
TITLE: ${input.title}
URL: ${input.sourceUrl}

RESEARCH EXCERPT:
${input.excerpt}

TASK: Analyze this research and provide:

1. SUMMARY (3-5 sentences)
   - What's the core finding or development?
   - Why does it matter to marketing leaders?
   - What's the macro context + micro signal?

2. SIGNALS (3-5 bullet points)
   - Data points or developments (what's happening)
   - Use framing patterns: "The 94% Problem:", "Two Camps:", "The Window Is Closing On..."
   - Each signal should be 1-2 sentences max

3. MOVES (2-3 actionable steps)
   - Tactical next steps (what to do Monday)
   - Format: "Your Monday move:", "Start here:", "The 3-step audit:"
   - Each move should be 1-2 sentences max

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "string",
  "signals": ["string", "string", "string"],
  "moves": ["string", "string"]
}`
      }]
    });

    const duration = Date.now() - startTime;

    // Parse response
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const enriched = JSON.parse(text);

    // Log metrics
    console.log(`[Opus 4.6] ✓ Enriched in ${duration}ms`);
    console.log(`[Opus 4.6] Tokens: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);
    console.log(`[Opus 4.6] Cost: ~$${((response.usage.input_tokens * 15 + response.usage.output_tokens * 75) / 1000000).toFixed(4)}`);

    return enriched;

  } catch (error) {
    console.error('[Opus 4.6] Enrichment failed:', error);
    throw error;
  }
}

/**
 * HTTP Cloud Function: Enrich Premium Brief
 *
 * POST /enrichPremiumBrief
 * Body: PremiumBriefInput
 *
 * Usage:
 * curl -X POST https://us-central1-plannerapi-prod.cloudfunctions.net/enrichPremiumBrief \
 *   -H "Content-Type: application/json" \
 *   -d '{"title":"...","source":"McKinsey","excerpt":"...","sourceUrl":"...","pillar":"ai_strategy"}'
 */
export const enrichPremiumBriefFunction = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '256MB',
    secrets: ['ANTHROPIC_API_KEY'], // Access secret
  })
  .https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const input: PremiumBriefInput = req.body;

      // Validate input
      if (!input.title || !input.source || !input.excerpt || !input.pillar) {
        res.status(400).json({ error: 'Missing required fields: title, source, excerpt, pillar' });
        return;
      }

      const enriched = await enrichBriefWithOpus(input);

      res.status(200).json({
        success: true,
        data: enriched,
        model: 'claude-opus-4-20250514',
        source: input.source,
      });

    } catch (error: any) {
      console.error('[enrichPremiumBrief] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  });
