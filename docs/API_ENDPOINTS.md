# API Endpoints Reference

Complete reference for all PlannerAPI backend endpoints.

---

## Google Cloud Run Backend

Base URL: `https://planners-backend-865025512785.us-central1.run.app`

### 1. Chat Intelligence Endpoint

**Generates structured intelligence briefs on any topic**

```http
POST /chat-intel
Content-Type: application/json

{
  "query": "AI marketing strategy ROI measurement",
  "audience": "CMO"
}
```

**Response:**
```json
{
  "summary": "Enterprise CMOs are investing in AI-powered attribution models...",
  "keySignals": [
    "94% of CMOs cite attribution as top blind spot",
    "AI-based attribution market growing 45% YoY",
    "First-party data strategies gaining traction"
  ],
  "implications": [
    "Budget shift from generic analytics to AI solutions",
    "New vendor evaluation cycles starting",
    "Urgency to modernize measurement stack"
  ],
  "actions": [
    "Audit current attribution stack against AI benchmarks",
    "Request RFP from top 3 AI attribution vendors",
    "Plan attribution modernization roadmap"
  ],
  "signals": [
    {
      "id": "signal-1",
      "title": "Gartner: Magic Quadrant for Marketing Attribution",
      "summary": "AI leaders identified in 2025 evaluation",
      "sourceName": "Gartner Research",
      "sourceUrl": "https://..."
    }
  ]
}
```

**Parameters:**
- `query` (string, required) - Topic to research and synthesize
- `audience` (string, required) - Target audience: CMO, VP Marketing, Brand Director, Agency Owner

**Response Time:** 15-30 seconds
**Timeout:** 30 seconds

---

### 2. Trending Topics Endpoint

**Fetch trending topics and sample queries for a given audience**

```http
GET /trending/topics?audience=CMO&limit=6
```

**Response:**
```json
{
  "topics": [
    {
      "topic": "AI Attribution",
      "sampleQuery": "How are CMOs using AI for marketing attribution?",
      "searchCount": 1250
    },
    {
      "topic": "First-Party Data",
      "sampleQuery": "First-party data strategy for enterprise marketing",
      "searchCount": 987
    }
  ]
}
```

**Parameters:**
- `audience` (string, required) - CMO, VP Marketing, Brand Director, Agency Owner
- `limit` (number, optional) - Max topics to return (default: 6, max: 20)

**Response Time:** 5-10 seconds

---

### 3. Briefings Latest Endpoint

**Fetch the most recent intelligence briefings**

```http
GET /briefings/latest?audience=CMO&limit=6
```

**Response:**
```json
{
  "briefings": [
    {
      "id": "brief-001",
      "date": "2026-01-22",
      "title": "CMOs Accelerate AI Attribution Investment",
      "description": "Enterprise budget allocation toward AI-powered measurement solutions",
      "theme": "ai_strategy"
    }
  ]
}
```

**Parameters:**
- `audience` (string, required) - CMO, VP Marketing, Brand Director, Agency Owner
- `limit` (number, optional) - Max briefings to return (default: 6, max: 20)

**Response Time:** 5-10 seconds

---

### 4. Perplexity Search Endpoint

**Execute a real-time Perplexity API search**

```http
POST /perplexity/search
Content-Type: application/json

{
  "query": "Latest retail media trends 2026"
}
```

**Response:**
```json
{
  "answer": "Retail media networks are experiencing rapid growth...",
  "sources": [
    "https://digiday.com/...",
    "https://adage.com/..."
  ],
  "citations": [...]
}
```

**Parameters:**
- `query` (string, required) - Search query

**Response Time:** 10-20 seconds
**Timeout:** 30 seconds

---

## Firebase Cloud Functions

Base URL: `https://us-central1-plannerapi-prod.cloudfunctions.net`

### 1. Chat Simple Endpoint

**Process follow-up questions with context**

```http
POST /chatSimple
Content-Type: application/json

{
  "query": "Context: CMO budget challenges\n\nQuestion: How should we prioritize AI investments?"
}
```

**Response:**
```json
{
  "answer": "Given the budget constraints mentioned, prioritize: 1) AI attribution for immediate ROI, 2) Workflow automation for efficiency gains, 3) Enterprise platforms for scalability",
  "followUp": [
    "What's your current attribution stack?",
    "Which teams would benefit most from automation?"
  ]
}
```

**Parameters:**
- `query` (string, required) - Question with context

**Response Time:** 5-10 seconds
**Timeout:** 30 seconds

---

## Third-Party APIs

### Perplexity AI API

Used internally by Cloud Functions for real-time research.

**Model:** `sonar-pro`
**Timeout:** 30 seconds
**Cost:** ~$0.005 per request

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Service unavailable",
  "code": 503,
  "message": "Backend service temporarily down"
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad request (missing required parameters)
- `403` - Forbidden (authentication failed)
- `500` - Internal server error
- `503` - Service unavailable
- `504` - Timeout (request took > 30 seconds)

---

## Rate Limiting

- **Per minute:** 60 requests
- **Per hour:** 1,000 requests
- **Per day:** 10,000 requests

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

---

## Authentication

Not required for public endpoints. For authenticated access (future):
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Examples

### cURL

```bash
# Chat Intelligence
curl -X POST "https://planners-backend-865025512785.us-central1.run.app/chat-intel" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AI marketing strategy",
    "audience": "CMO"
  }'

# Trending Topics
curl "https://planners-backend-865025512785.us-central1.run.app/trending/topics?audience=CMO&limit=6"

# Chat Simple
curl -X POST "https://us-central1-plannerapi-prod.cloudfunctions.net/chatSimple" \
  -H "Content-Type: application/json" \
  -d '{"query":"What should we prioritize?"}'
```

### JavaScript/Node.js

```typescript
import { ENDPOINTS, fetchWithTimeout } from '../config/api';

// Chat Intelligence
const response = await fetchWithTimeout(ENDPOINTS.chatIntel, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'AI marketing strategy',
    audience: 'CMO'
  }),
  timeout: 30000
});

const data = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'https://planners-backend-865025512785.us-central1.run.app/chat-intel',
    json={
        'query': 'AI marketing strategy',
        'audience': 'CMO'
    },
    timeout=30
)

data = response.json()
```

---

## Endpoint Status

Check endpoint health:
```bash
curl -I https://planners-backend-865025512785.us-central1.run.app/health
```

Expected response: `HTTP/1.1 200 OK`

---

## Support

For API issues:
1. Check error message and status code
2. Review example requests above
3. Verify audience parameter is valid
4. Check rate limits (X-RateLimit headers)
5. See: [RUNBOOK.md](RUNBOOK.md) for troubleshooting
