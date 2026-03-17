/**
 * Firebase Cloud Function: Dynamic OG Meta Tags for Brief Pages
 *
 * Serves HTML with proper og:title, og:description, og:image for
 * /brief/:cardId URLs so LinkedIn/Twitter show rich previews.
 *
 * This is a rewrite rule in firebase.json — requests to /brief/**
 * go through this function first. If it's a bot/crawler, serve meta tags.
 * If it's a human browser, serve the SPA index.html.
 *
 * Deploy: firebase deploy --only functions:ogMetaTags
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Bot user agents that need OG meta tags
const BOT_AGENTS = [
  'linkedinbot', 'twitterbot', 'facebookexternalhit', 'slackbot',
  'discordbot', 'telegrambot', 'whatsapp', 'googlebot', 'bingbot',
  'applebot', 'duckduckbot',
];

function isBot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  return BOT_AGENTS.some((bot) => ua.includes(bot));
}

export const ogMetaTags = functions.https.onRequest(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const path = req.path;

  // Only intercept /brief/:cardId paths
  const match = path.match(/^\/brief\/([^/]+)$/);
  if (!match) {
    // Not a brief URL — serve the SPA
    res.redirect(302, '/');
    return;
  }

  const cardId = match[1];

  // If not a bot, redirect to SPA (the React app handles routing)
  if (!isBot(userAgent)) {
    // Serve the SPA index.html for client-side routing
    res.set('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=/#/brief/${cardId}">
<script>window.location.replace('/');</script>
</head><body></body></html>`);
    return;
  }

  // Bot detected — fetch card and serve OG meta tags
  try {
    const doc = await db.collection('discover_cards').doc(cardId).get();

    if (!doc.exists) {
      res.status(404).send('Card not found');
      return;
    }

    const card = doc.data()!;
    const title = card.title || 'Signal Intelligence';
    const description = (card.summary || '').slice(0, 200);
    const source = card.source || 'signal2noise';
    const imageUrl = card.imageUrl || card.images?.[0]?.image_url || 'https://signals.ensolabs.ai/og-default.png';
    const url = `https://signals.ensolabs.ai/brief/${cardId}`;

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)} — signal2noise</title>

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="signal2noise by Enso Labs" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

  <!-- Article metadata -->
  <meta property="article:author" content="signal2noise" />
  <meta property="article:section" content="${escapeHtml(card.pillar || 'intelligence')}" />
  <meta property="article:tag" content="${escapeHtml(source)}" />

  <!-- Redirect humans to the SPA -->
  <meta http-equiv="refresh" content="0;url=https://signals.ensolabs.ai/">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p>Source: ${escapeHtml(source)}</p>
  <a href="${escapeHtml(url)}">Read full brief at signal2noise</a>
</body>
</html>`);
  } catch (error: any) {
    console.error('[OG] Error fetching card:', error.message);
    res.status(500).send('Error generating preview');
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
