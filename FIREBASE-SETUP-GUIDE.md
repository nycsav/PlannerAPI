# Firebase Setup Guide - Phase 2.1

**Status:** Auth infrastructure complete, needs credentials
**Estimated Time:** 5-10 minutes

---

## What's Already Done ✓

- ✅ Firebase SDK installed (v12.7.0)
- ✅ Firebase config file created (`utils/firebase.ts`)
- ✅ AuthContext for user state management
- ✅ SignupModal with Google SSO + Email/Password
- ✅ Navbar shows user avatar when logged in
- ✅ Logout functionality
- ✅ User profiles auto-created in Firestore

---

## What You Need to Do (5-10 minutes)

### Step 1: Get Firebase Credentials

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/plannerapi-prod

2. **Go to Project Settings:**
   - Click ⚙️ (gear icon) in sidebar
   - Click "Project settings"

3. **Scroll to "Your apps" section:**
   - If you don't have a web app yet, click "Add app" → Web (</>) icon
   - Name it "PlannerAPI Web"

4. **Copy the config values:**
   You'll see something like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "plannerapi-prod.firebaseapp.com",
     projectId: "plannerapi-prod",
     storageBucket: "plannerapi-prod.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

---

### Step 2: Update Your .env File

Open `/Users/savbanerjee/Projects/PlannerAPI-clean/.env` and replace placeholders:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...  # Your actual API key
VITE_FIREBASE_PROJECT_ID=plannerapi-prod
VITE_FIREBASE_SENDER_ID=123456789  # Your actual sender ID
VITE_FIREBASE_APP_ID=1:123456789:web:abc123  # Your actual app ID

# Perplexity API Configuration (keep as-is)
VITE_PPLX_API_KEY=your_perplexity_api_key_here
VITE_PPLX_MODEL_FAST=sonar
```

**Important:** Don't commit the .env file! (It's already in .gitignore)

---

### Step 3: Enable Authentication Methods

1. **Go to Firebase Console** → Authentication → Sign-in method

2. **Enable Google:**
   - Click "Google"
   - Toggle "Enable"
   - Add support email (your email)
   - Save

3. **Enable Email/Password:**
   - Click "Email/Password"
   - Toggle "Enable" (first option only, NOT Email link)
   - Save

---

### Step 4: Set up Firestore Database

1. **Go to Firebase Console** → Firestore Database

2. **Create Database:**
   - Click "Create database"
   - **Start in PRODUCTION MODE** (we'll add rules later)
   - Choose location (us-central1 recommended)
   - Click "Enable"

3. **Add Security Rules (IMPORTANT):**
   - Go to "Rules" tab
   - Replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // Users can read/write their own conversations
       match /conversations/{conversationId} {
         allow read, write: if request.auth != null &&
                              resource.data.userId == request.auth.uid;
       }

       // Users can read/write their own saved briefs
       match /saved_briefs/{briefId} {
         allow read, write: if request.auth != null &&
                              resource.data.userId == request.auth.uid;
       }
     }
   }
   ```
   - Click "Publish"

---

### Step 5: Test the Auth Flow

1. **Start dev server:**
   ```bash
   cd /Users/savbanerjee/Projects/PlannerAPI-clean
   npm run dev
   ```

2. **Open browser:**
   http://localhost:5173 (or whatever port Vite shows)

3. **Test signup:**
   - Click "Create Free Account" in navbar
   - Click "Continue with Google"
   - Should open Google sign-in popup
   - After signing in, modal closes
   - Navbar should show your avatar/name

4. **Test user menu:**
   - Click avatar in navbar
   - Should see dropdown with your email
   - "History" button (shows alert for now)
   - "Log Out" button (logs you out)

