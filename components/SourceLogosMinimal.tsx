import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ENDPOINTS } from '../src/config/api';

interface NotionReport {
  id: string;
  title: string;
  url: string;
  keyStat: string | null;
  date: string | null;
  sourceUrl: string | null;
}

interface SourceDef {
  /** Notion source name (must match database Source property exactly) */
  source: string;
  /** Display label on the pill */
  label: string;
  tier: 1 | 2;
  font: string;
  weight: number;
  letterSpacing?: string;
  /** Subtle brand accent color used on hover ring and report list header */
  brandColor: string;
}

const SOURCES: SourceDef[] = [
  // Tier 1: Premier Research
  {
    source: 'McKinsey',
    label: 'McKinsey',
    tier: 1,
    font: "'Libre Baskerville', Georgia, serif",
    weight: 700,
    brandColor: '#0A3D62',
  },
  {
    source: 'Gartner',
    label: 'Gartner',
    tier: 1,
    font: "'Inter', sans-serif",
    weight: 700,
    letterSpacing: '-0.01em',
    brandColor: '#0A5CE6',
  },
  {
    source: 'Forrester',
    label: 'Forrester',
    tier: 1,
    font: "'Barlow', 'Inter', sans-serif",
    weight: 600,
    brandColor: '#00A651',
  },
  {
    source: 'BCG',
    label: 'BCG',
    tier: 1,
    font: "'Inter', sans-serif",
    weight: 800,
    letterSpacing: '0.06em',
    brandColor: '#00843D',
  },
  {
    source: 'Bain',
    label: 'Bain',
    tier: 1,
    font: "'Libre Baskerville', Georgia, serif",
    weight: 700,
    brandColor: '#CC0000',
  },
  {
    source: 'Deloitte',
    label: 'Deloitte',
    tier: 1,
    font: "'Inter', sans-serif",
    weight: 500,
    brandColor: '#86BC25',
  },
  {
    source: 'Board of Innovation',
    label: 'Board of Innovation',
    tier: 1,
    font: "'Space Grotesk', 'Inter', sans-serif",
    weight: 600,
    brandColor: '#0040FF',
  },
  // Tier 2: Platform Research
  {
    source: 'OpenAI',
    label: 'OpenAI',
    tier: 2,
    font: "'Inter', sans-serif",
    weight: 500,
    brandColor: '#10a37f',
  },
  {
    source: 'Anthropic',
    label: 'Anthropic',
    tier: 2,
    font: "'Inter', sans-serif",
    weight: 500,
    brandColor: '#D97757',
  },
  {
    source: 'Google',
    label: 'Google AI',
    tier: 2,
    font: "'Barlow', 'Inter', sans-serif",
    weight: 600,
    brandColor: '#4285F4',
  },
  {
    source: 'Meta',
    label: 'Meta',
    tier: 2,
    font: "'Inter', sans-serif",
    weight: 600,
    letterSpacing: '-0.01em',
    brandColor: '#0866FF',
  },
];

const TABS = [
  { label: 'Signal', description: 'We pull raw reports from Tier-1 consulting and platform research so nothing slips past your radar.' },
  { label: 'Interpret', description: 'Claude cross-references sources and surfaces what the data actually means for marketing leaders.' },
  { label: 'Analyze', description: 'We map findings across your four intelligence pillars — AI strategy, brand, competitive, and media.' },
  { label: 'Predict', description: 'Pattern-matched implications give you the "so what" before your clients have even asked.' },
];

const NOTION_DB_URL = 'https://www.notion.so/2fa0bdffe59e80049d52c6171ae1630d';

// Hoisted: deterministic from module-level constant, no need to recompute per render
const tier1Sources = SOURCES.filter(s => s.tier === 1);
const tier2Sources = SOURCES.filter(s => s.tier === 2);

interface PopoverState {
  source: SourceDef;
  reports: NotionReport[];
  loading: boolean;
}

