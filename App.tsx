
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { IntelligenceCard } from './components/IntelligenceCard';
import { ConversationalBrief } from './components/ConversationalBrief';
import { IntelligenceModal, IntelligencePayload } from './components/IntelligenceModal';
import { EngineInstructions } from './components/EngineInstructions';
import { HeroSearch } from './components/HeroSearch';
import { ExecutiveStrategyChat } from './components/ExecutiveStrategyChat';
import { SignupModal } from './components/SignupModal';
import { DailyIntelligence } from './components/DailyIntelligence';
import { DashboardSection } from './components/DashboardSection';
import { PostSignupWelcome } from './components/PostSignupWelcome';
import { FeatureTour } from './components/FeatureTour';
import { WelcomeTooltip } from './components/WelcomeTooltip';
import { NewContentBadge } from './components/NewContentBadge';
import { useAudience } from './contexts/AudienceContext';
import { useAuth } from './contexts/AuthContext';
import { ENDPOINTS, fetchWithTimeout } from './src/config/api';
import {
  isFirstVisit,
  markAsVisited,
  hasCompletedOnboarding,
  markOnboardingCompleted,
  hasCompletedTour,
  markTourCompleted,
  hasWelcomeTooltipBeenDismissed,
  markWelcomeTooltipDismissed,
  updateLastVisit,
  shouldShowNewContentBadge,
  getNewContentCount,
  updateLastDailyIntelCheck,
} from './utils/userState';

type IntelligenceBriefing = {
  id: string;
  date: string;
  title: string;
  description: string;
  theme: string;
  query?: string;
};

const SectionHeader: React.FC<{ id: string; title: string; subtitle?: string; badge?: React.ReactNode }> = ({ id, title, subtitle, badge }) => (
  <div id={id} className="mb-xl border-b border-gray-200 dark:border-slate-700 pb-md">
    <div className="flex items-center gap-md">
      <h2 className="font-display text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight" style={{ fontStyle: 'italic', fontWeight: 900 }}>{title}</h2>
      {badge}
    </div>
    {subtitle && (
      <p className="text-base text-gray-600 dark:text-gray-300 mt-2">{subtitle}</p>
    )}
  </div>
);

