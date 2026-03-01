# Search Bar Debug Session — March 2026

**Date:** 2026-03-01
**Symptom:** "ASK button not firing" on signals.ensolabs.ai
**Conclusion:** Button fires correctly. Root cause is 8–15 second response latency with no visible loading state.

---

## Diagnostic Findings

### Files involved in search
Only 3 files:
- `src/components/HeroSection.tsx` — search input, button, `handleSearch`, `SearchModal`
- `src/config/api.ts` — URL resolution (`ENDPOINTS.perplexitySearch`)
- `src/App.tsx` — passes `trendingTopics` prop to HeroSection

No `HeroSearch.tsx` exists in this codebase.

### Backend status
```bash
curl -v -X POST https://planners-backend-9036060950.us-central1.run.app/perplexity/search \
  -H "Origin: https://signals.ensolabs.ai" \
  -d '{"query":"test"}'
# Returns: HTTP/2 200, access-control-allow-origin: *
# Response time: ~8 seconds
```

- CORS: `access-control-allow-origin: *` — no CORS issue
- URL: Correct (`9036060950`, not old `865025512785`)
- Response: Valid JSON with `query`, `answer`, `citations`, `images`

### Environment variables
`.env` contains:
```
VITE_CLOUD_RUN_URL=https://planners-backend-9036060950.us-central1.run.app
```
No `.env.production` or `.env.local` files exist. URL is correct.

### Button implementation (HeroSection.tsx)
```tsx
<button
  type="button"                          // Not "submit" — no form interference
  disabled={searching || !searchQuery.trim()}
  onClick={handleSearch}                 // Direct handler, no form wrapping
  className="... disabled:opacity-40"
>
  {searching ? '...' : 'Search →'}
</button>
```

### handleSearch function
```tsx
const handleSearch = async () => {
  const q = searchQuery.trim();
  if (!q || searching) return;          // Guard: empty query or already in-flight

  setSearching(true);
  setSearchError('');
  try {
    const res = await fetch(ENDPOINTS.perplexitySearch, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setSearchResult(data);              // Triggers SearchModal render
  } catch (err) {
    console.error('[Search] Failed:', err);
    setSearchError('Search unavailable — try again shortly.');
  } finally {
    setSearching(false);
  }
};
```

---

## Root Cause

**The button fires immediately on click. The problem is the absence of visible feedback during a long wait.**

The `/perplexity/search` endpoint uses `sonar-pro` with full web search. Response time from Cloud Run is **8–15 seconds** (8s confirmed for "test" query; real queries are longer).

During this window:
1. Button text changes from `Search →` to `...` — the only visual change
2. No other loading indicator exists anywhere on the page
3. User assumes nothing happened and clicks again — does nothing because `searching=true` disables the button
4. User gives up before the 8–15s timeout

Secondary contributing factors:
- `disabled:opacity-40` provides a very subtle visual cue on a dark background
- `cursor-pointer` stays in effect even when disabled — button always looks active
- The search bar has no placeholder loading message or spinner

---

## What is NOT the problem

| Suspected cause | Status |
|----------------|--------|
| Old backend URL (865025512785) | Not present anywhere in `src/` |
| CORS error | Not the issue — `access-control-allow-origin: *` |
| Missing `onClick` | Not the issue — `onClick={handleSearch}` correctly wired |
| Form submission interference | Not the issue — no `<form>` wrapper, button is `type="button"` |
| Wrong `VITE_CLOUD_RUN_URL` | Not the issue — correct URL in `.env` |
| Regex parsing failure silently breaking modal | Not the issue — regex updated to strip `**` markdown markers |

---

## API Response Format Note

The `/perplexity/search` endpoint response uses inconsistent markdown formatting:
- Sometimes: `**Summary:** text` (with `**` bold markers)
- Sometimes: `Summary: text` (plain)

The `parseSections` function in `SearchModal` strips `**` before parsing to handle both.

```typescript
const clean = text.replace(/\*\*/g, '');
const summaryMatch = clean.match(/Summary:\s*(.+?)(?=\n\s*\n|\n\s*Signals:|\n\s*Moves for leaders:|$)/is);
```

---

## Recommended Fix (not yet implemented)

Add a visible loading state below the search bar immediately on click:

```tsx
{searching && (
  <p className="font-mono text-[10px] m-0 animate-pulse" style={{ color: '#7A8BA0' }}>
    Searching intelligence database...
  </p>
)}
```

Or: Switch to `/chat-intel` endpoint which uses `sonar` (faster, ~3–4s) instead of `sonar-pro`.

---

## Perplexity /perplexity/search response shape

```json
{
  "query": "string",
  "answer": "Summary: ...\n\nSignals:\n- ...\n\nMoves for leaders:\n- ...",
  "citations": [{ "title": "string", "url": "string", "date": "string", "snippet": "string", "source": "web" }],
  "images": [{ "image_url": "string", "origin_url": "string", "height": 0, "width": 0, "title": "string" }],
  "raw": { ... }
}
```
