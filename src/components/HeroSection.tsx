import React from 'react';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onSeeExample?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onSeeExample }) => {
  return (
    <section className="w-full min-h-[640px] bg-p-navy px-6 py-10 md:px-[60px] md:py-[60px] lg:px-[120px] lg:py-[80px] flex flex-col items-start gap-8 box-border">
      {/* VOL. 01 label — top right */}
      <div className="w-full flex justify-end">
        <span className="font-mono text-[10px] text-p-muted uppercase tracking-widest">
          VOL. 01 — 2026
        </span>
      </div>

      {/* Accent line group */}
      <div className="flex items-center gap-3">
        <div className="w-[2px] h-20 bg-p-orange flex-shrink-0" />
        <span className="font-mono text-[10px] text-p-muted uppercase tracking-widest">
          Agentic Shift Intelligence
        </span>
      </div>

      {/* Headline */}
      <h1
        className="text-p-text font-bold text-[36px] md:text-[48px] lg:text-[64px] leading-[1.1] m-0 max-w-[720px]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Track the agentic shift before your clients ask
      </h1>

      {/* Subheadline */}
      <p
        className="font-sans text-[18px] leading-[1.7] m-0 max-w-[580px]"
        style={{ color: '#B8C5D0' }}
      >
        Marketing teams are buying AI agents, not point solutions. OpenAI Operator,
        Anthropic Computer Use, Google Gemini — which one delivers ROI?
      </p>

      {/* Value prop */}
      <p
        className="font-mono text-[11px] uppercase m-0 tracking-[0.15em]"
        style={{ color: '#E67E22', fontWeight: 700 }}
      >
        3 Signals Daily. Client-Ready. Zero Research Time.
      </p>

      {/* CTA group — stacked on mobile, row on tablet+ */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
        <button
          type="button"
          onClick={() => onGetStarted?.()}
          className="font-mono font-bold text-[12px] uppercase tracking-wide bg-p-orange text-p-navy px-8 py-[14px] border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          Get Daily Signals
        </button>
        <button
          type="button"
          onClick={() => onSeeExample?.()}
          className="font-mono text-[12px] uppercase tracking-wide text-p-orange border border-p-orange bg-transparent px-8 py-[14px] cursor-pointer hover:bg-p-orange hover:text-p-navy transition-colors"
        >
          See Example →
        </button>
      </div>

      {/* Bottom divider */}
      <div className="w-full border-t border-p-border pt-4 flex justify-center mt-auto">
        <span className="font-mono text-[10px] uppercase tracking-widest text-p-muted">
          Powered by Tier-1 Research
        </span>
      </div>
    </section>
  );
};
