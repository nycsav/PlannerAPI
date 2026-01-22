/**
 * Firebase Cloud Function: Get Top Card for Publishing
 *
 * Returns the highest priority card from today's Daily Intelligence generation
 * for n8n workflow to format and publish to social channels (LinkedIn, Medium, etc.)
 *
 * This endpoint is READ-ONLY - n8n pulls content, doesn't generate it.
 * Content generation happens in generateDiscoverCards.ts (the core engine).
 *
 * Endpoint: GET /getTopCardForPublishing
 * Authentication: API key via X-API-Key header
 * Returns: { card: DiscoverCard, timestamp: string }
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DiscoverCard } from './types';

export const getTopCardForPublishing = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onRequest(async (req, res) => {
    // ============================================
    // CORS Configuration
    // ============================================
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Only accept GET requests
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed. Use GET.' });
      return;
    }

    // ============================================
    // Authentication
    // ============================================
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.N8N_API_KEY || functions.config().n8n?.api_key;

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('[Publishing] Unauthorized request - invalid or missing API key');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid X-API-Key header is required'
      });
      return;
    }

    // ============================================
    // Query Firestore for Top Card
    // ============================================
    try {
      // Get cards from the last 24 hours (covers today's generation)
      const twentyFourHoursAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      console.log('[Publishing] Querying for top card published after:', twentyFourHoursAgo.toDate());

      const snapshot = await admin.firestore()
        .collection('discover_cards')
        .where('publishedAt', '>=', twentyFourHoursAgo)
        .orderBy('publishedAt', 'desc')
        .orderBy('priority', 'desc')
        .limit(5) // Get top 5 to have options
        .get();

      if (snapshot.empty) {
        console.warn('[Publishing] No cards found from the last 24 hours');
        res.status(404).json({
          error: 'No cards available',
          message: 'No intelligence cards found from the last 24 hours. Daily generation may not have run yet.',
          timestamp: new Date().toISOString()
        });
        return;
      }

      console.log(`[Publishing] Found ${snapshot.size} cards from last 24 hours`);

      // Get cards that haven't been posted to LinkedIn yet
      const unpostedCards = snapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.linkedinPosted;
      });

      if (unpostedCards.length === 0) {
        console.warn('[Publishing] All recent cards have already been posted to LinkedIn');
        res.status(404).json({
          error: 'No unposted cards',
          message: 'All recent cards have already been published to LinkedIn.',
          totalCards: snapshot.size,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Select the top unposted card
      const topCardDoc = unpostedCards[0];
      const topCard = topCardDoc.data() as DiscoverCard;

      console.log(
        `✅ [Publishing] Selected top card: "${topCard.title}" ` +
        `(priority: ${topCard.priority}, pillar: ${topCard.pillar})`
      );

      // ============================================
      // Success Response
      // ============================================
      res.status(200).json({
        card: {
          id: topCardDoc.id,
          ...topCard
        },
        metadata: {
          totalCardsToday: snapshot.size,
          unpostedCards: unpostedCards.length,
          selectedReason: 'Highest priority unposted card from last 24 hours'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // ============================================
      // Error Handling
      // ============================================
      console.error('[Publishing] Error fetching top card:', error);

      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });
