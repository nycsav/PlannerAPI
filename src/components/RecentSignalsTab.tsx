import React, { useState } from 'react';

export interface SignalCard {
  id: string;
  date: string;
  pillar: string;
  title: string;
  summary: string;
  source: string;
  signals?: string[];
  moves?: string[];
  sources?: string[];
  images?: Array<{ image_url: string; origin_url?: string; title?: string }>;
  citations?: Array<{ url: string; title: string }>;
}

export interface RecentSignalsTabProps {
  cards: SignalCard[];
  loading?: boolean;
}

const PILLAR_LABELS: Record<string, string> = {
  ai_strategy:          'AI Strategy',
  brand_performance:    'Brand',
  competitive_intel:    'Competitive',
  media_trends:         'Media Trends',
  platform_innovation:  'Platform',
  measurement_analytics:'Measurement',
  content_strategy:     'Content',
};

const PILLAR_COLORS: Record<string, string> = {
  ai_strategy:          '#7C3AED',
  brand_performance:    '#F59E0B',
  competitive_intel:    '#EF4444',
  media_trends:         '#3B82F6',
  platform_innovation:  '#10B981',
  measurement_analytics:'#F97316',
  content_strategy:     '#EC4899',
};

const PILLAR_GRADIENTS: Record<string, string> = {
  ai_strategy:          'linear-gradient(135deg, #7C3AED, #4C1D95)',
  brand_performance:    'linear-gradient(135deg, #F59E0B, #92400E)',
  competitive_intel:    'linear-gradient(135deg, #EF4444, #7F1D1D)',
  media_trends:         'linear-gradient(135deg, #3B82F6, #1E3A8A)',
  platform_innovation:  'linear-gradient(135deg, #10B981, #064E3B)',
  measurement_analytics:'linear-gradient(135deg, #F97316, #7C2D12)',
  content_strategy:     'linear-gradient(135deg, #EC4899, #831843)',
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
    <div className="h-24 bg-p-border rounded mb-1" />
    <div className="h-3 bg-p-border rounded w-1/3" />
    <div className="h-4 bg-p-border rounded w-full" />
    <div className="h-4 bg-p-border rounded w-4/5" />
    <div className="h-3 bg-p-border rounded w-1/2" />
  </div>
);

const CardThumbnail: React.FC<{ card: SignalCard; accentColor: string }> = ({ card, accentColor }) => {
  const [imgError, setImgError] = useState(false);
  // images is an array of objects with image_url property (from Perplexity API)
  const firstImage = card.images?.[0];
  const imageUrl = firstImage?.image_url;

  if (imageUrl && !imgError) {
    return (
      <div className="w-full h-[120px] overflow-hidden mb-1" style={{ borderBottom: `1px solid #2A3F5F` }}>
        <img
          src={imageUrl}
          alt={firstImage?.title ?? ''}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Gradient placeholder — never a broken image state
  const gradient = PILLAR_GRADIENTS[card.pillar] ?? 'linear-gradient(135deg, #0D1631 0%, #1E2A45 100%)';
  return (
    <div
      className="w-full h-[120px] mb-1 flex items-center justify-center"
      style={{ background: gradient, borderBottom: `1px solid ${accentColor}22` }}
    >
      <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: accentColor, opacity: 0.6 }}>
        {PILLAR_LABELS[card.pillar] ?? card.pillar}
      </span>
    </div>
  );
};

