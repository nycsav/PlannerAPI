import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
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
      <Navbar onSignupClick={onSignupClick} />
      <HeroSection onSearch={onSearch} />
      
      <section style={{ backgroundColor: 'var(--navy)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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

      <Footer />
    </div>
  );
};
