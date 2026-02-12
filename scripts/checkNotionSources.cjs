const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTION_DATABASE_ID = '2fa0bdff-e59e-8004-9d52-c6171ae1630d';

async function checkAllSources() {
  try {
    console.log('📊 Querying ALL pages in Notion Research Inbox...\n');

    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100,
    });

    console.log(`Found ${response.results.length} total pages\n`);

    // Count sources
    const sourceCounts = {};
    const tierCounts = {};

    response.results.forEach(page => {
      const props = page.properties;
      const source = props.Source?.select?.name || 'No Source';
      const tier = props['Source Tier']?.select?.name || 'No Tier';

      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });

    console.log('📈 SOURCES BREAKDOWN:');
    console.log('='.repeat(50));
    Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count} page(s)`);
      });

    console.log('\n📊 TIER BREAKDOWN:');
    console.log('='.repeat(50));
    Object.entries(tierCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tier, count]) => {
        console.log(`  ${tier}: ${count} page(s)`);
      });

    console.log('\n✅ To add more Tier 1 content, add research from:');
    console.log('  - Gartner');
    console.log('  - Forrester');
    console.log('  - BCG');
    console.log('  - Bain');
    console.log('  - Deloitte');
    console.log('\nThen re-run the population script.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllSources();
