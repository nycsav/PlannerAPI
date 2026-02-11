const admin = require('firebase-admin');
const serviceAccount = require('../plannerapi-firebase-adminsdk.json'); // adjust path as needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleCards = [
  {
    title: "The 94% Problem: McKinsey Says Most Marketers Aren't Ready for Google's AI Overviews",
    macroAnchor: "McKinsey's 2026 survey finds only 6% of marketing orgs reach AI maturity, but those teams see 22% efficiency gains.",
    microSignal: "Today, Google expanded AI Overviews to cover 40% of commercial queries in key retail and travel categories.",
    tension: "The gap between AI-mature and laggard teams is widening as search real estate shrinks.",
    summary: "McKinsey's latest data shows that only a small minority of marketing teams have the AI maturity to respond quickly to platform shifts. Google's expansion of AI Overviews increases pressure on underinvested teams whose content is now harder to find. What this means for CMOs is that waiting on AI strategy now carries direct revenue risk.",
    signals: ["6% of marketing orgs at AI maturity", "22% efficiency gains for AI-mature teams", "40% of commercial queries now show AI Overviews in key verticals"],
    moves: [
      "Your Monday move: Audit your top 25 commercial search queries and check how many trigger AI Overviews and which competitors are being surfaced.",
      "Ask your analytics lead to quantify revenue exposure from queries now dominated by AI Overviews.",
      "Identify 3-5 pages to rework with AI-aware content patterns over the next two weeks."
    ],
    pillar: "ai_strategy",
    source: "McKinsey & Company",
    sourceUrl: "https://www.mckinsey.com/...",
    sourceTier: 1,
    priority: 90,
    type: "brief",
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now()
  }
];

async function pushCards() {
  try {
    for (const card of sampleCards) {
      await db.collection('discover_cards').add(card);
      console.log(`Pushed: ${card.title}`);
    }
    console.log('\nAll cards pushed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

pushCards();