const App: React.FC = () => {
  const { audience } = useAudience();

  const [searchState, setSearchState] = useState<{
    isOpen: boolean;
    query: string;
    source: 'Claude' | 'Perplexity' | 'Gemini';
    data?: any;
  }>({
    isOpen: false,
    query: '',
    source: 'Perplexity',
    data: null
  });

  const [chatQuery, setChatQuery] = useState<string>('');
  const [isChatActive, setIsChatActive] = useState<boolean>(false);

  // Intelligence Modal state
  const [intelligenceOpen, setIntelligenceOpen] = useState(false);
  const [intelligencePayload, setIntelligencePayload] = useState<IntelligencePayload | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);

  // Signup Modal state
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Onboarding state
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  const [showPostSignupWelcome, setShowPostSignupWelcome] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const { user } = useAuth();

  // New content tracking
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [newContentCount, setNewContentCount] = useState(0);

  // Dynamic briefings state
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([]);
  const [loadingBriefings, setLoadingBriefings] = useState<boolean>(true);

  // Fallback briefings - business impact focus for C-suite marketing leaders
  const FALLBACK_BRIEFINGS: IntelligenceBriefing[] = [
    {
      id: "LOG-201",
      date: "19.01.2026",
      title: "TikTok Shop Surges: $12B US Revenue Projection for 2026",
      description: "Social commerce disrupts traditional e-commerce playbook. TikTok Shop projected to reach $12B US revenue in 2026, up 340% YoY. Brands allocating 15-25% of social budgets to shoppable video. Average conversion rates 2.8x higher than Instagram Shopping, driven by live commerce and creator partnerships. CMOs rethinking social-to-commerce attribution models.",
      theme: "Market Trends"
    },
    {
      id: "LOG-202",
      date: "19.01.2026",
      title: "AI Content Moderation Reduces Brand Safety Costs 67%",
      description: "Automated brand safety achieves enterprise-scale efficiency. Leading brands using AI moderation (Google Jigsaw, OpenAI) reduce safety incidents by 78% while cutting review costs 67%. Real-time flagging prevents $2-4M annual reputation damage. Average deployment: 45 days with 3 FTEs. CMOs prioritizing AI safety over manual review for programmatic campaigns.",
      theme: "AI Strategy"
    },
    {
      id: "LOG-203",
      date: "19.01.2026",
      title: "B2B Marketing Attribution Gap Costs $8.9B Annually",
      description: "Multi-touch attribution failures drive massive waste in B2B spend. 73% of B2B marketers cannot accurately attribute revenue to channels, resulting in $8.9B misallocated budget annually. Companies implementing AI attribution see 42% improvement in CAC and 3.1x ROI on marketing technology investments. Median payback period: 8 months.",
      theme: "Revenue Growth"
    },
    {
      id: "LOG-204",
      date: "19.01.2026",
      title: "Retail Media Consolidation: Top 3 Networks Hold 64% Share",
      description: "Winner-take-most dynamics reshape retail media landscape. Amazon Ads (38%), Walmart Connect (16%), and Target Roundel (10%) command 64% of $65B retail media market. Smaller networks struggle for scale as brands consolidate to 2-3 primary partners. First-party data moats deepen competitive advantages. CMOs negotiating guaranteed ROAS deals at 4-6x benchmarks.",
      theme: "Competitive Analysis"
    },
    {
      id: "LOG-205",
      date: "19.01.2026",
      title: "Sustainability Claims Under Fire: 56% Face Greenwashing Scrutiny",
      description: "Regulatory crackdown threatens brand positioning strategies. FTC investigates 56% of Fortune 500 sustainability marketing claims. Unsubstantiated green claims risk $10-50M fines plus reputation damage. Brands with third-party verified ESG credentials maintain 89% consumer trust vs. 34% for unverified claims. CMOs investing $2-5M in verification infrastructure to protect brand equity.",
      theme: "Brand Intelligence"
    },
    {
      id: "LOG-206",
      date: "19.01.2026",
      title: "Zero-Party Data Collection Drives 51% Higher Engagement",
      description: "Explicit consumer preferences outperform behavioral inference. Brands collecting zero-party data (explicit preferences, intent) achieve 51% higher engagement rates and 34% improved conversion versus third-party cookies. Interactive quizzes, preference centers, and loyalty programs generate 2.3x more actionable insights. Average implementation cost: $400-600K for enterprise CDP with zero-party modules.",
      theme: "Customer Retention"
    }
  ];

  // Fetch intelligence and open modal
  const fetchIntelligence = async (query: string, displayQuery?: string) => {
    console.log('[App] fetchIntelligence called with query:', query, 'displayQuery:', displayQuery);
    
    // Open modal immediately to show loading state (optimized: batch state updates)
    setIntelligenceOpen(true);
    setIsLoadingIntelligence(true);
    setIntelligencePayload(null); // Clear previous payload to show loading state
    
    // Use requestAnimationFrame to ensure smooth UI update
    requestAnimationFrame(() => {
      console.log('[App] Modal opened, loading state set');
    });

    try {
      // Convert audience format from VP_Marketing to "VP Marketing"
      const audienceFormatted = audience.replace(/_/g, ' ');

      console.log('[App] Fetching intelligence from backend...');

      const res = await fetchWithTimeout(ENDPOINTS.chatIntel, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query, audience: audienceFormatted }),
        timeout: 50000, // Increased timeout for real-time data fetching
      });
      console.log('[App] Backend response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[App] Backend error response:', errorText);
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('[App] Backend data received:', data);
      
      // Ensure citations are available for source extraction
      if (!data.citations && data.raw?.citations) {
        data.citations = data.raw.citations;
      }

      // Use display query for modal, or extract clean query from detailed prompt
      const cleanQuery = displayQuery || query.split('. Include:')[0].replace(/^Provide a detailed financial impact analysis for "|^Analyze the competitive landscape for "|^Create a detailed implementation roadmap for "/g, '').replace(/"/g, '');

      // Generate real-time, context-aware follow-up questions based on content
      const generateFollowUps = (query: string, summary: string, moves: string[], signals: any[]) => {
        const allContent = `${query} ${summary} ${moves.join(' ')} ${signals.map(s => s.title + ' ' + s.summary).join(' ')}`;
        const lowerContent = allContent.toLowerCase();

        // Extract entities (companies, technologies, products) from content
        const extractEntities = (text: string) => {
          // Common tech companies and products (canonical names only - no duplicates)
          const companies = [
            'Nvidia', 'Groq', 'DeepSeek', 'OpenAI', 'Anthropic', 'Google', 'Meta', 'Microsoft', 'Amazon',
            'Apple', 'Boston Dynamics', 'Hyundai', 'Shopify', 'Walmart', 'Target', 'TikTok', 'Instagram',
            'Facebook', 'Twitter', 'X', 'LinkedIn', 'Reddit', 'Smartly', 'GPT', 'Claude', 'Gemini'
          ];
          
          const technologies = [
            'LPU', 'LPU architecture', 'V4', 'Atlas robot', 'AI agents', 'agentic AI', 'machine learning',
            'inference', 'context windows', 'coding AI', 'physical AI', 'robot chips', 'open-source AI',
            'retail media', 'attribution', 'first-party data', 'zero-party data', 'CDP', 'AEO', 'GEO'
          ];
          
          const foundCompanies = companies.filter(company => 
            text.includes(company) || lowerContent.includes(company.toLowerCase())
          );
          
          const foundTechnologies = technologies.filter(tech => 
            text.includes(tech) || lowerContent.includes(tech.toLowerCase())
          );
          
          // Deduplicate companies by case-insensitive comparison
          const uniqueCompanies = foundCompanies.filter((company, index, arr) => 
            arr.findIndex(c => c.toLowerCase() === company.toLowerCase()) === index
          );
          
          return { companies: uniqueCompanies, technologies: foundTechnologies };
        };

        // Extract metrics and transactions
        const extractMetrics = (text: string) => {
          const transactions = text.match(/\$(\d+(?:\.\d+)?[KMB]?)\s*(?:acquisition|deal|investment|funding)/gi) || [];
          const percentages = text.match(/(\d+(?:\.\d+)?)%/g) || [];
          const multipliers = text.match(/(\d+(?:\.\d+)?)x/gi) || [];
          
          return {
            transactions: transactions.map(t => t.replace(/\$/g, '').trim()),
            percentages: percentages,
            multipliers: multipliers
          };
        };

        // Extract temporal signals (events, dates, recent developments)
        const extractTemporalSignals = (text: string) => {
          const events = [
            'CES 2026', 'CES', 'acquisition', 'deployment', 'announcement', 'launch', 'release',
            'this week', 'latest', 'upcoming', 'recent', 'new', 'now', 'today'
          ];
          
          const foundEvents = events.filter(event => 
            lowerContent.includes(event.toLowerCase())
          );
          
          // Extract years (2026, 2025, etc.)
          const years = text.match(/\b(20\d{2})\b/g) || [];
          
          return { events: foundEvents, years: [...new Set(years)] };
        };

        const entities = extractEntities(allContent);
        const metrics = extractMetrics(allContent);
        const temporal = extractTemporalSignals(allContent);

        const followUps: { label: string; question: string; displayQuery: string }[] = [];

        // Generate questions based on extracted real-time contexts
        // 1. Architecture/Technology questions
        if (entities.technologies.length > 0) {
          entities.technologies.slice(0, 2).forEach(tech => {
            if (tech === 'LPU' || tech === 'LPU architecture') {
              const company = entities.companies.find(c => ['Groq', 'Nvidia', 'NVIDIA'].includes(c));
              if (company && metrics.transactions.length > 0) {
                followUps.push({
                  label: 'Technology Deep Dive',
                  question: `What is Groq's LPU architecture and why did Nvidia acquire it for ${metrics.transactions[0] || '$20B'}`,
                  displayQuery: `Groq LPU architecture and Nvidia acquisition`
                });
              }
            } else if (tech.includes('V4') || tech === 'DeepSeek') {
              followUps.push({
                label: 'Model Comparison',
                question: `How does DeepSeek V4 improve coding AI compared to GPT and Claude`,
                displayQuery: `DeepSeek V4 vs GPT and Claude`
              });
            } else if (tech.includes('Atlas') || tech.includes('robot')) {
              const company = entities.companies.find(c => ['Boston Dynamics', 'Hyundai'].includes(c));
              if (company) {
                followUps.push({
                  label: 'Deployment Details',
                  question: `Details on Boston Dynamics Atlas robot deployment at Hyundai factory`,
                  displayQuery: `Boston Dynamics Atlas Hyundai deployment`
                });
              }
            }
          });
        }

        // 2. Event-based questions
        if (temporal.events.includes('ces') || temporal.events.includes('ces 2026')) {
          const company = entities.companies.find(c => ['Nvidia', 'NVIDIA'].includes(c));
          if (company) {
            followUps.push({
              label: 'Event Announcements',
              question: `NVIDIA'S CES 2026 announcements on physical AI and robot chips`,
              displayQuery: `NVIDIA CES 2026 physical AI announcements`
            });
          }
        }

        // 3. Trend/Prediction questions
        if (entities.technologies.some(t => t.includes('open-source') || t.includes('AI'))) {
          const year = temporal.years[0] || '2026';
          followUps.push({
            label: 'Market Predictions',
            question: `Predictions for open-source AI models in ${year} breaking Big Tech dominance`,
            displayQuery: `Open-source AI predictions ${year}`
          });
        }

        // 4. Company-specific questions
        if (entities.companies.length >= 2) {
          const [company1, company2] = entities.companies.slice(0, 2);
          // Validate: companies must be different (case-insensitive) and not similar names
          const areDifferentCompanies = company1 && company2 && 
            company1.toLowerCase() !== company2.toLowerCase() &&
            !company1.toLowerCase().includes(company2.toLowerCase()) &&
            !company2.toLowerCase().includes(company1.toLowerCase());
            
          if (areDifferentCompanies && !followUps.some(f => f.displayQuery.includes(company1))) {
            followUps.push({
              label: 'Competitive Analysis',
              question: `How does ${company1} compare to ${company2} in ${entities.technologies[0] || 'AI strategy'}`,
              displayQuery: `${company1} vs ${company2} comparison`
            });
          }
        }

        // 5. Transaction/Acquisition questions
        if (metrics.transactions.length > 0 && entities.companies.length > 0) {
          const company = entities.companies[0];
          const transaction = metrics.transactions[0];
          if (!followUps.some(f => f.question.includes(transaction))) {
            followUps.push({
              label: 'M&A Analysis',
              question: `What drove the ${transaction} acquisition and strategic implications for the market`,
              displayQuery: `${company} ${transaction} acquisition analysis`
            });
          }
        }

        // Fallback to topic-based questions if not enough context-specific ones
        if (followUps.length < 5) {
          const isAI = /\b(ai|artificial intelligence|machine learning|automation|gpt|llm)\b/i.test(allContent);
          const isFinance = /\b(revenue|cost|roi|budget|profit|pricing|financial|investment|funding)\b/i.test(allContent);
          const isMarket = /\b(market|trend|growth|share|expansion|opportunity|landscape)\b/i.test(allContent);
          const isBrand = /\b(brand|reputation|trust|positioning|identity|awareness|perception)\b/i.test(allContent);
          const isData = /\b(data|analytics|attribution|measurement|tracking|metrics)\b/i.test(allContent);
          const isCompetitive = /\b(competitor|competitive|market share|consolidation|positioning)\b/i.test(allContent);

          if (isAI && !followUps.some(f => f.label.includes('AI') || f.label.includes('Implementation'))) {
            followUps.push({
              label: 'AI Implementation',
              question: `Create an AI implementation guide for "${cleanQuery}" for ${audienceFormatted}. Include vendor selection, pilot design, risk mitigation, team needs, timeline, and metrics.`,
              displayQuery: `AI implementation: ${cleanQuery}`
            });
          }

          if (isFinance && !followUps.some(f => f.label.includes('ROI') || f.label.includes('Financial'))) {
            followUps.push({
              label: 'ROI Analysis',
              question: `Provide detailed ROI analysis for "${cleanQuery}" for ${audienceFormatted}. Include cost breakdown, revenue impact, payback period, budget recommendations, and financial modeling.`,
              displayQuery: `ROI analysis: ${cleanQuery}`
            });
          }

          if (isCompetitive && !followUps.some(f => f.label.includes('Competitive'))) {
            followUps.push({
              label: 'Competitive Strategy',
              question: `Develop competitive strategy for "${cleanQuery}" for ${audienceFormatted}. Include competitor analysis, differentiation, positioning, and tactical moves.`,
              displayQuery: `Competitive response: ${cleanQuery}`
            });
          }

          if (isData && !followUps.some(f => f.label.includes('Measurement') || f.label.includes('Data'))) {
            followUps.push({
              label: 'Measurement Strategy',
              question: `Create measurement strategy for "${cleanQuery}" for ${audienceFormatted}. Include KPIs, attribution models, data infrastructure, reporting frameworks, and dashboards.`,
              displayQuery: `Measurement approach: ${cleanQuery}`
            });
          }

          if (isBrand && !followUps.some(f => f.label.includes('Brand'))) {
            followUps.push({
              label: 'Brand Impact',
              question: `Analyze brand implications of "${cleanQuery}" for ${audienceFormatted}. Include reputation risks, positioning opportunities, messaging strategy, and brand protection.`,
              displayQuery: `Brand implications: ${cleanQuery}`
            });
          }
        }

        // Validate and filter follow-ups before returning
        const validateFollowUp = (followUp: { label: string; question: string; displayQuery: string }) => {
          const display = followUp.displayQuery.toLowerCase();
          const question = followUp.question.toLowerCase();
          
          // Check for redundant comparisons (X vs X, X vs X comparison)
          const vsMatch = display.match(/(.+?)\s+vs\s+(.+?)(?:\s+comparison)?$/i);
          if (vsMatch) {
            const [, item1, item2] = vsMatch;
            const clean1 = item1.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const clean2 = item2.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1)) {
              console.log('[FollowUp] Filtered redundant comparison:', followUp.displayQuery);
              return false;
            }
          }
          
          // Check for empty or too short questions
          if (!followUp.question || followUp.question.trim().length < 10) {
            return false;
          }
          
          // Check for placeholder text that wasn't filled
          if (question.includes('undefined') || question.includes('null') || display.includes('undefined')) {
            return false;
          }
          
          return true;
        };

        // Return top 5-7 most relevant, filtered for quality
        return followUps.filter(validateFollowUp).slice(0, 7);
      };

      // Build payload for modal
      const summaryText = data.implications?.join(' ') || 'No summary available.';
      const movesArray = data.actions || [];

      // Ensure signals always have source information - extract from citations if missing
      let signalsWithSources = data.signals || [];
      
      // Generate real-time, context-aware follow-ups using full content
      const followUps = generateFollowUps(cleanQuery, summaryText, movesArray, signalsWithSources);
      
      // If signals don't have sourceUrl, try to extract from citations
      if (signalsWithSources.length > 0 && data.citations && Array.isArray(data.citations)) {
        signalsWithSources = signalsWithSources.map((signal: any, index: number) => {
          // If signal already has sourceUrl, keep it
          if (signal.sourceUrl && signal.sourceUrl !== '#') {
            return signal;
          }
          
          // Otherwise, try to get from citations array
          const citation = data.citations[index];
          if (citation) {
            try {
              const url = new URL(citation);
              return {
                ...signal,
                sourceUrl: citation,
                sourceName: signal.sourceName || url.hostname.replace('www.', '') || 'Source'
              };
            } catch (e) {
              // Invalid URL, keep original signal
              return signal;
            }
          }
          
          return signal;
        });
      }

      // Create source entries directly from citations if signals don't have URLs
      // This ensures we always show Perplexity sources even if signal parsing failed
      const citationSources: any[] = [];
      if (data.citations && Array.isArray(data.citations) && data.citations.length > 0) {
        data.citations.forEach((citation: string, index: number) => {
          try {
            const url = new URL(citation);
            citationSources.push({
              id: `CIT-${index + 1}`,
              title: url.hostname.replace('www.', ''),
              summary: `Source ${index + 1} from Perplexity research`,
              sourceName: url.hostname.replace('www.', ''),
              sourceUrl: citation
            });
          } catch (e) {
            // Skip invalid URLs
            console.warn('Invalid citation URL:', citation, e);
          }
        });
      }

      // Merge signals with citation sources, prioritizing signals with URLs
      const allSources = [
        ...signalsWithSources.filter(s => s.sourceUrl && s.sourceUrl !== '#'),
        ...citationSources.filter(cit => !signalsWithSources.some(s => s.sourceUrl === cit.sourceUrl))
      ];

      const payload: IntelligencePayload = {
        query: cleanQuery, // Show clean user-friendly query in modal
        summary: summaryText,
        keySignals: signalsWithSources.map((s: any) => s.title || s.summary || s) || [],
        signals: allSources.length > 0 ? allSources : signalsWithSources, // Use merged sources, fallback to signals
        movesForLeaders: movesArray,
        frameworks: data.frameworks, // Use dynamic frameworks from API (modal will fallback to defaults if undefined)
        followUps: followUps, // Use real-time context-aware follow-ups generated above
        graphData: data.graphData // Include structured graph data from backend
      };

      console.log('[App] Setting intelligence payload:', payload);
      setIntelligencePayload(payload);
      console.log('[App] Payload set, modal should display data');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[App] Intelligence fetch failed:', errorMessage);
      console.error('[App] Error stack:', error instanceof Error ? error.stack : 'No stack');

      // Determine error type for better, user-friendly messaging
      let userMessage = 'I had trouble getting that intelligence. Could you try again?';
      if (errorMessage.includes('AbortError') || errorMessage.includes('timeout')) {
        userMessage = 'This is taking longer than expected. The system might be busy - try again in a moment?';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        userMessage = 'Looks like there\'s a connection issue. Check your internet and try again?';
      } else if (errorMessage.includes('CORS')) {
        userMessage = 'There\'s a configuration issue on our end. We\'re looking into it.';
      } else if (errorMessage.includes('404')) {
        userMessage = 'I couldn\'t find that endpoint. This might be a temporary issue - try again?';
      } else if (errorMessage.includes('500')) {
        userMessage = 'Something went wrong on our end. Give it a moment and try again?';
      }

      // Show error modal with helpful message
      const errorPayload: IntelligencePayload = {
        query: displayQuery || query,
        summary: `**Error:** ${userMessage}\n\n**Details:** ${errorMessage}\n\nPlease try your search again or contact support if the issue persists.`,
        keySignals: [],
        movesForLeaders: [],
        signals: []
      };
      
      console.log('[App] Setting error payload:', errorPayload);
      setIntelligencePayload(errorPayload);
      // Keep modal open to show error
    } finally {
      setIsLoadingIntelligence(false);
      console.log('[App] Loading complete, isLoadingIntelligence set to false');
    }
  };

  const openSearch = (query: string, source: 'Claude' | 'Perplexity' | 'Gemini' = 'Perplexity', data?: any) => {
    console.log('[App] openSearch called with query:', query, 'source:', source, 'data:', data);
    console.log('[App] About to call fetchIntelligence');
    // Use the new intelligence modal for briefing cards
    fetchIntelligence(query);
    console.log('[App] fetchIntelligence called');
  };

  const scrollToChat = (query?: string) => {
    console.log('[App] scrollToChat called with query:', query);
    try {
      setIsChatActive(true);
      if (query) {
        setChatQuery(query);
        console.log('[App] Chat query set:', query);
      }
      // Wait for component to render before scrolling
      setTimeout(() => {
        console.log('[App] Attempting to find chat section');
        const chatSection = document.querySelector('[class*="Executive Strategy"]')?.closest('div');
        if (chatSection) {
          console.log('[App] Chat section found, scrolling');
          chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus the input after scrolling
          setTimeout(() => {
            const input = chatSection.querySelector('input');
            if (input) {
              input.focus();
              console.log('[App] Input focused');
            }
          }, 800);
        } else {
          console.warn('[App] Chat section not found');
        }
      }, 100); // Increased timeout to ensure component mounts
    } catch (error) {
      console.error('[App] Error in scrollToChat:', error);
    }
  };

  const handleChatQueryProcessed = () => {
    setChatQuery(''); // Reset after processing
  };

  // Fetch dynamic briefings
  const fetchBriefings = async () => {
    setLoadingBriefings(true);
    try {
      // Convert audience format from VP_Marketing to "VP Marketing"
      const audienceFormatted = audience.replace(/_/g, ' ');

      const res = await fetch(
        `${ENDPOINTS.briefingsLatest}?audience=${encodeURIComponent(audienceFormatted)}&limit=6`
      );

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = await res.json();

      if (data.briefings && data.briefings.length > 0) {
        setBriefings(data.briefings);
      } else {
        // Use fallback if no briefings returned
        setBriefings(FALLBACK_BRIEFINGS);
      }
    } catch (error) {
      console.error('Failed to fetch briefings, using fallback:', error);
      setBriefings(FALLBACK_BRIEFINGS);
    } finally {
      setLoadingBriefings(false);
    }
  };

  // Fetch briefings on mount and when audience changes
  useEffect(() => {
    fetchBriefings();
  }, [audience]);

  // Onboarding logic
  useEffect(() => {
    // Track visit
    updateLastVisit();

    // Show welcome tooltip on first visit (if not dismissed)
    if (isFirstVisit() && !hasWelcomeTooltipBeenDismissed()) {
      setTimeout(() => setShowWelcomeTooltip(true), 1000); // Delay 1s for page load
      markAsVisited();
    }

    // Check for new Daily Intelligence content
    if (shouldShowNewContentBadge()) {
      setShowNewBadge(true);
      setNewContentCount(getNewContentCount());
    }
  }, []);

  // Handle successful signup
  const handleSignupSuccess = () => {
    console.log('[App] Signup successful, showing welcome');
    setShowPostSignupWelcome(true);
    markOnboardingCompleted();
  };

  // Handle tour start
  const handleStartTour = () => {
    console.log('[App] Starting feature tour');
    setShowFeatureTour(true);
  };

  // Handle new content badge click
  const handleNewContentClick = () => {
    console.log('[App] New content badge clicked');
    // Scroll to Daily Intelligence section
    const dailyIntelSection = document.querySelector('[class*="DAILY INTELLIGENCE"]')?.closest('div');
    if (dailyIntelSection) {
      dailyIntelSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Mark as checked
    updateLastDailyIntelCheck();
    setShowNewBadge(false);
    setNewContentCount(0);
  };

  // Determine which briefings to display
  const displayBriefings = briefings.length > 0 ? briefings : FALLBACK_BRIEFINGS;

  return (
    <Layout onSignupClick={() => setIsSignupModalOpen(true)}>
          <main className="w-full">

            {/* HERO SECTION */}
            <div className="section-zebra py-2xl border-b border-bureau-border dark:border-slate-700 bg-white dark:bg-slate-900">
              <section className="max-w-hero mx-auto w-full app-padding-x">
                <HeroSearch
                  onSearch={(q, data) => openSearch(q, 'Perplexity', data)}
                  onOpenChat={scrollToChat}
                />
              </section>
            </div>

            {/* EXECUTIVE STRATEGY CHAT - Primary Interactive Feature (only shown after activation) */}
            {isChatActive && (
              <div className="section-zebra py-2xl border-b border-bureau-border dark:border-slate-700 bg-white dark:bg-slate-900">
                <ExecutiveStrategyChat
                  externalQuery={chatQuery}
                  onExternalQueryProcessed={handleChatQueryProcessed}
                />
              </div>
            )}

            {/* DAILY INTELLIGENCE - AI-Generated Market Analysis with Visual Slider */}
            <div className="section-zebra py-2xl bg-white dark:bg-slate-900">
              <section className="max-w-content mx-auto w-full app-padding-x">
                <SectionHeader
                  id="01"
                  title="Daily Intelligence"
                  subtitle="AI-powered market analysis updated every morning at 6am ET"
                  badge={
                    showNewBadge ? (
                      <NewContentBadge
                        count={newContentCount}
                        onClick={handleNewContentClick}
                      />
                    ) : undefined
                  }
                />
                <DashboardSection />
              </section>
            </div>

            {/* STRATEGIC FRAMEWORKS - Decision Support Tools */}
            <div className="section-zebra py-2xl border-t border-bureau-border dark:border-slate-700 bg-white dark:bg-slate-900">
              <section className="max-w-wide mx-auto w-full app-padding-x">
                <SectionHeader
                  id="02"
                  title="Strategic Decision Frameworks"
                  subtitle="Tools and methodologies for marketing leadership teams"
                />
                <EngineInstructions />
              </section>
            </div>
          </main>

          <ConversationalBrief
            isOpen={searchState.isOpen}
            onClose={() => setSearchState({ ...searchState, isOpen: false })}
            initialQuery={searchState.query}
          />

          <IntelligenceModal
            open={intelligenceOpen}
            payload={intelligencePayload}
            onClose={() => setIntelligenceOpen(false)}
            isLoading={isLoadingIntelligence}
            onFollowUp={(question, displayQuery) => {
              console.log('[App] Follow-up clicked:', question);
              // Keep modal open and fetch new intelligence for conversational experience
              fetchIntelligence(question, displayQuery);
            }}
          />

          <SignupModal
            isOpen={isSignupModalOpen}
            onClose={() => setIsSignupModalOpen(false)}
            onSuccess={handleSignupSuccess}
          />

          {/* Post-signup welcome modal */}
          {showPostSignupWelcome && (
            <PostSignupWelcome
              userName={user?.displayName}
              onClose={() => setShowPostSignupWelcome(false)}
              onStartTour={handleStartTour}
            />
          )}

          {/* Feature tour */}
          <FeatureTour
            isOpen={showFeatureTour}
            onComplete={() => {
              setShowFeatureTour(false);
              markTourCompleted();
            }}
            onSkip={() => {
              setShowFeatureTour(false);
              markTourCompleted();
            }}
          />

          {/* Welcome tooltip (first-time visitors) */}
          {showWelcomeTooltip && (
            <WelcomeTooltip
              onDismiss={() => {
                setShowWelcomeTooltip(false);
                markWelcomeTooltipDismissed();
              }}
            />
          )}
    </Layout>
  );
};

export default App;
