import React from 'react';

interface FooterProps {
  onGetStarted?: () => void;
}

const PLATFORM_LINKS = ['Signals', 'Pillars', 'Pricing'];
const COMPANY_LINKS  = ['About', 'LinkedIn', 'Contact'];

export const Footer: React.FC<FooterProps> = ({ onGetStarted }) => {
  return (
    <footer className="w-full bg-p-navy border-t border-p-border flex flex-col">
      {/* Main columns — stacked on mobile, row on desktop */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start items-center text-center md:text-left px-6 md:px-[60px] lg:px-[120px] pt-[48px] pb-[40px] gap-8 md:gap-0">
        {/* Brand */}
        <div className="flex flex-col gap-3 items-center md:items-start">
          <div className="flex items-center">
            <span className="font-mono font-bold text-[16px] text-p-text">signal2noise</span>
          </div>
          <p className="font-sans text-[13px] text-p-muted m-0">
            Old methods. New speed.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          {[
            { heading: 'Platform', links: PLATFORM_LINKS },
            { heading: 'Company',  links: COMPANY_LINKS  },
          ].map((col) => (
            <div key={col.heading} className="flex flex-col gap-[10px] items-center md:items-start">
              <span className="font-mono text-[10px] uppercase text-p-orange tracking-[0.1em]">
                {col.heading}
              </span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-sans text-[13px] text-p-muted no-underline hover:text-p-text transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* CTA — full width on mobile */}
        <button
          type="button"
          onClick={() => onGetStarted?.()}
          className="font-mono font-bold text-[12px] uppercase tracking-wide bg-p-orange text-p-navy px-7 py-[14px] border-none cursor-pointer hover:opacity-90 transition-opacity w-full md:w-auto md:self-start"
        >
          Get Daily Signals
        </button>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-[60px] lg:px-[120px] py-4 border-t border-p-border gap-2 md:gap-0">
        <span className="font-mono text-[10px] text-p-muted">
          © 2026 signal2noise
        </span>
        <span className="font-mono text-[10px] text-p-muted uppercase tracking-[0.1em]">
          Strategy as Product, Not Service
        </span>
      </div>
    </footer>
  );
};
