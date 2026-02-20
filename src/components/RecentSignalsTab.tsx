import React, { useState } from 'react';

export interface SignalCard {
  id: string;
  date: string;       // formatted from publishedAt for tab grouping
  pillar: string;
  title: string;
  summary: string;
  source: string;
  signals?: string[];
  moves?: string[];
  sources?: string[];
}

export interface RecentSignalsTabProps {
  cards: SignalCard[];
  loading?: boolean;
}

const PILLAR_LABELS: Record<string, string> = {
  ai_strategy:      'AI Strategy',
  brand_performance:'Brand',
  competitive_intel:'Competitive',
  media_trends:     'Media Trends',
};

const PILLAR_COLORS: Record<string, string> = {
  ai_strategy:      '#E67E22',
  brand_performance:'#2980B9',
  competitive_intel:'#8E44AD',
  media_trends:     '#27AE60',
};

function getDateTabs(cards: SignalCard[]): string[] {
  const seen = new Set<string>();
  const tabs: string[] = [];
  for (const c of cards) {
    if (!seen.has(c.date)) { seen.add(c.date); tabs.push(c.date); }
  }
  return tabs;
}

const SkeletonCard: React.FC = () => (
  <div className="bg-p-navy-card p-5 flex flex-col gap-3 animate-pulse" style={{ border: '1px solid #2A3F5F', borderLeft: '3px solid #2A3F5F' }}>
    <div className="h-3 bg-p-border rounded w-1/3" />
    <div className="h-4 bg-p-border rounded w-full" />
    <div className="h-4 bg-p-border rounded w-4/5" />
    <div className="h-3 bg-p-border rounded w-1/2" />
  </div>
);

export const RecentSignalsTab: React.FC<RecentSignalsTabProps> = ({ cards, loading = false }) => {
  const tabs = getDateTabs(cards);
  const [activeTab, setActiveTab] = useState(0);

  const activeDate = tabs[activeTab];
  const visibleCards = cards.filter((c) => c.date === activeDate);

  return (
    <section
      id="recent-signals"
      className="w-full min-h-[580px] bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[80px] flex flex-col gap-7 box-border"
    >
      {/* Label */}
      <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em]">
        Recent Intelligence
      </p>

      {/* Tab row — scrollable on mobile */}
      {!loading && tabs.length > 0 && (
        <div
          className="flex items-center border-b border-p-border overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          role="tablist"
        >
          {tabs.map((date, i) => (
            <button
              key={date}
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => setActiveTab(i)}
              className={[
                'font-mono text-[11px] uppercase px-4 py-[10px] bg-transparent border-none cursor-pointer transition-colors mb-[-1px] whitespace-nowrap flex-shrink-0',
                i === activeTab
                  ? 'text-p-orange border-b-2 border-p-orange'
                  : 'text-p-muted border-b-2 border-transparent hover:text-p-text',
              ].join(' ')}
            >
              {date}
            </button>
          ))}
        </div>
      )}

      {/* Cards — 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : visibleCards.length > 0 ? (
          visibleCards.map((card) => {
            if (!card) return null;
            const accentColor = PILLAR_COLORS[card.pillar] ?? '#E67E22';
            return (
              <div
                key={card.id}
                className="bg-p-navy-card p-5 flex flex-col gap-3 min-w-0"
                style={{ border: '1px solid #2A3F5F', borderLeft: `3px solid ${accentColor}` }}
              >
                {/* Pillar label */}
                <span
                  className="font-mono text-[10px] uppercase tracking-wide"
                  style={{ color: accentColor, fontWeight: 700 }}
                >
                  {PILLAR_LABELS[card.pillar] ?? card.pillar}
                </span>

                {/* Title */}
                <h3
                  className="text-[15px] leading-[1.3] m-0"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5', fontWeight: 600 }}
                >
                  {card.title}
                </h3>

                {/* Summary */}
                <p
                  className="font-sans text-[13px] leading-[1.6] m-0 line-clamp-3"
                  style={{ color: '#B8C5D0' }}
                >
                  {card.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="font-mono text-[10px]" style={{ color: '#B8C5D0' }}>
                    {card.source}
                  </span>
                  <button
                    type="button"
                    className="font-mono text-[9px] uppercase border bg-transparent px-[10px] py-1 cursor-pointer transition-colors"
                    style={{ color: accentColor, borderColor: accentColor }}
                  >
                    Read More →
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="col-span-full bg-p-navy-card p-8 flex flex-col items-center gap-3"
            style={{ border: '1px solid #2A3F5F' }}
          >
            <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em]">
              Next signals dropping soon
            </p>
            <p className="font-sans text-[14px] m-0" style={{ color: '#B8C5D0' }}>
              No signals today — check back tomorrow.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
