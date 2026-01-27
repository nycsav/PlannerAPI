# Citation Removal and Sources Availability - Global Fix

**Date:** January 25, 2026  
**Status:** ✅ Complete  
**PRD Requirements:** 
- Sources must be available at all times
- Citation numbers in Moves for Leaders should not appear (no brackets/parentheses)

---

## ✅ Changes Applied Globally

### 1. Citation Number Removal

**Issue:** Citation numbers like `[1]`, `[2][3]` were appearing in Moves for Leaders section.

**Solution:** Updated `parseInlineMarkdown` utility function to automatically strip citation numbers.

**Files Modified:**

1. **`utils/markdown.tsx`**
   - Added `removeCitationNumbers()` function that removes patterns like `[1]`, `[2][3]`, `[1][2][3]`
   - Updated `parseInlineMarkdown()` to automatically remove citations before parsing markdown
   - Applied globally to all components using this utility

2. **`utils/exportPDF.ts`**
   - Updated `cleanText()` function to also remove citation numbers
   - Ensures PDF exports don't include citation numbers

3. **`components/IntelligenceBriefRenderer.tsx`**
   - Added inline citation removal for actions display
   - Ensures all brief renderers strip citations

**Components Automatically Updated (via `parseInlineMarkdown`):**
- ✅ `IntelligenceModal.tsx` - Moves for Leaders section
- ✅ `ExecutiveStrategyChat.tsx` - Actions display
- ✅ `ConversationalBrief.tsx` - Actions display
- ✅ All framework actions in Strategic Frameworks panel

**Pattern Removed:**
- `[1]` → removed
- `[2][3]` → removed
- `[1][2][3]` → removed
- Any combination of square brackets with numbers

---

### 2. Sources Always Available (PRD Requirement)

**Requirement:** Sources must be available at all times in intelligence briefs.

**Implementation:**

1. **Backend (`backend-integration/chat-intel-endpoint.ts`)**
   - Maps Perplexity citations to signals during parsing
   - Includes `citations` array in response
   - Falls back to citations when signal URLs are missing

2. **Frontend (`App.tsx`)**
   - Creates source entries directly from citations array
   - Merges signal sources with citation sources
   - Ensures sources are always included in payload

3. **Modal Display (`components/IntelligenceModal.tsx`)**
   - Sources section **always renders** (never conditionally hidden)
   - Shows actual Perplexity URLs when available
   - Displays helpful fallback message only when no citations exist
   - All source links are clickable and open in new tabs

**Source Display Logic:**
```typescript
// Always show sources section
const validSignals = payload.signals?.filter(signal => 
  signal.sourceUrl && signal.sourceUrl !== '#'
) || [];

if (validSignals.length === 0) {
  // Show helpful message (sources section still visible)
  return <FallbackMessage />;
}

// Display actual source links
return validSignals.map(signal => <SourceLink />);
```

---

## 🧪 Testing Checklist

### Citation Removal
- [x] Intelligence Modal - Moves for Leaders: No `[1]`, `[2][3]` visible
- [x] Executive Strategy Chat - Actions: No citation numbers
- [x] Conversational Brief - Actions: No citation numbers
- [x] PDF Export - Moves for Leaders: No citation numbers
- [x] Strategic Frameworks Actions: No citation numbers

### Sources Availability
- [x] Sources section always visible in Intelligence Modal
- [x] Actual Perplexity URLs displayed when available
- [x] Source links are clickable and open in new tabs
- [x] Fallback message shown only when no citations exist
- [x] Sources extracted from both signals and citations array

---

## 📝 Code Changes Summary

### Utility Function (`utils/markdown.tsx`)
```typescript
// New function to remove citation numbers
export function removeCitationNumbers(text: string): string {
  if (!text) return text;
  return text.replace(/\[\d+\](\[\d+\])*/g, '').trim();
}

// Updated parseInlineMarkdown to auto-remove citations
export function parseInlineMarkdown(text: string): React.ReactNode {
  const cleanedText = removeCitationNumbers(text); // ← Auto-removes citations
  // ... rest of markdown parsing
}
```

### PDF Export (`utils/exportPDF.ts`)
```typescript
const cleanText = (text: string) => {
  return text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/\[\d+\](\[\d+\])*/g, '') // Remove citations ← NEW
    .trim();
};
```

### Sources Always Available (`App.tsx` + `IntelligenceModal.tsx`)
- Backend includes citations in response
- Frontend creates source entries from citations
- Modal always displays Sources section
- Fallback message only when truly no sources

---

## ✅ Verification

All changes are applied globally and automatically:

1. **Citation Removal:** All components using `parseInlineMarkdown` automatically strip citations
2. **Sources Display:** Sources section always visible with actual Perplexity URLs
3. **PDF Export:** Citations removed in exported PDFs
4. **Consistency:** Same behavior across all intelligence brief displays

---

## 🎯 Next Steps

Ready for editorial content improvements:
- Content efficiency optimization
- Audience-specific context enhancement
- Resourceful content delivery

All PRD requirements met:
- ✅ Sources available at all times
- ✅ Citation numbers removed from Moves for Leaders
- ✅ Changes applied globally
