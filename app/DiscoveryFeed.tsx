'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DiscoveryFeed() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'discover_cards'),
      orderBy('publishedAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <main>
      <h1>Discovery Feed</h1>
      {cards.map(card => (
        <article key={card.id} className="card">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: card.title,
                description: card.macroAnchor,
                author: {
                  '@type': 'Organization',
                  name: card.source,
                },
                datePublished: card.publishedAt,
                articleSection: card.pillar,
                audience: {
                  '@type': 'Audience',
                  audienceType: card.audienceSegment,
                },
                keywords: `${card.pillar}, ${card.source}, ${card.audienceSegment}, tier ${card.sourceTier}`,
                about: [
                  {
                    '@type': 'Thing',
                    name: card.pillar,
                  },
                ],
              }),
            }}
          />
          <h2>{card.title}</h2>
          <p>{card.macroAnchor}</p>
          <small>{card.source} • Tier {card.sourceTier} • {card.audienceSegment}</small>
        </article>
      ))}
    </main>
  );
}
