# n8n Integration Guide - Revised Architecture

**Date:** January 21, 2026
**Architecture:** Firebase as Core Engine, n8n as Publishing Layer

---

## ✅ What's Built and Deployed

### Firebase Cloud Functions (LIVE)

1. **`generateDiscoverCards`** - Core content engine
   - Runs daily at 6:00 AM ET
   - Generates 10 intelligence cards using Perplexity + Claude
   - Stores to Firestore `discover_cards` collection
   - **Status:** Already deployed and working

2. **`getTopCardForPublishing`** - NEW (just deployed)
   - Endpoint: `https://us-central1-plannerapi-prod.cloudfunctions.net/getTopCardForPublishing`
   - Returns highest priority unposted card from last 24 hours
   - Authentication: X-API-Key header
   - **Status:** ✅ Deployed, ready to test

3. **`markLinkedInPosted`** - Metadata tracker
   - Marks card as posted after LinkedIn publish succeeds
   - **Status:** ✅ Deployed

---

## 🔑 Setup: API Key for n8n

Before testing, you need to set up authentication:

### Step 1: Generate API Key

```bash
# Generate a secure random key
openssl rand -base64 32

# Example output:
# xK8mP3vN2qR9wL5tY7hJ4fD6sA1gZ0bE2cM8nV3pQ4=
```

### Step 2: Store in Firebase Config

```bash
# Set the API key in Firebase Functions config
firebase functions:config:set n8n.api_key="YOUR_KEY_FROM_STEP_1"

# Verify it's set
firebase functions:config:get
```

### Step 3: Save Key for n8n

Copy the generated key - you'll need it in n8n workflow configuration.

**Store it in:** n8n environment variables as `FIREBASE_API_KEY`

---

## 🧪 Testing the Endpoint

### Test 1: Without API Key (Should Fail)

```bash
curl https://us-central1-plannerapi-prod.cloudfunctions.net/getTopCardForPublishing

# Expected response:
# {"error":"Unauthorized","message":"Valid X-API-Key header is required"}
```

### Test 2: With API Key (Should Succeed)

```bash
curl -X GET \
  https://us-central1-plannerapi-prod.cloudfunctions.net/getTopCardForPublishing \
  -H "X-API-Key: YOUR_API_KEY_HERE"

# Expected response:
# {
#   "card": {
#     "id": "abc123",
#     "title": "50% of Super Bowl ads will use generative AI...",
#     "summary": "The data tells a clear story...",
#     "signals": [...],
#     "moves": [...],
#     "pillar": "ai_strategy",
#     "priority": 90,
#     "source": "CMSWire",
#     ...
#   },
#   "metadata": {
#     "totalCardsToday": 10,
#     "unpostedCards": 10,
#     "selectedReason": "Highest priority unposted card from last 24 hours"
#   },
#   "timestamp": "2026-01-21T18:30:00.000Z"
# }
```

### Test 3: Check Response Structure

The card object includes everything n8n needs:
- `title` - Use for post headline
- `summary` - Use for post body
- `signals` - Use for bullet points
- `moves` - Use for actionable insights
- `source` - Use for attribution
- `priority` - Confirms it's the top card

---

## 🔄 n8n Workflow Modifications

### Current Workflow (What You Have)

```
[Schedule: 8:00 AM]
     ↓
[Perplexity: Research 3 items]
     ↓
[Claude: Generate LinkedIn post]
     ↓
[Gmail: Approval]
     ↓
[LinkedIn: Post]
```

### New Workflow (What to Build)

```
[Schedule: 8:00 AM ET]
     ↓
[HTTP Request: Get card from Firebase] ← NEW
     ↓
[Function: Format card for LinkedIn] ← MODIFIED
     ↓
[Gmail: Approval] ← KEEP AS-IS
     ↓
[LinkedIn: Post] ← KEEP AS-IS
     ↓
[HTTP Request: Mark as posted] ← NEW
```

---

## 📝 Detailed n8n Node Configurations

### Node 1: Schedule Trigger (KEEP, but verify timezone)

**Settings:**
- Trigger: Every day at 8:00 AM
- **Timezone:** America/New_York (EST/EDT)
- **Important:** Make sure this is 2 hours AFTER Firebase generation (6 AM ET)

**No changes needed if already set correctly.**

---

### Node 2: HTTP Request - Get Top Card (NEW)

**Replace:** "Message a model" (Perplexity) node

