# Debugging Lessons - PlannerAPI

**Purpose:** Document debugging sessions to avoid repeating mistakes and speed up future development.

---

## Premium Library Build - Feb 11, 2026

### Problem
Premium Library component not rendering despite being properly coded and integrated.

### Root Causes (in order discovered)
1. **Missing test data** - Collection `premium_briefs` didn't exist
2. **Missing required field** - Document lacked `createdAt` timestamp
3. **Missing Firestore index** - Composite index required for `featured + createdAt` query
4. **Stale build cache** - Changes not served until `rm -rf dist .vite` + restart

### Lesson Learned
**ALWAYS create test data BEFORE building components that query Firestore.**

**Correct workflow:**
1. Create Firestore collection + test document with ALL required fields
2. Verify data exists in Firebase Console
3. Build component to query that data
4. THEN debug if rendering fails

**Wrong workflow (what we did):**
1. Build component first
2. Spend 30+ minutes debugging permissions/cache/code
3. Finally discover no data exists

### Quick Checks for Future Firestore Features
- [ ] Collection exists in Firestore
- [ ] Test document has ALL fields component expects
- [ ] Firestore rules allow read access
- [ ] Composite indexes created if using multiple where/orderBy
- [ ] Build cache cleared if changes not appearing

### Commands for Next Time
```bash
# Clear build cache if changes not appearing
rm -rf dist .vite node_modules/.vite

# Force deploy Firestore rules
firebase deploy --only firestore:rules --project plannerapi-prod --force

# Force deploy Firestore indexes
firebase deploy --only firestore:indexes --project plannerapi-prod

# Check for running dev servers
ps aux | grep -i "vite\|npm" | grep -v grep
```

---

## Template for Future Lessons

### [Feature Name] - [Date]

**Problem:**
[Brief description of the issue]

**Root Causes:**
1. [Cause 1]
2. [Cause 2]
...

**Lesson Learned:**
[Key takeaway or workflow improvement]

**Quick Checks:**
- [ ] [Checklist item 1]
- [ ] [Checklist item 2]
...

**Commands/Solutions:**
```bash
[Relevant commands or code snippets]
```

---
