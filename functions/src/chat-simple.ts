/**
 * Firebase Cloud Function: Simple Conversational Chat
 *
 * Endpoint: POST /chat-simple
 * Body: { query: string }
 * Returns: { response: string, citations?: string[] }
 *
 * Deploy: firebase deploy --only functions:chatSimple
 */

import * as functions from 'firebase-functions';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

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
 * Cloud Function handler for simple conversational responses
 */
export const chatSimple = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { query } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid request. Please provide a query string in the request body.'
      });
      return;
    }

    // Check API key
    if (!PPLX_API_KEY) {
      console.error('[chatSimple] Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'Service configuration error. Please contact support.'
      });
      return;
    }

    console.log(`[chatSimple] Processing query: ${query.substring(0, 100)}...`);

    // Call Perplexity API for conversational response
    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PPLX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a strategic marketing intelligence assistant for C-suite executives. Provide direct, confident answers with specific data, metrics, and recent examples. Never mention lack of access to information or disclaimers - always respond positively using your knowledge and current research. Keep responses under 150 words. Focus on business impact, strategic implications, and actionable insights. Format with clear section headers using **bold** for readability.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error(`[chatSimple] Perplexity API error (${perplexityResponse.status}):`, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const data: PerplexityResponse = await perplexityResponse.json();
    const responseText = data.choices?.[0]?.message?.content || 'I could not generate a response.';
    const citations = data.citations || [];

    console.log(`[chatSimple] Response generated successfully (${responseText.length} chars)`);

    // Return simple response
    res.status(200).json({
      response: responseText,
      citations: citations
    });

  } catch (error) {
    console.error('[chatSimple] Error processing request:', error);

    // Return friendly error message
    res.status(500).json({
      error: 'Unable to process your question at this time. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
