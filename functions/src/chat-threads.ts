/**
 * Firebase Cloud Function: Chat Thread Persistence
 *
 * Endpoints:
 *   POST /chatThreadCreate  — Create or append to a conversation thread
 *   POST /chatThreadGet     — Retrieve a thread by ID
 *
 * Deploy: firebase deploy --only functions:chatThreadCreate,functions:chatThreadGet
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { handlePreflight } from './utils/cors';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  userId?: string;
  cardId?: string;
  topic: string;
  messages: ChatMessage[];
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * Create a new thread or append a message to an existing one.
 *
 * Body: {
 *   threadId?: string,     // If provided, append to existing thread
 *   cardId?: string,       // Optional: link to a discover_card
 *   topic: string,         // Thread topic (usually the initial query)
 *   message: { role: 'user' | 'assistant', content: string }
 * }
 *
 * Returns: { threadId: string, messageCount: number }
 */
export const chatThreadCreate = functions.https.onRequest(async (req, res) => {
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { threadId, cardId, topic, message } = req.body;

    if (!message || !message.role || !message.content) {
      res.status(400).json({ error: 'message with role and content required' });
      return;
    }

    const chatMessage: ChatMessage = {
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
    };

    if (threadId) {
      // Append to existing thread
      const threadRef = db.collection('chat_threads').doc(threadId);
      const threadDoc = await threadRef.get();

      if (!threadDoc.exists) {
        res.status(404).json({ error: 'Thread not found' });
        return;
      }

      await threadRef.update({
        messages: admin.firestore.FieldValue.arrayUnion(chatMessage),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      const updated = await threadRef.get();
      const data = updated.data() as ChatThread;

      res.json({
        threadId,
        messageCount: data.messages.length,
      });
    } else {
      // Create new thread
      const newRef = db.collection('chat_threads').doc();
      const thread: ChatThread = {
        id: newRef.id,
        cardId: cardId || null,
        topic: topic || message.content.slice(0, 100),
        messages: [chatMessage],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      await newRef.set(thread);

      res.json({
        threadId: newRef.id,
        messageCount: 1,
      });
    }
  } catch (error: any) {
    console.error('[chatThreadCreate] Error:', error.message);
    res.status(500).json({ error: 'Failed to save thread', details: error.message });
  }
});

/**
 * Retrieve a chat thread by ID.
 *
 * Body: { threadId: string }
 * Returns: ChatThread
 */
export const chatThreadGet = functions.https.onRequest(async (req, res) => {
  if (handlePreflight(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { threadId } = req.body;

    if (!threadId) {
      res.status(400).json({ error: 'threadId required' });
      return;
    }

    const threadDoc = await db.collection('chat_threads').doc(threadId).get();

    if (!threadDoc.exists) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    res.json(threadDoc.data());
  } catch (error: any) {
    console.error('[chatThreadGet] Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve thread', details: error.message });
  }
});
