/**
 * Notion API Endpoints
 *
 * Queries the PlannerAPI Research Inbox Notion database for source reports.
 *
 * Required env var: NOTION_TOKEN
 *   - Create an internal integration at https://www.notion.so/my-integrations
 *   - Share the "PlannerAPI Research Inbox" database with the integration
 *   - Add NOTION_TOKEN=secret_xxx to functions/.env
 */

import * as functions from 'firebase-functions';

const NOTION_DB_ID = '2fa0bdff-e59e-8075-a696-000b88058c9e';
const NOTION_DB_URL = 'https://www.notion.so/2fa0bdffe59e80049d52c6171ae1630d';

export interface NotionReport {
  id: string;
  title: string;
  url: string;
  keyStat: string | null;
  date: string | null;
  sourceUrl: string | null;
}

/**
 * getSourceReports: Returns latest Notion research entries for a given source
 *
 * Usage:
 *   POST /getSourceReports
 *   Body: { source: string }
 *   Returns: { reports: NotionReport[], notionDbUrl: string }
 */
export const getSourceReports = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed. Use POST.' }); return; }

  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    // Graceful fallback: return empty reports + DB URL so frontend can link to Notion directly
    res.status(200).json({ reports: [], notionDbUrl: NOTION_DB_URL });
    return;
  }

  const { source } = req.body as { source?: string };
  if (!source || typeof source !== 'string' || source.length > 100) {
    res.status(400).json({ error: 'source is required in request body' });
    return;
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Source',
          select: { equals: source },
        },
        sorts: [{ property: 'Date Added', direction: 'descending' }],
        page_size: 5,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`Notion API error: ${response.status}`);

    const data = await response.json() as any;

    const reports: NotionReport[] = (data.results || []).map((page: any) => ({
      id: page.id,
      title: page.properties?.Name?.title?.[0]?.text?.content || 'Untitled',
      url: page.url,
      keyStat: page.properties?.['Key Stat']?.rich_text?.[0]?.text?.content || null,
      date: page.created_time
        ? new Date(page.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null,
      sourceUrl: page.properties?.['URL']?.url || null,
    }));

    res.status(200).json({ reports, notionDbUrl: NOTION_DB_URL });

  } catch (error) {
    console.error('Error in getSourceReports:', error);
    res.status(500).json({ error: 'Unable to fetch reports', reports: [], notionDbUrl: NOTION_DB_URL });
  }
});
