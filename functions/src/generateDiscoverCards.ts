import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@notionhq/client';

// Initialize Firebase Admin
if (!admin.apps.length) admin.initializeApp();

// Secret Manager secrets — replaces deprecated functions.config()
const NOTION_API_KEY = defineSecret('NOTION_API_KEY');
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const PPLX_API_KEY = defineSecret('PPLX_API_KEY');

const ALERT_WEBHOOK_URL =
  process.env.N8N_FAILURE_WEBHOOK || 'https://r16-sav.app.n8n.cloud/webhook/signal2noise-failure-alert';

// All supported pillars
const PILLARS = [
  'ai_strategy',
  'brand_performance',
  'competitive_intel',
  'media_trends',
  'platform_innovation',
  'measurement_analytics',
  'content_strategy',
];

// Perplexity query per pillar
const PILLAR_QUERIES: Record<string, string> = {
  ai_strategy: 'AI adoption, AI strategy, and AI operating models for enterprise marketing teams and CMOs',
  brand_performance: 'brand equity measurement, creative effectiveness, and brand performance for marketers',
  competitive_intel: 'competitive intelligence, market share shifts, and agency moves in advertising and marketing',
  media_trends: 'media trends, platform algorithm changes, programmatic advertising, CTV, and retail media',
  platform_innovation: 'platform innovations from Google, Meta, TikTok, Amazon, and LinkedIn for advertisers and marketers',
  measurement_analytics: 'marketing measurement, attribution models, and marketing analytics trends',
  content_strategy: 'content strategy, AI-generated content, content marketing, and creator economy trends',
};

// Lazy client getters — secrets only available at function runtime
let _anthropic: Anthropic | null = null;
let _notion: Client | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY.value() || process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

function getNotion(): Client {
  if (!_notion) {
    _notion = new Client({
      auth: NOTION_API_KEY.value() || process.env.NOTION_API_KEY,
    });
  }
  return _notion;
}

interface PerplexityResult {
  content: string;
  images: any[];
  citations: Array<{ url: string; title: string }>;
}

async function queryPerplexity(pillar: string): Promise<PerplexityResult> {
  const query = PILLAR_QUERIES[pillar];
  const pplxKey = PPLX_API_KEY.value() || process.env.PPLX_API_KEY;

  if (!pplxKey) throw new Error('PPLX_API_KEY not configured');

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pplxKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'user',
          content: `Find 3 significant developments in ${query} in the past 48 hours. Focus on data-backed insights from McKinsey, Gartner, Forrester, BCG, Google, or major platforms. Return specific statistics, named companies, and concrete trends.`,
        },
      ],
      return_images: true,
      search_recency_filter: 'day',
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices?.[0]?.message?.content || '';
  const images: string[] = data.images || [];
  const rawCitations: string[] = data.citations || [];
  const citations = rawCitations.map((url, i) => ({ url, title: `Source ${i + 1}` }));

  return { content, images, citations };
}

const CLAUDE_SYSTEM_PROMPT = `You are an editorial AI for signal2noise, a marketing intelligence platform for CMOs and agency strategists. Convert raw research into a structured intelligence card.

TITLE RULES — use tension framing:
- "The X% Problem: [implication]"
- "Two Camps Are Emerging: [context]"
- "The Window Is Closing On [trend]"

CONTENT RULES:
- summary: 2 sentences max, lead with data
- signals: 3 items, each naming a winner/loser or a specific number
- moves: 3 items, first MUST start with exactly "Your Monday move:"
- source: most credible source name found in the research
- sourceTier: 1=McKinsey/Gartner/Forrester/BCG, 2=Google/OpenAI/Meta/Anthropic, 3=AdAge/Adweek/Digiday, 4=eMarketer/WARC/Kantar, 5=other
- No emojis. No hype words: revolutionary, game-changing, paradigm shift, unprecedented

Return valid JSON only — no markdown, no prose:
{"title": string, "summary": string, "signals": string[], "moves": string[], "source": string, "sourceTier": number, "pillar": string, "type": "brief"}`;

async function synthesizeWithClaude(pillar: string, researchContent: string): Promise<any> {
  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    system: CLAUDE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Pillar: ${pillar}\n\nResearch:\n${researchContent}\n\nReturn valid JSON only.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Claude response');

  const card = JSON.parse(jsonMatch[0]);
  if (!card.title || !card.summary || !card.signals || !card.moves) {
    throw new Error('Missing required fields in Claude response');
  }

  return card;
}

async function generateCardForPillar(pillar: string): Promise<any> {
  console.log(`[CARD START] Pillar: ${pillar}`);

  const { content, images, citations } = await queryPerplexity(pillar);
  console.log(`[PERPLEXITY OK] Pillar: ${pillar} | images: ${images.length} | citations: ${citations.length}`);

  const card = await synthesizeWithClaude(pillar, content);

  card.id = admin.firestore().collection('discover_cards').doc().id;
  card.pillar = pillar;
  card.type = card.type || 'brief';
  card.publishedAt = admin.firestore.Timestamp.now();
  card.images = images;
  card.citations = citations;
  card.createdBy = 'agent-v2';

  console.log(`[CARD OK] Pillar: ${pillar} → "${card.title}"`);
  return card;
}

