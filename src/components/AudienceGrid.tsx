import React from 'react';

const AUDIENCE_CARDS = [
  {
    title: 'Agency Strategists',
    subtitle: 'Strategy & Planning',
    description: 'Arm yourself with tier-1 intelligence before every client meeting. No research hours required.',
  },
  {
    title: 'Research Teams',
    subtitle: 'Brand & Marketing Research',
    description: 'Stay ahead of methodology shifts with daily signals from McKinsey, Kantar, and WARC.',
  },
  {
    title: 'Independent Consultants',
    subtitle: 'Marketing Consultants',
    description: 'Position as the expert who already knows. Walk into every engagement with the latest market intelligence.',
  },
  {
    title: 'Agency Leadership',
    subtitle: 'Owners & VPs',
    description: 'Drive strategic conversations with clients using intelligence that took minutes, not weeks, to surface.',
  },
];

export const AudienceGrid: React.FC = () => {
  return (
    <section
      className="w-full bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[80px] flex flex-col gap-[48px] box-border"
      style={{ borderTop: '1px solid #1E2A45' }}
    >
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em]">
          Who It's For
        </p>
        <h2
          className="font-bold text-[34px] text-p-text m-0 max-w-[540px] leading-[1.2]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Built for the people who brief the room
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AUDIENCE_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-3 p-6"
            style={{ background: '#0D1631', border: '1px solid #1E2A45', borderLeft: '3px solid #F59E0B' }}
          >
            <div className="flex flex-col gap-1">
              <span
                className="text-[16px] font-semibold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5' }}
              >
                {card.title}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-wide"
                style={{ color: '#F59E0B', fontWeight: 700 }}
              >
                {card.subtitle}
              </span>
            </div>
            <p className="font-sans text-[13px] leading-[1.6] m-0" style={{ color: '#B8C5D0' }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