const ExpandedCard: React.FC<{ card: SignalCard; accentColor: string; onClose: () => void }> = ({ card, accentColor, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/card/${card.id}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,17,40,0.92)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto flex flex-col gap-5"
        style={{ background: '#0D1631', border: `1px solid ${accentColor}`, borderLeft: `4px solid ${accentColor}`, padding: '32px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <span className="font-mono text-[10px] uppercase tracking-wide" style={{ color: accentColor, fontWeight: 700 }}>
            {PILLAR_LABELS[card.pillar] ?? card.pillar}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] bg-transparent border-none cursor-pointer"
            style={{ color: '#7A8BA0' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Image — only show in modal if there's a valid image */}
        {card.images && card.images.length > 0 && card.images[0].image_url && (
          <CardThumbnail card={card} accentColor={accentColor} />
        )}

        {/* Title */}
        <h2
          className="m-0 text-[20px] leading-[1.3]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5', fontWeight: 700 }}
        >
          {card.title}
        </h2>

        {/* Summary */}
        <p className="font-sans text-[14px] leading-[1.7] m-0" style={{ color: '#B8C5D0' }}>
          {card.summary}
        </p>

        {/* Signals */}
        {card.signals && card.signals.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: accentColor }}>Signals</p>
            {card.signals.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[10px] mt-[3px]" style={{ color: accentColor }}>›</span>
                <p className="font-sans text-[13px] leading-[1.6] m-0" style={{ color: '#B8C5D0' }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        {/* Moves */}
        {card.moves && card.moves.length > 0 && (
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: accentColor }}>Actions</p>
            {card.moves.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="font-mono text-[10px] mt-[3px]" style={{ color: accentColor }}>→</span>
                <p className="font-sans text-[13px] leading-[1.6] m-0 font-medium" style={{ color: i === 0 ? '#F5F5F5' : '#B8C5D0' }}>{m}</p>
              </div>
            ))}
          </div>
        )}

        {/* Citations */}
        {card.citations && card.citations.length > 0 && (
          <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest m-0" style={{ color: '#7A8BA0' }}>Sources</p>
            {card.citations.slice(0, 5).map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] underline truncate"
                style={{ color: '#7A8BA0' }}
              >
                [{i + 1}] {c.title || c.url}
              </a>
            ))}
          </div>
        )}

        {/* Footer: source + share link */}
        <div className="flex items-center justify-between gap-4" style={{ borderTop: '1px solid #1E2A45', paddingTop: '16px' }}>
          <span className="font-mono text-[10px]" style={{ color: '#7A8BA0' }}>{card.source}</span>
          <button
            type="button"
            onClick={copyLink}
            className="font-mono text-[9px] uppercase border bg-transparent px-3 py-1 cursor-pointer transition-colors"
            style={{ color: copied ? '#27AE60' : accentColor, borderColor: copied ? '#27AE60' : accentColor }}
          >
            {copied ? 'Copied!' : '⧉ Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RecentSignalsTab: React.FC<RecentSignalsTabProps> = ({ cards, loading = false }) => {
  const tabs = getDateTabs(cards);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCard, setExpandedCard] = useState<SignalCard | null>(null);

  const activeDate = tabs[activeTab];
  const visibleCards = cards.filter((c) => c.date === activeDate);

  return (
    <>
      <section
        id="recent-signals"
        className="w-full min-h-[580px] bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[80px] flex flex-col gap-7 box-border"
      >
        <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em]">
          Recent Intelligence
        </p>

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
                  className="bg-p-navy-card flex flex-col min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ border: '1px solid #2A3F5F', borderLeft: `3px solid ${accentColor}` }}
                  onClick={() => setExpandedCard(card)}
                >
                  {/* Image / gradient thumbnail */}
                  <CardThumbnail card={card} accentColor={accentColor} />

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <span
                      className="font-mono text-[10px] uppercase tracking-wide"
                      style={{ color: accentColor, fontWeight: 700 }}
                    >
                      {PILLAR_LABELS[card.pillar] ?? card.pillar}
                    </span>

                    <h3
                      className="text-[15px] leading-[1.3] m-0"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5', fontWeight: 600 }}
                    >
                      {card.title}
                    </h3>

                    <p
                      className="font-sans text-[13px] leading-[1.6] m-0 line-clamp-3"
                      style={{ color: '#B8C5D0' }}
                    >
                      {card.summary}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="font-mono text-[10px]" style={{ color: '#B8C5D0' }}>
                        {card.source}
                        {card.citations && card.citations.length > 0 && (
                          <span style={{ color: '#7A8BA0' }}> · {card.citations.length} sources</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="font-mono text-[9px] uppercase border bg-transparent px-[10px] py-1 cursor-pointer transition-colors"
                        style={{ color: accentColor, borderColor: accentColor }}
                        onClick={(e) => { e.stopPropagation(); setExpandedCard(card); }}
                      >
                        Read More →
                      </button>
                    </div>
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

      {/* Expanded card modal */}
      {expandedCard && (
        <ExpandedCard
          card={expandedCard}
          accentColor={PILLAR_COLORS[expandedCard.pillar] ?? '#E67E22'}
          onClose={() => setExpandedCard(null)}
        />
      )}
    </>
  );
};
