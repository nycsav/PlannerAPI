import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface Signal {
  id: string;
  date: string;
  title: string;
  summary: string;
  sources: string[];
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

export const RecentSignalsTab: React.FC<RecentSignalsTabProps> = ({ onReadMore }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const q = query(
          collection(db, 'discover_cards'),
          orderBy('publishedAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);

        // Deduplicate by doc id first, then by formatted date (one card per date)
        const seenIds = new Set<string>();
        const seenDates = new Set<string>();
        const fetched: Signal[] = [];

        for (const docSnap of snapshot.docs) {
          if (seenIds.has(docSnap.id)) continue;
          seenIds.add(docSnap.id);

          const d = docSnap.data();
          const date = formatDate(d.publishedAt);

          if (seenDates.has(date)) continue;
          seenDates.add(date);

          fetched.push({
            id: docSnap.id,
            date,
            title: d.title || 'Intelligence Update',
            summary: d.summary || '',
            sources: d.source ? [d.source] : [],
          });

          if (fetched.length >= 5) break;
        }

        if (fetched.length > 0) setSignals(fetched);
      } catch (err) {
        console.error('[RecentSignalsTab] fetch error:', err);
      }
    };
    fetchSignals();
  }, []);

  const signal = signals[active];

  if (!signal) return null;

  return (
    <section
      id="recent-signals"
      style={{
        backgroundColor: 'var(--navy)',
        padding: '60px 120px 80px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div
          className="flex flex-wrap gap-2 mb-6 border-b"
          style={{ borderColor: 'var(--border)' }}
          role="tablist"
        >
          {signals.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              style={{
                padding: '0.5rem 1rem',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: i === active ? 700 : 400,
                color: i === active ? 'var(--orange)' : 'var(--muted)',
                background: 'none',
                border: 'none',
                borderBottom: i === active ? '2px solid var(--orange)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {s.date}
            </button>
          ))}
        </div>
        <div key={active} style={{ animation: 'recentSignalsFade 0.3s ease-out' }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '28px',
              color: 'var(--text)',
              marginBottom: '12px',
              lineHeight: 1.3,
            }}
          >
            {signal.title}
          </h3>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--muted)',
              marginBottom: '16px',
            }}
          >
            {signal.summary}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {signal.sources.map((src) => (
              <span
                key={src}
                style={{
                  padding: '4px 10px',
                  fontSize: '9px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--orange)',
                  border: '1px solid rgba(230, 126, 34, 0.4)',
                  backgroundColor: 'rgba(230, 126, 34, 0.05)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {src}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onReadMore?.(signal)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--orange)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Read more →
          </button>
        </div>
        <div
          className="flex md:hidden justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Select signal date"
        >
          {signals.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-label={s.date}
              aria-selected={i === active}
              onClick={() => setActive(i)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                backgroundColor: i === active ? 'var(--orange)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes recentSignalsFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};
