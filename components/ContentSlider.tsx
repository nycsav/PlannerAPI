import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ContentSliderCard } from './ContentSliderCard';
import { IntelligenceCard } from '../utils/dashboardMetrics';

interface ContentSliderProps {
  cards: IntelligenceCard[];
  onCardClick: (card: IntelligenceCard) => void;
  title?: string;
  subtitle?: string;
}

export const ContentSlider: React.FC<ContentSliderProps> = ({
  cards,
  onCardClick,
  title = 'Daily Intelligence',
  subtitle
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [cards]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Intelligence Loading</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Fresh market analysis updates daily at 6:00 AM ET</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation header */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200 ease-out active:scale-95
            ${canScrollLeft
              ? 'bg-slate-900/30 hover:bg-slate-800/70 border border-slate-700/70 text-slate-200 hover:text-white hover:shadow-md hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2 focus:ring-offset-transparent'
              : 'bg-slate-900/10 border border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50 pointer-events-none'
            }
          `}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-200 ease-out active:scale-95
            ${canScrollRight
              ? 'bg-slate-900/30 hover:bg-slate-800/70 border border-slate-700/70 text-slate-200 hover:text-white hover:shadow-md hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2 focus:ring-offset-transparent'
              : 'bg-slate-900/10 border border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50 pointer-events-none'
            }
          `}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Cards Container */}
      <div className="relative -mx-4">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 px-4"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              style={{ scrollSnapAlign: 'start' }}
              className="
                flex-shrink-0
                w-[calc((100%-40px)/3)]
                lg:w-[calc((100%-40px)/3)]
                xl:w-[calc((100%-60px)/4)]
                2xl:w-[calc((100%-80px)/5)]
                min-w-[280px]
                max-w-[320px]
              "
            >
              <ContentSliderCard
                card={card}
                onClick={() => onCardClick(card)}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Gradient fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />
        )}
      </div>
    </div>
  );
};
