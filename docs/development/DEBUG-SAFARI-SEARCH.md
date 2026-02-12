# Safari Search Issue - Debugging Guide

## Summary of Investigation

**Status**: Firestore security rules have been updated and deployed ✓

**Issue**: Search button not delivering results in Safari

**Root Cause Identified**: Firestore analytics write was failing due to restrictive security rules
- Error: `[Analytics] Firestore write failed – FirebaseError: [code=permission-denied]`

**Fix Applied**: Updated `firestore.rules` to allow writes to `analytics_events` collection
```firestore
match /analytics_events/{eventId} {
  allow create: if true;
  allow read: if request.auth != null;
}
```

---

## Search Flow Architecture

When user clicks search button in Safari:

```
1. User enters query → clicks SEARCH button
   ↓
2. HeroSearch.tsx → handleSubmit()
   ↓
3. trackSearch(query) → writes to Firestore analytics_events
   ↓
4. onSearch(query) → App.tsx openSearch()
   ↓
5. fetchIntelligence(query) → calls backend /chat-intel endpoint
   ↓
6. Backend responds with intelligence data
   ↓
7. IntelligenceModal displays results
```

**Key Point**: Steps 1-3 happen in quick succession. Even if analytics write fails, it should NOT block steps 4-7.

---

## Verification Checklist

### Step 1: Verify Firestore Rules Were Deployed ✓
```bash
# Check current rules
firebase rules:get
```

Expected output should show:
```firestore
match /analytics_events/{eventId} {
  allow create: if true;
  allow read: if request.auth != null;
}
```

### Step 2: Test Analytics Write Directly
Open Safari Developer Console (Cmd+Option+I) and run:
```javascript
// This should succeed now (no permission denied error)
db.collection('analytics_events').add({
  eventName: 'test_event',
  timestamp: new Date(),
  test: true
})
.then(() => console.log('✓ Analytics write succeeded!'))
.catch(err => console.error('✗ Analytics write failed:', err.message));
```

Expected result: `✓ Analytics write succeeded!`

### Step 3: Test Backend Endpoint
The backend endpoint is at: `https://planners-backend-865025512785.us-central1.run.app/chat-intel`

**Test via curl** (from terminal):
```bash
curl -X POST https://planners-backend-865025512785.us-central1.run.app/chat-intel \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is AI attribution?",
    "audience": "VP Marketing"
  }' \
  -v
```

**Expected response**: JSON with structure:
```json
{
  "implications": ["..."],
  "actions": ["..."],
  "signals": [{"title": "...", "summary": "..."}],
  "frameworks": [...]
}
```

**If endpoint is down**, you'll see:
- Connection timeout
- 404 Not Found
- 500 Internal Server Error
- CORS error in browser

### Step 4: Test Search in Safari with Network Debug

1. Open Safari Developer Tools (Cmd+Option+I)
2. Switch to Network tab
3. Enter search query and click SEARCH
4. Watch for these requests:
   - **analytics_events write** - POST to Firebase
   - **chat-intel request** - POST to backend endpoint
5. Check each request for:
   - **Status**: Should be 200 OK
   - **Response**: Should have JSON body
   - **Errors**: Check Console tab for error messages

---

## Common Failure Scenarios

### Scenario 1: Analytics Write Still Failing
- **Symptom**: Safari console shows `[Analytics] Firestore write failed`
- **Cause**: Firestore rules not deployed yet
- **Fix**:
  ```bash
  firebase deploy --only firestore:rules
  ```

### Scenario 2: Backend Endpoint Returns 404
- **Symptom**: Network tab shows `404 Not Found` for chat-intel request
- **Cause**: Backend Cloud Function not deployed or URL is wrong
- **Fix**:
  ```bash
  # From functions/ directory:
  firebase deploy --only functions

  # Verify function exists:
  gcloud functions list --project=plannerapi-prod
  ```

### Scenario 3: Backend Endpoint Returns 500
- **Symptom**: Network tab shows `500 Internal Server Error`
- **Cause**: Backend function has runtime error or missing environment variables
- **Fix**:
  ```bash
  # Check Cloud Function logs:
  firebase functions:log --only chat-intel --since 1h

  # Or use gcloud:
  gcloud functions describe chat-intel --runtime python311 --region us-central1 --project=plannerapi-prod
  ```

