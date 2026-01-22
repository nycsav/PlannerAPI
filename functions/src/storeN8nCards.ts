/**
 * Firebase Cloud Function: Store n8n-Generated Cards
 *
 * Receives Daily Intelligence cards from n8n workflow,
 * validates them, and stores to Firestore.
 *
 * Endpoint: POST /storeN8nCards
 * Authentication: API key via X-API-Key header
 * Body: { cards: DiscoverCard[] }
 * Returns: { success: boolean, stored: number, rejected: number, ... }
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateDiscoverCard, generateContentHash } from './utils/validateDiscoverCard';
import { DiscoverCard } from './types';

export const storeN8nCards = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
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
      console.error('[n8n] Unauthorized request - invalid or missing API key');
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
      const { cards } = req.body;

      if (!cards) {
        res.status(400).json({
          error: 'Invalid payload',
          message: 'Request body must include "cards" field'
        });
        return;
      }

      if (!Array.isArray(cards)) {
        res.status(400).json({
          error: 'Invalid payload',
          message: 'Cards must be an array'
        });
        return;
      }

      if (cards.length === 0) {
        res.status(400).json({
          error: 'Invalid payload',
          message: 'Cards array cannot be empty'
        });
        return;
      }

      console.log(`[n8n] Received ${cards.length} cards from n8n workflow`);

      // ============================================
      // Content Validation & Processing
      // ============================================
      const batch = admin.firestore().batch();
      const validCards: DiscoverCard[] = [];
      const rejectedCards: any[] = [];
      const now = admin.firestore.Timestamp.now();

      for (const card of cards) {
        // Validate card against editorial standards
        const validation = validateDiscoverCard(card);

        if (validation.isValid) {
          // Generate unique ID
          const cardId = admin.firestore().collection('discover_cards').doc().id;

          // Enrich card with metadata
          const enrichedCard: DiscoverCard = {
            ...card,
            id: cardId,
            publishedAt: now,
            createdAt: now,
            contentSource: 'n8n',
            validationScore: validation.score,
            contentHash: generateContentHash(card.title + card.summary)
          };

          // Add to batch write
          const docRef = admin.firestore()
            .collection('discover_cards')
            .doc(cardId);

          batch.set(docRef, enrichedCard);
          validCards.push(enrichedCard);

          console.log(
            `✅ [${enrichedCard.pillar}] "${card.title}" ` +
            `(score: ${validation.score}, priority: ${card.priority})`
          );

          // Log warnings if any
          if (validation.warnings.length > 0) {
            console.warn(`⚠️  Warnings for "${card.title}":`, validation.warnings);
          }
        } else {
          // Card failed validation
          console.error(`❌ Card REJECTED: "${card.title}"`);
          console.error('   Validation score:', validation.score);
          console.error('   Issues:', validation.issues);

          rejectedCards.push({
            card,
            validation,
            rejectedAt: now,
            source: 'n8n'
          });
        }
      }

      // ============================================
      // Commit Valid Cards to Firestore
      // ============================================
      if (validCards.length > 0) {
        await batch.commit();
        console.log(`📊 Committed ${validCards.length} cards to discover_cards collection`);
      } else {
        console.warn('⚠️  No valid cards to commit - all were rejected');
      }

      // ============================================
      // Store Rejected Cards for Review
      // ============================================
      if (rejectedCards.length > 0) {
        const rejectedBatch = admin.firestore().batch();

        for (const rejected of rejectedCards) {
          const docRef = admin.firestore()
            .collection('rejected_cards')
            .doc();
          rejectedBatch.set(docRef, rejected);
        }

        await rejectedBatch.commit();
        console.log(`📋 Logged ${rejectedCards.length} rejected cards to rejected_cards collection`);
      }

      // ============================================
      // Success Response
      // ============================================
      const response = {
        success: true,
        stored: validCards.length,
        rejected: rejectedCards.length,
        timestamp: now.toDate().toISOString(),
        validationIssues: rejectedCards.map(r => ({
          title: r.card.title,
          issues: r.validation.issues,
          score: r.validation.score
        })),
        storedCards: validCards.map(c => ({
          id: c.id,
          title: c.title,
          pillar: c.pillar,
          priority: c.priority,
          source: c.source,
          validationScore: c.validationScore
        }))
      };

      console.log(
        `✅ Request completed: ${validCards.length} stored, ${rejectedCards.length} rejected`
      );

      res.status(200).json(response);

    } catch (error) {
      // ============================================
      // Error Handling
      // ============================================
      console.error('[n8n] Error processing cards:', error);

      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });
