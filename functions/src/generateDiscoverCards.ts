import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@notionhq/client';

// Initialize Firebase Admin
if (!admin.apps.length) admin.initializeApp();

// Secret Manager secrets
const NOTION_API_KEY = defineSecret('NOTION_API_KEY');
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const PPLX_API_KEY = defineSecret('PPLX_API_KEY');

const ALERT_WEBHOOK_URL =
  process.env.N8N_FAILURE_WEBHOOK || 'https://r16-sav.app.n8n.cloud/webhook/signal2noise-failure-alert';

// Core pillars for card distribution
const PILLARS = [
  'ai_strategy',
  'brand_performance',
  'competitive_intel',
  'media_trends',
] as const;

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

// ─── Step 1: Single Perplexity call for ALL pillars ───────────────────────

async function fetchAllPillarResearch(): Promise<{
  content: string;
  images: any[];
  citations: Array<{ url: string; title: string }>;
}> {
  const pplxKey = PPLX_API_KEY.value() || process.env.PPLX_API_KEY;
  if (!pplxKey) throw new Error('PPLX_API_KEY not configured');

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pplxKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'user',
          content: `Find the 10 most significant marketing and AI developments from the past 24 hours across these four areas:

1. AI STRATEGY: AI adoption, operating models, governance for enterprise marketing teams and CMOs
2. BRAND PERFORMANCE: Brand equity, attribution, measurement, creative effectiveness
3. COMPETITIVE INTEL: Market share shifts, agency moves, holding company strategy
4. MEDIA TRENDS: Platform changes, programmatic, CTV, retail media, search/AEO/GEO

Focus on data-backed insights from McKinsey, Gartner, Forrester, BCG, Google, Meta, Anthropic, or major platforms. Include specific statistics, named companies, and concrete trends. Organize clearly by area.`,
        },
      ],
      return_images: true,
      search_recency_filter: 'day',
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices?.[0]?.message?.content || '';
  const images: any[] = data.images || [];
  const rawCitations: string[] = data.citations || [];
  const citations = rawCitations.map((url: string, i: number) => ({ url, title: `Source ${i + 1}` }));

  console.log(`[PERPLEXITY] Single call complete | ${content.length} chars | ${images.length} images | ${citations.length} citations`);
  return { content, images, citations };
}

// ─── Step 2: Fetch last 7 days titles for deduplication ───────────────────

async function getRecentTitles(): Promise<string[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const snapshot = await admin
    .firestore()
    .collection('discover_cards')
    .where('publishedAt', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
    .select('title')
    .get();

  return snapshot.docs.map((doc) => doc.data().title as string);
}

// ─── Step 3: Single Claude call → 10 structured cards ────────────────────

const CLAUDE_SYSTEM_PROMPT = `You are the editorial engine for signal2noise, a marketing intelligence platform for CMOs at $50M-$500M companies. Convert raw research into exactly 10 intelligence cards distributed across 4 pillars.

OUTPUT: Return a JSON array of exactly 10 card objects. No markdown, no prose — pure JSON array.

PILLAR DISTRIBUTION (aim for):
- ai_strategy: 3 cards
- brand_performance: 2 cards
- competitive_intel: 2 cards
- media_trends: 3 cards

EACH CARD MUST HAVE:
{
  "title": string,       // Tension-framed: "The X% Problem:", "Two Camps Are Emerging:", "The Window Is Closing On..."
  "summary": string,     // 2 sentences max. Lead with a number or named source.
  "signals": string[],   // Exactly 3 items. Each names a winner/loser or cites a specific number.
  "moves": string[],     // Exactly 3 items. First MUST start with "Your Monday move:"
  "source": string,      // Most credible source (McKinsey, Gartner, Google, etc.)
  "sourceUrl": string,   // URL to the source article (from citations if available)
  "sourceTier": number,  // 1=McKinsey/Gartner/Forrester/BCG/Bain/Deloitte, 2=Google/OpenAI/Meta/Anthropic, 3=AdAge/Digiday, 4=eMarketer/WARC, 5=other
  "pillar": string,      // One of: ai_strategy, brand_performance, competitive_intel, media_trends
  "type": "brief",       // Always "brief" for daily cards
  "priority": number     // 1-100. Higher = more important. Use 80+ for Tier 1-2 sources with strong data.
}

EDITORIAL RULES:
- No emojis. No hype words (revolutionary, game-changing, paradigm shift, unprecedented).
- Every card must cite a specific number, percentage, or dollar amount.
- Titles use tension framing — name the conflict, not the topic.
- "Your Monday move:" must be a concrete, actionable first step.
- Diversify sources: max 2 cards per source. Aim for 60%+ Tier 1-2 sources.`;

interface GeneratedCard {
  title: string;
  summary: string;
  signals: string[];
  moves: string[];
  source: string;
  sourceUrl?: string;
  sourceTier: number;
  pillar: string;
  type: string;
  priority: number;
}

async function synthesizeAllCards(
  research: string,
  citations: Array<{ url: string; title: string }>,
  recentTitles: string[],
): Promise<GeneratedCard[]> {
  const citationList = citations
    .slice(0, 20)
    .map((c, i) => `[${i + 1}] ${c.url}`)
    .join('\n');

  const dedupeBlock = recentTitles.length > 0
    ? `\n\nDEDUPLICATION — Do NOT create cards similar to these recent titles:\n${recentTitles.slice(0, 30).map((t) => `- ${t}`).join('\n')}`
    : '';

  const message = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: CLAUDE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `RESEARCH:\n${research}\n\nAVAILABLE CITATIONS:\n${citationList}${dedupeBlock}\n\nReturn a JSON array of exactly 10 cards. No markdown fences — raw JSON array only.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

  // Extract JSON array from response
  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in Claude response');

  const cards: GeneratedCard[] = JSON.parse(jsonMatch[0]);

  // Validate each card has required fields
  const validCards = cards.filter((card) => {
    if (!card.title || !card.summary || !card.signals?.length || !card.moves?.length) {
      console.warn(`[VALIDATE] Skipping card missing fields: "${card.title || 'untitled'}"`);
      return false;
    }
    if (!PILLARS.includes(card.pillar as any)) {
      card.pillar = 'ai_strategy'; // fallback
    }
    return true;
  });

  console.log(`[CLAUDE] Generated ${validCards.length} valid cards from ${cards.length} total`);
  return validCards;
}

// ─── Optional: Notion secondary source (unchanged, non-blocking) ─────────

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

        // For Notion items, use a lightweight Claude call
        const message = await getAnthropic().messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: CLAUDE_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Pillar: ${pillar}\n\nResearch:\nTitle: ${title}\nExcerpt: ${excerpts}\nURL: ${url}\n\nReturn a single JSON object (not array) for one intelligence card.`,
            },
          ],
        });

        const text = message.content[0];
        if (text.type !== 'text') continue;
        const jsonMatch = text.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;
        const card = JSON.parse(jsonMatch[0]);

        card.id = admin.firestore().collection('discover_cards').doc().id;
        card.pillar = pillar;
        card.type = card.type || 'brief';
        card.publishedAt = admin.firestore.Timestamp.now();
        card.images = [];
        card.citations = url ? [{ url, title }] : [];
        card.createdBy = 'agent-v3-notion';
        cards.push(card);

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

