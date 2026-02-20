import React from 'react';

export interface StatCalloutProps {
  stat: string;
  label: string;
  context: string;
  source: string;
}

export const StatCallout: React.FC<StatCalloutProps> = ({ stat, label, context, source }) => {
  return (
    <section
      className="w-full min-h-[400px] bg-p-navy px-6 md:px-[60px] py-[60px] md:py-[80px] flex flex-col items-center justify-center gap-6 text-center box-border"
      style={{
        borderTop: '1px solid rgba(230, 126, 34, 0.2)',
        borderBottom: '1px solid rgba(230, 126, 34, 0.2)',
      }}
      aria-label={`Key stat: ${label}`}
    >
      <div
        className="font-mono font-bold text-p-orange leading-[0.9] text-center"
        style={{ fontSize: 'clamp(80px, 12vw, 144px)' }}
      >
        {stat}
      </div>

      <h2
        className="font-bold text-[32px] text-p-text m-0 text-center"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {label}
      </h2>

      <p
        className="font-sans text-[15px] md:text-[17px] leading-[1.8] m-0 max-w-[640px] text-center"
        style={{ color: '#C5D0DC' }}
      >
        {context}
      </p>

      <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em] text-center">
        {source}
      </p>
    </section>
  );
};
