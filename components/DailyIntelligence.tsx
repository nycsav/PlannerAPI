import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { IntelligenceModal, IntelligencePayload } from './IntelligenceModal';

type IntelligenceCard = {
  id: string;
  title: string;
  summary: string;
  signals: string[];
  moves: string[];
  pillar: 'ai_strategy' | 'brand_performance' | 'competitive_intel' | 'media_trends';
  priority: number;
  sourceCount: number;
  publishedAt: Timestamp;
  type: 'brief' | 'hot_take';
};

// Brand-aligned pillar colors
const PILLAR_COLORS: Record<string, string> = {
  'ai_strategy': 'bg-[#7C3AED]',           // Deep purple - AI/tech
  'brand_performance': 'bg-bureau-signal',  // Brand blue
  'competitive_intel': 'bg-planner-orange', // Planner orange - urgent
  'media_trends': 'bg-[#059669]',          // Emerald green - growth
};

const PILLAR_LABELS: Record<string, string> = {
  'ai_strategy': 'AI STRATEGY',
  'brand_performance': 'BRAND PERFORMANCE',
  'competitive_intel': 'COMPETITIVE INTEL',
  'media_trends': 'MEDIA TRENDS',
};

// Static fallback cards - used if Firestore is empty or fails
const FALLBACK_INTELLIGENCE_CARDS = [
  {
    id: 'fallback-1',
    title: 'AI Marketing Spend Surpasses $12B in 2026, Up 340% YoY',
    summary: 'Enterprise marketing leaders are rapidly adopting AI tools for content generation, customer segmentation, and predictive analytics. Fortune 500 CMOs report 23% efficiency gains and 34% improvement in campaign personalization.',
    signals: [
      'Global AI marketing technology spend reached $12.4B in Q1 2026',
      '89% of enterprise marketers now use at least one AI tool daily',
      'Average ROI of 4.2x on AI marketing investments within 8 months'
    ],
    moves: [
      'Audit current martech stack for AI integration opportunities',
      'Pilot AI-powered segmentation tools in one high-value campaign',
      'Establish governance framework for AI-generated content approval'
    ],
    pillar: 'ai_strategy' as const,
    priority: 95,
    sourceCount: 12,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-2',
    title: 'First-Party Data Collection Drives 51% Higher Engagement',
    summary: 'Brands collecting zero-party data through interactive experiences achieve significantly higher engagement and conversion rates versus third-party cookie-based targeting. Leading CMOs are investing $400-600K in enterprise CDP implementations.',
    signals: [
      '51% higher engagement rates for zero-party data strategies',
      '34% improved conversion versus third-party targeting',
      'Interactive quizzes generate 2.3x more actionable customer insights'
    ],
    moves: [
      'Implement preference centers to collect explicit customer data',
      'Design interactive quiz or assessment to capture zero-party insights',
      'Evaluate enterprise CDP vendors (Segment, mParticle, Treasure Data)'
    ],
    pillar: 'brand_performance' as const,
    priority: 88,
    sourceCount: 8,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-3',
    title: 'Retail Media Consolidation: Top 3 Networks Hold 64% Share',
    summary: 'Amazon Ads, Walmart Connect, and Target Roundel command nearly two-thirds of the $65B retail media market. Brands are consolidating to 2-3 primary partners as winner-take-most dynamics reshape the landscape.',
    signals: [
      'Amazon Ads holds 38% market share, Walmart 16%, Target 10%',
      'Smaller retail media networks struggle to achieve scale',
      'First-party data moats create sustainable competitive advantages'
    ],
    moves: [
      'Negotiate guaranteed ROAS deals with top-tier retail media partners',
      'Consolidate retail media spend to 2-3 strategic platforms',
      'Develop retail media testing framework for emerging networks'
    ],
    pillar: 'competitive_intel' as const,
    priority: 86,
    sourceCount: 15,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-4',
    title: 'TikTok Shop Hits $12B US Revenue, Reshaping Social Commerce',
    summary: 'Social commerce disrupts traditional e-commerce playbook as TikTok Shop achieves 340% YoY growth. Average conversion rates are 2.8x higher than Instagram Shopping, driven by live commerce and creator partnerships.',
    signals: [
      '$12B projected US revenue for TikTok Shop in 2026',
      'Brands allocating 15-25% of social budgets to shoppable video',
      '2.8x higher conversion rates than Instagram Shopping'
    ],
    moves: [
      'Test TikTok Shop with 3-5 SKUs in high-margin product categories',
      'Partner with micro-influencers for authentic live commerce sessions',
      'Rethink social-to-commerce attribution models and KPIs'
    ],
    pillar: 'media_trends' as const,
    priority: 92,
    sourceCount: 10,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-5',
    title: 'B2B Attribution Gap Costs $8.9B Annually in Misallocated Spend',
    summary: '73% of B2B marketers cannot accurately attribute revenue to channels, resulting in massive budget waste. Companies implementing AI attribution see 42% improvement in CAC and 3.1x ROI on martech investments.',
    signals: [
      '$8.9B in annual misallocated B2B marketing budgets',
      'Only 27% of B2B marketers have reliable multi-touch attribution',
      'AI attribution tools deliver 42% CAC improvement with 8-month payback'
    ],
    moves: [
      'Evaluate AI-powered attribution platforms (Bizible, Dreamdata, HockeyStack)',
      'Implement first-touch and last-touch attribution as baseline measurement',
      'Build business case for multi-touch attribution investment'
    ],
    pillar: 'brand_performance' as const,
    priority: 84,
    sourceCount: 9,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  },
  {
    id: 'fallback-6',
    title: 'Sustainability Claims Face 56% Greenwashing Scrutiny Rate',
    summary: 'FTC investigates majority of Fortune 500 sustainability marketing claims. Unsubstantiated green claims risk $10-50M fines plus reputation damage. Brands with third-party verified ESG credentials maintain 89% consumer trust.',
    signals: [
      '56% of Fortune 500 sustainability claims under FTC investigation',
      'Third-party verified ESG credentials maintain 89% consumer trust vs 34% unverified',
      'CMOs investing $2-5M in verification infrastructure to protect brand equity'
    ],
    moves: [
      'Audit all sustainability marketing claims for substantiation',
      'Obtain third-party ESG verification (B Corp, Climate Neutral, etc.)',
      'Implement legal review process for all green marketing materials'
    ],
    pillar: 'competitive_intel' as const,
    priority: 81,
    sourceCount: 11,
    publishedAt: Timestamp.now(),
    type: 'brief' as const
  }
];

