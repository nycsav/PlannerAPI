import React from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Automated Research',
    body: 'Every Mon/Wed/Fri at 6am ET, we scan McKinsey, Gartner, Forrester, BCG, plus OpenAI and Anthropic for the latest reports.',
  },
  {
    number: '02',
    title: 'Cross-Reference & Analyze',
    body: 'At 7am ET, Claude Sonnet synthesizes across sources — matching platform launches to ROI frameworks.',
  },
  {
    number: '03',
    title: '3 Signals, Client-Ready',
    body: 'By 8am ET: 3 intelligence cards with data signals, implications, and next moves. Ready to drop into client presentations.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="w-full min-h-[480px] bg-p-navy px-6 md:px-[60px] lg:px-[120px] py-[80px] flex flex-col gap-[60px] box-border border-t border-b border-p-border"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[11px] uppercase text-p-orange m-0 tracking-[0.15em]">
          The System
        </p>
        <h2
          className="font-bold text-[34px] text-p-text m-0 max-w-[540px] leading-[1.2]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          From tier-1 research to client-ready in 90 minutes
        </h2>
      </div>

      {/* Steps — stacked on mobile, 3-column on desktop */}
      <div className="flex flex-col lg:flex-row">
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className={[
              'flex flex-col gap-4',
              /* Desktop: horizontal padding + vertical dividers */
              i === 0 ? 'lg:pr-10 lg:border-r lg:border-p-border' : '',
              i === 1 ? 'lg:px-10 lg:border-r lg:border-p-border' : '',
              i === 2 ? 'lg:pl-10' : '',
              /* Mobile: horizontal divider above steps 2 and 3 */
              i > 0 ? 'border-t border-[#1E2A45] pt-8 mt-0 lg:border-t-0 lg:pt-0' : '',
            ].join(' ')}
          >
            <span className="font-mono font-bold text-[40px] text-p-orange leading-none">
              {step.number}
            </span>
            <h3
              className="text-[18px] m-0"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F5F5', fontWeight: 600 }}
            >
              {step.title}
            </h3>
            <p
              className="font-sans text-[14px] leading-[1.7] m-0"
              style={{ color: '#B8C5D0' }}
            >
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