// ─── Main Cloud Function ─────────────────────────────────────────────────

export const generateDiscoverCards = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
    secrets: [NOTION_API_KEY, ANTHROPIC_API_KEY, PPLX_API_KEY],
  })
  .pubsub.schedule('0 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    _anthropic = null;
    _notion = null;

    const startTime = Date.now();
    console.log('========================================');
    console.log('DISCOVER CARDS GENERATION v3 (1+1 architecture)');
    console.log('========================================');

    try {
      // Step 1: Single Perplexity call for all pillars
      const { content: research, images, citations } = await fetchAllPillarResearch();

      // Step 2: Fetch recent titles for deduplication
      const recentTitles = await getRecentTitles();
      console.log(`[DEDUP] ${recentTitles.length} recent titles loaded for deduplication`);

      // Step 3: Single Claude call → 10 structured cards
      const generatedCards = await synthesizeAllCards(research, citations, recentTitles);

      // Distribute images across cards (round-robin from Perplexity results)
      const imageList = Array.isArray(images) ? images : [];
      const enrichedCards = generatedCards.map((card, i) => ({
        ...card,
        id: admin.firestore().collection('discover_cards').doc().id,
        publishedAt: admin.firestore.Timestamp.now(),
        images: imageList.length > 0
          ? [imageList[i % imageList.length]].filter(Boolean).map((img: any) =>
              typeof img === 'string'
                ? { image_url: img, origin_url: img }
                : img,
            )
          : [],
        citations: card.sourceUrl
          ? [{ url: card.sourceUrl, title: card.source || 'Source' }, ...citations.slice(0, 2)]
          : citations.slice(0, 3),
        createdBy: 'agent-v3',
      }));

      // Step 4: Optional Notion secondary source
      const notionCards = await processNotionTriaged();
      const allCards = [...enrichedCards, ...notionCards];

      // Step 5: Write all cards to Firestore
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
      const pillarCounts = PILLARS.map(
        (p) => `${p}: ${enrichedCards.filter((c) => c.pillar === p).length}`,
      ).join(', ');

      console.log('========================================');
      console.log('GENERATION SUMMARY (v3)');
      console.log('========================================');
      console.log(`API calls: 1 Perplexity + 1 Claude (was 14+ in v2)`);
      console.log(`Primary cards: ${enrichedCards.length}`);
      console.log(`Pillar distribution: ${pillarCounts}`);
      console.log(`Notion cards: ${notionCards.length}`);
      console.log(`Total saved: ${allCards.length}`);
      console.log(`Dedup titles checked: ${recentTitles.length}`);
      console.log(`Total time: ${elapsed}s`);
      console.log('========================================');

      // Alert if zero cards
      if (allCards.length === 0) {
        try {
          await fetch(ALERT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              successCount: 0,
              error: 'Zero cards generated in v3 pipeline',
            }),
          });
          console.log('[ALERT] Failure notification sent');
        } catch (alertError: any) {
          console.warn('[ALERT] Failed to send notification:', alertError.message);
        }
      }
    } catch (error: any) {
      console.error('[FATAL] Generation pipeline failed:', error.message);

      try {
        await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            successCount: 0,
            error: error.message,
          }),
        });
      } catch { /* ignore alert failure */ }
    }

    return null;
  });
