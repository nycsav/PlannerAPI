/**
 * Firebase Cloud Function: Mark Card as Posted to LinkedIn
 *
 * Called by n8n after successfully posting a card to LinkedIn.
 * Updates the card in Firestore with LinkedIn posting metadata.
 *
 * Endpoint: POST /markLinkedInPosted
 * Authentication: API key via X-API-Key header
 * Body: { cardId: string, linkedinPostUrl?: string }
 * Returns: { success: boolean }
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const markLinkedInPosted = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onRequest(async (req, res) => {
    // ============================================
    // CORS Configuration
    // ============================================
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

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

    // ============================================
    // Authentication
    // ============================================
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.N8N_API_KEY || functions.config().n8n?.api_key;

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('[LinkedIn] Unauthorized request - invalid or missing API key');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid X-API-Key header is required'
      });
      return;
    }

    // ============================================
    // Request Validation
    // ============================================
    try {
      const { cardId, linkedinPostUrl } = req.body;

      if (!cardId || typeof cardId !== 'string') {
        res.status(400).json({
          error: 'Invalid payload',
          message: 'cardId is required and must be a string'
        });
        return;
      }

      console.log(`[LinkedIn] Marking card as posted: ${cardId}`);

      // ============================================
      // Update Card in Firestore
      // ============================================
      const cardRef = admin.firestore()
        .collection('discover_cards')
        .doc(cardId);

      const cardDoc = await cardRef.get();

      if (!cardDoc.exists) {
        console.error(`[LinkedIn] Card not found: ${cardId}`);
        res.status(404).json({
          error: 'Card not found',
          message: `No card found with ID: ${cardId}`
        });
        return;
      }

      // Update card with LinkedIn metadata
      const updateData: any = {
        linkedinPosted: true,
        linkedinPostedAt: admin.firestore.Timestamp.now()
      };

      if (linkedinPostUrl) {
        updateData.linkedinPostUrl = linkedinPostUrl;
      }

      await cardRef.update(updateData);

      const cardData = cardDoc.data();
      console.log(
        `✅ [LinkedIn] Card marked as posted: "${cardData?.title}" ` +
        `(${linkedinPostUrl ? 'with URL' : 'without URL'})`
      );

      // ============================================
      // Success Response
      // ============================================
      res.status(200).json({
        success: true,
        cardId,
        cardTitle: cardData?.title || 'Unknown',
        linkedinPostUrl: linkedinPostUrl || null,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      // ============================================
      // Error Handling
      // ============================================
      console.error('[LinkedIn] Error marking card as posted:', error);

      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });
