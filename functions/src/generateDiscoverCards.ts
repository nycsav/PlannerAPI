import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@notionhq/client';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Notion client
const notion = new Client({
  auth: functions.config().notion?.api_key || process.env.NOTION_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: functions.config().anthropic?.api_key || process.env.ANTHROPIC_API_KEY,
});

// Topic to Pillar mapping
function topicToPillar(topic: string): string {
  const mapping: Record<string, string> = {
    'AI adoption and strategy': 'ai_strategy',
    'Platform data and research': 'brand_performance',
    'Competitive intelligence and brand performance': 'competitive_intel',
  };
  return mapping[topic] || 'ai_strategy';
}

// Query Notion database for tier-1/2 sources
async function queryNotionForTopic(pillar: string): Promise<any[]> {
  try {
    const response = await notion.databases.query({
      database_id: '2fa0bdffe59e80049d52c6171ae1630d',
      filter: {
        and: [
          {
            property: 'Pillar',
            select: {
              equals: pillar,
            },
          },
          {
            or: [
              {
                property: 'Source Tier',
                select: {
                  equals: '1: Premier Research',
                },
              },
              {
                property: 'Source Tier',
                select: {
                  equals: '2: Platform Research',
                },
              },
            ],
          },
          {
            or: [
              {
                property: 'Status',
                select: {
                  equals: 'Ready for AI',
                },
              },
              {
                property: 'Status',
                select: {
                  equals: 'Triaged',
                },
              },
            ],
          },
        ],
      },
      sorts: [
        {
          property: 'Date Added',
          direction: 'descending',
        },
      ],
      page_size: 10,
    });

    return response.results.map((page: any) => ({
      title: page.properties.Name?.title[0]?.plain_text || '',
      source: page.properties.Source?.select?.name || '',
      excerpts: page.properties['Excerpts / Notes']?.rich_text[0]?.plain_text || '',
      url: page.properties['userDefined:URL']?.url || '',
      stat: page.properties['Key Stat']?.rich_text[0]?.plain_text || '',
      sourceTier: page.properties['Source Tier']?.select?.name || '',
    }));
  } catch (error) {
    console.error(`[NOTION ERROR] Failed to query for pillar ${pillar}:`, error);
    throw error;
  }
}

// Synthesize card from Notion sources using Claude
async function synthesizeCardWithClaude(
  topic: string,
  notionSources: any[],
): Promise<any> {
  const pillar = topicToPillar(topic);

  // Format sources for Claude
  const sourceContext = notionSources
    .map(
      (r) =>
        `Source: ${r.source} (${r.sourceTier})
Title: ${r.title}
Excerpt: ${r.excerpts}
${r.stat ? `Key Stat: ${r.stat}` : ''}
URL: ${r.url}`,
    )
    .join('\n\n---\n\n');

  const systemPrompt = `You are a senior strategy analyst creating daily intelligence briefs for advertising and marketing executives.

VOICE RULES:
- Analytical: Lead with data ("The data suggests…", "Three factors explain…")
- Pragmatic: Every insight leads to "what to do Monday"
- Concise: 2-3 sentences max per section
- Direct: Name winners/losers and tradeoffs
- Credible: Cite tier-1 sources (McKinsey, Gartner, BCG, Google, OpenAI, Anthropic)

PROHIBITIONS:
- No emojis
- No hype phrases ("revolutionary", "game-changing", "paradigm shift")
- No vague recommendations ("consider evaluating")

OUTPUT FORMAT:
Return valid JSON with this exact structure:
{
  "title": "The [X]% Problem: …" or "Two Camps Are Emerging: …",
  "summary": "2-3 sentence analytical summary with data",
  "signals": ["Key metric or fact", "Another data point", "Third signal"],
  "moves": [
    "Your Monday move: [specific actionable step]",
    "[Second specific action]",
    "[Third specific action]"
  ],
  "pillar": "${pillar}",
  "source": "[Primary tier-1 source name]",
  "sourceTier": 1,
  "type": "brief"
}`;

  const userPrompt = `Topic: ${topic}

Available tier-1/2 sources from our curated research library:

${sourceContext}

Create a daily intelligence brief following the voice rules and output format. Focus on the most recent, data-rich insights. First move MUST start with "Your Monday move:".`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const card = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!card.title || !card.summary || !card.signals || !card.moves) {
      throw new Error('Missing required fields in card');
    }

    // Add metadata
    card.id = admin.firestore().collection('discover_cards').doc().id;
    card.date = new Date().toISOString();
    card.status = 'published';

    return card;
  } catch (error) {
    console.error(`[SYNTHESIS ERROR] Topic "${topic}":`, error);
    throw error;
  }
}

