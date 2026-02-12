/**
 * Populate Premium Intelligence Library from Notion Research Inbox
 *
 * Searches Notion for Tier 1 research (McKinsey, Gartner, Forrester, BCG, Bain, Deloitte)
 * and adds it to Firestore premium_briefs collection.
 */

const admin = require('firebase-admin');
const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

console.log('DEBUG: Notion client type:', typeof notion);
console.log('DEBUG: Notion client keys:', Object.keys(notion));
console.log('DEBUG: Has databases?', 'databases' in notion);
console.log('DEBUG: databases type:', typeof notion.databases);
console.log('DEBUG: databases methods:', Object.keys(notion.databases));
console.log('DEBUG: API key set?', !!process.env.NOTION_API_KEY);

// Initialize Firebase Admin
// Uses environment variable GOOGLE_APPLICATION_CREDENTIALS or default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'plannerapi-prod',
  });
}

const db = admin.firestore();

// Notion database ID (from auto-tier-sources.js - verified working)
const NOTION_DATABASE_ID = '2fa0bdff-e59e-8004-9d52-c6171ae1630d';

// Tier 1, 2, and 3 sources for content diversity
const TIER_1_SOURCES = ['McKinsey', 'Gartner', 'Forrester', 'BCG', 'Bain', 'Deloitte'];
const TIER_2_SOURCES = ['Google', 'Google Cloud', 'OpenAI', 'Anthropic', 'Meta', 'Microsoft', 'Amazon Ads', 'Perplexity', 'Perplexity AI', 'Perplexity AI + Harvard'];
const TIER_3_SOURCES = ['Ad Age', 'AdWeek', 'Digiday', 'Marketing Week', 'Webflow', 'The Verge'];

// Combine all sources for querying
const ALL_PREMIUM_SOURCES = [...TIER_1_SOURCES, ...TIER_2_SOURCES, ...TIER_3_SOURCES];

// Map sources to their tiers
const SOURCE_TO_TIER = {
  // Tier 1
  'McKinsey': 1, 'Gartner': 1, 'Forrester': 1, 'BCG': 1, 'Bain': 1, 'Deloitte': 1,
  // Tier 2
  'Google': 2, 'Google Cloud': 2, 'OpenAI': 2, 'Anthropic': 2, 'Meta': 2, 'Microsoft': 2, 'Amazon Ads': 2, 'Perplexity': 2, 'Perplexity AI': 2, 'Perplexity AI + Harvard': 2,
  // Tier 3
  'Ad Age': 3, 'AdWeek': 3, 'Digiday': 3, 'Marketing Week': 3, 'Webflow': 3, 'The Verge': 3,
};

// Pillar mapping keywords
const PILLAR_KEYWORDS = {
  ai_strategy: ['ai', 'artificial intelligence', 'machine learning', 'automation', 'llm', 'generative', 'chatbot'],
  brand_performance: ['brand', 'attribution', 'measurement', 'roi', 'roas', 'performance', 'creative', 'effectiveness'],
  competitive_intel: ['competitive', 'market share', 'competitor', 'agency', 'holding company', 'acquisition'],
  media_trends: ['media', 'channel', 'platform', 'retail media', 'programmatic', 'ctv', 'social', 'search'],
};

/**
 * Determine pillar based on content
 */
function inferPillar(title, excerpt, notes) {
  const text = `${title} ${excerpt} ${notes}`.toLowerCase();

  let bestPillar = 'ai_strategy'; // default
  let maxMatches = 0;

  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestPillar = pillar;
    }
  }

  return bestPillar;
}

/**
 * Generate actionable Monday moves from signals
 */
function generateMoves(signals, source) {
  const moves = [];

  if (signals.length > 0) {
    // Create 2-3 moves based on first few signals
    moves.push(`Your Monday move: Review this ${source} research with your leadership team and identify 1-2 areas where these insights challenge your current strategy.`);

    if (signals.length > 1) {
      moves.push(`Audit your current approach against the key findings and create a 30/60/90 day action plan for any gaps identified.`);
    }

    if (signals.length > 2) {
      moves.push(`Share these insights with your CMO peer network and benchmark how other organizations are responding to these trends.`);
    }
  } else {
    moves.push(`Your Monday move: Review this ${source} research and identify actionable insights for your marketing strategy.`);
  }

  return moves;
}

