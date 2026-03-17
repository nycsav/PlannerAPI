/**
 * Firebase Cloud Function: Multi-Platform Distribution Engine
 *
 * Picks the top unposted card, generates platform-specific drafts + branded image,
 * stores in distribution_queue, and sends Slack approval notification.
 *
 * Scheduled: 7:05 AM ET daily (5 min after card generation)
 * Can also be triggered manually: POST /distributeTopSignalManual
 *
 * Deploy: firebase deploy --only functions:distributeTopSignal,functions:distributeTopSignalManual
 */

import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import { handlePreflight } from './utils/cors';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

// ─── Branded Image Template (htmlcsstoimage) ─────────────────────────────

const PILLAR_COLORS: Record<string, string> = {
  ai_strategy: '#8B5CF6',
  brand_performance: '#3B82F6',
  competitive_intel: '#E67E22',
  media_trends: '#10B981',
};

function buildImageHTML(card: any): string {
  const pillarColor = PILLAR_COLORS[card.pillar] || '#E67E22';
  const pillarLabel = (card.pillar || '').replace(/_/g, ' ').toUpperCase();

  // Extract key stat from summary (first number/percentage found)
  const statMatch = card.summary?.match(/(\d+\.?\d*%|\$[\d.]+[BMK]?|\d+,?\d+)/);
  const keyStat = statMatch ? statMatch[0] : '';
  const statContext = keyStat
    ? card.summary.split(keyStat).pop()?.split(/[.!]/)[0]?.trim() || ''
    : '';

  return `
<div style="width:1200px;height:630px;background:linear-gradient(135deg,#0A0F1C 0%,#0d1321 50%,#111827 100%);font-family:'Inter',system-ui,sans-serif;color:#F5F5F5;display:flex;flex-direction:column;justify-content:space-between;padding:60px;position:relative;overflow:hidden;">
  <!-- Noise texture overlay -->
  <div style="position:absolute;inset:0;opacity:0.03;background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22256%22 height=%22256%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');"></div>

  <!-- Pillar accent bar -->
  <div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:${pillarColor};"></div>

  <!-- Content -->
  <div style="position:relative;z-index:1;padding-left:20px;">
    <!-- Pillar pill -->
    <div style="display:inline-block;background:${pillarColor}20;border:1px solid ${pillarColor}60;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;letter-spacing:0.1em;color:${pillarColor};text-transform:uppercase;margin-bottom:24px;">
      ${pillarLabel}
    </div>

    ${keyStat ? `
    <!-- Key stat -->
    <div style="font-size:72px;font-weight:900;color:#E67E22;line-height:1;margin-bottom:8px;letter-spacing:-0.02em;">
      ${keyStat}
    </div>
    <div style="font-size:24px;font-weight:400;color:#94A3B8;margin-bottom:32px;max-width:800px;">
      ${statContext.slice(0, 80)}
    </div>
    ` : `
    <!-- Title (fallback if no stat) -->
    <div style="font-size:36px;font-weight:800;color:#F5F5F5;line-height:1.2;margin-bottom:24px;max-width:900px;">
      ${card.title}
    </div>
    `}

    <!-- Source -->
    <div style="font-size:14px;color:#64748B;font-weight:500;">
      ${card.source || 'signal2noise'}${card.source ? ' · 2026' : ''}
    </div>
  </div>

  <!-- Footer -->
  <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-end;padding-left:20px;">
    <div>
      <div style="font-size:18px;font-weight:700;color:#E67E22;margin-bottom:4px;">signals.ensolabs.ai</div>
      <div style="font-size:13px;color:#64748B;">Your next move: Read the full brief →</div>
    </div>
    <div style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;">signal2noise intelligence</div>
  </div>
</div>`;
}

