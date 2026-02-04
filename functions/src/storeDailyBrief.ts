import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firestore
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface DailyBriefPayload {
  date: string; // YYYY-MM-DD format
  content: {
    linkedin_post: string;
    briefing_items: string;
    citations: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  };
  approved_by: string;
  approved_at: string; // ISO timestamp
}

export const storeDailyBrief = functions.https.onRequest(async (req, res) => {
  // CORS headers (allow requests from n8n)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Validate payload
  const payload: DailyBriefPayload = req.body;

  if (!payload.date || !payload.content || !payload.approved_by) {
    res.status(400).json({
      error: 'Missing required fields: date, content, approved_by'
    });
    return;
  }

  try {
    // Debug: Log citations structure
    console.log(`[DEBUG] Storing brief for ${payload.date}`);
    console.log(`[DEBUG] Citations count: ${payload.content.citations?.length || 0}`);
    if (payload.content.citations && payload.content.citations.length > 0) {
      console.log('[DEBUG] First citation:', JSON.stringify(payload.content.citations[0]));
    }

    // Store in Firestore
    await db.collection('daily_briefs').doc(payload.date).set({
      content: payload.content,
      approved_by: payload.approved_by,
      approved_at: payload.approved_at,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        source: 'n8n_workflow',
        version: '1.0'
      }
    });

    console.log(`Daily brief stored for ${payload.date}`);

    res.status(200).json({
      success: true,
      date: payload.date,
      message: 'Daily brief stored successfully'
    });

  } catch (error) {
    console.error('Error storing daily brief:', error);
    res.status(500).json({
      error: 'Failed to store daily brief',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
