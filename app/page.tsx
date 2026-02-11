import type { Metadata } from 'next'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import DiscoveryFeed from './DiscoveryFeed'

export async function generateMetadata(): Promise<Metadata> {
  // Fetch top card on server for meta tags
  const q = query(
    collection(db, 'discover_cards'),
    orderBy('publishedAt', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)
  const topCard = snapshot.docs[0]?.data()

  if (topCard) {
    return {
      title: `${topCard.title} | Discovery Feed`,
      description: topCard.macroAnchor || 'Latest marketing intelligence from tier-1 sources',
      keywords: `${topCard.pillar}, ${topCard.source}, AI marketing intelligence, CMO insights`,
      openGraph: {
        title: topCard.title,
        description: topCard.macroAnchor,
        type: 'article',
      }
    }
  }

  // Fallback if no cards
  return {
    title: 'Discovery Feed | AI Marketing Intelligence',
    description: 'Latest curated insights from McKinsey, Forrester, Gartner',
    keywords: 'marketing intelligence, CMO briefing, AI strategy',
  }
}

const discoveryFeedJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Marketing Intelligence Discovery Feed',
  description: 'Curated insights from tier-1 sources for CMOs and marketing leaders',
  audience: {
    '@type': 'Audience',
    audienceType: ['CMO', 'VP Marketing', 'CX Executive', 'Agency Leader'],
  },
  about: [
    { '@type': 'Thing', name: 'AI Marketing Strategy' },
    { '@type': 'Thing', name: 'Customer Experience Transformation' },
    { '@type': 'Thing', name: 'Marketing Operations' },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(discoveryFeedJsonLd) }}
      />
      <DiscoveryFeed />
    </>
  )
}