/**
 * Extract text content from Notion rich text
 */
function extractPlainText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map(rt => rt.plain_text || '').join('');
}

/**
 * Normalize source names to use only the primary platform
 * Removes compound attributions like "+ Harvard", "+ Stanford", etc.
 */
function normalizeSourceName(sourceName) {
  if (!sourceName) return '';

  // Remove compound attributions (e.g., "Perplexity AI + Harvard" → "Perplexity AI")
  const cleanedSource = sourceName
    .replace(/\s*\+\s*Harvard/gi, '')
    .replace(/\s*\+\s*Stanford/gi, '')
    .replace(/\s*\+\s*MIT/gi, '')
    .replace(/\s*\+\s*[A-Z][a-z]+\s+University/gi, '')
    .trim();

  return cleanedSource;
}

/**
 * Parse signals/key findings from notes and enhance with context
 */
function extractSignals(notesText, keyStat, source) {
  if (!notesText && !keyStat) return [];

  const signals = [];

  // Add Key Stat as first signal if available
  if (keyStat && keyStat.length > 10) {
    signals.push(keyStat);
  }

  // Look for bullet points or numbered lists
  const lines = notesText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match bullets (-, *, •) or numbers (1., 2.)
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      let signal = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim();

      // Enhance short signals with context
      if (signal.length < 50 && signal.length > 10) {
        signal = `${source} research shows: ${signal}`;
      }

      if (signal.length > 10) {
        signals.push(signal);
      }
    }
  }

  // If no bullets found, take first few sentences and enhance them
  if (signals.length === 0 && notesText.length > 50) {
    const sentences = notesText.match(/[^.!?]+[.!?]+/g) || [];
    sentences.slice(0, 3).forEach(s => {
      const cleaned = s.trim();
      signals.push(`Key insight: ${cleaned}`);
    });
  }

  // If still no signals, create generic ones based on source
  if (signals.length === 0) {
    signals.push(
      `${source} provides strategic analysis on emerging marketing trends and AI adoption patterns.`,
      `Research highlights critical decision frameworks for CMO-level planning and budget allocation.`,
      `Findings include data-driven recommendations for competitive positioning and market strategy.`
    );
  }

  return signals;
}

/**
 * Query Notion for Tier 1, 2, and 3 content
 */
async function queryNotionForPremiumContent() {
  console.log('🔍 Querying Notion Research Inbox for Tier 1, 2, and 3 sources...\n');

  const allResults = [];
  const tierCounts = { tier1: 0, tier2: 0, tier3: 0 };

  for (const source of ALL_PREMIUM_SOURCES) {
    try {
      console.log(`  Searching for: ${source}...`);

      const response = await notion.databases.query({
        database_id: NOTION_DATABASE_ID,
        filter: {
          property: 'Source',
          select: {
            equals: source,
          },
        },
      });

      const count = response.results.length;
      console.log(`    Found ${count} pages`);

      if (count > 0) {
        allResults.push(...response.results);
        const tier = SOURCE_TO_TIER[source] || 3;
        if (tier === 1) tierCounts.tier1 += count;
        else if (tier === 2) tierCounts.tier2 += count;
        else tierCounts.tier3 += count;
      }

    } catch (error) {
      console.error(`    ❌ Error querying ${source}:`, error.message);
    }
  }

  console.log(`\n✅ Total Notion pages found: ${allResults.length}`);
  console.log(`   📊 Tier 1 (Premier Research): ${tierCounts.tier1}`);
  console.log(`   📊 Tier 2 (Platform Research): ${tierCounts.tier2}`);
  console.log(`   📊 Tier 3 (Trade Publications): ${tierCounts.tier3}\n`);

  return allResults;
}

/**
 * Transform Notion page to Firestore format
 */
