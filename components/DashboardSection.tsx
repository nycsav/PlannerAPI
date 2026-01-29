import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ContentSlider } from './ContentSlider';
import { FeaturedIntelligence } from './FeaturedIntelligence';
import { IntelligenceModal, IntelligencePayload } from './IntelligenceModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { IntelligenceCard, Pillar, PILLAR_CONFIG } from '../utils/dashboardMetrics';
import { useAnalytics } from '../hooks/useAnalytics';

export const DashboardSection: React.FC = () => {
  const { cards, loading, isLiveData, refetch } = useDashboardData({ cardLimit: 12 });
  const [selectedCard, setSelectedCard] = useState<IntelligenceCard | null>(null);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [flashUpdated, setFlashUpdated] = useState(false);
  const { trackPillarFilter } = useAnalytics();

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

  // Filter cards by selected pillar
  const filteredCards = selectedPillar
    ? cards.filter(card => card.pillar === selectedPillar)
    : cards;

  const countsByPillar = useMemo(() => {
    const counts: Record<string, number> = { all: cards.length };
    (Object.keys(PILLAR_CONFIG) as Pillar[]).forEach(p => {
      counts[p] = cards.filter(c => c.pillar === p).length;
    });
    return counts as Record<'all' | Pillar, number>;
  }, [cards]);

  const handleFilterChange = (next: Pillar | null) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      trackPillarFilter(next, selectedPillar);
      setSelectedPillar(next);
      window.setTimeout(() => setIsTransitioning(false), 160);
    }, 110);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.resolve(refetch());
      setFlashUpdated(true);
      window.setTimeout(() => setFlashUpdated(false), 700);
    } finally {
      window.setTimeout(() => setIsRefreshing(false), 520);
    }
  };

  useEffect(() => {
    // Ensure we don't get stuck in a dimmed state
    if (!isTransitioning) return;
    const id = window.setTimeout(() => setIsTransitioning(false), 500);
    return () => window.clearTimeout(id);
  }, [isTransitioning]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-24 bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-[320px] flex-shrink-0">
              <div className="h-[280px] bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get featured cards (top 4 for the featured section)
  const featuredCards = cards.slice(0, 4);
  // Get remaining cards for the discover slider
  const discoverCards = selectedPillar ? filteredCards : cards.slice(4);

  return (
    <>
      <div className="space-y-8">
        {/* Featured Intelligence - Chart of the Day */}
        {!selectedPillar && featuredCards.length > 0 && (
          <FeaturedIntelligence
            cards={featuredCards}
            onCardClick={handleCardClick}
          />
        )}

        {/* Discover Section */}
        <div className="space-y-5">
          {/* Filter bar */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl md:text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight" style={{ fontStyle: 'italic', fontWeight: 900 }}>
              {selectedPillar ? PILLAR_CONFIG[selectedPillar].label : 'Discover More'}
            </h3>

            {/* Pillar filters + Refresh */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleFilterChange(null);
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-out
                    border
                    ${!selectedPillar
                      ? 'bg-planner-orange text-white border-transparent scale-[1.02]'
                      : 'bg-transparent border-slate-300/30 text-slate-600 dark:text-gray-300 hover:bg-slate-800/40 hover:text-white'
                    }
                  `}
                >
                  <span className="inline-flex items-center gap-2">
                    All
                    <span className={`
                      text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${!selectedPillar ? 'bg-white/20 text-white' : 'bg-slate-800/40 text-slate-300'}
                    `}>
                      {countsByPillar.all}
                    </span>
                  </span>
                </button>
                {(Object.keys(PILLAR_CONFIG) as Pillar[]).map((pillar) => (
                  <button
                    key={pillar}
                    onClick={() => {
                      const next = selectedPillar === pillar ? null : pillar;
                      handleFilterChange(next);
                    }}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-out
                      border
                      ${selectedPillar === pillar
                        ? 'text-white border-transparent scale-[1.02]'
                        : 'bg-transparent border-slate-300/30 text-slate-600 dark:text-gray-300 hover:bg-slate-800/40 hover:text-white'
                      }
                    `}
                    style={selectedPillar === pillar ? { backgroundColor: PILLAR_CONFIG[pillar].color } : {}}
                  >
                    <span className="inline-flex items-center gap-2">
                      {PILLAR_CONFIG[pillar].label}
                      <span className={`
                        text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${selectedPillar === pillar ? 'bg-white/20 text-white' : 'bg-slate-800/40 text-slate-300'}
                      `}>
                        {countsByPillar[pillar]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100 border border-slate-200 dark:border-slate-700 rounded-full hover:border-slate-300 dark:hover:border-planner-orange transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Refresh intelligence cards"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Cards slider */}
          <div className={`transition-opacity duration-200 ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <ContentSlider
              cards={selectedPillar ? filteredCards : discoverCards}
              onCardClick={handleCardClick}
            />
          </div>
        </div>

        {/* Status footer */}
        <div className="text-center pt-3 border-t border-slate-800/70">
          <p className={`text-[14px] transition-colors duration-200 ease-out ${flashUpdated ? 'text-planner-orange' : 'text-slate-400'}`}>
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              {isLiveData ? 'Live data' : 'Demo mode'} · {cards.length} briefings · Updated 6:00 AM ET
            </span>
          </p>
        </div>
      </div>

      {/* Intelligence Modal */}
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