async function generateBrandedImage(card: any): Promise<string | null> {
  const hctiApiKey = process.env.HCTI_API_KEY;
  const hctiUserId = process.env.HCTI_USER_ID;

  if (!hctiApiKey || !hctiUserId) {
    console.log('[IMAGE] htmlcsstoimage not configured — skipping branded image');
    return null;
  }

  try {
    const html = buildImageHTML(card);
    const response = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${hctiUserId}:${hctiApiKey}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        html,
        css: '',
        google_fonts: 'Inter:400,500,700,800,900',
      }),
    });

    if (!response.ok) {
      console.warn(`[IMAGE] htmlcsstoimage error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { url: string };
    console.log(`[IMAGE] Generated branded card: ${data.url}`);
    return data.url;
  } catch (err: any) {
    console.warn('[IMAGE] Failed to generate branded image:', err.message);
    return null;
  }
}

// ─── Platform-Specific Post Drafting (Single Claude Call) ─────────────────

interface PlatformDrafts {
  linkedin: string;
  twitter_thread: string[];
  email_subject: string;
  email_body: string;
  slack_message: string;
}

async function draftAllPlatformPosts(card: any): Promise<PlatformDrafts> {
  const anthropicKey = ANTHROPIC_API_KEY.value() || process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: `You are the distribution editor for signal2noise, a marketing intelligence platform. Draft platform-specific posts from an intelligence card.

RULES:
- No emojis. No hype words (revolutionary, game-changing, paradigm shift).
- Lead with the strongest data point.
- Editorial voice: analytical, pragmatic, direct, credible.
- Every post must end with a CTA linking to signals.ensolabs.ai
- LinkedIn: Professional, 200-400 words, tension framing.
- Twitter/X: 3-5 tweet thread, 280 chars max each, lead with key stat.
- Email: Subject < 60 chars, body has top 3 signals + CTA.
- Slack: Single concise message with bold title.

Return valid JSON only — no markdown fences.`,
    messages: [
      {
        role: 'user',
        content: `Draft posts for all platforms from this intelligence card:

TITLE: ${card.title}
SUMMARY: ${card.summary}
SIGNALS: ${(card.signals || []).join(' | ')}
MOVES: ${(card.moves || []).join(' | ')}
SOURCE: ${card.source || 'N/A'}
PILLAR: ${card.pillar}
APP URL: https://signals.ensolabs.ai/brief/${card.id}

Return JSON:
{
  "linkedin": "full LinkedIn post text",
  "twitter_thread": ["tweet 1", "tweet 2", "tweet 3"],
  "email_subject": "subject line",
  "email_body": "HTML email body with inline styles",
  "slack_message": "Slack message with *bold* and links"
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected Claude response type');

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Claude response');

  return JSON.parse(jsonMatch[0]) as PlatformDrafts;
}

// ─── Slack Approval Notification ──────────────────────────────────────────

async function sendSlackApproval(
  card: any,
  drafts: PlatformDrafts,
  imageUrl: string | null,
  queueId: string,
): Promise<boolean> {
  const slackWebhook = process.env.SLACK_APPROVAL_WEBHOOK;
  if (!slackWebhook) {
    console.log('[SLACK] No SLACK_APPROVAL_WEBHOOK configured — skipping notification');
    return false;
  }

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `New Signal Ready: ${card.title.slice(0, 100)}` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Pillar:* ${card.pillar}\n*Source:* ${card.source || 'N/A'}\n*Priority:* ${card.priority || 'N/A'}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*LinkedIn Preview:*\n${drafts.linkedin.slice(0, 300)}...`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Twitter Thread:* ${drafts.twitter_thread.length} tweets\n*Email Subject:* ${drafts.email_subject}`,
      },
    },
    ...(imageUrl
      ? [{ type: 'image' as const, image_url: imageUrl, alt_text: 'Branded card preview' }]
      : []),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Approve All' },
          style: 'primary',
          action_id: 'approve_all',
          value: queueId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'LinkedIn Only' },
          action_id: 'approve_linkedin',
          value: queueId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Regenerate' },
          action_id: 'regenerate',
          value: queueId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Skip' },
          style: 'danger',
          action_id: 'skip',
          value: queueId,
        },
      ],
    },
  ];

  try {
    const resp = await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ blocks }),
    });

    if (resp.ok) {
      console.log('[SLACK] Approval notification sent');
      return true;
    }
    console.warn(`[SLACK] Webhook returned ${resp.status}`);
    return false;
  } catch (err: any) {
    console.warn('[SLACK] Failed to send approval:', err.message);
    return false;
  }
}

// ─── Main Distribution Pipeline ──────────────────────────────────────────

