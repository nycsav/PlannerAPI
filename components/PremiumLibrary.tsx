import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Clock } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { IntelligenceModal, IntelligencePayload } from './IntelligenceModal';

type PremiumBrief = {
  id: string;
  title: string;
  source: string;
  sourceTier: number;
  excerpt: string;
  sourceUrl: string;
  publishedDate: string;
  featured: boolean;
  createdAt: Timestamp;
  summary: string;
  signals: string[];
  moves: string[];
  pillar: string;
  type: string;
  chartData?: {
    type: string;
    data: Array<{ category: string; value: number }>;
  };
};

// Source tier badge colors (from briefing requirements)
const TIER_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-red-500', text: 'text-white', label: 'Premier Research' },
  2: { bg: 'bg-orange-500', text: 'text-white', label: 'Platform Research' },
  3: { bg: 'bg-yellow-500', text: 'text-white', label: 'Trade Publication' },
  4: { bg: 'bg-blue-500', text: 'text-white', label: 'Data Provider' },
  5: { bg: 'bg-gray-500', text: 'text-white', label: 'Emerging Signal' },
};

// Brand logo URLs (use simple logo.dev service for consistent branding)
const BRAND_LOGOS: Record<string, string> = {
  // Tier 1 - Premier Research
  'McKinsey': 'https://logo.clearbit.com/mckinsey.com',
  'Gartner': 'https://logo.clearbit.com/gartner.com',
  'Forrester': 'https://logo.clearbit.com/forrester.com',
  'BCG': 'https://logo.clearbit.com/bcg.com',
  'Bain': 'https://logo.clearbit.com/bain.com',
  'Deloitte': 'https://logo.clearbit.com/deloitte.com',

  // Tier 2 - Platform Research
  'Google': 'https://logo.clearbit.com/google.com',
  'Google Cloud': 'https://logo.clearbit.com/cloud.google.com',
  'OpenAI': 'https://logo.clearbit.com/openai.com',
  'Anthropic': 'https://logo.clearbit.com/anthropic.com',
  'Meta': 'https://logo.clearbit.com/meta.com',
  'Microsoft': 'https://logo.clearbit.com/microsoft.com',
  'Amazon Ads': 'https://logo.clearbit.com/amazon.com',
  'Perplexity': 'https://logo.clearbit.com/perplexity.ai',
  'Perplexity AI': 'https://logo.clearbit.com/perplexity.ai',
  'Perplexity AI + Harvard': 'https://logo.clearbit.com/perplexity.ai',

  // Tier 3 - Trade Publications
  'Ad Age': 'https://logo.clearbit.com/adage.com',
  'AdWeek': 'https://logo.clearbit.com/adweek.com',
  'Digiday': 'https://logo.clearbit.com/digiday.com',
  'Marketing Week': 'https://logo.clearbit.com/marketingweek.com',
  'Webflow': 'https://logo.clearbit.com/webflow.com',
  'The Verge': 'https://logo.clearbit.com/theverge.com',
};