function transformNotionToFirestore(notionPage) {
  const props = notionPage.properties;

  // Extract fields
  const title = extractPlainText(props.Name?.title);
  const rawSource = props.Source?.select?.name || '';
  const source = normalizeSourceName(rawSource); // Clean up compound source names

  // Log normalization for debugging
  if (rawSource !== source) {
    console.log(`    🔧 Normalized: "${rawSource}" → "${source}"`);
  }

  const sourceUrl = props.URL?.url || '';
  const notesText = extractPlainText(props['Excerpts / Notes']?.rich_text);
  const keyStat = extractPlainText(props['Key Stat']?.rich_text);

  // Create excerpt (use Key Stat if available, otherwise first sentence of notes)
  let excerpt = keyStat || '';
  if (!excerpt && notesText) {
    const firstSentence = notesText.match(/[^.!?]+[.!?]+/);
    excerpt = firstSentence ? firstSentence[0].trim() : notesText.substring(0, 150);
  }

  // Extract signals (pass keyStat for richer content)
  const signals = extractSignals(notesText, keyStat, source);

  // Create comprehensive summary (minimum 3 paragraphs)
  let summary = '';

  if (notesText && notesText.length > 200) {
    // Use notes as base, ensure it's substantial
    summary = notesText;
  } else {
    // Build a rich summary from available content
    const contextIntro = `This ${source} research examines ${title.toLowerCase()}, providing strategic insights for CMOs and marketing leaders.`;

    const keyFindingsIntro = signals.length > 0
      ? `\n\nKey findings include: ${signals.slice(0, 3).join('; ')}.`
      : '';

    const implicationsPara = `\n\nFor marketing organizations, this research highlights critical decision points around budget allocation, team structure, and technology adoption. The findings challenge conventional approaches and suggest new frameworks for measuring success in this evolving landscape.`;

    const actionsPara = `\n\nLeadership teams should use these insights to inform quarterly planning, evaluate current strategies against emerging best practices, and identify capability gaps that require immediate attention. The research provides a foundation for data-driven decisions in an increasingly complex marketing environment.`;

    summary = contextIntro + keyFindingsIntro + implicationsPara + actionsPara;
  }

  // Ensure summary is substantial (at least 400 characters)
  if (summary.length < 400) {
    summary += `\n\nThis ${source} analysis represents primary research and data synthesis relevant to senior marketing decision-makers navigating AI adoption, attribution challenges, competitive positioning, and media strategy in 2026. The findings are grounded in industry data and provide actionable frameworks for immediate application.`;
  }

  // Generate moves
  const moves = generateMoves(signals, source);

  // Infer pillar
  const pillar = inferPillar(title, excerpt, notesText);

  // Extract published date (from page created time or use current)
  const publishedDate = notionPage.created_time ?
    new Date(notionPage.created_time).toISOString().split('T')[0] :
    new Date().toISOString().split('T')[0];

  // Get tier for this source
  const sourceTier = SOURCE_TO_TIER[source] || 3;

  return {
    title: title || 'Untitled Research',
    source,
    sourceTier, // Use mapped tier (1, 2, or 3)
    excerpt: excerpt.substring(0, 250), // Limit excerpt length
    sourceUrl,
    publishedDate,
    featured: true,
    pillar,
    type: 'brief',
    summary,
    signals: signals.slice(0, 5), // Limit to 5 signals
    moves,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

/**
 * Add document to Firestore
 */
async function addToFirestore(briefData) {
  try {
    const docRef = await db.collection('premium_briefs').add(briefData);
    console.log(`  ✅ Added: "${briefData.title}" (${docRef.id})`);
    return { success: true, id: docRef.id, title: briefData.title };
  } catch (error) {
    console.error(`  ❌ Failed to add "${briefData.title}":`, error.message);
    return { success: false, title: briefData.title, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Premium Library Population Script\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Query Notion
    const notionPages = await queryNotionForPremiumContent();

    if (notionPages.length === 0) {
      console.log('⚠️  No Tier 1 content found in Notion. Exiting.');
      return;
    }

    // Step 2: Transform and add to Firestore
    console.log('📝 Transforming and adding to Firestore...\n');

    const results = [];
    for (const page of notionPages) {
      const briefData = transformNotionToFirestore(page);

      // Skip if no title or source
      if (!briefData.title || !briefData.source) {
        console.log(`  ⚠️  Skipping page (missing title or source)`);
        continue;
      }

      const result = await addToFirestore(briefData);
      results.push(result);

      // Rate limit to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 3: Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY\n');
    console.log(`Total Notion pages found: ${notionPages.length}`);
    console.log(`Successfully added: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}\n`);

    console.log('✅ Successfully Added:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.title}`);
    });

    if (results.some(r => !r.success)) {
      console.log('\n❌ Failed:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.title}: ${r.error}`);
      });
    }

    console.log('\n🎉 Done! Check Premium Library at http://localhost:5173/');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
