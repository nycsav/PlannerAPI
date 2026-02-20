import React from 'react';
import { Check } from 'lucide-react';

const FREE_FEATURES = [
  '3 intelligence cards daily',
  'All 4 pillars (AI strategy, brand performance, competitive intel, media trends)',
  'Tier-1 source citations',
  'Basic search & filtering',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Intelligence archive (full searchable history)',
  'Export to PDF/slides',
  'Weekly deep-dive reports',
  'Slack/email delivery',
  'API access',
];

interface PricingSectionProps {
  onStartFree?: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onStartFree }) => {
  return (
    <section id="pricing" style={{
      backgroundColor: 'var(--navy)',
      padding: '2rem 1.5rem',
      borderTop: '1px solid var(--border-light)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Try Intelligence That Respects Your Time
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--overlay-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
          }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--cream)',
              marginBottom: '0.25rem',
            }}>
              Daily Intelligence (Free)
            </h3>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: '1rem',
            }}>
              $0/month
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 1rem 0',
            }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  <Check size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: 'var(--text-muted-60)',
              marginBottom: '1rem',
            }}>
              Perfect for: Solo consultants, agency strategists testing the platform
            </p>
            <button
              onClick={() => onStartFree?.()}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--accent)',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--navy)',
                cursor: 'pointer',
              }}
            >
              Start Free →
            </button>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: 'var(--overlay-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            opacity: 0.9,
          }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--cream)',
              marginBottom: '0.25rem',
            }}>
              Premium Intelligence
            </h3>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-muted-60)',
              marginBottom: '1rem',
            }}>
              $49/month
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 1rem 0',
            }}>
              {PRO_FEATURES.map((f, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  <Check size={16} style={{ color: 'var(--text-muted-50)', flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: 'var(--text-muted-60)',
              marginBottom: '1rem',
            }}>
              Perfect for: Agency teams, in-house research departments
            </p>
            <button
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--overlay-medium)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-muted-50)',
                cursor: 'not-allowed',
              }}
            >
              Coming Soon
            </button>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.75rem',
              color: 'var(--text-muted-50)',
              marginTop: '0.5rem',
            }}>
              Focus on free tier quality first—premium features ship Q2 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