// Generate card for a single topic
async function generateCardForTopic(topic: string): Promise<any> {
  try {
    console.log(`[CARD START] Topic: "${topic}"`);

    // Step 1: Query Notion for tier-1/2 sources
    const pillar = topicToPillar(topic);
    console.log(`[NOTION QUERY] Pillar: ${pillar}`);

    const notionSources = await queryNotionForTopic(pillar);

    if (notionSources.length === 0) {
      throw new Error(`No tier-1/2 sources found in Notion for pillar: ${pillar}`);
    }

    console.log(`[NOTION SUCCESS] Found ${notionSources.length} sources for ${pillar}`);

    // Step 2: Synthesize card with Claude
    const card = await synthesizeCardWithClaude(topic, notionSources);

    console.log(`[CARD SUCCESS] Topic: "${topic}" → Card: ${card.id}`);
    return card;
  } catch (error: any) {
    console.error(`[CARD FAILED] Topic "${topic}": ${error.message}`);
    throw error;
  }
}

// Main Cloud Function - runs daily at 7am ET via Cloud Scheduler
export const generateDiscoverCards = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
  })
  .pubsub.schedule('0 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    try {
      const startTime = Date.now();

      console.log('========================================');
    console.log('🚀 STARTING DISCOVER CARDS GENERATION');
    console.log('========================================');

    const topics = [
      'AI adoption and strategy',
      'Platform data and research',
      'Competitive intelligence and brand performance',
    ];

    const results = await Promise.allSettled(
      topics.map((topic) => generateCardForTopic(topic)),
    );

    const successfulCards = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    const failedCards = results
      .map((r, idx) => ({
        topic: topics[idx],
        result: r,
      }))
      .filter((item) => item.result.status === 'rejected')
      .map((item) => ({
        topic: item.topic,
        error:
          (item.result as PromiseRejectedResult).reason?.message ||
          'Unknown error',
        stack: (item.result as PromiseRejectedResult).reason?.stack,
      }));

    if (failedCards.length > 0) {
      console.log('========================================');
      console.log('❌ FAILED CARDS DETAIL');
      console.log('========================================');
      failedCards.forEach((failure, idx) => {
        console.log(`\n${idx + 1}. Topic: ${failure.topic}`);
        console.log(`   Error: ${failure.error}`);
        if (failure.stack) {
          console.log(`   Stack: ${failure.stack.substring(0, 200)}...`);
        }
      });
      console.log('========================================\n');
    }

    if (successfulCards.length > 0) {
      const batch = admin.firestore().batch();
      successfulCards.forEach((card) => {
        const docRef = admin
          .firestore()
          .collection('discover_cards')
          .doc(card.id);
        batch.set(docRef, card);
      });
      await batch.commit();
      console.log(
        `[FIRESTORE] Saved ${successfulCards.length} cards successfully`,
      );
    }

    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log('========================================');
    console.log('📊 GENERATION SUMMARY');
    console.log('========================================');
    console.log(`✅ Successful: ${successfulCards.length}/${topics.length}`);
    console.log(`❌ Failed: ${failedCards.length}/${topics.length}`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log('========================================');

      return null;
    } catch (error: any) {
      console.error('[FATAL ERROR]', error);
      throw error;
    }
  });
