# PlannerAPI Notion Integration - Deployment Instructions

## What Changed

Refactored `generateDiscoverCards` Cloud Function to:
- ✅ Pull tier-1/2 sources from your Notion database instead of Perplexity API
- ✅ Use Promise.allSettled to track individual card failures
- ✅ Add detailed error logging for debugging
- ✅ ~90% cost reduction ($1.10/month → ~$0.10/month)
- ✅ Faster generation (300ms Notion query vs 5-10s Perplexity search)

## Step 1: Update package.json

Add to `/functions/package.json` dependencies:

```json
{
  "dependencies": {
    "@notionhq/client": "^2.2.15",
    "@anthropic-ai/sdk": "^0.30.1",
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^6.0.0"
  }
}
```

Then run:
```bash
cd /Users/savbanerjee/Projects/PlannerAPI-clean/functions
npm install
```

## Step 2: Get Your Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "PlannerAPI Cloud Functions"
4. Select your workspace
5. Capabilities: Read content only
6. Copy the "Internal Integration Secret"

## Step 3: Share Database with Integration

1. Open your "PlannerAPI Research Inbox" database in Notion
2. Click "..." menu → Add connections
3. Select "PlannerAPI Cloud Functions"
4. Confirm access

## Step 4: Set Firebase Environment Variable

```bash
firebase functions:config:set notion.api_key="YOUR_NOTION_API_KEY_HERE"
```

Verify it's set:
```bash
firebase functions:config:get
```

Should show:
```json
{
  "notion": {
    "api_key": "secret_..."
  },
  "anthropic": {
    "api_key": "sk-ant-..."
  }
}
```

## Step 5: Replace the File

Use Cursor to replace the entire contents of:
`/functions/src/generateDiscoverCards.ts`

With the refactored version: `generateDiscoverCards-REFACTORED.ts`

## Step 6: Deploy

```bash
cd /Users/savbanerjee/Projects/PlannerAPI-clean/functions
firebase deploy --only functions:generateDiscoverCards --project plannerapi-prod
```

## Step 7: Test

Trigger the function:
```bash
curl https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards
```

Check logs:
```bash
firebase functions:log --project plannerapi-prod --limit 50
```

## Expected Results

### Success Case:
```
🚀 STARTING DISCOVER CARDS GENERATION
[NOTION QUERY] Pillar: ai_strategy
[NOTION SUCCESS] Found 8 sources for ai_strategy
[CARD SUCCESS] Topic: "AI adoption and strategy" → Card: abc123
[NOTION QUERY] Pillar: brand_performance
[NOTION SUCCESS] Found 6 sources for brand_performance
[CARD SUCCESS] Topic: "Platform data and research" → Card: def456
[NOTION QUERY] Pillar: competitive_intel
[NOTION SUCCESS] Found 5 sources for competitive_intel
[CARD SUCCESS] Topic: "Competitive intelligence and brand performance" → Card: ghi789

📊 GENERATION SUMMARY
✅ Successful: 3/3
❌ Failed: 0/3
⏱️  Total time: 12.3s
```

### Failure Case (will show which topics/pillars have no sources):
```
❌ FAILED CARDS DETAIL
1. Topic: AI adoption and strategy
   Error: No tier-1/2 sources found in Notion for pillar: ai_strategy
   Stack: Error: No tier-1/2 sources found...
```

## Troubleshooting

### Error: "No tier-1/2 sources found"
**Cause:** No pages in Notion match the filters (Pillar + Source Tier + Status)

**Fix:** 
1. Check your Notion database has pages with:
   - Pillar = "ai_strategy", "brand_performance", or "competitive_intel"
   - Source Tier = "1: Premier Research" OR "2: Platform Research"
   - Status = "Ready for AI" OR "Triaged"

2. Use the "Consulting Pipeline Hooks" view to see what's available

### Error: "Notion API authentication failed"
**Cause:** API key not set or integration not connected

**Fix:**
1. Verify env var: `firebase functions:config:get`
2. Reconnect integration to database in Notion

### Error: "Missing required fields in card"
**Cause:** Claude returned invalid JSON

**Fix:** Check the synthesis prompt is correctly formatted

## Next Steps After Deployment

1. Monitor first generation run
2. If successful, set up Cloud Scheduler for daily automation:
   ```bash
   gcloud scheduler jobs create http daily-discover-cards \
     --schedule="0 6 * * *" \
     --uri="https://us-central1-plannerapi-prod.cloudfunctions.net/generateDiscoverCards" \
     --http-method=GET \
     --time-zone="America/New_York"
   ```

3. Add more sources to Notion with status "Ready for AI"
4. Monitor cost in Firebase Console (should be ~$0.10/month)

## Rollback Plan

If something breaks:

1. Revert to previous version:
   ```bash
   git checkout HEAD~1 functions/src/generateDiscoverCards.ts
   firebase deploy --only functions:generateDiscoverCards
   ```

2. Or keep both versions and use feature flag in code to switch between Perplexity and Notion