export const PremiumLibrary: React.FC = () => {
  const [briefs, setBriefs] = useState<PremiumBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<PremiumBrief | null>(null);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);

  console.log('🔍 PremiumLibrary component mounted');

  useEffect(() => {
    fetchPremiumBriefs();
  }, []);

  const fetchPremiumBriefs = async () => {
    console.log('🔍 PremiumLibrary: fetchPremiumBriefs called');
    setLoading(true);
    try {
      const briefsRef = collection(db, 'premium_briefs');
      console.log('📊 PremiumLibrary: Querying premium_briefs collection...');

      // Fetch more briefs than needed to ensure diversity
      const q = query(
        briefsRef,
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      console.log('📊 PremiumLibrary: Query completed. Documents found:', snapshot.size);

      const allBriefs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PremiumBrief[];

      // Ensure source diversity: max 1 brief per source for the top 4
      const diverseBriefs: PremiumBrief[] = [];
      const sourcesSeen = new Set<string>();

      for (const brief of allBriefs) {
        // If we already have 4 briefs, stop
        if (diverseBriefs.length >= 4) break;

        // If we haven't seen this source yet, or we have less than 4 briefs total, add it
        if (!sourcesSeen.has(brief.source)) {
          diverseBriefs.push(brief);
          sourcesSeen.add(brief.source);
        }
      }

      // If we still need more briefs and have exhausted unique sources, add duplicates
      // but prioritize tier 1 > tier 2 > tier 3
      if (diverseBriefs.length < 4) {
        const remaining = allBriefs
          .filter(b => !diverseBriefs.find(db => db.id === b.id))
          .sort((a, b) => a.sourceTier - b.sourceTier);

        diverseBriefs.push(...remaining.slice(0, 4 - diverseBriefs.length));
      }

      console.log('📊 PremiumLibrary: Diverse briefs selected:', diverseBriefs.length);
      console.log('📊 Sources:', diverseBriefs.map(b => b.source));

      setBriefs(diverseBriefs);
    } catch (err) {
      console.error('❌ PremiumLibrary: Error fetching premium briefs:', err);
      setBriefs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate contextual follow-up questions based on brief content
   */
  const generateFollowUpQuestions = (brief: PremiumBrief) => {
    const followUps = [];
    const title = brief.title.toLowerCase();
    const summary = (brief.summary || '').toLowerCase();
    const content = `${title} ${summary}`;

    // AI-related research
    if (content.includes('ai') || content.includes('artificial intelligence')) {
      followUps.push({
        label: 'AI Implementation',
        question: `Based on the ${brief.source} research on "${brief.title}", what are the specific steps my team should take in the next 30 days to implement these AI recommendations?`,
        displayQuery: 'What are the 30-day implementation steps for this AI strategy?'
      });
      followUps.push({
        label: 'ROI Analysis',
        question: `What ROI metrics should I use to measure success of the AI initiatives discussed in "${brief.title}"?`,
        displayQuery: 'How do I measure ROI on these AI initiatives?'
      });
    }

    // Attribution/Measurement research
    if (content.includes('attribution') || content.includes('measurement') || content.includes('roi')) {
      followUps.push({
        label: 'Current State Assessment',
        question: `How can I audit my current attribution model against the findings in "${brief.title}"?`,
        displayQuery: 'How do I audit my current attribution setup?'
      });
      followUps.push({
        label: 'Alternative Approaches',
        question: `What are alternatives to traditional attribution that ${brief.source} recommends in this research?`,
        displayQuery: 'What are the alternative attribution approaches?'
      });
    }

    // Competitive/Market research
    if (content.includes('competitive') || content.includes('market') || content.includes('industry')) {
      followUps.push({
        label: 'Competitive Positioning',
        question: `Based on "${brief.title}", how should I reposition my brand against competitors in the next quarter?`,
        displayQuery: 'How should I reposition against competitors?'
      });
      followUps.push({
        label: 'Market Opportunities',
        question: `What untapped market opportunities does this ${brief.source} research reveal?`,
        displayQuery: 'What market opportunities are being missed?'
      });
    }

    // Agency/Services research
    if (content.includes('agency') || content.includes('services') || content.includes('consulting')) {
      followUps.push({
        label: 'Internal vs External',
        question: `Should I build this capability in-house or work with an agency based on the "${brief.title}" findings?`,
        displayQuery: 'Build in-house or hire agency for this?'
      });
    }

    // Generic fallbacks (always add these)
    followUps.push({
      label: 'Key Risks',
      question: `What are the biggest risks to ignore from the ${brief.source} research on "${brief.title}"?`,
      displayQuery: 'What risks should I NOT ignore from this research?'
    });

    followUps.push({
      label: 'Budget Impact',
      question: `How should this ${brief.source} research influence my 2026 marketing budget allocation?`,
      displayQuery: 'How should this change my budget priorities?'
    });

    // Return first 4-5 most relevant questions
    return followUps.slice(0, 5);
  };

  const handleBriefClick = (brief: PremiumBrief) => {
    console.log('🔍 PremiumLibrary: handleBriefClick called with brief:', brief);
    console.log('📊 Brief fields:', {
      title: brief.title,
      summary: brief.summary,
      signals: brief.signals,
      moves: brief.moves,
      source: brief.source,
      sourceUrl: brief.sourceUrl,
    });

    // Create IntelligenceSignal object from brief source for citations
    const sourceSignals = [];
    if (brief.source && brief.sourceUrl && brief.sourceUrl !== '#') {
      sourceSignals.push({
        id: `source-${brief.id}`,
        title: brief.source,
        summary: brief.excerpt || '',
        sourceName: brief.source,
        sourceUrl: brief.sourceUrl,
      });
    }

    // Generate contextual follow-up questions
    const followUps = generateFollowUpQuestions(brief);

    const payload: IntelligencePayload = {
      query: brief.title,
      summary: brief.summary || 'No summary available.',
      keySignals: brief.signals || [],
      movesForLeaders: brief.moves || [],
      signals: sourceSignals,  // Pass source citation for SOURCES section
      followUps: followUps,  // Add contextual follow-up questions
      graphData: brief.chartData ? {
        comparisons: brief.chartData.data.map(item => ({
          label: item.category,
          value: item.value,
          unit: '%',
          context: brief.title,
        }))
      } : undefined,
    };

    console.log('🎯 PremiumLibrary: Payload created:', payload);
    console.log('📚 Sources passed to modal:', sourceSignals);
    console.log('❓ Follow-up questions generated:', followUps.length);

    setSelectedBrief(brief);
    setIntelligencePayload(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent, brief: PremiumBrief) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBriefClick(brief);
    }
  };

  const getTierBadge = (tier: number) => {
    return TIER_COLORS[tier] || TIER_COLORS[5];
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#0A0E27] py-2xl border-b border-gray-800">
        <section className="max-w-content mx-auto w-full app-padding-x">
          <div className="mb-xl">
            <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-900 rounded-xl p-lg border border-gray-800 animate-pulse">
                <div className="h-6 w-24 bg-gray-800 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-800 rounded mb-3 w-4/5"></div>
                <div className="h-6 bg-gray-800 rounded mb-4 w-3/5"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Don't render if no briefs
  if (briefs.length === 0) {
    console.log('⚠️ PremiumLibrary: No briefs to display - returning null');
    // TODO: Temporarily show debug message instead of null
    return (
      <div className="bg-[#0A0E27] py-2xl border-b border-gray-800">
        <section className="max-w-content mx-auto w-full app-padding-x">
          <div className="text-center text-gray-400 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-bold">Premium Library: No featured briefs found</p>
            <p className="text-sm mt-2">Debug: Check console logs for Firestore query details</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#0A0E27] py-2xl border-b border-gray-800">
        <section className="max-w-content mx-auto w-full app-padding-x">
          {/* Section Header */}
          <div className="mb-xl">
            <div className="flex items-center gap-md mb-2">
              <BookOpen className="w-8 h-8 text-planner-orange" />
              <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1]" style={{ fontStyle: 'italic', fontWeight: 900 }}>
                Premium Intelligence Library
              </h2>
            </div>
            <p className="text-base text-gray-400 leading-relaxed">
              Deep-dive research from McKinsey, Gartner, Google, and top-tier platforms
            </p>
          </div>

          {/* Premium Briefs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {briefs.map((brief) => {
              const tierBadge = getTierBadge(brief.sourceTier);

              return (
                <div
                  key={brief.id}
                  className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl border border-gray-800 hover:border-planner-orange/50 overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-planner-orange focus:ring-offset-2 focus:ring-offset-[#0A0E27] transition-all duration-200 hover:shadow-2xl hover:shadow-planner-orange/10 hover:-translate-y-1"
                  onClick={() => handleBriefClick(brief)}
                  onKeyDown={(e) => handleKeyDown(e, brief)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Read premium brief: ${brief.title}`}
                >
                  {/* Brand Logo Header */}
                  <div className={`${tierBadge.bg} ${tierBadge.text} px-4 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      {BRAND_LOGOS[brief.source] && (
                        <img
                          src={BRAND_LOGOS[brief.source]}
                          alt={`${brief.source} logo`}
                          className="h-5 w-auto object-contain bg-white rounded px-2 py-1"
                          onError={(e) => {
                            // Fallback to text if logo fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wide">{tierBadge.label}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-75" />
                  </div>

                  <div className="p-lg">
                    {/* Source Name */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                        {brief.source}
                      </span>
                      {brief.publishedDate && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {brief.publishedDate}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-black text-white mb-3 leading-tight tracking-tight group-hover:text-planner-orange transition-colors line-clamp-2">
                      {brief.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {brief.excerpt}
                    </p>

                    {/* Read More CTA */}
                    <div className="flex items-center text-xs text-planner-orange font-medium group-hover:text-orange-400 transition-colors">
                      <span>Read Full Brief</span>
                      <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Intelligence Modal for Brief Details */}
      <IntelligenceModal
        open={!!selectedBrief}
        payload={intelligencePayload}
        onClose={() => {
          setSelectedBrief(null);
          setIntelligencePayload(null);
        }}
        isLoading={false}
      />
    </>
  );
};
