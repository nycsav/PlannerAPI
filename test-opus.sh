#!/bin/bash
# Test the Opus 4.6 premium brief enrichment function
# This will consume ~$0.50-1.00 from your $50 credit

echo "🧪 Testing Opus 4.6 enrichment..."
echo "This will use your \$50 Anthropic API credit"
echo ""

curl -X POST "https://us-central1-plannerapi-prod.cloudfunctions.net/enrichPremiumBrief" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Google Announces New AI-Powered Search Features",
    "source": "Google",
    "pillar": "ai_strategy",
    "sourceUrl": "https://blog.google/products/search/",
    "excerpt": "Google today announced significant updates to its search platform, integrating advanced AI capabilities that will change how users discover information. The new features include AI-powered summaries at the top of search results, conversational follow-up questions, and multi-perspective answers that synthesize information from multiple sources. Early testing shows that users spend 30% less time finding answers, but publishers are concerned about traffic impact. Google claims the new experience will still drive clicks to websites, but industry analysts predict a 15-20% reduction in organic search traffic for content sites."
  }' | jq '.'

echo ""
echo "✓ Test complete. Check your credit balance:"
echo "  https://console.anthropic.com/settings/billing"