5. **Check Firestore:**
   - Go back to Firebase Console → Firestore Database
   - You should see:
     - **users** collection
     - A document with your user ID
     - Fields: email, displayName, createdAt, tier, etc.

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
**Solution:** Add your domain to authorized domains
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost`
3. Add your production domain (plannerapi-prod.web.app)

### "Firebase: No Firebase App '[DEFAULT]' has been created"
**Solution:** Check .env file
- Make sure all VITE_FIREBASE_* variables are set
- Restart dev server (`npm run dev`)

### Google Sign-In popup blocked
**Solution:** Allow popups for localhost
- Click popup blocker icon in browser bar
- Allow popups from localhost

### "Firebase: Error (auth/operation-not-allowed)"
**Solution:** Enable authentication method
- Firebase Console → Authentication → Sign-in method
- Make sure Google and Email/Password are ENABLED

### Build errors about Firebase
**Solution:** Check imports
- Make sure `firebase` package is in package.json
- Run `npm install` if needed

---

## What Happens After Signup

### For Users:
1. **Google SSO:**
   - Popup opens → user selects Google account
   - User data stored in Firestore (`users` collection)
   - Modal closes
   - Navbar shows avatar and user menu
   - User is logged in across all tabs (Firebase handles this)

2. **Email/Password:**
   - User enters email + password (min 6 chars)
   - Account created
   - User data stored in Firestore
   - Modal closes
   - Navbar shows avatar and user menu

### User Profile Created in Firestore:
```javascript
{
  uid: "abc123...",
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "https://...", // (Google only)
  createdAt: Timestamp,
  tier: "free", // free, pro, enterprise
  savedBriefsCount: 0,
  lastActive: Timestamp
}
```

### Session Persistence:
- User stays logged in across page refreshes
- Firebase stores session token in localStorage
- Logout clears session

---

## Next Steps (After Testing)

Once auth is working:

### ✅ Phase 2.1 Complete → Move to Phase 2.2
**Phase 2.2: Add Modal Trigger Logic**
- Show signup modal automatically after first search loads
- Track dismissals (don't re-show same session)
- Time: 4-6 hours

### ✅ Phase 2.2 Complete → Move to Phase 2.3
**Phase 2.3: Post-Signup Experience**
- Success toast: "Account created!"
- Contextual tooltip pointing to History icon
- Auto-save current search
- Time: 4-6 hours

### ✅ Phase 2.3 Complete → Move to Phase 3
**Phase 3.1: Conversation Persistence**
- Auto-save all intelligence queries
- Build History sidebar
- Load saved conversations
- Time: 1 day

---

## Security Notes

### What's Secure:
- ✅ Firebase Auth handles password hashing
- ✅ Google SSO uses OAuth2 (secure tokens)
- ✅ Firestore rules enforce user-only access
- ✅ API keys are client-side safe (restricted by domain)

### What to Do Before Production:
1. **Restrict API key:**
   - Firebase Console → Project Settings → API Key
   - Click "..." → Application restrictions
   - Add only your domains (plannerapi-prod.web.app)

2. **Enable App Check (recommended):**
   - Prevents API abuse
   - Firebase Console → App Check
   - Register app → reCAPTCHA v3

3. **Review Firestore rules:**
   - Make sure only authenticated users can read/write
   - Test rules with Firebase Emulator

---

## Files Modified in Phase 2.1

| File | Purpose |
|------|---------|
| `utils/firebase.ts` | Firebase config, auth functions, Firestore setup |
| `contexts/AuthContext.tsx` | React context for user auth state |
| `components/SignupModal.tsx` | Real Google SSO + email/password signup |
| `components/Navbar.tsx` | User avatar dropdown, logout button |
| `index.tsx` | AuthProvider wrapping App |
| `.env.example` | Updated with all Firebase fields |

**New Files:** 2 (firebase.ts, AuthContext.tsx)
**Modified Files:** 4

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Firebase Hosting (after testing)
firebase deploy --only hosting

# Check Firebase project
firebase projects:list

# Open Firebase Console
open https://console.firebase.google.com/project/plannerapi-prod
```

---

**Ready to test! Follow the 5 steps above, then let me know if signup works.**