// Optional Notion secondary source — processes Triaged items; never throws
async function processNotionTriaged(): Promise<any[]> {
  try {
    const response = await getNotion().databases.query({
      database_id: '2fa0bdff-e59e-8075-a696-000b88058c9e',
      filter: { property: 'Status', select: { equals: 'Triaged' } },
      page_size: 5,
    });

    if (response.results.length === 0) {
      console.log('[NOTION] 0 Triaged items — skipping secondary source');
      return [];
    }

    console.log(`[NOTION] Processing ${response.results.length} Triaged items`);
    const cards: any[] = [];

    for (const page of response.results as any[]) {
      try {
        const props = page.properties;
        const title = props.Name?.title?.[0]?.plain_text || '';
        const pillar = props.Pillar?.select?.name || 'ai_strategy';
        const excerpts = props['Excerpts / Notes']?.rich_text?.[0]?.plain_text || '';
        const url = props.URL?.url || '';

        if (!title || !excerpts) continue;

        const card = await synthesizeWithClaude(
          pillar,
          `Title: ${title}\nExcerpt: ${excerpts}\nURL: ${url}`,
        );

        card.id = admin.firestore().collection('discover_cards').doc().id;
        card.pillar = pillar;
        card.type = card.type || 'brief';
        card.publishedAt = admin.firestore.Timestamp.now();
        card.images = [];
        card.citations = url ? [{ url, title }] : [];
        card.createdBy = 'agent-v2-notion';
        cards.push(card);

        // Mark as Published in Notion
        await getNotion().pages.update({
          page_id: page.id,
          properties: { Status: { select: { name: 'Published' } } },
        });

        console.log(`[NOTION OK] Processed: "${title}"`);
      } catch (itemError: any) {
        console.warn(`[NOTION SKIP] Item failed (non-fatal): ${itemError.message}`);
      }
    }

    return cards;
  } catch (error: any) {
    console.warn('[NOTION] Secondary source unavailable (non-fatal):', error.message);
    return [];
  }
}

// Main Cloud Function — runs daily at 7am ET via Cloud Scheduler
export const generateDiscoverCards = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
    secrets: [NOTION_API_KEY, ANTHROPIC_API_KEY, PPLX_API_KEY],
  })
  .pubsub.schedule('0 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    // Reset lazy clients so secrets are re-read on each cold start
    _anthropic = null;
    _notion = null;

    const startTime = Date.now();
    console.log('========================================');
    console.log('STARTING DISCOVER CARDS GENERATION v2');
    console.log('========================================');

    // Primary: generate one card per pillar from Perplexity
    const primaryResults = await Promise.allSettled(
      PILLARS.map((pillar) => generateCardForPillar(pillar)),
    );

    const successfulCards = primaryResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    const failedPillars = PILLARS.filter(
      (_, i) => primaryResults[i].status === 'rejected',
    ).map((pillar, i) => ({
      pillar,
      error: (primaryResults[PILLARS.indexOf(pillar)] as PromiseRejectedResult).reason?.message,
    }));

    if (failedPillars.length > 0) {
      console.log('FAILED PILLARS:');
      failedPillars.forEach(({ pillar, error }) =>
        console.log(`  [FAIL] ${pillar}: ${error}`),
      );
    }

    // Secondary: Notion Triaged items (non-blocking)
    const notionCards = await processNotionTriaged();
    const allCards = [...successfulCards, ...notionCards];

    // Write all cards to Firestore
    if (allCards.length > 0) {
      const batch = admin.firestore().batch();
      allCards.forEach((card) => {
        const docRef = admin.firestore().collection('discover_cards').doc(card.id);
        batch.set(docRef, card);
      });
      await batch.commit();
      console.log(`[FIRESTORE] Saved ${allCards.length} cards`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('========================================');
    console.log('GENERATION SUMMARY');
    console.log('========================================');
    console.log(`Primary (Perplexity): ${successfulCards.length}/${PILLARS.length} succeeded`);
    console.log(`Secondary (Notion): ${notionCards.length} processed`);
    console.log(`Total saved: ${allCards.length}`);
    console.log(`Total time: ${elapsed}s`);
    console.log('========================================');

    // Dead man's switch — alert if zero cards were generated
    if (allCards.length === 0) {
      try {
        await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            successCount: allCards.length,
            failedPillars: failedPillars.map((f) => f.pillar).join(', '),
            error: failedPillars[0]?.error || 'All pillars failed with no error message',
          }),
        });
        console.log('[ALERT] Failure notification sent to n8n');
      } catch (alertError: any) {
        console.warn('[ALERT] Failed to send failure notification:', alertError.message);
      }
    }

    return null;
  });