### Scenario 4: CORS Error
- **Symptom**: Browser console shows `CORS error` or `blocked by CORS policy`
- **Cause**: Backend endpoint missing CORS headers
- **Fix**: Backend function should include CORS headers:
  ```python
  from flask import Response

  def chat_intel(request):
    # Enable CORS
    if request.method == 'OPTIONS':
      headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
      return ('', 204, headers)

    # Process request...
  ```

### Scenario 5: Modal Opens but Shows Error
- **Symptom**: Modal opens, shows "Unable to retrieve intelligence" error
- **Cause**: Backend returned error response
- **Fix**: Check Cloud Function logs to see what went wrong

---

## Files Modified in This Fix

### firestore.rules (UPDATED)
- **Change**: Added explicit allow rules for analytics collections
- **Status**: Deployed ✓
- **Verification**:
  ```bash
  firebase rules:get | grep analytics_events
  ```

### App.tsx (ALREADY HAD)
- **Status**: Has comprehensive error handling and logging
- **Logging**: `[App]` prefixed console messages show full flow
- **Includes**: 30-second timeout, error differentiation (timeout vs network vs CORS)

### HeroSearch.tsx (ALREADY HAD)
- **Status**: Has error logging for fetch
- **Includes**: Fallback error message if backend fails
- **Logging**: `[HeroSearch]` prefixed console messages

### useAnalytics.ts (ALREADY HAD)
- **Status**: Has non-blocking error handling for Firestore writes
- **Behavior**: Logs warning but continues execution
- **Logging**: `[Analytics]` prefixed console messages

---

## Next Steps

1. **If analytics write now succeeds** (Step 2):
   - ✓ Firestore rules are working
   - → Test backend endpoint (Step 3)

2. **If backend endpoint responds** (Step 3):
   - ✓ Backend is deployed and healthy
   - → Test search in Safari with Network debug (Step 4)
   - → Check what data backend returns

3. **If search still fails**:
   - Open Safari Developer Console
   - Look for error messages in Console tab
   - Check Network tab for failed requests
   - Share the error message and network request details for deeper debugging

---

## Debug Script for Safari Console

Copy and paste this in Safari Developer Console to test both analytics and backend:

```javascript
(async function() {
  console.log('=== Testing PlannerAPI Search Flow ===\n');

  // Test 1: Analytics write
  console.log('Test 1: Analytics write to Firestore...');
  try {
    const docRef = await db.collection('analytics_events').add({
      eventName: 'debug_test',
      timestamp: new Date(),
      properties: { test: true }
    });
    console.log('✓ Analytics write succeeded! Doc ID:', docRef.id);
  } catch (err) {
    console.error('✗ Analytics write failed:', err.message);
  }

  // Test 2: Backend endpoint
  console.log('\nTest 2: Backend /chat-intel endpoint...');
  try {
    const response = await fetch(
      'https://planners-backend-865025512785.us-central1.run.app/chat-intel',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Test query',
          audience: 'VP Marketing'
        })
      }
    );

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('✓ Backend endpoint working! Response structure:', Object.keys(data));
  } catch (err) {
    console.error('✗ Backend endpoint failed:', err.message);
  }

  console.log('\n=== Debug Complete ===');
})();
```

---

## Estimated Deployment Time

| Component | Time | Status |
|-----------|------|--------|
| Firestore rules deploy | ~30 seconds | ✓ Done |
| Backend function deploy | ~2-3 minutes | ? Check |
| Frontend changes | ~1 minute | N/A |
| **Total** | ~5 minutes | In progress |

---

## Success Criteria

✓ **Search is working** when:
1. Safari console shows no Firestore permission errors
2. Backend endpoint returns 200 status with valid JSON
3. IntelligenceModal displays intelligence brief with summary, signals, and moves
4. User can interact with follow-up questions
5. Export/Share buttons work

---

## Rollback Plan

If you need to revert changes:

```bash
# Restore previous firestore rules
git checkout HEAD~1 -- firestore.rules

# Redeploy
firebase deploy --only firestore:rules
```

---

## Additional Resources

- **Firebase Hosting**: https://plannerapi-prod.web.app
- **Backend endpoint**: https://planners-backend-865025512785.us-central1.run.app
- **Firebase Console**: https://console.firebase.google.com/project/plannerapi-prod
- **Cloud Functions logs**: https://console.cloud.google.com/functions/details/us-central1/chat-intel?project=plannerapi-prod