**Configuration:**
```json
{
  "name": "Get Top Card from Firebase",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "GET",
    "url": "https://us-central1-plannerapi-prod.cloudfunctions.net/getTopCardForPublishing",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-API-Key",
          "value": "={{ $env.FIREBASE_API_KEY }}"
        }
      ]
    },
    "options": {
      "timeout": 10000,
      "retry": {
        "enabled": true,
        "maxRetries": 3,
        "retryInterval": 5000
      }
    }
  }
}
```

**Output:**
- `$json.card` - The complete card object
- `$json.metadata` - Info about card selection

---

### Node 3: Function - Transform to LinkedIn Format (MODIFIED)

**Replace:** "Basic LLM Chain" node (or keep and modify the prompt)

**Option A: Use Function Node (simpler, no AI call)**

```javascript
// Function Node: "Transform Card to LinkedIn Post"
const card = $input.item.json.card;

// Build LinkedIn post following your proven format
const linkedInPost = `${card.signals[0]}

The data tells a clear story:

${card.signals.slice(1).map((signal, i) => `- ${signal}`).join('\n')}

${card.summary.split('.').slice(-1)[0]}. ${card.moves[0].replace('Your next move: ', '')}

— Sav`;

return {
  json: {
    linkedInPost: linkedInPost,
    cardId: card.id,
    cardTitle: card.title,
    cardPillar: card.pillar,
    originalCard: card
  }
};
```

**Option B: Use Claude for Polish (more flexible)**

Keep your existing "Basic LLM Chain" node but update the prompt:

```javascript
// Prompt for Claude
const card = $node["Get Top Card from Firebase"].json.card;

const prompt = `Transform this intelligence card into a LinkedIn post for Sav Banerjee.

CARD DATA:
Title: ${card.title}
Summary: ${card.summary}
Signals: ${card.signals.join('\n- ')}
Moves: ${card.moves.join('\n- ')}
Source: ${card.source}

FORMAT:
[Strong opening line - use the most surprising signal]

The data tells a clear story:

- [Signal 1 from card]
- [Signal 2 from card]
- [Signal 3 from card]

[Insight + action from moves]

— Sav

RULES:
- Keep under 200 words
- Lead with most surprising data point
- Include specific numbers
- End with actionable insight from "moves"
- No hashtags
- Match tone: analytical, direct, practitioner perspective`;

return { prompt };
```

---

### Node 4: Gmail Approval (KEEP AS-IS)

**Your existing node works perfectly.**

**Only change:** Update the email body to show card metadata

```javascript
const post = $json.linkedInPost;
const card = $node["Get Top Card from Firebase"].json.card;

return {
  subject: `LinkedIn Approval: ${card.title}`,
  message: `
    <h3>LinkedIn Post for ${new Date().toLocaleDateString()}</h3>

    <p><strong>Card Selected:</strong><br>
    ${card.title} (Priority: ${card.priority}, Pillar: ${card.pillar})</p>

    <div style="border: 1px solid #ddd; padding: 16px; background: #f9f9f9; margin: 16px 0;">
      ${post.replace(/\n/g, '<br>')}
    </div>

    <p><strong>Reply with:</strong> APPROVE | REJECT</p>

    <p><small>Source: ${card.source}</small></p>
  `
};
```

---

### Node 5: Switch (KEEP AS-IS)

Your existing switch logic works perfectly.

---

### Node 6: LinkedIn Post (KEEP AS-IS)

Your existing LinkedIn posting node works perfectly.

**Only change:** Make sure it uses the formatted post:

```javascript
{
  "text": "={{$node[\"Transform Card to LinkedIn Post\"].json.linkedInPost}}"
}
```

---

### Node 7: HTTP Request - Mark as Posted (NEW)

**Add after LinkedIn post succeeds:**

```json
{
  "name": "Mark Card as Posted",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://us-central1-plannerapi-prod.cloudfunctions.net/markLinkedInPosted",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "X-API-Key",
          "value": "={{ $env.FIREBASE_API_KEY }}"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({ cardId: $node[\"Get Top Card from Firebase\"].json.card.id }) }}",
    "options": {
      "timeout": 10000
    }
  }
}
```

**Purpose:** Marks the card so it won't be selected again tomorrow.

---

## 🚀 Migration Steps

