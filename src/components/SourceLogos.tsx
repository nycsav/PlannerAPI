import React from 'react';

const ROW1 = ['McKinsey', 'Gartner', 'Forrester', 'BCG', 'Bain', 'Deloitte'];
const ROW2 = ['OpenAI', 'Anthropic', 'Google AI', 'Meta AI'];

export const SourceLogos: React.FC = () => {
  return (
    <section className="w-full bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[60px] flex flex-col items-center justify-center gap-6 box-border">
      {/* Section label */}
      <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em] text-center">
        Research from firms your clients already cite
      </p>

      {/* Row 1 — consulting firms */}
      <div className="flex flex-wrap justify-center gap-[10px]">
        {ROW1.map((name) => (
          <span
            key={name}
            className="font-mono text-[9px] md:text-[10px] uppercase text-p-text border border-p-border px-[14px] py-[6px] tracking-wide"
          >
            {name}
          </span>
        ))}
      </div>

      {/* Row 2 — platform firms */}
      <div className="flex flex-wrap justify-center gap-[10px]">
        {ROW2.map((name) => (
          <span
            key={name}
            className="font-mono text-[9px] md:text-[10px] uppercase text-p-orange px-[14px] py-[6px] tracking-wide"
            style={{
              border: '1px solid rgba(230, 126, 34, 0.4)',
              backgroundColor: 'rgba(230, 126, 34, 0.05)',
            }}
          >
            {name}
          </span>
        ))}
      </div>

      <p className="font-mono text-[10px] uppercase text-p-muted m-0 tracking-[0.1em] text-center">
        If procurement and the C-suite won't cite it, we don't cover it.
      </p>
    </section>
  );
};
