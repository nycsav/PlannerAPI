import React, { useState } from 'react';
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
                    trackPillarFilter(null, selectedPillar);
                    setSelectedPillar(null);
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${!selectedPillar
                      ? 'bg-slate-900 dark:bg-planner-orange text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  All
                </button>
                {(Object.keys(PILLAR_CONFIG) as Pillar[]).map((pillar) => (
                  <button
                    key={pillar}
                    onClick={() => {
                      const newPillar = selectedPillar === pillar ? null : pillar;
                      trackPillarFilter(newPillar, selectedPillar);
                      setSelectedPillar(newPillar);
                    }}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                      ${selectedPillar === pillar
                        ? 'text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                    `}
                    style={selectedPillar === pillar ? { backgroundColor: PILLAR_CONFIG[pillar].color } : {}}
                  >
                    {PILLAR_CONFIG[pillar].label}
                  </button>
                ))}
              </div>
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-gray-100 border border-slate-200 dark:border-slate-700 rounded-full hover:border-slate-300 dark:hover:border-planner-orange transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-bureau-signal dark:focus:ring-planner-orange focus:ring-offset-2"
                aria-label="Refresh intelligence cards"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </div>

          {/* Cards slider */}
          <ContentSlider
            cards={selectedPillar ? filteredCards : discoverCards}
            onCardClick={handleCardClick}
          />
        </div>

        {/* Status footer */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-gray-300">
            {isLiveData ? 'Live data' : 'Demo mode'} · {cards.length} briefings · Updated 6:00 AM ET
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