### Step 1: Backup Current Workflow
1. Go to n8n dashboard
2. Open "Ai Daily Briefing" workflow
3. Click "..." → "Download"
4. Save as `ai-daily-briefing-backup.json`

### Step 2: Modify Workflow
1. **Delete:** "Message a model" (Perplexity) node
2. **Add:** "HTTP Request" node → configure as "Get Top Card from Firebase"
3. **Modify:** "Basic LLM Chain" prompt (or replace with Function node)
4. **Keep:** Gmail approval and LinkedIn nodes
5. **Add:** "HTTP Request" node → configure as "Mark Card as Posted"

### Step 3: Connect Nodes
```
Schedule Trigger
    → Get Top Card from Firebase (HTTP Request)
    → Transform to LinkedIn (Function or Claude)
    → Gmail Approval
    → Switch
    → LinkedIn Post
    → Mark Card as Posted (HTTP Request)
```

### Step 4: Set Environment Variable
1. Go to n8n Settings → Environment Variables
2. Add: `FIREBASE_API_KEY` = your generated key from earlier
3. Save

### Step 5: Test Manually
1. Click "Execute Workflow" (don't wait for 8 AM schedule)
2. Check each node's output
3. Expected flow:
   - Get card: Returns card object ✅
   - Transform: Returns LinkedIn post text ✅
   - Email: Sent to your inbox ✅
   - Reply APPROVE → LinkedIn posts ✅
   - Mark posted: Returns success ✅

### Step 6: Enable Schedule
1. Set workflow to "Active"
2. Tomorrow at 8:00 AM ET, it will run automatically

---

## ✅ Success Criteria

After tomorrow's automated run, verify:

1. **6:00 AM:** Firebase generated 10 cards
   - Check Firestore: `discover_cards` collection has new entries

2. **6:05 AM:** Cards appear on app
   - Visit: https://plannerapi-prod.web.app
   - Daily Intelligence section shows 10 cards

3. **8:00 AM:** n8n pulls top card
   - Check n8n execution logs
   - Email approval arrives in inbox

4. **8:05 AM:** You approve
   - Reply APPROVE to email

5. **8:10 AM:** LinkedIn post published
   - Check your LinkedIn profile
   - Verify post is live

6. **Verification:**
   - Check Firestore: Card should have `linkedinPosted: true`
   - Tomorrow's run should NOT select the same card

---

## 🐛 Troubleshooting

### Error: "No cards available"

**Cause:** Firebase hasn't generated cards yet (or generation failed)

**Fix:**
1. Check if it's after 6:00 AM ET
2. Check Firebase function logs: `firebase functions:log --only generateDiscoverCards`
3. If generation failed, manually trigger: `gcloud scheduler jobs run firebase-schedule-generateDiscoverCards-us-central1`

### Error: "Unauthorized"

**Cause:** API key not set or incorrect

**Fix:**
1. Verify key is set: `firebase functions:config:get`
2. Verify key matches in n8n environment variables
3. Redeploy functions after changing config

### Error: "All recent cards have already been posted"

**Cause:** All cards from today already have `linkedinPosted: true`

**Options:**
1. Wait for tomorrow's generation (recommended)
2. Manually reset a card in Firestore (remove `linkedinPosted` field)
3. Temporarily disable the "unposted only" filter for testing

---

## 📊 Data Flow Summary

```
6:00 AM ET
├─ Firebase Cloud Function generates 10 cards
├─ Stores to Firestore (discover_cards)
└─ Cards immediately available on app

8:00 AM ET
├─ n8n calls Firebase: "Get top unposted card"
├─ Firebase returns highest priority card
├─ n8n formats for LinkedIn
├─ n8n sends approval email
└─ [PAUSE - waiting for human approval]

8:05 AM ET (after you reply APPROVE)
├─ n8n posts to LinkedIn
├─ n8n calls Firebase: "Mark card as posted"
└─ Firebase updates card: linkedinPosted = true

Result:
├─ App users see all 10 cards
├─ LinkedIn followers see 1 card (with link back to app)
└─ System prevents posting same card twice
```

---

## 🎯 Next Steps

1. ✅ Set API key (see Step 1-3 above)
2. ✅ Test endpoint with curl (verify it works)
3. ⏳ Modify n8n workflow (follow Step 2)
4. ⏳ Test manually (Execute workflow button)
5. ⏳ Enable schedule and wait for tomorrow morning

---

**Questions or issues?** Check the troubleshooting section or review Firebase function logs.
