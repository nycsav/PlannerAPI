# User-Friendly Prompts Enhancement - Perplexity-Inspired

**Date:** January 25, 2026  
**Status:** ✅ Complete  
**Purpose:** Make all prompts, placeholders, and error messages more personal, conversational, and user-friendly using Perplexity AI best practices

---

## 🎯 Overview

Updated all user-facing prompts, placeholders, error messages, and system prompts to be more personal, conversational, and user-friendly, matching Perplexity's seamless, approachable style.

---

## ✨ Key Changes

### 1. Input Placeholders

**Before:**
- `"Ask about this intelligence..."`

**After:**
- `"Ask a follow-up..."` (matches Perplexity's style)

**Rationale:**
- Shorter, more direct
- Matches Perplexity's exact phrasing
- Feels more conversational

---

### 2. Button Labels

**Before:**
- `"Ask"` (loading: `"Thinking"`)

**After:**
- `"Send"` (loading: `"Thinking..."`)

**Rationale:**
- "Send" is more standard and expected
- Ellipsis in "Thinking..." provides better visual feedback
- More natural interaction pattern

---

### 3. Loading Messages

**Before:**
- `"Analyzing intelligence..."`
- `"Creating Your Intelligence Brief"`
- `"Analyzing data and generating insights... This may take 6-8 seconds."`

**After:**
- `"Finding the latest insights..."`
- `"Creating Your Intelligence Brief"` (kept)
- `"Gathering the latest data and insights... This usually takes 6-8 seconds."`

**Rationale:**
- "Finding" and "Gathering" feel more active and helpful
- "usually" is softer than "may" (sets realistic expectations)
- More conversational tone

---

### 4. Error Messages

**Before:**
- `"Unable to retrieve intelligence. Please try again."`
- `"Request timed out. The backend may be overloaded. Please try again."`
- `"Network error. Please check your connection and try again."`
- `"I could not generate a response."`
- `"Invalid request. Please provide a query string."`

**After:**
- `"I had trouble getting that intelligence. Could you try again?"`
- `"This is taking longer than expected. The system might be busy - try again in a moment?"`
- `"Looks like there's a connection issue. Check your internet and try again?"`
- `"I need a bit more context to help with that. Could you rephrase your question?"`
- `"What would you like to know more about?"`

**Rationale:**
- First-person ("I") makes it feel more personal
- Questions instead of commands feel more conversational
- Acknowledges the issue without being technical
- Offers helpful next steps

---

### 5. System Prompts (Backend)

**Before:**
```
You are an elite strategic intelligence analyst providing highly personalized, user-centric insights...
Write as if briefing a busy CMO before a critical decision
```

**After:**
```
You're a trusted strategic intelligence advisor helping a CMO make critical decisions...
Write as if you're having a direct conversation - be helpful, clear, and actionable
Be direct but friendly - like you're briefing a colleague before an important meeting
```

**Rationale:**
- "You're" instead of "You are" is more conversational
- "Trusted advisor" feels more personal than "elite analyst"
- "Direct conversation" is more approachable than "briefing"
- "Colleague" suggests partnership, not hierarchy

---

### 6. Follow-Up Query Building

**Before:**
```
Context: ${payload.query}. Question: ${currentInput}
```

**After:**
```
Based on this intelligence about "${payload.query}", ${currentInput}
```

**Rationale:**
- More natural, conversational flow
- Reads like a human would phrase it
- Less technical, more approachable

---

### 7. Chat Simple System Prompt

**Before:**
```
You are a strategic marketing intelligence assistant for C-suite executives. 
Provide concise, actionable answers with specific data, metrics, and sources when possible.
```

**After:**
```
You're a trusted strategic intelligence advisor helping a CMO make critical decisions.

Write as if you're having a direct conversation - be helpful, clear, and actionable. 
Use real data and specific examples when you can. Keep it concise (under 150 words) 
but make every word count.

Focus on what matters most: business impact, strategic implications, and what they 
should do next. Be direct but friendly - like you're briefing a colleague before 
an important meeting.

Never mention that you don't have access to information or include disclaimers. 
Always respond positively using your knowledge and research capabilities.
```

**Rationale:**
- More conversational and personal
- Clearer guidance on tone and approach
- Explicitly prevents disclaimers (better UX)
- Emphasizes helpfulness and actionability

---

## 📐 Perplexity Best Practices Applied

### 1. Conversational Tone
- ✅ Use "you're" instead of "you are"
- ✅ Use first person ("I", "we") in error messages
- ✅ Ask questions instead of giving commands
- ✅ Use contractions for natural flow

### 2. Helpful, Not Technical
- ✅ Avoid technical jargon in user-facing messages
- ✅ Explain what's happening in plain language
- ✅ Offer next steps, not just problems
- ✅ Acknowledge issues without being defensive

### 3. Personal Connection
- ✅ "Trusted advisor" instead of "analyst"
- ✅ "Colleague" instead of "executive"
- ✅ "Direct conversation" instead of "briefing"
- ✅ Friendly but professional tone

### 4. Clear Expectations
- ✅ "This usually takes 6-8 seconds" (realistic)
- ✅ "Could you try again?" (helpful suggestion)
- ✅ "What would you like to know more about?" (inviting)

---

## 📝 Files Modified

### 1. `components/IntelligenceModal.tsx`
- ✅ Updated placeholder: `"Ask a follow-up..."`
- ✅ Updated button: `"Send"` (was "Ask")
- ✅ Updated loading: `"Thinking..."` (was "Thinking")
- ✅ Updated loading messages to be more conversational
- ✅ Updated error message to be more friendly
- ✅ Updated contextual query building to be more natural

### 2. `backend-integration/chat-simple-endpoint.ts`
- ✅ Updated system prompt to be conversational and personal
- ✅ Updated error messages to be user-friendly
- ✅ Added audience context to system prompt
- ✅ Explicitly prevents disclaimers

### 3. `backend-integration/chat-intel-endpoint.ts`
- ✅ Updated system prompt opening to be more conversational
- ✅ Enhanced editorial voice requirements with friendly tone
- ✅ Updated query-specific personalization section
- ✅ Added reminder about conversational, helpful tone

### 4. `App.tsx`
- ✅ Updated all error messages to be more personal and friendly
- ✅ Changed from commands to questions
- ✅ Added first-person perspective

---

## 🎨 UI/UX Improvements

### Input Field
**Before:**
```
[Ask about this intelligence...] [Ask]
```

**After:**
```
[Ask a follow-up...] [Send]
```

### Loading States
**Before:**
- "Analyzing intelligence..."
- "Thinking"

**After:**
- "Finding the latest insights..."
- "Gathering the latest data and insights..."
- "Thinking..."

### Error Messages
**Before:**
- "Unable to retrieve intelligence. Please try again."
- "Request timed out. The backend may be overloaded."

**After:**
- "I had trouble getting that intelligence. Could you try again?"
- "This is taking longer than expected. The system might be busy - try again in a moment?"

---

## ✅ Quality Checklist

- [x] All placeholders are conversational and inviting
- [x] All error messages use first-person and questions
- [x] All loading messages are active and helpful
- [x] System prompts emphasize conversational tone
- [x] Button labels are standard and expected
- [x] No technical jargon in user-facing text
- [x] All prompts feel personal and friendly
- [x] Matches Perplexity's approachable style

---

## 🚀 Benefits

**Before:**
- Formal, technical language
- Commands instead of questions
- Impersonal error messages
- System prompts feel corporate

**After:**
- Conversational, friendly language
- Questions and suggestions
- Personal, helpful error messages
- System prompts feel like a trusted advisor

**User Experience:**
- ✅ Feels more like talking to a helpful colleague
- ✅ Less intimidating, more approachable
- ✅ Clear expectations without being demanding
- ✅ Errors feel like temporary hiccups, not failures

---

## 📚 Examples

### Example 1: Error Handling

**Before:**
```
Error: Unable to retrieve intelligence. Please try again.
```

**After:**
```
I had trouble getting that intelligence. Could you try again?
```

### Example 2: System Prompt

**Before:**
```
You are an elite strategic intelligence analyst providing highly personalized, 
user-centric insights for a Chief Marketing Officer.
```

**After:**
```
You're a trusted strategic intelligence advisor helping a CMO make critical decisions. 
Think of yourself as their go-to source for what's happening in the market and what 
it means for their business.
```

### Example 3: Loading Message

**Before:**
```
Analyzing intelligence...
```

**After:**
```
Finding the latest insights...
```

---

## 🔄 Integration Points

**Frontend:**
- `IntelligenceModal.tsx` - All user-facing prompts and messages
- `App.tsx` - Error handling and user messages

**Backend:**
- `chat-simple-endpoint.ts` - Follow-up question system prompt
- `chat-intel-endpoint.ts` - Main intelligence generation system prompt

---

**Status:** ✅ All prompts, placeholders, and error messages are now more personal, conversational, and user-friendly, matching Perplexity's seamless, approachable style.
