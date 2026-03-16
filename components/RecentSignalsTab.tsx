import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface Signal {
  id: string;
  date: string;
  title: string;
  summary: string;
  sources: string[];
  pillar?: string;
}

export interface RecentSignalsTabProps {
  onReadMore?: (signal: Signal) => void;
}

const formatDate = (publishedAt: any): string => {
  try {
    const ts = publishedAt?.toDate ? publishedAt.toDate() : new Date(publishedAt);
    return ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const PILLAR_LABEL: Record<string, string> = {
  ai_strategy: 'AI SIGNAL',
  brand_performance: 'BRAND SIGNAL',
  competitive_intel: 'COMPETITIVE SIGNAL',
  media_trends: 'MEDIA SIGNAL',
};

const BG = 'var(--bg-card)';
const ACCENT = 'var(--orange)';
const TEXT = 'var(--text)';
const MUTED = 'var(--muted)';
const BORDER = 'var(--border-subtle)';

export const RecentSignalsTab: React.FC<RecentSignalsTabProps> = ({ onReadMore }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const q = query(
          collection(db, 'discover_cards'),
          orderBy('publishedAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);

        const seenIds = new Set<string>();
        const fetched: Signal[] = [];

        for (const docSnap of snapshot.docs) {
          if (seenIds.has(docSnap.id)) continue;
          seenIds.add(docSnap.id);

          const d = docSnap.data();
          fetched.push({
            id: docSnap.id,
            date: formatDate(d.publishedAt),
            title: d.title || 'Intelligence Update',
            summary: d.summary || '',
            sources: d.source ? [d.source] : [],
            pillar: d.pillar || '',
          });
        }

        if (fetched.length > 0) {
          setSignals(fetched);
          setActiveDate(fetched[0].date);
        }
      } catch (err) {
        console.error('[RecentSignalsTab] fetch error:', err);
      }
    };
    fetchSignals();
  }, []);

  // Unique dates in order (most recent first)
  const dates = Array.from(new Set(signals.map((s) => s.date))).slice(0, 5);
  const visibleSignals = signals.filter((s) => s.date === activeDate);

  if (signals.length === 0) return null;

  return (
    <section
      id="recent-signals"
      style={{
        backgroundColor: BG,
        padding: '80px 120px',
        borderTop: `1px solid ${BORDER}`,
        boxSizing: 'border-box',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Section label */}
      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: ACCENT,
          marginBottom: '4px',
        }}
      >
        RECENT INTELLIGENCE
      </p>

      {/* Date filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: '48px',
          overflowX: 'auto',
        }}
        role="tablist"
      >
        {dates.map((date) => (
          <button
            key={date}
            role="tab"
            aria-selected={date === activeDate}
            onClick={() => setActiveDate(date)}
            style={{
              padding: '10px 20px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: date === activeDate ? ACCENT : MUTED,
              background: 'none',
              border: 'none',
              borderBottom: date === activeDate ? `2px solid ${ACCENT}` : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
            }}
          >
            {date}
          </button>
        ))}
      </div>

      {/* 3-column card grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {visibleSignals.map((signal) => (
          <article
            key={signal.id}
            style={{
              border: `1px solid ${BORDER}`,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Pillar tag */}
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: ACCENT,
                fontWeight: 700,
              }}
            >
              {PILLAR_LABEL[signal.pillar || ''] || 'AI SIGNAL'}
            </span>

            {/* Title */}
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: 1.3,
                color: TEXT,
                margin: 0,
              }}
            >
              {signal.title}
            </h3>

            {/* Summary — 2-line clamp */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                lineHeight: 1.6,
                color: MUTED,
                margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                flex: 1,
              }}
            >
              {signal.summary}
            </p>

            {/* Source badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {signal.sources.map((src) => (
                <span
                  key={src}
                  style={{
                    padding: '3px 8px',
                    fontSize: '9px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: ACCENT,
                    border: '1px solid rgba(230, 126, 34, 0.35)',
                    backgroundColor: 'rgba(230, 126, 34, 0.05)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {src}
                </span>
              ))}
            </div>

            {/* Read more */}
            <button
              type="button"
              onClick={() => onReadMore?.(signal)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: ACCENT,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
              }}
            >
              Read more →
            </button>
          </article>
        ))}
      </div>

      <style>{`
        @keyframes recentSignalsFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};
