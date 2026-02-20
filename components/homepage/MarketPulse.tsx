import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

export const MarketPulse: React.FC = () => {
  const [stats, setStats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRef = collection(db, 'hero_stats');
        const q = query(statsRef, orderBy('publishedAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const items = snapshot.docs
          .map((doc) => doc.data().stat)
          .filter((s): s is string => typeof s === 'string' && s.length > 10);
        setStats(items);
      } catch (err) {
        console.error('[MarketPulse] Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Rotate through stats every 8 seconds if multiple exist
  useEffect(() => {
    if (stats.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stats.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [stats.length]);

  if (loading || stats.length === 0) return null;

  const currentStat = stats[activeIndex];

  return (
    <section
      style={{
        backgroundColor: 'var(--navy)',
        padding: '0 1.5rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          backgroundColor: 'var(--overlay-light)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1.5rem 2rem',
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.75rem',
          }}
        >
          Market Pulse
        </div>
        <div
          key={activeIndex}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.1rem',
            color: 'var(--cream)',
            lineHeight: 1.5,
            opacity: 1,
            animation: 'marketPulseFade 0.5s ease-in-out',
          }}
        >
          {currentStat}
        </div>
        {stats.length > 1 && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: 'rgba(248, 246, 240, 0.45)',
              marginTop: '0.75rem',
            }}
          >
            Auto-rotates daily from Perplexity query
          </div>
        )}
      </div>
      <style>{`
        @keyframes marketPulseFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};
