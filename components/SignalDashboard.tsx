import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { ENDPOINTS } from '../src/config/api';

export interface SignalScore {
  rank: number;
  topic: string;
  signal_momentum: 'rising' | 'stable' | 'falling';
  score_today: number;
  score_yesterday: number;
  delta: number;
  top_brand: string;
  chart_data: number[];
}

interface SignalDashboardProps {
  /** Pre-fetched signals — pass from parent if already loaded */
  signals?: SignalScore[];
}

const MOMENTUM_COLORS: Record<string, string> = {
  rising: '#22c55e',
  stable: '#E67E22',
  falling: '#ef4444',
};

const MOMENTUM_LABELS: Record<string, string> = {
  rising: '▲ RISING',
  stable: '● STABLE',
  falling: '▼ FALLING',
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div
      style={{
        width: '80px',
        height: '4px',
        backgroundColor: 'var(--border)',
        borderRadius: 0,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${score}%`,
          height: '100%',
          backgroundColor: score >= 75 ? '#ef4444' : score >= 50 ? 'var(--orange)' : '#60a5fa',
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

function Sparkline({ data, momentum }: { data: number[]; momentum: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  const color = MOMENTUM_COLORS[momentum] || 'var(--orange)';
  return (
    <div style={{ width: '80px', height: '32px', flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={true}
          />
          <Tooltip
            content={() => null}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 80px 80px 48px 80px',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      {[24, 140, 80, 80, 40, 80].map((w, i) => (
        <div
          key={i}
          style={{
            height: '10px',
            width: `${w}px`,
            backgroundColor: 'var(--overlay-hover)',
            borderRadius: 0,
          }}
          className="animate-pulse"
        />
      ))}
    </div>
  );
}

export const SignalDashboard: React.FC<SignalDashboardProps> = ({ signals: propSignals }) => {
  const [signals, setSignals] = useState<SignalScore[]>(propSignals || []);
  const [loading, setLoading] = useState(!propSignals || propSignals.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (propSignals && propSignals.length > 0) {
      setSignals(propSignals);
      setLoading(false);
      return;
    }
    const fetchScores = async () => {
      try {
        const res = await fetch(ENDPOINTS.getSignalScores, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setSignals(data.signals || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (error) return null;

  return (
    <section
      id="signal-dashboard"
      style={{
        backgroundColor: 'var(--bg-card)',
        padding: '64px 120px',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--orange)',
                marginBottom: '8px',
              }}
            >
              LIVE SIGNAL INTELLIGENCE
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '28px',
                color: 'var(--text)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Top Signals Right Now
            </h2>
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Powered by sonar-reasoning-pro
          </span>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 80px 80px 48px 80px',
            alignItems: 'center',
            gap: '16px',
            padding: '0 0 8px 0',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {['#', 'SIGNAL', 'SCORE', 'MOMENTUM', 'Δ', '7-DAY'].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </>
        ) : (
          signals.map((s) => {
            const momentumColor = MOMENTUM_COLORS[s.signal_momentum] || 'var(--orange)';
            const deltaStr = s.delta > 0 ? `+${s.delta}` : `${s.delta}`;
            return (
              <div
                key={s.rank}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 80px 80px 48px 80px',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--overlay-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    fontWeight: 700,
                  }}
                >
                  {s.rank}
                </span>

                {/* Topic + brand */}
                <div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.topic}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '9px',
                      letterSpacing: '0.06em',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.top_brand}
                  </div>
                </div>

                {/* Score bar + number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <ScoreBar score={s.score_today} />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '10px',
                      color: 'var(--text)',
                      fontWeight: 700,
                    }}
                  >
                    {s.score_today}
                  </span>
                </div>

                {/* Momentum badge */}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.06em',
                    color: momentumColor,
                    fontWeight: 700,
                  }}
                >
                  {MOMENTUM_LABELS[s.signal_momentum] || s.signal_momentum.toUpperCase()}
                </span>

                {/* Delta */}
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 700,
                    color: s.delta > 0 ? '#22c55e' : s.delta < 0 ? '#ef4444' : 'var(--muted)',
                  }}
                >
                  {deltaStr}
                </span>

                {/* Sparkline */}
                <Sparkline
                  data={s.chart_data || [50, 50, 50, 50, 50, 50, s.score_today]}
                  momentum={s.signal_momentum}
                />
              </div>
            );
          })
        )}

        {!loading && signals.length === 0 && !error && (
          <div
            style={{
              padding: '32px 0',
              textAlign: 'center',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: 'var(--muted)',
            }}
          >
            Signal data unavailable. Retry shortly.
          </div>
        )}
      </div>
    </section>
  );
};
