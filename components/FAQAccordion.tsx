import React, { useState } from 'react';

const items = [
  {
    q: "How is signal2noise different from reading McKinsey's blog?",
    a: "McKinsey publishes 50+ articles/week across industries. signal2noise filters for marketing/advertising-relevant research, cross-references with OpenAI/Anthropic platform updates, and synthesizes into 3 client-ready signals daily. Tier-1 synthesis: you get the 0.1% that matters, not the 99.9% that doesn't.",
  },
  {
    q: 'Why not just use ChatGPT or Perplexity for research?',
    a: "Two problems: (1) Recency bias—LLMs return recent articles, not best sources. (2) No synthesis—you get links, not strategic implications. signal2noise uses tier-1 sources only (McKinsey, Gartner, Forrester) and tells you 'what this means' + 'what to do about it.'",
  },
  {
    q: 'How do you choose which sources to track?',
    a: 'Tier 1 (McKinsey, Gartner, Forrester, BCG, Bain, Deloitte) and Tier 2 (OpenAI, Anthropic, Google, Meta). These are the sources procurement teams and C-suite executives already trust. If they won\'t cite it, we won\'t cover it.',
  },
  {
    q: 'Can I forward these to clients?',
    a: 'Yes. Every intelligence card is designed to be client-ready: data-focused, source-attributed, actionable. Forward the card, the app link, or export to PDF (coming Q2 2026).',
  },
  {
    q: 'What if I want to dive deeper on a signal?',
    a: "Click 'Ask a follow-up question' on any intelligence card. Our Perplexity-style AI chat pulls from the same tier-1 sources to answer deeper questions (e.g., 'What are the implementation costs for Anthropic Computer Use at mid-market scale?').",
  },
  {
    q: 'How often do you update the intelligence?',
    a: 'Daily at 7am ET. Weekend intelligence drops Monday morning. Research sources updated Mon/Wed/Fri at 6am ET (auto-scans McKinsey, Gartner, OpenAI, Anthropic for new content).',
  },
];

export const FAQAccordion: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '80px 120px',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 0',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: isOpen ? 'var(--orange)' : 'var(--text)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'color 0.15s',
                }}
              >
                <span style={{ paddingRight: '1rem' }}>{item.q}</span>
                <span
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    transition: 'transform 0.25s ease-in-out',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                style={{
                  maxHeight: isOpen ? '400px' : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.25s ease-in-out',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.875rem',
                    lineHeight: 1.55,
                    color: 'var(--muted)',
                    padding: '24px 2.5rem 40px 0',
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
