# Firebase Functions Setup

## Initial Setup

1. **Install dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Set Perplexity API key**:
   ```bash
   firebase functions:config:set pplx.api_key="YOUR_PERPLEXITY_API_KEY_HERE"
   firebase functions:config:set pplx.model_fast="sonar"
   ```

3. **Build the functions**:
   ```bash
   npm run build
   ```

## Deploy

Deploy just the chatIntel function:
```bash
firebase deploy --only functions:chatIntel
```

Or deploy all functions:
```bash
npm run deploy
```

## Local Development

Run functions locally with emulator:
```bash
npm run serve
```

The function will be available at:
```
http://localhost:5001/plannerapi-prod/us-central1/chatIntel
```

## Test the Function

Once deployed, your function will be available at:
```
https://us-central1-plannerapi-prod.cloudfunctions.net/chatIntel
```

Test with curl:
```bash
curl -X POST \
  https://us-central1-plannerapi-prod.cloudfunctions.net/chatIntel \
  -H 'Content-Type: application/json' \
  -d '{"query": "What are the latest trends in AI-driven marketing?"}'
```

## Function Details

- **Name**: `chatIntel`
- **Endpoint**: POST `/chatIntel`
- **Request**: `{ query: string }`
- **Response**: `PlannerChatResponse` (signals, implications, actions)
- **Runtime**: Node.js 18
- **CORS**: Enabled for all origins
