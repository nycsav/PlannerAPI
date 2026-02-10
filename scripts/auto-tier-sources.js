#!/usr/bin/env node

/**
 * auto-tier-sources.js
 *
 * Reads the PlannerAPI Research Inbox via Notion API,
 * finds rows where Source Tier is empty, assigns a tier
 * based on Source value or URL domain, and updates the page.
 *
 * Usage:
 *   NOTION_API_KEY=<key> node scripts/auto-tier-sources.js [--dry-run]
 *
 * Requires: @notionhq/client (npm install @notionhq/client)
 */

const { Client } = require("@notionhq/client");

const DATABASE_ID = "2fa0bdff-e59e-8004-9d52-c6171ae1630d";

// --- Tier mapping by Source select value ---
const SOURCE_TO_TIER = {
  // Tier 1: Premier Research
  McKinsey: "1: Premier Research",
  Gartner: "1: Premier Research",
  Forrester: "1: Premier Research",
  BCG: "1: Premier Research",
  Bain: "1: Premier Research",
  Deloitte: "1: Premier Research",

  // Tier 2: Platform Research
  Google: "2: Platform Research",
  OpenAI: "2: Platform Research",
  Anthropic: "2: Platform Research",
  Meta: "2: Platform Research",
  Microsoft: "2: Platform Research",
  "Amazon Ads": "2: Platform Research",
  Perplexity: "2: Platform Research",

  // Tier 3: Trade Publication
  "Ad Age": "3: Trade Publication",
  AdWeek: "3: Trade Publication",
  Digiday: "3: Trade Publication",
  "Marketing Week": "3: Trade Publication",
  Webflow: "3: Trade Publication",
  "The Verge": "3: Trade Publication",

  // Tier 4: Data Provider
  eMarketer: "4: Data Provider",
  WARC: "4: Data Provider",
  Kantar: "4: Data Provider",
  Nielsen: "4: Data Provider",

  // Tier 5: Emerging Signal
  VentureBeat: "5: Emerging Signal",
  TechCrunch: "5: Emerging Signal",
  "The Rundown": "5: Emerging Signal",
  "LinkedIn Post": "5: Emerging Signal",
  Whitepaper: "5: Emerging Signal",
  "PDF Report": "5: Emerging Signal",
};

// --- Tier mapping by URL domain (fallback when Source is empty) ---
const DOMAIN_TO_TIER = {
  "mckinsey.com": "1: Premier Research",
  "gartner.com": "1: Premier Research",
  "forrester.com": "1: Premier Research",
  "bcg.com": "1: Premier Research",
  "bain.com": "1: Premier Research",
  "deloitte.com": "1: Premier Research",

  "google.com": "2: Platform Research",
  "openai.com": "2: Platform Research",
  "anthropic.com": "2: Platform Research",
  "meta.com": "2: Platform Research",
  "microsoft.com": "2: Platform Research",
  "amazon.com": "2: Platform Research",
  "perplexity.ai": "2: Platform Research",
  "research.perplexity.ai": "2: Platform Research",
  "research-perplexity.ai": "2: Platform Research",

  "adage.com": "3: Trade Publication",
  "adweek.com": "3: Trade Publication",
  "digiday.com": "3: Trade Publication",
  "marketingweek.com": "3: Trade Publication",
  "webflow.com": "3: Trade Publication",
  "theverge.com": "3: Trade Publication",

  "emarketer.com": "4: Data Provider",
  "warc.com": "4: Data Provider",
  "kantar.com": "4: Data Provider",
  "nielsen.com": "4: Data Provider",

  "venturebeat.com": "5: Emerging Signal",
  "techcrunch.com": "5: Emerging Signal",
  "linkedin.com": "5: Emerging Signal",
};

const DEFAULT_TIER = "5: Emerging Signal";

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return null;
  }
}

function tierFromDomain(url) {
  const domain = extractDomain(url);
  if (!domain) return null;

  // Check exact match first
  if (DOMAIN_TO_TIER[domain]) return DOMAIN_TO_TIER[domain];

  // Check if domain ends with a known domain (e.g., blog.mckinsey.com)
  for (const [knownDomain, tier] of Object.entries(DOMAIN_TO_TIER)) {
    if (domain.endsWith(`.${knownDomain}`) || domain === knownDomain) {
      return tier;
    }
  }
  return null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error("Error: NOTION_API_KEY environment variable is required");
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });

  console.log(`[AUTO-TIER] Starting source tier assignment${dryRun ? " (DRY RUN)" : ""}...`);
  console.log(`[AUTO-TIER] Database: ${DATABASE_ID}\n`);

  // Query all pages where Source Tier is empty
  const pages = [];
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Source Tier",
        select: { is_empty: true },
      },
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  console.log(`[AUTO-TIER] Found ${pages.length} pages with empty Source Tier\n`);

  if (pages.length === 0) {
    console.log("[AUTO-TIER] Nothing to update. All pages have Source Tier assigned.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const page of pages) {
    const name = page.properties.Name?.title?.[0]?.plain_text || "(untitled)";
    const source = page.properties.Source?.select?.name || null;
    const url = page.properties.URL?.url || null;

    let tier = null;
    let reason = "";

    // Step 1: Check Source value
    if (source && SOURCE_TO_TIER[source]) {
      tier = SOURCE_TO_TIER[source];
      reason = `Source="${source}"`;
    }

    // Step 2: Fallback to URL domain
    if (!tier && url) {
      tier = tierFromDomain(url);
      if (tier) {
        reason = `URL domain="${extractDomain(url)}"`;
      }
    }

    // Step 3: Default
    if (!tier) {
      tier = DEFAULT_TIER;
      reason = "default (no source or URL match)";
    }

    console.log(`  ${name}`);
    console.log(`    Source: ${source || "(empty)"} | URL: ${url || "(empty)"}`);
    console.log(`    → ${tier} (${reason})`);

    if (!dryRun) {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          "Source Tier": { select: { name: tier } },
        },
      });
      updated++;
      console.log(`    Updated\n`);
    } else {
      skipped++;
      console.log(`    ~ Skipped (dry run)\n`);
    }
  }

  console.log(`[AUTO-TIER] Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("[AUTO-TIER] Fatal error:", err.message);
  process.exit(1);
});
