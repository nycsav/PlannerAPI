import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How is signal2noise different from reading McKinsey\'s blog?',
    a: 'McKinsey publishes 50+ articles/week across industries. signal2noise filters for marketing/advertising-relevant research, cross-references with OpenAI/Anthropic platform updates, and synthesizes into 3 client-ready signals daily. Tier-1 synthesis: you get the 0.1% that matters, not the 99.9% that doesn\'t.',
  },
  {
    q: 'Why not just use ChatGPT or Perplexity for research?',
    a: 'Two problems: (1) Recency bias—LLMs return recent articles, not best sources. (2) No synthesis—you get links, not strategic implications. signal2noise uses tier-1 sources only (McKinsey, Gartner, Forrester) and tells you "what this means" + "what to do about it."',
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
    a: 'Click "Ask a follow-up question" on any intelligence card. Our Perplexity-style AI chat pulls from the same tier-1 sources to answer deeper questions (e.g., "What are the implementation costs for Anthropic Computer Use at mid-market scale?").',
  },
  {
    q: 'How often do you update the intelligence?',
    a: 'Daily at 7am ET. Weekend intelligence drops Monday morning. Research sources updated Mon/Wed/Fri at 6am ET (auto-scans McKinsey, Gartner, OpenAI, Anthropic for new content).',
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border-light)',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--overlay-subtle)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--cream)',
                }}
              >
                {faq.q}
                <ChevronDown
                  size={18}
                  style={{
                    color: 'var(--text-muted-50)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {openIndex === i && (
                <div style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--navy)',
                }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
