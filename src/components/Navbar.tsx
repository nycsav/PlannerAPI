import React from 'react';

interface NavbarProps {
  onSignupClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  return (
    <nav className="w-full h-16 bg-p-navy border-t-[3px] border-p-orange flex items-center justify-between px-6 md:px-[60px] lg:px-10 box-border">
      {/* Logo wordmark */}
      <div className="flex items-center">
        <span className="font-mono font-bold text-[18px] text-p-text">planner</span>
        <span className="font-mono font-bold text-[18px] text-p-orange">API</span>
      </div>

      {/* Nav links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-8">
        {(['Signals', 'About', 'Pricing'] as const).map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className="font-mono text-[12px] uppercase tracking-wide text-p-muted hover:text-p-text transition-colors no-underline"
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA — always visible */}
      <button
        type="button"
        onClick={() => onSignupClick?.()}
        className="font-mono text-[11px] uppercase tracking-wide text-p-orange border border-p-orange bg-transparent px-5 py-2 hover:bg-p-orange hover:text-p-navy transition-colors cursor-pointer"
      >
        Get Access
      </button>
    </nav>
  );
};
