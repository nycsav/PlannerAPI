const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function test() {
  try {
    console.log('Testing Notion API...');
    console.log('Methods on notion:', Object.keys(notion));
    console.log('Methods on notion.databases:', Object.keys(notion.databases));

    // Try to retrieve database info
    const dbId = '2fa0bdff-e59e-8004-9d52-c6171ae1630d';
    console.log('\nTrying to retrieve database...');
    const db = await notion.databases.retrieve({ database_id: dbId });
    console.log('Database retrieved:', db.title);

    // Try to query the database
    console.log('\nTrying to query database...');
    console.log('typeof notion.databases.query:', typeof notion.databases.query);

    // Try different approaches
    if (typeof notion.databases.query === 'function') {
      const results = await notion.databases.query({
        database_id: dbId,
        filter: {
          property: 'Source',
          select: {
            equals: 'McKinsey',
          },
        },
      });
      console.log('Query succeeded! Results:', results.results.length);
    } else {
      console.log('query method not available');
      // Try using pages API instead
      console.log('\nTrying pages.query...');
      if (typeof notion.pages.query === 'function') {
        console.log('pages.query exists!');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

test();
