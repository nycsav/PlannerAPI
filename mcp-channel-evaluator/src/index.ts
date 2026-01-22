#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Anthropic from '@anthropic-ai/sdk';

// Channel guidelines for evaluation
const CHANNEL_GUIDELINES = {
  linkedin: {
    ideal_length: '150-200 words',
    tone: 'Professional, data-driven, actionable',
    format: 'Hook + bullets + CTA',
    strengths: 'Data points, career relevance, quick insights',
    weaknesses: 'Long narratives, academic language, no clear takeaway',
    audience: 'CMOs, agency owners, senior marketers',
    best_for: ['ai_strategy', 'competitive_intel']
  },
  medium: {
    ideal_length: '800-1200 words',
    tone: 'Analytical, thoughtful, educational',
    format: 'Narrative with subheadings and depth',
    strengths: 'Deep analysis, case studies, research-backed',
    weaknesses: 'Surface-level takes, bullet lists only, no depth',
    audience: 'Marketing practitioners, strategists',
    best_for: ['brand_performance', 'media_trends']
  },
  substack: {
    ideal_length: '500-800 words',
    tone: 'Personal, opinionated, conversational',
    format: 'Newsletter style with strong POV',
    strengths: 'Hot takes, personal stories, contrarian views',
    weaknesses: 'Neutral reporting, corporate speak, no personality',
    audience: 'Marketing leaders seeking POV',
    best_for: ['ai_strategy', 'competitive_intel']
  }
} as const;

type Channel = keyof typeof CHANNEL_GUIDELINES;

interface Card {
  title: string;
  summary: string;
  signals?: string[];
  moves?: string[];
  pillar?: string;
  type?: string;
  sourceUrl?: string;
}

interface EvaluationResult {
  score: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  recommendedEdits: string[];
  suggestedTitle?: string;
  suggestedHook?: string;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Create MCP server
const server = new Server(
  {
    name: 'channel-evaluator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'evaluate_card_for_channel',
      description: 'Evaluates how well an intelligence card fits a specific publishing channel (LinkedIn, Medium, or Substack)',
      inputSchema: {
        type: 'object' as const,
        properties: {
          card: {
            type: 'object' as const,
            description: 'The discover card to evaluate',
            properties: {
              title: { type: 'string' as const },
              summary: { type: 'string' as const },
              signals: { type: 'array' as const, items: { type: 'string' as const } },
              moves: { type: 'array' as const, items: { type: 'string' as const } },
              pillar: { type: 'string' as const },
              type: { type: 'string' as const },
              sourceUrl: { type: 'string' as const }
            },
            required: ['title', 'summary']
          },
          channel: {
            type: 'string' as const,
            enum: ['linkedin', 'medium', 'substack'],
            description: 'Target publishing channel'
          }
        },
        required: ['card', 'channel']
      }
    },
    {
      name: 'evaluate_card_for_all_channels',
      description: 'Evaluates an intelligence card against all publishing channels and returns ranked recommendations',
      inputSchema: {
        type: 'object' as const,
        properties: {
          card: {
            type: 'object' as const,
            description: 'The discover card to evaluate',
            properties: {
              title: { type: 'string' as const },
              summary: { type: 'string' as const },
              signals: { type: 'array' as const, items: { type: 'string' as const } },
              moves: { type: 'array' as const, items: { type: 'string' as const } },
              pillar: { type: 'string' as const },
              type: { type: 'string' as const },
              sourceUrl: { type: 'string' as const }
            },
            required: ['title', 'summary']
          }
        },
        required: ['card']
      }
    },
    {
      name: 'get_channel_guidelines',
      description: 'Returns the publishing guidelines for a specific channel',
      inputSchema: {
        type: 'object' as const,
        properties: {
          channel: {
            type: 'string' as const,
            enum: ['linkedin', 'medium', 'substack'],
            description: 'The channel to get guidelines for'
          }
        },
        required: ['channel']
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'evaluate_card_for_channel': {
      const { card, channel } = args as { card: Card; channel: Channel };
      const evaluation = await evaluateCardForChannel(card, channel);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(evaluation, null, 2)
        }]
      };
    }

    case 'evaluate_card_for_all_channels': {
      const { card } = args as { card: Card };
      const results: Record<string, EvaluationResult> = {};

      for (const channel of ['linkedin', 'medium', 'substack'] as Channel[]) {
        results[channel] = await evaluateCardForChannel(card, channel);
      }

      // Rank channels by score
      const ranked = Object.entries(results)
        .sort(([, a], [, b]) => b.score - a.score)
        .map(([channel, eval_]) => ({
          channel,
          score: eval_.score,
          recommendation: eval_.score >= 90 ? 'auto_publish' :
                         eval_.score >= 80 ? 'review_recommended' :
                         eval_.score >= 70 ? 'needs_adaptation' : 'not_recommended'
        }));

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            evaluations: results,
            ranked,
            topChannel: ranked[0]?.channel,
            publishReady: ranked.filter(r => r.score >= 85).map(r => r.channel)
          }, null, 2)
        }]
      };
    }

    case 'get_channel_guidelines': {
      const { channel } = args as { channel: Channel };
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(CHANNEL_GUIDELINES[channel], null, 2)
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function evaluateCardForChannel(card: Card, channel: Channel): Promise<EvaluationResult> {
  const guidelines = CHANNEL_GUIDELINES[channel];

  const prompt = `You are a content strategist evaluating whether this intelligence card is a good fit for ${channel}.

CARD DATA:
Title: ${card.title}
Summary: ${card.summary}
Signals: ${card.signals?.join('\n- ') || 'N/A'}
Moves: ${card.moves?.join('\n- ') || 'N/A'}
Pillar: ${card.pillar || 'N/A'}
Type: ${card.type || 'brief'}

CHANNEL GUIDELINES FOR ${channel.toUpperCase()}:
- Ideal length: ${guidelines.ideal_length}
- Tone: ${guidelines.tone}
- Format: ${guidelines.format}
- Strengths: ${guidelines.strengths}
- Weaknesses: ${guidelines.weaknesses}
- Best for pillars: ${guidelines.best_for.join(', ')}

EVALUATE:
1. Content-channel fit score (0-100)
   - 90+: Ready to publish as-is
   - 80-89: Minor tweaks needed
   - 70-79: Significant adaptation required
   - <70: Poor fit, consider different channel
2. Why this score? (specific strengths and weaknesses for this channel)
3. What edits would optimize this for ${channel}?
4. Suggest an optimized title and hook for this channel

Return ONLY valid JSON in this exact format:
{
  "score": 85,
  "reasoning": "Brief explanation of the score",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendedEdits": ["edit 1", "edit 2"],
  "suggestedTitle": "Optimized title for this channel",
  "suggestedHook": "Opening hook optimized for this channel"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  try {
    return JSON.parse(textContent.text) as EvaluationResult;
  } catch {
    // If JSON parsing fails, return a default structure
    return {
      score: 0,
      reasoning: 'Failed to parse evaluation response',
      strengths: [],
      weaknesses: ['Could not evaluate'],
      recommendedEdits: []
    };
  }
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Channel Evaluator MCP Server running on stdio');
}

main().catch(console.error);
