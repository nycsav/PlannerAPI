/**
 * SignalPulseChart — Live intelligence distribution visualization for homepage.
 * Fetches last 30 discover_cards from Firestore, groups by pillar,
 * and renders a Recharts BarChart showing current signal distribution.
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface PillarCount {
  pillar: string;
  label: string;
  count: number;
  color: string;
  accent: string;
}

const PILLARS: Record<string, { label: string; color: string; accent: string }> = {
  ai_strategy:       { label: 'AI Strategy',       color: '#7C3AED', accent: '#EDE9FE' },
  brand_performance: { label: 'Brand Performance',  color: '#2563EB', accent: '#DBEAFE' },
  competitive_intel: { label: 'Competitive Intel',  color: '#F97316', accent: '#FED7AA' },
  media_trends:      { label: 'Media Trends',       color: '#059669', accent: '#D1FAE5' },
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as PillarCount;
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.95)',
        border: `1px solid ${d.color}40`,
        borderRadius: 8,
        padding: '8px 12px',
        fontFamily: 'monospace',
      }}
    >
      <p style={{ color: d.color, fontWeight: 700, fontSize: 12, marginBottom: 2 }}>
        {d.label}
      </p>
      <p style={{ color: '#CBD5E1', fontSize: 11 }}>
        {d.count} signal{d.count !== 1 ? 's' : ''} this week
      </p>
    </div>
  );
};

export const SignalPulseChart: React.FC = () => {
  const [data, setData] = useState<PillarCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = collection(db, 'discover_cards');
        const q = query(ref, orderBy('createdAt', 'desc'), limit(30));
        const snap = await getDocs(q);

        const counts: Record<string, number> = {};
        snap.docs.forEach((doc) => {
          const pillar = doc.data().pillar as string;
          if (pillar && PILLARS[pillar]) {
            counts[pillar] = (counts[pillar] || 0) + 1;
          }
        });

        const chartData: PillarCount[] = Object.entries(PILLARS).map(([key, meta]) => ({
          pillar: key,
          label: meta.label,
          count: counts[key] || 0,
          color: meta.color,
          accent: meta.accent,
        })).filter(d => d.count > 0);

        setData(chartData);
        setTotal(chartData.reduce((sum, d) => sum + d.count, 0));
      } catch (err) {
        console.error('[SignalPulseChart] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || data.length === 0) return null;

  const strongest = data.reduce((a, b) => (a.count > b.count ? a : b), data[0]);

  return (
    <section
      style={{
        backgroundColor: 'var(--navy)',
        padding: '0 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          background: 'var(--overlay-light)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '2rem 2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '0.4rem',
              }}
            >
              Signal Distribution
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--cream)',
                lineHeight: 1.3,
              }}
            >
              <span style={{ color: strongest.color }}>{strongest.label}</span> leads this week
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--cream)',
                lineHeight: 1,
              }}
            >
              {total}
            </div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(248,246,240,0.4)',
                marginTop: '0.2rem',
              }}
            >
              Signals This Week
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -16, bottom: 0 }}
            barCategoryGap="30%"
          >
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 10,
                fill: 'rgba(248,246,240,0.5)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={hoveredIndex === index ? entry.color : `${entry.color}80`}
                  style={{ transition: 'fill 0.15s ease', cursor: 'default' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {data.map(d => (
            <div key={d.pillar} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.65rem',
                  color: 'rgba(248,246,240,0.5)',
                  letterSpacing: '0.05em',
                }}
              >
                {d.label} · {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
