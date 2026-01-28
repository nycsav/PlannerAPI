# CopilotKit Integration - Setup & Configuration

This document covers the CopilotKit AI copilot integration for PlannerAPI Intelligence Briefs.

---

## Overview

CopilotKit provides an AI-powered chat interface within Intelligence Briefs, allowing users to ask questions about brief content, get summaries, and receive strategic recommendations.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ IntelligenceModal│───▶│ CopilotKit React Components    │ │
│  │                  │    │ - CopilotKit Provider          │ │
│  │ "Ask about brief"│    │ - CopilotPopup                 │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Cloud Functions                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ copilotRuntime (functions/src/copilot-runtime.ts)       ││
│  │ - OpenAI Adapter (supports OpenRouter)                  ││
│  │ - GPT-4o-mini model                                     ││
│  │ - MCP Tool definitions                                  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LLM Provider                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   OpenRouter    │ OR │   OpenAI        │                 │
│  │ (Recommended)   │    │   (Direct)      │                 │
│  └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployed Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **Runtime** | `https://us-central1-plannerapi-prod.cloudfunctions.net/copilotRuntime` | CopilotKit chat API |
| **Health** | `https://us-central1-plannerapi-prod.cloudfunctions.net/copilotHealth` | Health check |

---

## Configuration

### LLM Provider Setup

CopilotKit supports two providers. OpenRouter is recommended for cost and flexibility.

#### Option A: OpenRouter (Recommended)

1. Get API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Set Firebase config:
   ```bash
   firebase functions:config:set openrouter.api_key="sk-or-YOUR_KEY"
   ```
3. Deploy:
   ```bash
   cd functions && npm run deploy
   ```

#### Option B: OpenAI Direct

1. Get API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Set Firebase config:
   ```bash
   firebase functions:config:set openai.api_key="sk-YOUR_KEY"
   ```
3. Deploy:
   ```bash
   cd functions && npm run deploy
   ```

### Model Configuration

Default model: **GPT-4o-mini**

| Model | Provider Config | Cost (per 1M tokens) |
|-------|-----------------|----------------------|
| GPT-4o-mini | `openai/gpt-4o-mini` (OpenRouter) | $0.15 input / $0.60 output |
| GPT-4o-mini | `gpt-4o-mini` (OpenAI) | $0.15 input / $0.60 output |

To change the model, edit `functions/src/copilot-runtime.ts`:

```typescript
const MODEL = useOpenRouter ? 'openai/gpt-4o' : 'gpt-4o';
```

---

## Cost Estimates

### Monthly Usage Projections

| Usage Level | Users | Sessions | Est. Cost |
|-------------|-------|----------|-----------|
| Light | 50 | 150 | $0.50 - $2 |
| Moderate | 200 | 1,000 | $4 - $10 |
| Heavy | 1,000 | 10,000 | $30 - $60 |

Based on GPT-4o-mini pricing with average 1,500 tokens per interaction.

---

## Frontend Components

### File Structure

```
components/copilot/
├── CopilotBriefWrapper.tsx   # Main wrapper with CopilotKit provider
├── types.ts                   # TypeScript definitions for MCP tools
└── index.ts                   # Exports
```

### Integration in IntelligenceModal

The CopilotKit UI is integrated via an "AI Actions" bar:

```tsx
// In IntelligenceModal.tsx
<CopilotActionButton
  icon={<MessageCircle />}
  label="Ask about brief"
  onClick={() => setShowCopilotChat(true)}
  variant="primary"
/>
```

### Available Actions

| Button | Action | Description |
|--------|--------|-------------|
| Visualize signals | Opens Insight Dashboard | Shows extracted metrics |
| Explore sources | Scrolls to sources | Quick navigation |
| Ask about brief | Opens CopilotKit chat | AI-powered Q&A |

---

## Backend Cloud Function

### File: `functions/src/copilot-runtime.ts`

Key features:
- Auto-detects OpenRouter vs OpenAI based on config
- Uses GPT-4o-mini for cost efficiency
- Includes MCP tool definitions for future extensions
- CORS enabled for browser requests

### MCP Tools Defined

```typescript
actions: [
  {
    name: 'visualize_brief_insights',
    description: 'Generate a visualization from brief metrics',
    // Triggers frontend chart rendering
  },
  {
    name: 'generate_action_plan',
    description: 'Create detailed action plan from recommendations',
    // Returns structured action items
  }
]
```

---

## Testing

### Health Check

```bash
curl https://us-central1-plannerapi-prod.cloudfunctions.net/copilotHealth
```

Expected response:
```json
{
  "status": "ok",
  "service": "copilot-runtime",
  "timestamp": "2026-01-28T..."
}
```

### View Logs

```bash
firebase functions:log --only copilotRuntime
```

### Manual Test Flow

1. Open PlannerAPI app
2. Search for any topic to generate an Intelligence Brief
3. In the modal, click "Ask about brief"
4. Type a question like "What's the key takeaway?"
5. Verify AI response appears

---

## Troubleshooting

### "CopilotKit not configured" message

- Check that API key is set: `firebase functions:config:get`
- Verify deployment: `firebase functions:list`
- Check logs for errors: `firebase functions:log`

### CORS errors

The runtime includes CORS headers. If issues persist:
- Verify the request origin matches allowed origins
- Check browser console for specific error details

### Slow responses

- GPT-4o-mini typically responds in 2-5 seconds
- If slower, check OpenRouter/OpenAI status pages
- Consider reducing context length in prompts

---

## Dependencies

### Frontend (package.json)

```json
{
  "@copilotkit/react-core": "^1.x",
  "@copilotkit/react-ui": "^1.x"
}
```

### Backend (functions/package.json)

```json
{
  "@copilotkit/runtime": "^1.x",
  "openai": "^4.x"
}
```

---

## Future Enhancements

1. **Custom MCP Tools**: Add tools for generating charts, comparing scenarios
2. **Context Memory**: Persist conversation history per user
3. **Model Switching**: Allow users to choose between models
4. **Usage Analytics**: Track token usage and costs per user

---

*Last updated: January 28, 2026*
*Deployed with: OpenRouter + GPT-4o-mini*