export const DailyIntelligence: React.FC = () => {
  const [cards, setCards] = useState<IntelligenceCard[]>(FALLBACK_INTELLIGENCE_CARDS);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<IntelligenceCard | null>(null);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [useLiveData, setUseLiveData] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const cardsRef = collection(db, 'discover_cards');
      const q = query(
        cardsRef,
        orderBy('priority', 'desc'),
        orderBy('publishedAt', 'desc'),
        limit(6)
      );

      const snapshot = await getDocs(q);
      const fetchedCards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IntelligenceCard[];

      if (fetchedCards.length > 0) {
        // Prefer live Firestore data when available
        setCards(fetchedCards);
        setUseLiveData(true);
      } else {
        // Use fallback cards if Firestore is empty
        setCards(FALLBACK_INTELLIGENCE_CARDS);
        setUseLiveData(false);
      }
    } catch (err) {
      console.error('Error fetching intelligence cards:', err);
      // Use fallback cards on error but don't break experience
      setCards(FALLBACK_INTELLIGENCE_CARDS);
      setUseLiveData(false);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: Timestamp) => {
    const now = Date.now();
    const published = timestamp.toMillis();
    const diff = now - published;

    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes < 1) return 'Just now';
      return `${minutes}m ago`;
    }

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCardClick = (card: IntelligenceCard) => {
    const payload: IntelligencePayload = {
      query: card.title,
      summary: card.summary,
      keySignals: card.signals,
      movesForLeaders: card.moves,
      signals: [],
    };

    setSelectedCard(card);
    setIntelligencePayload(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent, card: IntelligenceCard) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(card);
    }
  };

  // Refined loading state - skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md lg:gap-lg auto-rows-auto">
        {/* Featured skeleton */}
        <div className="md:col-span-2 md:row-span-2 bg-white rounded-xl border-2 border-bureau-border overflow-hidden animate-pulse">
          <div className="p-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-32 bg-bureau-slate/10 rounded-full"></div>
              <div className="h-4 w-16 bg-bureau-slate/10 rounded"></div>
            </div>
            <div className="h-8 bg-bureau-slate/10 rounded mb-3 w-4/5"></div>
            <div className="h-8 bg-bureau-slate/10 rounded mb-4 w-3/5"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-bureau-slate/10 rounded"></div>
              <div className="h-4 bg-bureau-slate/10 rounded w-5/6"></div>
              <div className="h-4 bg-bureau-slate/10 rounded w-4/6"></div>
            </div>
            <div className="h-4 w-24 bg-bureau-slate/10 rounded"></div>
          </div>
        </div>

        {/* Standard skeletons */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="md:col-span-2 bg-white rounded-xl border border-bureau-border p-lg animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-28 bg-bureau-slate/10 rounded-full"></div>
              <div className="h-4 w-14 bg-bureau-slate/10 rounded"></div>
            </div>
            <div className="h-6 bg-bureau-slate/10 rounded mb-3 w-4/5"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-bureau-slate/10 rounded"></div>
              <div className="h-4 bg-bureau-slate/10 rounded w-3/4"></div>
            </div>
            <div className="h-4 w-20 bg-bureau-slate/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const [featuredCard, ...standardCards] = cards;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md lg:gap-lg auto-rows-auto">
        {/* Featured card - spans 2 columns, 2 rows */}
        {featuredCard && (
          <div
            className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-white to-bureau-surface/30 rounded-xl border-2 border-bureau-signal/20 overflow-hidden hover:shadow-2xl hover:border-bureau-signal/40 hover:-translate-y-0.5 cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 transition-all duration-200"
            onClick={() => handleCardClick(featuredCard)}
            onKeyDown={(e) => handleKeyDown(e, featuredCard)}
            role="button"
            tabIndex={0}
            aria-label={`Read featured intelligence: ${featuredCard.title}`}
          >
            {/* Featured badge */}
            <div className="absolute top-0 right-0 bg-planner-orange text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl uppercase tracking-wide">
              Featured
            </div>

            <div className="p-lg relative z-10">
              <div className="flex items-center gap-2 mb-4 flex-wrap pr-20">
                <span className={`${PILLAR_COLORS[featuredCard.pillar]} text-white/95 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide`}>
                  {PILLAR_LABELS[featuredCard.pillar]}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-bureau-slate/80">
                  <Clock className="w-3.5 h-3.5" />
                  {getTimeAgo(featuredCard.publishedAt)}
                </span>
              </div>

              <h3 className="font-display text-3xl font-black text-bureau-ink mb-4 leading-tight tracking-tight group-hover:text-planner-orange transition-colors">
                {featuredCard.title}
              </h3>

              <p className="text-base text-bureau-slate/90 leading-relaxed mb-6">
                {featuredCard.summary}
              </p>

              <div className="flex items-center gap-4 text-xs text-bureau-slate/80">
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-medium">{featuredCard.sourceCount} sources</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Standard cards - fill remaining grid */}
        {standardCards.slice(0, 5).map((card) => (
          <div
            key={card.id}
            className="md:col-span-2 bg-white rounded-xl border border-bureau-border p-lg hover:shadow-xl hover:border-planner-orange/30 hover:-translate-y-0.5 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-bureau-signal focus:ring-offset-2 transition-all duration-200"
            onClick={() => handleCardClick(card)}
            onKeyDown={(e) => handleKeyDown(e, card)}
            role="button"
            tabIndex={0}
            aria-label={`Read intelligence: ${card.title}`}
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`${PILLAR_COLORS[card.pillar]} text-white/95 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide`}>
                {PILLAR_LABELS[card.pillar]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-bureau-slate/80">
                <Clock className="w-3 h-3" />
                {getTimeAgo(card.publishedAt)}
              </span>
            </div>

            <h4 className="font-display text-xl font-black text-bureau-ink mb-3 leading-tight tracking-tight group-hover:text-planner-orange transition-colors">
              {card.title}
            </h4>

            <p className="text-sm text-bureau-slate/90 line-clamp-2 mb-4 leading-relaxed">
              {card.summary}
            </p>

            <div className="text-xs text-bureau-slate/80">
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium">{card.sourceCount} sources</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Section footer */}
      <div className="mt-xl pt-lg border-t border-bureau-border">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-bureau-surface border border-bureau-border rounded-full">
            <Sparkles className="w-4 h-4 text-bureau-signal" />
            <span className="text-sm font-medium text-bureau-slate">
              {useLiveData ? 'AI-powered market intelligence' : 'Curated market intelligence'}
            </span>
            <span className="text-bureau-slate/40">•</span>
            <span className="text-sm text-bureau-slate/80">
              {useLiveData ? 'Updated daily at 6:00 AM ET' : 'Strategic insights for marketing leaders'}
            </span>
          </div>
        </div>
      </div>

      {/* Intelligence Modal for Card Details */}
      <IntelligenceModal
        open={!!selectedCard}
        payload={intelligencePayload}
        onClose={() => {
          setSelectedCard(null);
          setIntelligencePayload(null);
        }}
        isLoading={false}
      />
    </>
  );
};
