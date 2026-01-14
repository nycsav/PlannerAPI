# Backend Integration Guide

## Overview
This directory contains code to integrate the Executive Strategy Chat feature with your existing Cloud Run backend.

## File: chat-intel-endpoint.ts

This file contains the complete `/chat-intel` endpoint implementation.

### Integration Steps

1. **Copy the endpoint code** to your Cloud Run backend service:
   ```bash
   # Assuming your backend repo structure is:
   # backend/
   #   ├── src/
   #   │   ├── routes/
   #   │   │   └── chat-intel.ts  (add this file here)
   #   │   └── index.ts
   ```

2. **Mount the router** in your main Express app (`index.ts` or `app.ts`):
   ```typescript
   import chatIntelRouter from './routes/chat-intel';

   app.use(chatIntelRouter);
   ```

3. **Set environment variables** in Cloud Run:
   ```bash
   gcloud run services update planners-backend \
     --update-env-vars PPLX_API_KEY=your_perplexity_api_key_here,PPLX_MODEL_FAST=sonar \
     --region us-central1
   ```

4. **Redeploy** your Cloud Run service:
   ```bash
   # From your backend directory
   gcloud run deploy planners-backend \
     --source . \
     --region us-central1
   ```

5. **Test the endpoint**:
   ```bash
   curl -X POST https://planners-backend-865025512785.us-central1.run.app/chat-intel \
     -H "Content-Type: application/json" \
     -d '{"query":"How are CMOs reallocating budget to AI in 2026?"}'
   ```

## API Specification

### Endpoint
```
POST /chat-intel
```

### Request Body
```json
{
  "query": "string" // Required: The intelligence query
}
```

### Response (Success - 200)
```json
{
  "signals": [
    {
      "id": "SIG-1",
      "title": "Signal title",
      "summary": "1-2 sentence summary",
      "sourceName": "Source name",
      "sourceUrl": "https://source-url.com"
    }
  ],
  "implications": [
    "What this means for marketing strategy"
  ],
  "actions": [
    "Suggested actionable next step"
  ]
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid request. Please provide a query string in the request body."
}
```

**500 Internal Server Error**
```json
{
  "error": "Unable to generate intelligence brief at this time.",
  "details": "Error details for debugging"
}
```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `PPLX_API_KEY` | Perplexity API key | `pplx-...` |
| `PPLX_MODEL_FAST` | Perplexity model to use | `sonar` |

## Frontend Integration

The frontend component `ExecutiveStrategyChat.tsx` has been updated to call:
```
https://planners-backend-865025512785.us-central1.run.app/chat-intel
```

Once you deploy the backend changes, the frontend will work automatically.

## Alternative: Firebase Functions

The Firebase Functions implementation is available in `/functions/` but is not required for the MVP. You can deploy it later if needed.

## Testing

After deployment, test from the frontend or use curl:

```bash
# Test query
curl -X POST \
  https://planners-backend-865025512785.us-central1.run.app/chat-intel \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest trends in AI-driven marketing personalization?"
  }'
```

Expected response should contain signals, implications, and actions arrays.
