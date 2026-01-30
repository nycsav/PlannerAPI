import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Terminal, ExternalLink } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { IntelligenceModalTerminal, IntelligencePayload } from './IntelligenceModalTerminal';

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

// Terminal-style pillar colors (more muted, technical)
const PILLAR_COLORS: Record<string, string> = {
  'ai_strategy': 'border-purple-500/50 bg-purple-500/10',
  'brand_performance': 'border-blue-500/50 bg-blue-500/10',
  'competitive_intel': 'border-orange-500/50 bg-orange-500/10',
  'media_trends': 'border-emerald-500/50 bg-emerald-500/10',
};

const PILLAR_TEXT_COLORS: Record<string, string> = {
  'ai_strategy': 'text-purple-400',
  'brand_performance': 'text-blue-400',
  'competitive_intel': 'text-orange-400',
  'media_trends': 'text-emerald-400',
};

const PILLAR_LABELS: Record<string, string> = {
  'ai_strategy': 'AI.STRAT',
  'brand_performance': 'BRAND.PERF',
  'competitive_intel': 'COMP.INTEL',
  'media_trends': 'MEDIA.TREND',
};

// Static fallback cards
const FALLBACK_INTELLIGENCE_CARDS: IntelligenceCard[] = [
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
    summary: 'Brands collecting zero-party data through interactive experiences achieve significantly higher engagement and conversion rates versus third-party cookie-based targeting.',
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
    summary: 'Amazon Ads, Walmart Connect, and Target Roundel command nearly two-thirds of the $65B retail media market. Brands are consolidating to 2-3 primary partners.',
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
    summary: 'Social commerce disrupts traditional e-commerce playbook as TikTok Shop achieves 340% YoY growth. Average conversion rates are 2.8x higher than Instagram Shopping.',
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
  }
];

export const DailyIntelligenceTerminal: React.FC = () => {
  const [cards, setCards] = useState<IntelligenceCard[]>(FALLBACK_INTELLIGENCE_CARDS);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<IntelligenceCard | null>(null);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);

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
        setCards(fetchedCards);
      }
    } catch (err) {
      console.error('Error fetching intelligence cards:', err);
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
      if (minutes < 1) return '00h';
      return `${minutes.toString().padStart(2, '0')}m`;
    }

    if (hours < 24) return `${hours.toString().padStart(2, '0')}h`;

    const days = Math.floor(hours / 24);
    return `${days.toString().padStart(2, '0')}d`;
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-20 bg-slate-800/50 rounded"></div>
              <div className="h-3 w-12 bg-slate-800/50 rounded"></div>
            </div>
            <div className="h-5 bg-slate-800/50 rounded mb-3 w-4/5"></div>
            <div className="h-5 bg-slate-800/50 rounded mb-4 w-3/5"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-800/50 rounded"></div>
              <div className="h-3 bg-slate-800/50 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => {
          const isFeatured = index === 0;

          return (
            <div
              key={card.id}
              className={`group relative bg-slate-900/30 border border-slate-800/50 hover:border-${card.pillar === 'ai_strategy' ? 'purple' : card.pillar === 'brand_performance' ? 'blue' : card.pillar === 'competitive_intel' ? 'orange' : 'emerald'}-500/30 rounded cursor-pointer transition-all duration-200 overflow-hidden ${
                isFeatured ? 'md:col-span-2 lg:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => handleKeyDown(e, card)}
              role="button"
              tabIndex={0}
              aria-label={`Read intelligence: ${card.title}`}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Featured badge */}
              {isFeatured && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500/20 border-l border-b border-orange-500/30">
                  <span className="font-mono text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                    ★ FEATURED
                  </span>
                </div>
              )}

              <div className={`relative p-6 ${isFeatured ? 'md:p-8' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 border rounded ${PILLAR_COLORS[card.pillar]}`}>
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${PILLAR_TEXT_COLORS[card.pillar]}`}>
                        {PILLAR_LABELS[card.pillar]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-600" />
                      <span className="font-mono text-[9px] text-slate-600">
                        {getTimeAgo(card.publishedAt)}
                      </span>
                    </div>
                  </div>

                  {card.type === 'hot_take' && (
                    <div className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded">
                      <span className="font-mono text-[9px] font-bold text-red-400 uppercase tracking-widest">
                        HOT
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className={`font-mono font-black text-white uppercase tracking-tight leading-tight mb-3 group-hover:${PILLAR_TEXT_COLORS[card.pillar]} transition-colors ${
                  isFeatured ? 'text-xl md:text-2xl' : 'text-base'
                }`}>
                  {card.title}
                </h3>

                {/* Summary */}
                <p className={`font-mono text-slate-400 leading-relaxed mb-4 ${
                  isFeatured ? 'text-sm' : 'text-xs line-clamp-2'
                }`}>
                  {card.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-slate-600" />
                    <span className="font-mono text-[9px] text-slate-600">
                      {card.sourceCount} SOURCES
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 group-hover:text-slate-400 transition-colors">
                    <span className="font-mono text-[9px]">READ</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section footer */}
      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <div className="flex items-center justify-center gap-3">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            AI-POWERED INTELLIGENCE STREAM
          </span>
          <span className="text-slate-700">•</span>
          <span className="font-mono text-xs text-slate-600">
            UPDATED DAILY AT 06:00 ET
          </span>
        </div>
      </div>

      {/* Intelligence Modal */}
      <IntelligenceModalTerminal
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
