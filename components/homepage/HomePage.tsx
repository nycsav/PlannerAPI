import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { SourceLogos } from './SourceLogos';
import { CTASection } from './CTASection';
import { BriefCard, BriefCardProps } from './BriefCard';
import { Footer } from './Footer';

interface HomePageProps {
  onBriefClick?: (brief: any) => void;
  onSignupClick?: () => void;
  onSearch?: (query: string) => void;
}

type BriefWithRaw = BriefCardProps & { rawData?: Record<string, unknown> };

export const HomePage: React.FC<HomePageProps> = ({ onBriefClick, onSignupClick, onSearch }) => {
  const [briefs, setBriefs] = useState<BriefWithRaw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const briefsRef = collection(db, 'discover_cards');
        const q = query(briefsRef, orderBy('publishedAt', 'desc'), limit(6));
        const snapshot = await getDocs(q);
        
        const fetchedBriefs: BriefWithRaw[] = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          return {
            title: data.title || '',
            pillar: data.pillar === 'ai_strategy' ? 'Technology' :
                   data.pillar === 'brand_performance' ? 'Markets' :
                   data.pillar === 'competitive_intel' ? 'Defense' :
                   data.pillar === 'media_trends' ? 'Markets' : 'Policy',
            summary: data.summary || '',
            source: data.source || 'Source',
            readTime: '3 min',
            date: data.publishedAt?.toDate?.()?.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) || 'Recent',
            index,
            rawData: { id: docSnap.id, ...data },
          };
        });

        setBriefs(fetchedBriefs);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--navy)', minHeight: '100vh' }}>
      {/* 1. Navigation */}
      <Navbar onSignupClick={onSignupClick} />

      {/* 2. Hero Section */}
      <HeroSection onSearch={onSearch} />

      {/* 3. Source Logos */}
      <SourceLogos />

      {/* 4. CTA Section */}
      <div style={{ marginBottom: '4rem' }}>
        <CTASection onQueryClick={onSearch} />
      </div>

      {/* 5. Brief Cards Grid */}
      <section style={{ backgroundColor: 'var(--navy)', padding: '4rem 1.5rem', marginBottom: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--cream)',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}>
              Latest Intelligence
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1rem',
              color: 'rgba(248, 246, 240, 0.6)',
            }}>
              Fresh insights delivered daily
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {loading ? (
              <div style={{ color: 'var(--cream)', textAlign: 'center', gridColumn: '1 / -1' }}>
                Loading briefs...
              </div>
            ) : (
              briefs.map((brief) => {
                const { rawData, ...cardProps } = brief;
                return (
                  <BriefCard
                    key={brief.index}
                    {...cardProps}
                    onClick={() => onBriefClick?.(rawData ?? brief)}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
};
