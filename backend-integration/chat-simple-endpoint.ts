/**
 * Simple Chat Endpoint for Follow-Up Questions
 *
 * Add this to your planners-backend Cloud Run service
 *
 * Endpoint: POST /chat-simple
 * Body: { query: string }
 * Returns: { response: string }
 */

import express, { Request, Response } from 'express';

const router = express.Router();

const PPLX_API_KEY = process.env.PPLX_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * POST /chat-simple
 * Simple conversational endpoint for follow-up questions
 */
router.post('/chat-simple', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid request. Please provide a query string.'
      });
      return;
    }

    if (!PPLX_API_KEY) {
      console.error('Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'Service configuration error.'
      });
      return;
    }

    // Call Perplexity API for simple conversational response
    const response = await fetch(PERPLEXITY_API_URL, {
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
            content: 'You are a strategic marketing intelligence assistant for C-suite executives. Provide concise, actionable answers with specific data, metrics, and sources when possible. Keep responses under 150 words. Focus on business impact and strategic implications.'
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || 'I could not generate a response.';

    // Return simple response
    res.status(200).json({
      response: responseText,
      citations: data.citations || []
    });

  } catch (error) {
    console.error('Error in /chat-simple endpoint:', error);
    res.status(500).json({
      error: 'Unable to process your question. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add this file to your Cloud Run backend (e.g., src/routes/chat-simple.ts)
 *
 * 2. Import and mount in your main Express app:
 *
 *    import chatSimpleRouter from './routes/chat-simple';
 *    app.use(chatSimpleRouter);
 *
 * 3. Redeploy your Cloud Run service
 *
 * 4. Test:
 *    curl -X POST https://planners-backend-865025512785.us-central1.run.app/chat-simple \
 *      -H "Content-Type: application/json" \
 *      -d '{"query": "Which brands are leading in AI marketing spend?"}'
 */