export const SourceLogosMinimal: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const popoverDomRef = useRef<HTMLDivElement>(null);
  const popoverStateRef = useRef<PopoverState | null>(null);
  const fetchCacheRef = useRef<Map<string, NotionReport[]>>(new Map());

  // Keep ref in sync so stable event handlers can read current popover without capturing it
  useEffect(() => { popoverStateRef.current = popover; }, [popover]);

  // Register listeners once — use popoverStateRef to check current state inside handlers
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverStateRef.current && popoverDomRef.current && !popoverDomRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPopover(null); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Stable callback — reads popoverStateRef instead of capturing popover state
  const handleSourceClick = useCallback(async (def: SourceDef) => {
    if (popoverStateRef.current?.source.source === def.source) {
      setPopover(null);
      return;
    }

    setPopover({ source: def, reports: [], loading: true });

    if (fetchCacheRef.current.has(def.source)) {
      setPopover({ source: def, reports: fetchCacheRef.current.get(def.source)!, loading: false });
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.getSourceReports, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: def.source }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json() as { reports: NotionReport[] };
      fetchCacheRef.current.set(def.source, data.reports);
      setPopover({ source: def, reports: data.reports, loading: false });
    } catch {
      setPopover({ source: def, reports: [], loading: false });
    }
  }, []);

  return (
    <section
      id="sources"
      style={{
        backgroundColor: 'var(--bg-card)',
        padding: 'clamp(40px, 6vw, 60px) clamp(16px, 8vw, 120px)',
        borderTop: '1px solid var(--border-subtle)',
        transition: 'background-color 0.2s ease',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--orange)',
            marginBottom: '32px',
          }}
        >
          TIER-1 SOURCE INTELLIGENCE
        </p>

        {/* Tier-1 pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 12px', marginBottom: '20px', position: 'relative' }}>
          {tier1Sources.map((def) => (
            <SourcePill
              key={def.source}
              def={def}
              isActive={popover?.source.source === def.source}
              onClick={handleSourceClick}
            />
          ))}
        </div>

        {/* Tier-2 pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 12px', marginBottom: '32px', position: 'relative' }}>
          {tier2Sources.map((def) => (
            <SourcePill
              key={def.source}
              def={def}
              isActive={popover?.source.source === def.source}
              onClick={handleSourceClick}
            />
          ))}
        </div>

        {/* Popover panel */}
        {popover && (
          <div
            ref={popoverDomRef}
            style={{
              marginBottom: '32px',
              border: `1px solid ${popover.source.brandColor}44`,
              backgroundColor: 'var(--bg)',
              padding: '20px 24px',
              textAlign: 'left',
              transition: 'opacity 0.15s ease',
            }}
          >
            {/* Popover header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                style={{
                  fontFamily: popover.source.font,
                  fontWeight: popover.source.weight,
                  fontSize: '13px',
                  color: popover.source.brandColor,
                  letterSpacing: popover.source.letterSpacing,
                }}
              >
                {popover.source.label}
              </span>
              <a
                href={NOTION_DB_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                View all in Notion ↗
              </a>
            </div>

            {/* Report list */}
            {popover.loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{ height: '10px', width: i === 1 ? '80%' : i === 2 ? '65%' : '72%', backgroundColor: 'var(--overlay-hover)', borderRadius: 0 }}
                    className="animate-pulse"
                  />
                ))}
              </div>
            ) : popover.reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--muted)',
                    marginBottom: '8px',
                  }}
                >
                  No reports indexed yet for {popover.source.label}.
                </p>
                <a
                  href={NOTION_DB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--orange)',
                    textDecoration: 'none',
                  }}
                >
                  Browse Research Inbox →
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {popover.reports.map((report, i) => (
                  <a
                    key={report.id}
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '10px 0',
                      borderBottom: i < popover.reports.length - 1 ? '1px solid var(--border-light)' : 'none',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--overlay-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--text)',
                        lineHeight: 1.4,
                        marginBottom: report.keyStat ? '4px' : '0',
                      }}
                    >
                      {report.title}
                    </div>
                    {report.keyStat && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '10px',
                          color: 'var(--orange)',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {report.keyStat}
                      </div>
                    )}
                    {report.date && (
                      <div
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '9px',
                          color: 'var(--muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginTop: '2px',
                        }}
                      >
                        {report.date}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 0,
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
          role="tablist"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 20px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: i === activeTab ? 'var(--orange)' : 'var(--muted)',
                background: 'none',
                border: 'none',
                borderBottom: i === activeTab ? '2px solid var(--orange)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab descriptor */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: 'var(--muted)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {TABS[activeTab].description}
        </p>
      </div>
    </section>
  );
};

interface SourcePillProps {
  def: SourceDef;
  isActive: boolean;
  onClick: (def: SourceDef) => void;
}

const SourcePill: React.FC<SourcePillProps> = ({ def, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const active = isActive || isHovered;
  const dimmed = def.tier === 2;
  return (
    <button
      onClick={() => onClick(def)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '8px 16px',
        fontFamily: def.font,
        fontSize: '14px',
        fontWeight: def.weight,
        letterSpacing: def.letterSpacing,
        color: active ? def.brandColor : dimmed ? 'var(--muted)' : 'var(--text)',
        border: `1px solid ${active ? def.brandColor + '88' : dimmed ? 'var(--border-light)' : 'var(--border-subtle)'}`,
        borderRadius: 0,
        backgroundColor: active ? def.brandColor + '0d' : 'transparent',
        cursor: 'pointer',
        transition: 'color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        outline: 'none',
      }}
      title={`View ${def.label} research`}
    >
      {def.label}
    </button>
  );
};
