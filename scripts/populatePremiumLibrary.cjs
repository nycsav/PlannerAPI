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
// Note: Include both "Perplexity AI" and "Perplexity AI + Harvard" for Notion queries, but they'll be normalized to "Perplexity" in output
const TIER_2_SOURCES = ['Google', 'Google Cloud', 'OpenAI', 'Anthropic', 'Meta', 'Microsoft', 'Amazon Ads', 'Perplexity', 'Perplexity AI', 'Perplexity AI + Harvard'];
const TIER_3_SOURCES = ['Ad Age', 'AdWeek', 'Digiday', 'Marketing Week', 'Webflow', 'The Verge'];

// Combine all sources for querying
const ALL_PREMIUM_SOURCES = [...TIER_1_SOURCES, ...TIER_2_SOURCES, ...TIER_3_SOURCES];

// Map sources to their tiers (includes variants for Notion querying)
const SOURCE_TO_TIER = {
  // Tier 1
  'McKinsey': 1, 'Gartner': 1, 'Forrester': 1, 'BCG': 1, 'Bain': 1, 'Deloitte': 1,
  // Tier 2 - Note: All Perplexity variants map to tier 2 but normalize to "Perplexity" in output
  'Google': 2, 'Google Cloud': 2, 'OpenAI': 2, 'Anthropic': 2, 'Meta': 2, 'Microsoft': 2, 'Amazon Ads': 2,
  'Perplexity': 2, 'Perplexity AI': 2, 'Perplexity AI + Harvard': 2,
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
 * Generate strategic, actionable moves for leadership teams
 * Provides 4-6 specific, tactical bullets with concrete next steps
 */
function generateMoves(signals, source, pillar) {
  const moves = [];

  // Generate pillar-specific strategic moves
  if (pillar === 'ai_strategy') {
    moves.push(
      `Convene your leadership team within 48 hours to review this ${source} research. Identify 2-3 specific findings that challenge your current AI roadmap or budget assumptions.`,
      `Audit your existing AI tools and workflows against the benchmarks in this research. Document gaps in capability, governance, or ROI measurement that require immediate attention.`,
      `Create a 30/60/90 day action plan that addresses the top 2 strategic risks or opportunities identified. Assign ownership and success metrics for each initiative.`,
      `Share this research with your board or executive committee as a briefing document. Use it to frame upcoming budget requests or organizational restructuring proposals.`,
      `Schedule peer benchmark calls with 2-3 other CMOs in your network. Compare how they're interpreting these findings and what actions they're taking in response.`
    );
  } else if (pillar === 'brand_performance') {
    moves.push(
      `Your Monday move: Review this ${source} research with your brand and performance leads. Map the findings to your current attribution model and identify measurement blind spots.`,
      `Conduct a 90-minute working session with finance and analytics to stress-test your current brand investment thesis against these findings. Quantify potential risk exposure.`,
      `Build a scenario model showing how the trends in this research could impact your brand equity or performance metrics over the next 2-4 quarters.`,
      `Draft a one-page POV for your CEO or CFO explaining how this research validates or challenges your current brand-performance allocation strategy.`,
      `Identify 1-2 quick-win tests you can run in Q1/Q2 to validate the key hypotheses from this research in your own business context.`
    );
  } else if (pillar === 'competitive_intel') {
    moves.push(
      `Immediately brief your executive team on competitive positioning implications from this ${source} research. Highlight any share shifts or strategic moves that could threaten your market position.`,
      `Update your competitive battle cards with new data points and strategic positioning insights from this research. Share updated cards with sales and customer success teams.`,
      `Launch a competitive deep-dive with your strategy team to map how competitors are likely responding to the trends in this research. Identify defensive and offensive plays.`,
      `Schedule quarterly competitive reviews where you systematically evaluate new research like this against your competitive strategy. Make this a standing operating rhythm.`,
      `Create an internal brief synthesizing the top 3 competitive threats and top 2 offensive opportunities from this research. Circulate to leadership and request feedback within 5 business days.`
    );
  } else if (pillar === 'media_trends') {
    moves.push(
      `Convene your media planning and buying teams to review this ${source} research against your current media mix and channel allocation strategy.`,
      `Audit your media budget allocation for the next 2 quarters. Identify any channels or tactics that this research suggests are becoming over- or under-weighted relative to performance.`,
      `Request a revised media plan scenario from your agency or internal team that incorporates the trends and benchmarks from this research. Compare projected ROI and risk profiles.`,
      `Share this research with your agency partners and demand a written POV on how it impacts your joint strategy. Use their response to evaluate strategic alignment.`,
      `Create a watchlist of emerging media channels or tactics flagged in this research. Assign someone to monitor these monthly and report back on when to pilot or scale.`
    );
  } else {
    // Generic strategic moves for other pillars
    moves.push(
      `Your Monday move: Review this ${source} research with your leadership team and identify 1-2 areas where these insights challenge your current strategy.`,
      `Audit your current approach against the key findings and create a 30/60/90 day action plan for any gaps identified.`,
      `Create an internal brief synthesizing the top 3 strategic implications from this research. Circulate to leadership with specific recommendations.`,
      `Share these insights with your CMO peer network and benchmark how other organizations are responding to these trends.`,
      `Schedule a follow-up working session in 2 weeks to review progress on actions taken in response to this research.`
    );
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
 * Clean text from Notion artifacts (metadata, status fields, etc.)
 */
function cleanNotionText(text) {
  if (!text) return '';

  let cleaned = text;

  // Remove status/assignment artifacts
  cleaned = cleaned.replace(/✅\s*ASSIGNED:\s*[A-Za-z_]+/gi, '');
  cleaned = cleaned.replace(/REASONING:\s*/gi, '');
  cleaned = cleaned.replace(/\bASSIGNED:\s*[A-Za-z_]+/gi, '');

  // Remove checkbox symbols
  cleaned = cleaned.replace(/[✅✓☑]/g, '');

  // Clean up multiple spaces and line breaks
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove leading/trailing whitespace and punctuation artifacts
  cleaned = cleaned.replace(/^[:\-\s]+/, '').replace(/[:\-\s]+$/, '');

  return cleaned;
}

/**
 * Normalize source names to use only the primary platform
 * Removes compound attributions like "+ Harvard", "+ Stanford", etc.
 * Also standardizes "Perplexity AI" to "Perplexity"
 */
function normalizeSourceName(sourceName) {
  if (!sourceName) return '';

  // Remove compound attributions (e.g., "Perplexity AI + Harvard" → "Perplexity AI")
  let cleanedSource = sourceName
    .replace(/\s*\+\s*Harvard/gi, '')
    .replace(/\s*\+\s*Stanford/gi, '')
    .replace(/\s*\+\s*MIT/gi, '')
    .replace(/\s*\+\s*[A-Z][a-z]+\s+University/gi, '')
    .trim();

  // Standardize "Perplexity AI" to "Perplexity"
  if (cleanedSource === 'Perplexity AI') {
    cleanedSource = 'Perplexity';
  }

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
  const rawNotesText = extractPlainText(props['Excerpts / Notes']?.rich_text);
  const rawKeyStat = extractPlainText(props['Key Stat']?.rich_text);

  // Clean Notion artifacts from extracted text
  const notesText = cleanNotionText(rawNotesText);
  const keyStat = cleanNotionText(rawKeyStat);

  // Create excerpt (use Key Stat if available, otherwise first sentence of notes)
  let excerpt = keyStat || '';
  if (!excerpt && notesText) {
    const firstSentence = notesText.match(/[^.!?]+[.!?]+/);
    excerpt = firstSentence ? firstSentence[0].trim() : notesText.substring(0, 150);
  }

  // Extract signals (pass keyStat for richer content)
  const rawSignals = extractSignals(notesText, keyStat, source);
  // Clean signals to remove any remaining artifacts
  const signals = rawSignals.map(s => cleanNotionText(s)).filter(s => s.length > 10);

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

  // Clean summary text
  summary = cleanNotionText(summary);

  // Ensure summary is substantial (at least 400 characters)
  if (summary.length < 400) {
    summary += `\n\nThis ${source} analysis represents primary research and data synthesis relevant to senior marketing decision-makers navigating AI adoption, attribution challenges, competitive positioning, and media strategy in 2026. The findings are grounded in industry data and provide actionable frameworks for immediate application.`;
  }

  // Infer pillar first (needed for generating moves)
  const pillar = inferPillar(title, excerpt, notesText);

  // Generate strategic moves based on pillar
  const moves = generateMoves(signals, source, pillar);

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
