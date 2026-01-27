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
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * POST /chat-simple
 * Simple conversational endpoint for follow-up questions
 */
router.post('/chat-simple', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        error: 'What would you like to know more about?'
      });
      return;
    }

    if (!PPLX_API_KEY) {
      console.error('Missing PPLX_API_KEY environment variable');
      res.status(500).json({
        error: 'I\'m having a configuration issue. We\'re looking into it.'
      });
      return;
    }

    // Call Perplexity API with retry logic for reliable real-time data
    let lastError: Error | null = null;
    let responseText = '';
    let citations: string[] = [];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(PERPLEXITY_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PPLX_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar-pro', // Use sonar-pro for real-time online data
            messages: [
              {
                role: 'system',
                content: `You're a trusted strategic intelligence advisor helping a ${audience || 'CMO'} make critical decisions. 

Write as if you're having a direct conversation - be helpful, clear, and actionable. Use real data and specific examples when you can. Keep it concise (under 150 words) but make every word count.

Focus on what matters most: business impact, strategic implications, and what they should do next. Be direct but friendly - like you're briefing a colleague before an important meeting.

Never mention that you don't have access to information or include disclaimers. Always respond positively using your knowledge and research capabilities.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.2,
            max_tokens: 500,
            search_recency_filter: 'day', // Ensure real-time data from last 24 hours
            return_citations: true, // Always return citations
          }),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`Perplexity API error (${response.status}): ${errorText}`);
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }
          
          lastError = error;
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
          }
          continue;
        }

        const data = await response.json();
        
        if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
          throw new Error('Invalid Perplexity API response: missing choices');
        }

        responseText = data.choices[0]?.message?.content || 'I need a bit more context to help with that. Could you rephrase your question?';
        citations = data.citations || [];

        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Perplexity API returned empty response');
        }

        // Success - break out of retry loop
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (lastError.name === 'AbortError' || lastError.message.includes('timeout')) {
          throw new Error('This is taking longer than expected. Please try again in a moment.');
        }
        
        if (attempt === MAX_RETRIES - 1) {
          throw new Error(`Failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, attempt)));
      }
    }

    // Return simple response
    res.status(200).json({
      response: responseText,
      citations: citations
    });

  } catch (error) {
    console.error('Error in /chat-simple endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: errorMessage.includes('timeout') || errorMessage.includes('trouble connecting') 
        ? errorMessage 
        : 'I had trouble processing that. Could you try rephrasing your question?',
      details: errorMessage
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