async function runDistribution(): Promise<void> {
  const startTime = Date.now();
  console.log('========================================');
  console.log('DISTRIBUTION ENGINE v1');
  console.log('========================================');

  // Step 1: Get top unposted card from last 24h
  const twentyFourHoursAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  const snapshot = await db
    .collection('discover_cards')
    .where('publishedAt', '>=', twentyFourHoursAgo)
    .orderBy('publishedAt', 'desc')
    .orderBy('priority', 'desc')
    .limit(10)
    .get();

  const unpostedDocs = snapshot.docs.filter((d) => !d.data().linkedinPosted);

  if (unpostedDocs.length === 0) {
    console.log('[DIST] No unposted cards found — nothing to distribute');
    return;
  }

  const topDoc = unpostedDocs[0];
  const cardData = topDoc.data() as Record<string, any>;
  const card = { id: topDoc.id, ...cardData } as Record<string, any>;
  console.log(`[DIST] Selected: "${card.title}" (priority: ${card.priority}, pillar: ${card.pillar})`);

  // Step 2: Generate branded image card
  const imageUrl = await generateBrandedImage(card);

  // Step 3: Draft all platform posts in single Claude call
  const drafts = await draftAllPlatformPosts(card);
  console.log(`[DIST] Drafted: LinkedIn (${drafts.linkedin.length} chars), Twitter (${drafts.twitter_thread.length} tweets), Email ("${drafts.email_subject}")`);

  // Step 4: Store in distribution queue
  const queueRef = db.collection('distribution_queue').doc();
  await queueRef.set({
    id: queueRef.id,
    cardId: card.id,
    cardTitle: card.title,
    pillar: card.pillar,
    source: card.source,
    priority: card.priority,
    drafts,
    imageUrl: imageUrl || null,
    appUrl: `https://signals.ensolabs.ai/brief/${card.id}`,
    status: 'pending_approval',
    createdAt: admin.firestore.Timestamp.now(),
    approvedAt: null,
    publishedPlatforms: [],
  });
  console.log(`[DIST] Queued: ${queueRef.id}`);

  // Step 5: Send Slack approval notification
  const slackSent = await sendSlackApproval(card, drafts, imageUrl, queueRef.id);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('========================================');
  console.log('DISTRIBUTION SUMMARY');
  console.log(`Card: "${card.title}"`);
  console.log(`Image: ${imageUrl ? 'Generated' : 'Skipped (no HCTI credentials)'}`);
  console.log(`Slack: ${slackSent ? 'Sent' : 'Skipped (no webhook)'}`);
  console.log(`Queue ID: ${queueRef.id}`);
  console.log(`Time: ${elapsed}s`);
  console.log('========================================');
}

// ─── Scheduled Function: Runs 7:05 AM ET daily ──────────────────────────

export const distributeTopSignal = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
    secrets: [ANTHROPIC_API_KEY],
  })
  .pubsub.schedule('5 7 * * *')
  .timeZone('America/New_York')
  .onRun(async () => {
    try {
      await runDistribution();
    } catch (error: any) {
      console.error('[DIST FATAL]', error.message);
    }
    return null;
  });

// ─── Manual Trigger (for testing) ────────────────────────────────────────

export const distributeTopSignalManual = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
    secrets: [ANTHROPIC_API_KEY],
  })
  .https.onRequest(async (req, res) => {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      await runDistribution();
      res.json({ success: true, message: 'Distribution pipeline complete' });
    } catch (error: any) {
      console.error('[DIST MANUAL]', error.message);
      res.status(500).json({ error: error.message });
    }
  });

// ─── Publish Approved Posts ──────────────────────────────────────────────

