import React from 'react';

export interface ExampleCardData {
  title: string;
  summary: string;
  signals: string[];
  nextMove: string;
  sources: string[];
}

export interface ExampleCardProps {
  card: ExampleCardData | null;
}

const FALLBACK_CARD: ExampleCardData = {
  title:   "The 94% Problem: Most Marketing Teams Can't Evaluate AI Agents",
  summary: "McKinsey's Q1 2026 data shows 94% of marketing orgs are procuring AI agents without evaluation frameworks.",
  signals: [
    '94% procure AI agents without ROI benchmarks (McKinsey Q1 2026)',
    "Gartner: 67% of CMOs cite 'agent selection paralysis' as top blocker in 2026 planning",
    'BCG: Firms with structured evaluation frameworks see 3.2x higher agent ROI',
  ],
  nextMove: 'Build a 3-question AI agent evaluation scorecard before your next client AI review. Lead with ROI benchmarks, not feature demos.',
  sources: ['McKinsey Q1 2026', 'Gartner AI Report', 'BCG Agent Framework'],
};

export const ExampleCard: React.FC<ExampleCardProps> = ({ card }) => {
  const data = card ?? FALLBACK_CARD;

  return (
    <section className="w-full min-h-[640px] bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[80px] flex flex-col items-center gap-10 box-border">
      {/* Section label */}
      <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em] text-center">
        Example Intelligence Brief
      </p>

      {/* Card */}
      <div
        className="w-full max-w-[860px] flex flex-col gap-6 p-5 md:p-10 lg:p-16 box-border"
        style={{ border: '2px solid rgba(230, 126, 34, 0.3)' }}
      >
        {/* Title */}
        <h2
          className="font-bold text-[20px] md:text-[24px] lg:text-[28px] leading-[1.3] text-p-text m-0"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {data.title}
        </h2>

        {/* Summary */}
        <p className="font-sans text-[16px] leading-[1.8] m-0" style={{ color: '#C5D0DC' }}>
          {data.summary}
        </p>

        {/* Signals label */}
        <p
          className="font-mono text-[11px] uppercase m-0"
          style={{ color: '#E67E22', fontWeight: 700, letterSpacing: '0.15em' }}
        >
          Signals
        </p>

        {/* Signal list */}
        <div className="flex flex-col gap-3">
          {Array.isArray(data.signals) && data.signals.map((signal, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-[5px]"
                style={{
                  display: 'inline-block',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid #E67E22',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                }}
              />
              <span className="font-sans text-[14px] leading-[1.6]" style={{ color: '#D5DDE5' }}>
                {signal}
              </span>
            </div>
          ))}
        </div>

        {/* Next Move label */}
        <p
          className="font-mono text-[11px] uppercase m-0"
          style={{ color: '#E67E22', fontWeight: 700, letterSpacing: '0.15em' }}
        >
          Next Move
        </p>

        {/* Next Move body */}
        <div className="border-l-2 border-p-orange pl-4">
          <p className="font-sans text-[14px] leading-[1.6] m-0" style={{ color: '#F5F5F5', fontWeight: 600 }}>
            {data.nextMove}
          </p>
        </div>

        {/* Source badges */}
        <div className="flex flex-wrap gap-2">
          {Array.isArray(data.sources) && data.sources.map((src) => (
            <span
              key={src}
              className="font-mono text-[9px] uppercase text-p-orange px-[10px] py-1 tracking-wide"
              style={{
                border: '1px solid rgba(230, 126, 34, 0.4)',
                backgroundColor: 'rgba(230, 126, 34, 0.05)',
              }}
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
