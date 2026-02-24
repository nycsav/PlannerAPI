/**
 * Add two discover cards to Firestore discover_cards collection (plannerapi-prod)
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'plannerapi-prod' });
}

const db = admin.firestore();
const now = admin.firestore.Timestamp.now();

const CARD_1 = {
  title: "The Window Is Closing On Human-In-The-Loop: Anthropic's Agent Autonomy Data",
  summary: "Anthropic's February 2026 analysis of nearly 1M real-world agent interactions finds that experienced Claude Code users auto-approve agent actions in over 40% of sessions — double the rate of new users — while simultaneously interrupting more often. The data reveals a trust accumulation curve: teams aren't abandoning oversight, they're shifting from action-by-action approval to exception-based intervention. For CMOs deploying AI agents in marketing workflows, the implication is clear — governance frameworks built for 'approve every step' will create friction without producing safety.",
  macroAnchor: "Anthropic's analysis of 998,481 real-world API tool calls finds 80% of agent actions include at least one safeguard, and only 0.8% of actions are irreversible.",
  microSignal: "Among Claude Code's most advanced users (750+ sessions), auto-approve rates exceed 40% while interrupt rates also rise — shifting from sequential approval to active monitoring.",
  tension: "Pre-deployment evaluations show Claude can handle tasks a human would take 5 hours on, yet real-world sessions average just 42 minutes — most teams are under-utilizing what models can already do.",
  signals: [
    "99.9th percentile Claude Code session duration doubled from <25 min to >45 min Oct 2025–Jan 2026 (Anthropic)",
    "Auto-approve rate grows from 20% (new users) to 40%+ (experienced users) — trust accumulates gradually",
    "Software engineering = 49% of all agentic API traffic; marketing workflows are an emerging share",
    "On complex tasks, Claude initiates clarification stops 2x more often than humans interrupt it"
  ],
  moves: [
    "Your next move: Audit your AI agent governance policy — if it requires human approval on every action, replace it with an exception-based oversight model before your team hits friction and abandons the tool.",
    "Map your marketing workflows by reversibility: email sends, budget changes, published content = high-risk; research and drafting = low-risk. Set autonomy levels accordingly.",
    "Share the Anthropic deployment overhang finding with your CFO: your teams likely have access to more AI capability than they're using."
  ],
  pillar: "ai_strategy",
  type: "brief",
  source: "Anthropic",
  sourceUrl: "https://www.anthropic.com/research/measuring-agent-autonomy",
  sourceTier: 2,
  priority: 91,
  publishedAt: now,
  createdAt: now,
  contentSource: "notion",
  validationScore: 90,
  notionPageId: "30c0bdff-e59e-812f-a6f0-da3a8685347b"
};

const CARD_2 = {
  title: "Two Camps Are Emerging: AI Vendors With Capital Staying Power vs. The Rest",
  summary: "JP Morgan's February 2026 investment analysis finds VC funding in 2025 concentrated into fewer, larger deals — with AI and defense capturing the majority. McKinsey's parallel data shows only 1 in 4 companies deploying AI is capturing real economic value, while AI spend is shifting from model training to inference workloads. For CMOs evaluating martech vendors, the signal is unambiguous: a shakeout is coming, and selecting AI tools from undercapitalized vendors is a budget risk disguised as a technology decision.",
  macroAnchor: "JP Morgan's Feb 2026 analysis confirms 2025 VC capital concentrated into fewer, larger AI deals — the long tail of AI marketing vendors faces structural funding pressure.",
  microSignal: "McKinsey data shows AI adoption jumped from 55% to 78% in one year, but only 25% of organizations are capturing measurable economic value.",
  tension: "CMOs are under pressure to show ROI from AI investments while managing martech sprawl — but the vendors they're consolidating around may not survive the current funding contraction.",
  signals: [
    "2025 VC: capital concentrated in fewer, larger deals; AI and defense captured majority of funding (JP Morgan, Feb 2026)",
    "AI adoption: 55% → 78% in one year, but only 25% of orgs capture real economic value (McKinsey)",
    "AI/martech spend = 19% of marketing budgets now, projected to hit 31.7% within 5 years (CMO Survey)",
    "Martech sprawl + budget pressure are the top co-occurring pain points among CMO_Mid-Market segment"
  ],
  moves: [
    "Your next move: Run a vendor viability audit on every AI tool in your martech stack — check funding rounds, runway signals, and whether the vendor has enterprise customers with renewal history.",
    "Consolidate around platforms with demonstrable infrastructure staying power rather than point solutions built on models that may deprecate.",
    "Brief your procurement team: AI vendor contracts signed in 2024–2025 may need renegotiation as market consolidation accelerates."
  ],
  pillar: "competitive_intel",
  type: "hot_take",
  source: "J.P. Morgan",
  sourceUrl: "https://www.linkedin.com/posts/jpmorganglobalbanking_click-learn-more-to-read-the-full-analysis-activity-7421935099836862464",
  sourceTier: 1,
  priority: 87,
  publishedAt: now,
  createdAt: now,
  contentSource: "notion",
  validationScore: 88,
  notionPageId: "2fc0bdff-e59e-8130-abbd-fb8de5037450"
};

async function addCards() {
  try {
    const ref1 = await db.collection('discover_cards').add(CARD_1);
    console.log('CARD 1 added. Document ID:', ref1.id);

    const ref2 = await db.collection('discover_cards').add(CARD_2);
    console.log('CARD 2 added. Document ID:', ref2.id);

    console.log('\nDone. Document IDs:');
    console.log('  Card 1:', ref1.id);
    console.log('  Card 2:', ref2.id);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  process.exit(0);
}

addCards();