export const publishApprovedPost = functions
  .runWith({ timeoutSeconds: 60, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    if (handlePreflight(req, res)) return;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    const { queueId, platforms } = req.body;
    if (!queueId) {
      res.status(400).json({ error: 'queueId required' });
      return;
    }

    const queueDoc = await db.collection('distribution_queue').doc(queueId).get();
    if (!queueDoc.exists) {
      res.status(404).json({ error: 'Queue item not found' });
      return;
    }

    const queue = queueDoc.data()!;
    const drafts = queue.drafts as PlatformDrafts;
    const targetPlatforms: string[] = platforms || ['linkedin', 'twitter', 'email', 'slack'];
    const published: string[] = [];
    const errors: string[] = [];

    // ── LinkedIn ──
    if (targetPlatforms.includes('linkedin')) {
      const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const linkedinPersonId = process.env.LINKEDIN_PERSON_ID;

      if (linkedinToken && linkedinPersonId) {
        try {
          const postBody: any = {
            author: `urn:li:person:${linkedinPersonId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: drafts.linkedin },
                shareMediaCategory: 'ARTICLE',
                media: [
                  {
                    status: 'READY',
                    originalUrl: queue.appUrl,
                    title: { text: queue.cardTitle },
                    description: { text: drafts.linkedin.slice(0, 200) },
                  },
                ],
              },
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
          };

          const liResp = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${linkedinToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0',
            },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify(postBody),
          });

          if (liResp.ok) {
            const liData = (await liResp.json()) as { id: string };
            published.push('linkedin');

            // Mark card as posted
            await db.collection('discover_cards').doc(queue.cardId).update({
              linkedinPosted: true,
              linkedinPostedAt: admin.firestore.Timestamp.now(),
              linkedinPostUrl: `https://www.linkedin.com/feed/update/${liData.id}`,
            });
            console.log(`[LINKEDIN] Posted: ${liData.id}`);
          } else {
            const errText = await liResp.text();
            errors.push(`LinkedIn: ${liResp.status} - ${errText}`);
          }
        } catch (err: any) {
          errors.push(`LinkedIn: ${err.message}`);
        }
      } else {
        errors.push('LinkedIn: LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_ID not configured');
      }
    }

    // ── Twitter/X ──
    if (targetPlatforms.includes('twitter')) {
      const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

      if (twitterBearerToken && drafts.twitter_thread?.length > 0) {
        try {
          let lastTweetId: string | null = null;

          for (const tweetText of drafts.twitter_thread) {
            const tweetBody: any = { text: tweetText };
            if (lastTweetId) {
              tweetBody.reply = { in_reply_to_tweet_id: lastTweetId };
            }

            const tResp = await fetch('https://api.x.com/2/tweets', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${twitterBearerToken}`,
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(10000),
              body: JSON.stringify(tweetBody),
            });

            if (tResp.ok) {
              const tData = (await tResp.json()) as { data: { id: string } };
              lastTweetId = tData.data.id;
            } else {
              const errText = await tResp.text();
              errors.push(`Twitter: ${tResp.status} - ${errText}`);
              break;
            }
          }

          if (lastTweetId) {
            published.push('twitter');
            console.log(`[TWITTER] Thread posted: ${drafts.twitter_thread.length} tweets`);
          }
        } catch (err: any) {
          errors.push(`Twitter: ${err.message}`);
        }
      } else {
        errors.push('Twitter: TWITTER_BEARER_TOKEN not configured or no tweets');
      }
    }

    // ── Email (SendGrid) ──
    if (targetPlatforms.includes('email')) {
      const sendgridKey = process.env.SENDGRID_API_KEY;
      if (sendgridKey) {
        // For now, just log — email list management is Phase 3.5
        console.log(`[EMAIL] Would send: "${drafts.email_subject}" via SendGrid`);
        published.push('email_queued');
      } else {
        errors.push('Email: SENDGRID_API_KEY not configured');
      }
    }

    // ── Slack Team Notification ──
    if (targetPlatforms.includes('slack')) {
      const slackTeamWebhook = process.env.SLACK_TEAM_WEBHOOK;

      if (slackTeamWebhook) {
        try {
          const resp = await fetch(slackTeamWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({ text: drafts.slack_message }),
          });

          if (resp.ok) {
            published.push('slack');
            console.log('[SLACK] Team notification sent');
          }
        } catch (err: any) {
          errors.push(`Slack: ${err.message}`);
        }
      } else {
        errors.push('Slack: SLACK_TEAM_WEBHOOK not configured');
      }
    }

    // Update queue status
    await queueDoc.ref.update({
      status: published.length > 0 ? 'published' : 'failed',
      approvedAt: admin.firestore.Timestamp.now(),
      publishedPlatforms: published,
      errors: errors.length > 0 ? errors : null,
    });

    res.json({
      success: published.length > 0,
      published,
      errors: errors.length > 0 ? errors : undefined,
      queueId,
    });
  });
