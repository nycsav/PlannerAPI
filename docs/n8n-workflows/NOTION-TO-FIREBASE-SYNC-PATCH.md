# Notion Research to Firebase Discovery Sync — Bug Fix Patch

**Workflow:** Notion Research to Firebase Discovery Sync  
**Issue:** When all items are skipped due to empty excerpts, the workflow throws "Unexpected end of input" instead of returning gracefully.

---

## 1. Claude - Generate Analysis (Code Node)

**Fix:** Add a safe return when all items are skipped. Insert this block **immediately before** the final `return results;`:

```javascript
if (results.length === 0) {
  return [{ json: { skipped: true, reason: 'All items had empty excerpts' } }];
}
```

So the end of the script becomes:

```javascript
  if (excerpts.length < 20 || title.length < 5) {
    console.log(`Skipping hollow card: "${title}" (excerpts: ${excerpts.length} chars)`);
    continue;
  }
  // ... (rest of loop unchanged) ...
}

if (results.length === 0) {
  return [{ json: { skipped: true, reason: 'All items had empty excerpts' } }];
}
return results;
```

---

## 2. Transform to Firebase Schema (Code Node)

**Fix:** Filter out skipped items at the start. Replace the opening:

```javascript
const items = $input.all();
const results = [];

for (const item of items) {
```

With:

```javascript
const items = $input.all();

// Skip items marked as skipped by Claude (e.g. all had empty excerpts)
const validItems = items.filter(item => !item.json?.skipped);
if (validItems.length === 0) {
  return [];
}

const results = [];

for (const item of validItems) {
```

**Important:** The loop must iterate over `validItems`, not `items`.

---

## Summary of Changes

| Node | Change |
|------|--------|
| **Claude - Generate Analysis** | Add `if (results.length === 0) { return [{ json: { skipped: true, reason: 'All items had empty excerpts' } }]; }` before `return results;` |
| **Transform to Firebase Schema** | Filter input: `validItems = items.filter(item => !item.json?.skipped)`; return `[]` if none; loop over `validItems` |

---

## How to Apply

1. Open n8n → **Notion Research to Firebase Discovery Sync** workflow
2. Double-click **Claude - Generate Analysis** node
3. In the Code editor, find the line `return results;` at the end
4. Insert the `if (results.length === 0)` block **above** it
5. Save the node
6. Double-click **Transform to Firebase Schema** node
7. At the top, add the `validItems` filter and early return
8. Change the loop variable from `items` to `validItems`
9. Save the node
10. Save the workflow
