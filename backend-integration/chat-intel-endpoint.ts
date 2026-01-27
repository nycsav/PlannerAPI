/**
 * Cloud Run Backend Integration: /chat-intel endpoint
 *
 * Add this to your existing planners-backend Cloud Run service
 *
 * Endpoint: POST /chat-intel
 * Body: { query: string }
 * Returns: PlannerChatResponse
 */

import express, { Request, Response } from 'express';

const router = express.Router();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PPLX_MODEL_FAST = process.env.PPLX_MODEL_FAST || 'sonar-pro'; // Use sonar-pro for real-time data
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second delay

type IntelligenceFramework = {
  id: string;
  label: string;
  actions: string[];
};

type ComparisonData = {
  label: string;
  value: number;
  unit: string; // '%', '$', 'x', etc.
  context: string; // Full context for tooltip
  source?: string; // Company name or benchmark type
};

type PlannerChatResponse = {
  signals: Array<{
    id: string;
    title: string;
    summary: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  implications: string[];
  actions: string[];
  frameworks?: IntelligenceFramework[];
  citations?: string[]; // Include citations for source extraction
  graphData?: {
    comparisons?: ComparisonData[]; // Company comparisons, benchmarks, etc.
    metrics?: Array<{
      label: string;
      value: number;
      unit: string;
      context: string;
    }>;
  };
};

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

/**
 * POST /chat-intel
 * Generate strategic intelligence brief
 */
/**
 * Rich audience-specific context for highly personalized, user-centric responses
 * Each audience has specific pain points, decision frameworks, and success metrics
 */
const AUDIENCE_CONTEXT = {
  CMO: {
    role: 'Chief Marketing Officer',
    focus: 'Board-level strategic decisions, budget allocation, competitive positioning, organizational transformation',
    painPoints: [
      'Proving marketing ROI to CFO and board',
      'Competitive threats and market share shifts',
      'Budget reallocation decisions with limited data',
      'Team capability gaps in emerging tech (AI, retail media)',
      'Attribution blind spots affecting budget confidence'
    ],
    decisionFramework: 'Strategic impact → Budget allocation → Timeline → Board presentation → Measurable outcomes',
    successMetrics: ['Revenue impact', 'Market share', 'Budget efficiency', 'Competitive positioning', 'Team capability'],
    language: 'Board-ready language with specific numbers, competitive context, and strategic implications',
    examples: {
      signals: 'Focus on market share shifts, competitive moves, budget benchmarks, and strategic positioning',
      implications: 'Frame as "What this means for your board presentation" or "How this affects competitive positioning"',
      actions: 'Include budget ranges ($X-YM), timeline (Q1/Q2 2026), board presentation elements, and competitive response'
    }
  },
  'VP Marketing': {
    role: 'VP of Marketing',
    focus: 'Operational execution, team efficiency, vendor selection, pilot programs, cross-functional coordination',
    painPoints: [
      'Vendor evaluation and selection paralysis',
      'Team bandwidth and skill gaps',
      'Pilot program design and execution',
      'Cross-functional alignment (IT, data, creative)',
      'Scaling successful pilots to full programs'
    ],
    decisionFramework: 'Pilot design → Vendor selection → Team assignment → Timeline → Scale criteria → ROI measurement',
    successMetrics: ['Pilot success rate', 'Team efficiency', 'Vendor performance', 'Time to market', 'Operational cost'],
    language: 'Tactical, execution-focused with specific tools, vendors, timelines, and team assignments',
    examples: {
      signals: 'Focus on vendor capabilities, tool comparisons, implementation timelines, and operational efficiency gains',
      implications: 'Frame as "What this means for your team" or "How this affects vendor selection"',
      actions: 'Include specific vendors/platforms, pilot timelines (30/60/90 days), team roles (2-3 FTEs), and scale criteria'
    }
  },
  'Brand Director': {
    role: 'Brand Director',
    focus: 'Brand equity, creative differentiation, positioning strategy, brand safety, consumer perception',
    painPoints: [
      'Brand safety in programmatic and AI-generated content',
      'Creative differentiation in crowded markets',
      'Positioning strategy in evolving consumer landscape',
      'Measuring brand impact beyond direct response',
      'Balancing brand guidelines with performance optimization'
    ],
    decisionFramework: 'Brand positioning → Creative strategy → Safety controls → Measurement → Consumer perception',
    successMetrics: ['Brand equity', 'Creative effectiveness', 'Brand safety score', 'Consumer perception', 'Positioning strength'],
    language: 'Brand-focused with creative examples, positioning frameworks, safety considerations, and perception metrics',
    examples: {
      signals: 'Focus on brand safety incidents, creative trends, positioning shifts, and consumer perception changes',
      implications: 'Frame as "What this means for brand positioning" or "How this affects creative strategy"',
      actions: 'Include brand safety controls, creative formats, positioning tests, and brand measurement frameworks'
    }
  },
  'Growth Leader': {
    role: 'Growth Leader / Performance Marketer',
    focus: 'Acquisition channels, conversion optimization, testing strategy, attribution models, scaling tactics',
    painPoints: [
      'Attribution accuracy across channels',
      'Channel mix optimization with limited budget',
      'Testing strategy and statistical significance',
      'Scaling winning channels while maintaining efficiency',
      'Conversion rate optimization and funnel efficiency'
    ],
    decisionFramework: 'Test design → Attribution model → Channel selection → Budget allocation → Scale criteria → Conversion lift',
    successMetrics: ['ROAS', 'CAC', 'Conversion rate', 'Attribution accuracy', 'Channel efficiency', 'Incremental lift'],
    language: 'Performance-focused with specific metrics, test designs, attribution models, and conversion data',
    examples: {
      signals: 'Focus on channel performance, attribution models, conversion benchmarks, and testing results',
      implications: 'Frame as "What this means for channel mix" or "How this affects conversion optimization"',
      actions: 'Include test budgets ($XK), attribution models, channel comparisons, and conversion lift targets'
    }
  }
};

router.post('/chat-intel', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { query, audience } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: 'Invalid request. Please provide a query string in the request body.'
      });
      return;
    }

    if (query.trim().length === 0) {
      res.status(400).json({
        error: 'Query cannot be empty. Please enter a question about marketing strategy or market intelligence.'
      });
      return;
    }

    // Check API key
    if (!PPLX_API_KEY) {
      console.error('Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'Service configuration error. Please contact support.'
      });
      return;
    }

    // Call Perplexity API with audience context
    const response = await fetchFastIntel({ query, audience: audience || 'CMO' });

    // Return successful response
    res.status(200).json(response);

  } catch (error) {
    console.error('Error in /chat-intel endpoint:', error);

    // Return friendly error message
    res.status(500).json({
      error: 'Unable to generate intelligence brief at this time. Please try again or contact support if the issue persists.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Fetch fast intelligence using Perplexity Sonar
 */
async function fetchFastIntel(args: { query: string; audience: string }): Promise<PlannerChatResponse> {
  const { query, audience } = args;
  const audienceProfile = AUDIENCE_CONTEXT[audience as keyof typeof AUDIENCE_CONTEXT] || AUDIENCE_CONTEXT.CMO;

  // Build rich, personalized system prompt with conversational, user-friendly tone
  const systemPrompt = `You're a trusted strategic intelligence advisor helping a ${audienceProfile.role} make critical decisions. Think of yourself as their go-to source for what's happening in the market and what it means for their business.

**AUDIENCE CONTEXT:**
Role: ${audienceProfile.role}
Primary Focus: ${audienceProfile.focus}
Key Pain Points: ${audienceProfile.painPoints.join('; ')}
Decision Framework: ${audienceProfile.decisionFramework}
Success Metrics: ${audienceProfile.successMetrics.join(', ')}

**EDITORIAL VOICE REQUIREMENTS:**
- Write as if briefing a busy ${audienceProfile.role} before a critical decision
- Use specific numbers, metrics, and data points (avoid vague language)
- Frame implications using role-specific language: ${audienceProfile.examples.implications}
- Make every insight immediately actionable and citable
- Use tension patterns for signals: "The [X]% Problem", "Two Camps Are Emerging", "The Gap Is Widening"
- Use action patterns for moves: "Your next move:", "Start here:", "The 3-step audit:"

**CONTENT GENERATION RULES:**

1. SIGNALS (2-5 key insights):
   - Each signal must include a specific data point or metric
   - Focus on: ${audienceProfile.examples.signals}
   - Use tension patterns in titles when possible
   - Include source attribution with specific publication names
   - Make signals relevant to ${audienceProfile.role}'s pain points

2. IMPLICATIONS (2-4 points):
   - Frame as: ${audienceProfile.examples.implications}
   - Connect directly to ${audienceProfile.role}'s decision framework
   - Use present tense: "This puts pressure on...", "This creates opportunity for..."
   - Quantify impact whenever possible
   - Name specific roles/teams affected

3. ACTIONS (3-4 highly specific moves):
   - Each action MUST include: ${audienceProfile.examples.actions}
   - Start with specific action verbs: Audit, Reallocate, Launch, Build, Partner, Measure, Test
   - Include quantifiable targets, timelines, tools/vendors, expected outcomes, and resources
   - Format: [Action Verb] [What] [Target] [Timeline] [Tools] [Outcome] [Resources]
   - Make immediately executable (no "consider" or "explore" - be direct)

4. FRAMEWORKS (2-3 relevant strategic frameworks):
   - Select frameworks most relevant to the query topic and ${audienceProfile.role}'s focus
   - Categories: Digital Strategy, Media Strategy, CX Strategy, Data Strategy, Content Strategy, Brand Strategy, Growth Strategy, Product Marketing
   - For each framework, provide 3 specific, actionable steps tailored to this query and ${audienceProfile.role}'s context

**QUERY-SPECIFIC PERSONALIZATION:**
The user asked: "${query}"

Your job is to:
- Understand what they're really trying to figure out
- Connect it to what ${audienceProfile.role}s care about most: ${audienceProfile.painPoints.slice(0, 2).join(', ')}
- Give them specific, actionable insights they can use right away
- Use real data and industry benchmarks to back up your recommendations
- Make it clear what this means for their business and what they should do about it

**ABSOLUTE PROHIBITIONS:**
- No generic advice ("consider evaluating", "think about", "explore")
- No vague recommendations without specifics
- No hype words ("revolutionary", "game-changing", "paradigm shift")
- No content that could appear in any generic AI newsletter
- No moves without numbers, timelines, or specific tools

Format your response EXACTLY as follows:

## SIGNALS
- [SIGNAL 1 TITLE - Use tension pattern if possible, include specific metric]
Summary: [1-2 sentences with data point, relevant to ${audienceProfile.role}]
Source: [Source Name] | [URL]

- [SIGNAL 2 TITLE]
Summary: [1-2 sentences with data point, relevant to ${audienceProfile.role}]
Source: [Source Name] | [URL]

## IMPLICATIONS
- [Implication 1 - Frame as ${audienceProfile.examples.implications}]
- [Implication 2 - Connect to ${audienceProfile.role}'s decision framework]

## ACTIONS
- [Action 1 - Include: ${audienceProfile.examples.actions}]
- [Action 2 - Start with action verb, be specific]
- [Action 3 - Make immediately executable]

## FRAMEWORKS
### [Framework 1 Name]
- [Actionable step 1 - specific to query and ${audienceProfile.role}]
- [Actionable step 2 - specific to query and ${audienceProfile.role}]
- [Actionable step 3 - specific to query and ${audienceProfile.role}]

### [Framework 2 Name]
- [Actionable step 1 - specific to query and ${audienceProfile.role}]
- [Actionable step 2 - specific to query and ${audienceProfile.role}]
- [Actionable step 3 - specific to query and ${audienceProfile.role}]

Remember: Every insight must pass the "So What?" test - can a ${audienceProfile.role} act on this immediately? 

Write as if you're helping them make a real decision, not just sharing information. Be conversational, helpful, and focused on what matters most.`;

  // Retry logic with exponential backoff for reliable real-time data fetching
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PPLX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: PPLX_MODEL_FAST,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.2,
          max_tokens: 1500,
          // Ensure real-time data with recency filter
          search_recency_filter: 'day', // Only get data from last 24 hours
          return_citations: true, // Always return citations for source attribution
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(45000), // 45 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Perplexity API error (${response.status}): ${errorText}`);
        
        // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
        if (response.status >= 400 && response.status < 500) {
          throw error;
        }
        
        lastError = error;
        // Exponential backoff: wait longer between retries
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
        }
        continue;
      }

      const data: PerplexityResponse = await response.json();
      
      // Validate response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('Invalid Perplexity API response: missing choices array');
      }

      const content = data.choices[0]?.message?.content || '';
      const citations = data.citations || [];

      if (!content || content.trim().length === 0) {
        throw new Error('Perplexity API returned empty content');
      }

      const parsedResponse = parsePerplexityResponse(content, citations);
      
      // Ensure citations are included in response for frontend source extraction
      return {
        ...parsedResponse,
        citations: citations // Include citations at top level for easy access
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's an abort error (timeout), don't retry
      if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
        throw new Error(`Request timeout: Perplexity API did not respond within 45 seconds. Please try again.`);
      }
      
      // If it's the last attempt, throw the error
      if (attempt === MAX_RETRIES - 1) {
        throw new Error(`Failed to fetch real-time intelligence after ${MAX_RETRIES} attempts: ${lastError.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Unknown error occurred while fetching intelligence');
}

/**
 * Parse Perplexity response into structured PlannerChatResponse
 */
function parsePerplexityResponse(content: string, citations: string[]): PlannerChatResponse {
  const signals: PlannerChatResponse['signals'] = [];
  const implications: string[] = [];
  const actions: string[] = [];
  const frameworks: IntelligenceFramework[] = [];

  const signalsSection = extractSection(content, 'SIGNALS');
  const implicationsSection = extractSection(content, 'IMPLICATIONS');
  const actionsSection = extractSection(content, 'ACTIONS');
  const frameworksSection = extractSection(content, 'FRAMEWORKS');

  // Parse signals
  if (signalsSection) {
    const signalBlocks = signalsSection.split(/^-\s+/m).filter(s => s.trim());

    signalBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      const title = lines[0].trim();
      const summaryLine = lines.find(l => l.startsWith('Summary:'));
      const sourceLine = lines.find(l => l.startsWith('Source:'));

      const summary = summaryLine?.replace('Summary:', '').trim() || '';
      const sourceText = sourceLine?.replace('Source:', '').trim() || '';
      const [sourceName = 'Industry Analysis', sourceUrl = ''] = sourceText.split('|').map(s => s.trim());

      // Use citation URL if available and signal doesn't have a valid URL
      let finalSourceUrl = sourceUrl || '#';
      let finalSourceName = sourceName;
      
      // If no URL in parsed source, try to use citation
      if ((!finalSourceUrl || finalSourceUrl === '#') && citations[index]) {
        try {
          const url = new URL(citations[index]);
          finalSourceUrl = citations[index];
          finalSourceName = url.hostname.replace('www.', '') || sourceName;
        } catch (e) {
          // Invalid citation URL, keep defaults
        }
      }

      signals.push({
        id: `SIG-${index + 1}`,
        title,
        summary,
        sourceName: finalSourceName,
        sourceUrl: finalSourceUrl,
      });
    });
  }

  // Parse implications
  if (implicationsSection) {
    const implLines = implicationsSection
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().replace(/^-\s*/, ''));
    implications.push(...implLines);
  }

  // Parse actions
  if (actionsSection) {
    const actionLines = actionsSection
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.trim().replace(/^-\s*/, ''));
    actions.push(...actionLines);
  }

  // Parse frameworks
  if (frameworksSection) {
    const frameworkBlocks = frameworksSection.split(/^###\s+/m).filter(f => f.trim());

    frameworkBlocks.forEach((block) => {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) return;

      // First line is the framework name
      const label = lines[0].trim().replace(/\(.*\)/, '').trim();
      const id = label.toLowerCase().replace(/\s+/g, '-');

      // Rest are action items (lines starting with -)
      const frameworkActions = lines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.trim().replace(/^-\s*/, ''));

      if (frameworkActions.length > 0) {
        frameworks.push({
          id,
          label,
          actions: frameworkActions
        });
      }
    });
  }

  // Fallback: If parsing fails, create from raw content
  if (signals.length === 0) {
    const bullets = content.match(/^[-•]\s+.+$/gm) || [];
    bullets.slice(0, 5).forEach((bullet, index) => {
      signals.push({
        id: `SIG-${index + 1}`,
        title: bullet.substring(0, 60).trim(),
        summary: bullet.substring(2).trim(),
        sourceName: 'Perplexity Analysis',
        sourceUrl: citations[index] || '#',
      });
    });
  }

  if (implications.length === 0) {
    implications.push('Requires strategic review and action planning');
    implications.push('Monitor competitive landscape for similar trends');
  }

  if (actions.length === 0) {
    actions.push('Schedule team briefing to discuss implications');
    actions.push('Analyze internal data to validate findings');
  }

  // Extract structured graph data from content
  const graphData = extractGraphData(content, signals);

  // Return with frameworks (optional field - frontend will fall back to defaults if empty)
  // Always include citations for source extraction
  return {
    signals,
    implications,
    actions,
    frameworks: frameworks.length > 0 ? frameworks : undefined,
    citations: citations, // Include citations for frontend to extract sources
    graphData: graphData.comparisons && graphData.comparisons.length > 0 ? graphData : undefined
  };
}

/**
 * Extract structured graph data from content for visualization
 * Looks for comparisons, benchmarks, and key metrics
 */
function extractGraphData(content: string, signals: PlannerChatResponse['signals']): PlannerChatResponse['graphData'] {
  const comparisons: ComparisonData[] = [];
  const metrics: Array<{ label: string; value: number; unit: string; context: string }> = [];

  // Extract company/entity comparisons (e.g., "Unilever's 18% vs Average 12%")
  const companyComparisonRegex = /([A-Z][a-zA-Z\s&]+(?:'s)?)\s+([\d.]+)\s*([%xBMK$]?)\s+([\w\s]+)/gi;
  let match;
  const seenComparisons = new Set<string>();

  while ((match = companyComparisonRegex.exec(content)) !== null) {
    const entity = match[1].trim();
    const value = parseFloat(match[2]);
    const unit = match[3] || '';
    const context = match[4].trim();

    // Normalize value based on unit
    let normalizedValue = value;
    if (unit === 'B') normalizedValue = value * 1000; // Billions to millions scale
    else if (unit === 'M') normalizedValue = value;
    else if (unit === 'K') normalizedValue = value / 1000;
    else if (unit === '%') normalizedValue = value;
    else if (unit === 'x') normalizedValue = value * 10; // Multipliers scaled for visualization

    const key = `${entity}-${context}`;
    if (!seenComparisons.has(key) && !isNaN(value)) {
      comparisons.push({
        label: entity.length > 20 ? entity.substring(0, 17) + '...' : entity,
        value: normalizedValue,
        unit: unit || '%',
        context: `${entity} ${value}${unit} ${context}`,
        source: entity
      });
      seenComparisons.add(key);
    }
  }

  // Extract benchmark comparisons (e.g., "Average 12%", "Industry average 15%")
  const benchmarkRegex = /(?:Industry\s+)?(?:Average|Benchmark|Standard|Typical)\s+([\d.]+)\s*([%xBMK$]?)/gi;
  while ((match = benchmarkRegex.exec(content)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2] || '%';
    
    let normalizedValue = value;
    if (unit === 'B') normalizedValue = value * 1000;
    else if (unit === 'M') normalizedValue = value;
    else if (unit === 'K') normalizedValue = value / 1000;
    else if (unit === 'x') normalizedValue = value * 10;

    if (!isNaN(value) && !comparisons.some(c => c.label === 'Average' && Math.abs(c.value - normalizedValue) < 0.1)) {
      comparisons.push({
        label: 'Average',
        value: normalizedValue,
        unit: unit,
        context: `Industry average: ${value}${unit}`,
        source: 'Industry Benchmark'
      });
    }
  }

  // Extract key metrics from signals
  signals.forEach((signal, index) => {
    // Look for percentage metrics
    const percentMatch = signal.summary.match(/([\d.]+)\s*%/);
    if (percentMatch) {
      const value = parseFloat(percentMatch[1]);
      if (!isNaN(value)) {
        metrics.push({
          label: signal.title.length > 25 ? signal.title.substring(0, 22) + '...' : signal.title,
          value: value,
          unit: '%',
          context: signal.summary
        });
      }
    }

    // Look for dollar amounts
    const dollarMatch = signal.summary.match(/\$([\d.]+)\s*([BMK]?)/);
    if (dollarMatch) {
      const value = parseFloat(dollarMatch[1]);
      const suffix = dollarMatch[2] || '';
      let normalizedValue = value;
      if (suffix === 'B') normalizedValue = value * 1000;
      else if (suffix === 'M') normalizedValue = value;
      else if (suffix === 'K') normalizedValue = value / 1000;

      if (!isNaN(value)) {
        metrics.push({
          label: signal.title.length > 25 ? signal.title.substring(0, 22) + '...' : signal.title,
          value: normalizedValue,
          unit: `$${suffix}`,
          context: signal.summary
        });
      }
    }
  });

  // If we have comparisons, prioritize those; otherwise use metrics
  if (comparisons.length > 0) {
    return { comparisons: comparisons.slice(0, 4) };
  } else if (metrics.length > 0) {
    return { metrics: metrics.slice(0, 4) };
  }

  return undefined;
}

function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// Export the router
export default router;

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add this file to your Cloud Run backend
 * 2. Import and mount the router in your main Express app:
 *
 *    import chatIntelRouter from './routes/chat-intel-endpoint';
 *    app.use(chatIntelRouter);
 *
 * 3. Set environment variables:
 *    - PPLX_API_KEY=your_perplexity_api_key_here
 *    - PPLX_MODEL_FAST=sonar
 *
 * 4. Redeploy your Cloud Run service
 *
 * 5. Test endpoint:
 *    curl -X POST https://planners-backend-865025512785.us-central1.run.app/chat-intel \
 *      -H "Content-Type: application/json" \
 *      -d '{"query":"How are CMOs reallocating budget to AI in 2026?"}'
 */
