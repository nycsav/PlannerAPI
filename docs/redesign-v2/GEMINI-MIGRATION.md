# Gemini 3.1 Pro + Nano Banana 2 Migration Plan

**Date**: 2026-03-19
**Status**: Planning

## Overview

Migrate Signal2Noise from Perplexity Sonar APIs to Google Gemini ecosystem for:
1. Grounded web search + structured JSON output (Gemini 3.1 Pro)
2. AI-generated visuals per card (Nano Banana 2)

## Model Mapping

| Current (Perplexity) | New (Gemini) | API Model ID | Purpose |
|---|---|---|---|
| `sonar` | Gemini 3.1 Pro | `gemini-3.1-pro-preview` | Search + summarization |
| `sonar-pro` | Gemini 3.1 Pro | `gemini-3.1-pro-preview` | Deep research, chat intel |
| `sonar-reasoning-pro` | Gemini 3.1 Pro (thinking) | `gemini-3.1-pro-preview` | Signal scoring (JSON mode) |
| N/A (og_image only) | Nano Banana 2 | `gemini-3.1-flash-image-preview` | Image generation per card |

## Firebase Functions to Migrate

### Phase 1: Search + Chat (Replace Perplexity text endpoints)

| Function | Current | Migration |
|---|---|---|
| `chatIntel` | Perplexity sonar | Gemini 3.1 Pro + Google Search grounding |
| `chatIntelStream` | Perplexity sonar (SSE) | Gemini 3.1 Pro streaming |
| `chatSimple` | Perplexity sonar | Gemini 3.1 Pro (no grounding needed) |
| `perplexitySearch` | Perplexity sonar | Gemini 3.1 Pro + grounding |
| `perplexityResearch` | Perplexity sonar-pro | Gemini 3.1 Pro + grounding (extended) |
| `perplexityRawSearch` | Perplexity sonar | Gemini 3.1 Pro + grounding |
| `perplexitySearchInstant` | Perplexity sonar | Gemini 3.1 Pro + grounding |

### Phase 2: Signal Scoring (Replace reasoning endpoints)

| Function | Current | Migration |
|---|---|---|
| `getSignalScores` | Perplexity sonar-reasoning-pro | Gemini 3.1 Pro (structured output + thinking) |
| `getSignalInsight` | Perplexity sonar-pro (JSON mode) | Gemini 3.1 Pro (structured output) |

### Phase 3: Visual Generation (New capability)

| Function | New | Purpose |
|---|---|---|
| `generateCardImage` | Nano Banana 2 | Generate hero/thumbnail image per signal card |
| `generateOGImage` | Nano Banana 2 | Generate Open Graph images for sharing |

## New API Client: `functions/src/geminiClient.ts`

```typescript
// Google Generative AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Text + Search model
export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
});

// Image generation model
export const nanoBanana = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
});

// Grounded search helper
export async function groundedSearch(query: string, options?: {
  structuredOutput?: object;
  thinkingLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}) {
  const result = await geminiPro.generateContent({
    contents: [{ role: 'user', parts: [{ text: query }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: options?.structuredOutput ? {
      responseMimeType: 'application/json',
      responseSchema: options.structuredOutput,
    } : undefined,
  });
  return result;
}

// Image generation helper
export async function generateImage(prompt: string) {
  const result = await nanoBanana.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'image/png',
    },
  });
  return result;
}
```

## Environment Variables

Add to `functions/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Dependencies

Add to `functions/package.json`:
```json
"@google/generative-ai": "^0.30.0"
```

## Cost Estimate

| Usage | Tokens/day | Cost/month |
|---|---|---|
| Search + summarization (Pro) | ~50K input, ~20K output | ~$10 |
| Signal scoring (Pro + thinking) | ~30K input, ~10K output | ~$5 |
| Image generation (Nano Banana 2) | ~20 images/day | ~$10-15 |
| Google Search grounding | ~50 queries/day | Free (under 1,500/day) |
| **Total** | | **~$25-30/month** |

vs. current Perplexity spend — savings of ~30-40%.

## Migration Strategy

1. **Create `geminiClient.ts`** alongside existing `perplexityClient.ts`
2. **Add feature flag** `USE_GEMINI=true` in `.env`
3. **Migrate one function at a time**, starting with `chatSimple` (simplest)
4. **A/B test** by keeping Perplexity as fallback for 2 weeks
5. **Remove Perplexity deps** after validation
6. **Add Nano Banana 2** image gen as new capability (no migration needed, pure addition)

## Grounding vs Perplexity Differences

| Feature | Perplexity | Gemini Grounded |
|---|---|---|
| Citations | URL list in response | `groundingChunks` with URLs + `groundingSupports` linking text→source |
| Search scope | 10B+ pages | Google Search index |
| Image results | `og_image` per result | No image in search results (use Nano Banana 2 separately) |
| JSON mode | `response_format: { type: "json_object" }` | `responseMimeType: "application/json"` + `responseSchema` |
| Streaming | SSE via fetch | SSE via `generateContentStream()` |
| Rate limits | Varies by plan | 1,500 grounding queries/day free |
