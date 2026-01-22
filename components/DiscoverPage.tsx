import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { IntelligenceModal, IntelligencePayload } from './IntelligenceModal';

type DiscoverCard = {
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

type Pillar = {
  id: string;
  label: string;
  color: string;
};

const PILLARS: Pillar[] = [
  { id: 'all', label: 'All', color: 'bg-bureau-ink' },
  { id: 'ai_strategy', label: 'AI Strategy', color: 'bg-purple-500' },
  { id: 'brand_performance', label: 'Brand Performance', color: 'bg-blue-500' },
  { id: 'competitive_intel', label: 'Competitive Intel', color: 'bg-red-500' },
  { id: 'media_trends', label: 'Media Trends', color: 'bg-green-500' },
];

export const DiscoverPage: React.FC = () => {
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [heroCard, setHeroCard] = useState<DiscoverCard | null>(null);
  const [secondaryCards, setSecondaryCards] = useState<DiscoverCard[]>([]);
  const [hotTakes, setHotTakes] = useState<DiscoverCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<DiscoverCard | null>(null);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);

  useEffect(() => {
    fetchCards();
  }, [selectedPillar]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const cardsRef = collection(db, 'discover_cards');

      // Build query
      let q = query(
        cardsRef,
        orderBy('publishedAt', 'desc'),
        limit(20)
      );

      // Filter by pillar if not "all"
      if (selectedPillar !== 'all') {
        q = query(
          cardsRef,
          where('pillar', '==', selectedPillar),
          orderBy('publishedAt', 'desc'),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const fetchedCards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiscoverCard[];

      // Separate hero, secondary, and hot takes
      const briefs = fetchedCards.filter(c => c.type === 'brief');
      const takes = fetchedCards.filter(c => c.type === 'hot_take');

      setHeroCard(briefs[0] || null);
      setSecondaryCards(briefs.slice(1, 5));
      setHotTakes(takes);
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: Timestamp) => {
    const now = Date.now();
    const published = timestamp.toMillis();
    const diff = now - published;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getPillarColor = (pillar: string) => {
    return PILLARS.find(p => p.id === pillar)?.color || 'bg-gray-500';
  };

  const getPillarLabel = (pillar: string) => {
    return PILLARS.find(p => p.id === pillar)?.label || pillar;
  };

  const handleCardClick = (card: DiscoverCard) => {
    // Convert DiscoverCard to IntelligencePayload format
    const payload: IntelligencePayload = {
      query: card.title,
      summary: card.summary,
      keySignals: card.signals,
      movesForLeaders: card.moves,
      signals: [], // Discover cards don't have individual source URLs
    };

    setSelectedCard(card);
    setIntelligencePayload(payload);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bureau-surface">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bureau-signal border-t-transparent"></div>
          <p className="mt-4 text-bureau-slate">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  // Empty state - no cards available
  if (!loading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-bureau-surface flex items-center justify-center">
        <div className="text-center max-w-md app-padding-x">
          <h2 className="text-2xl font-bold text-bureau-ink mb-3">No intelligence yet</h2>
          <p className="text-bureau-slate">
            Fresh insights are generated daily. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bureau-surface">
      {/* Header */}
      <div className="border-b border-bureau-border bg-white sticky top-[80px] z-40">
        <div className="max-w-wide mx-auto app-padding-x py-6">
          <h1 className="font-display text-4xl font-black text-bureau-ink uppercase mb-4">
            Discover
          </h1>

          {/* Pillar Filters */}
          <div className="flex flex-wrap gap-2">
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(pillar.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedPillar === pillar.id
                    ? `${pillar.color} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pillar.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-wide mx-auto app-padding-x py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Left Column: Hero + Secondary Cards */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Hero Card */}
            {heroCard && (
              <div
                onClick={() => handleCardClick(heroCard)}
                className="bg-white rounded-xl border border-bureau-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Optional image thumbnail */}
                {heroCard.imageUrl && (
                  <div className="w-full h-48 bg-gray-100">
                    <img
                      src={heroCard.imageUrl}
                      alt={heroCard.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-lg">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`${getPillarColor(heroCard.pillar)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                      {getPillarLabel(heroCard.pillar)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-bureau-slate/60">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(heroCard.publishedAt)}
                    </span>
                    <span className="text-xs text-bureau-slate/60 bg-bureau-surface border border-bureau-border px-2 py-1 rounded">
                      🤖 AI-generated intelligence
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-bureau-ink mb-3 leading-tight">
                    {heroCard.title}
                  </h2>

                  <p className="text-base text-bureau-slate mb-4 leading-relaxed">
                    {heroCard.summary}
                  </p>

                  {/* Optional chart placeholder */}
                  {heroCard.chartData && (
                    <div className="mt-4 p-4 bg-bureau-surface border border-bureau-border rounded-lg">
                      <p className="text-xs text-bureau-slate/60 mb-2">Chart visualization coming soon</p>
                      <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                        <span className="text-sm text-bureau-slate/40">Chart data available</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-bureau-slate/60 mt-4">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {heroCard.sourceCount} sources
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Secondary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {secondaryCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="bg-white rounded-lg border border-bureau-border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  {/* Optional small thumbnail */}
                  {card.imageUrl && (
                    <div className="w-full h-32 bg-gray-100">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-md">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`${getPillarColor(card.pillar)} text-white text-xs font-bold px-2 py-1 rounded uppercase`}>
                        {getPillarLabel(card.pillar)}
                      </span>
                      <span className="text-xs text-bureau-slate/60">
                        {getTimeAgo(card.publishedAt)}
                      </span>
                      <span className="text-xs text-bureau-slate/60 bg-bureau-surface border border-bureau-border px-2 py-1 rounded">
                        🤖 AI
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-bureau-ink mb-2 leading-tight">
                      {card.title}
                    </h3>

                    <p className="text-sm text-bureau-slate line-clamp-2">
                      {card.summary}
                    </p>

                    {/* Optional chart indicator */}
                    {card.chartData && (
                      <div className="mt-2 p-2 bg-bureau-surface border border-bureau-border rounded text-center">
                        <span className="text-xs text-bureau-slate/60">📊 Includes chart data</span>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-bureau-slate/60">
                      {card.sourceCount} sources
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Personalization + Hot Takes */}
          <div className="space-y-lg">
            {/* Personalization Card */}
            <div className="bg-white rounded-lg border border-bureau-border p-lg">
              <h3 className="font-bold text-bureau-ink mb-3">Make it yours</h3>
              <p className="text-sm text-bureau-slate mb-4">
                Select topics to customize your Discover experience
              </p>

              <div className="space-y-2">
                {PILLARS.slice(1).map((pillar) => (
                  <label
                    key={pillar.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPillar === pillar.id || selectedPillar === 'all'}
                      onChange={() => setSelectedPillar(pillar.id)}
                      className="w-4 h-4 text-bureau-signal rounded focus:ring-bureau-signal"
                    />
                    <span className="text-sm text-bureau-slate">{pillar.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hot Takes */}
            {hotTakes.length > 0 && (
              <div className="bg-planner-orange/5 rounded-lg border border-planner-orange/20 p-lg">
                <h3 className="font-bold text-bureau-ink mb-3 flex items-center gap-2">
                  <span>🔥</span> Hot Takes
                </h3>
                <div className="space-y-3">
                  {hotTakes.map((take) => (
                    <div
                      key={take.id}
                      onClick={() => handleCardClick(take)}
                      className="border-l-2 border-planner-orange pl-3 cursor-pointer hover:bg-white/50 transition-colors p-2 -ml-2 rounded"
                    >
                      <h4 className="font-semibold text-sm text-bureau-ink mb-1">
                        {take.title}
                      </h4>
                      <p className="text-xs text-bureau-slate">
                        {take.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};
