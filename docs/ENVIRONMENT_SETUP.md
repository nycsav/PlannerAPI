# Environment Setup Guide

Complete guide for configuring your development environment.

---

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Git** for version control
- **Firebase CLI** for local development
- **Google Cloud SDK** for Cloud Functions

### Installation

```bash
# Install Node.js (macOS)
brew install node@20

# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud SDK
brew install google-cloud-sdk

# Verify installations
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
firebase --version
gcloud --version
```

---

## 1. Clone Repository

```bash
git clone https://github.com/nycsav/PlannerAPI.git
cd PlannerAPI
```

---

## 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

---

## 3. Firebase Authentication

```bash
# Authenticate with Google Cloud
firebase login

# Set active project
firebase use plannerapi-prod

# Or create .firebaserc for auto-selection:
cat > .firebaserc << 'EOF'
{
  "projects": {
    "default": "plannerapi-prod"
  }
}
EOF
```

---

## 4. Frontend Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```bash
# Firebase Configuration
# Get from: Firebase Console → Project Settings → General

VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_PROJECT_ID=plannerapi-prod
VITE_FIREBASE_SENDER_ID=YOUR_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE

# Perplexity (optional for client-side use)
VITE_PPLX_API_KEY=your_key_here
VITE_PPLX_MODEL_FAST=sonar

# Google Analytics (optional)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### How to Get Firebase Credentials

1. Go to: https://console.firebase.google.com/u/0/project/plannerapi-prod
2. Click **⚙️ Settings** → **Project Settings**
3. Scroll down to **SDK setup and configuration**
4. Copy the values:
   ```javascript
   const firebaseConfig = {
     apiKey: "VITE_FIREBASE_API_KEY",
     projectId: "VITE_FIREBASE_PROJECT_ID",
     messagingSenderId: "VITE_FIREBASE_SENDER_ID",
     appId: "VITE_FIREBASE_APP_ID"
   };
   ```

---

## 5. Cloud Functions Environment Variables

Create `.env` in the `functions/` directory:

```bash
cp functions/.env.example functions/.env
```

Edit `functions/.env`:

```bash
# Perplexity API Key
PPLX_API_KEY=pplx-YOUR_KEY_HERE
PPLX_MODEL_FAST=sonar

# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# n8N Integration (optional)
N8N_API_KEY=your_key_here
N8N_WEBHOOK_URL=https://your-instance.com/webhook
```

### How to Get API Keys

#### Perplexity API

1. Go to: https://www.perplexity.ai/settings/api
2. Sign in with your Perplexity account
3. Click **Create Key**
4. Copy the full key (starts with `pplx-`)

#### Anthropic API

1. Go to: https://console.anthropic.com/settings/keys
2. Sign in with your Anthropic account
3. Click **Create Key**
4. Copy the full key (starts with `sk-ant-`)

---

## 6. Configure Firebase Functions Secrets

For **production deployment**, store secrets in Firebase Functions config:

```bash
# Set Perplexity key
firebase functions:config:set \
  pplx.api_key="pplx-YOUR_KEY_HERE"

# Set Anthropic key
firebase functions:config:set \
  anthropic.api_key="sk-ant-YOUR_KEY_HERE"

# Verify config
firebase functions:config:get
```

For **local development**, use `.env` file in `functions/` directory.

---

## 7. Google Cloud Configuration

```bash
# Set default project
gcloud config set project plannerapi-prod

# Authenticate
gcloud auth login

# Verify
gcloud config list
```

---

## 8. Firestore Setup

For **local development with emulator**:

```bash
# Install emulator (one time)
firebase setup:emulators:firestore

# Start emulator
firebase emulators:start

# In another terminal, run dev server
npm run dev
```

For **production**, Firestore is already configured on Google Cloud.

---

## 9. Verify Setup

Run these commands to verify everything is configured:

```bash
# Check Node version
node --version

# Check npm dependencies
npm list

# Check Firebase configuration
firebase projects:list

# Check Google Cloud configuration
gcloud config list

# Test build
npm run build

# Test frontend
npm run dev
# Visit http://localhost:5173
```

---

## 10. Environment Variables Summary

| Variable | Where | Required | Purpose |
|----------|-------|----------|---------|
| `VITE_FIREBASE_API_KEY` | `.env` | ✅ Yes | Firebase Web SDK key |
| `VITE_FIREBASE_PROJECT_ID` | `.env` | ✅ Yes | Firebase project |
| `VITE_FIREBASE_SENDER_ID` | `.env` | ✅ Yes | Firebase cloud messaging |
| `VITE_FIREBASE_APP_ID` | `.env` | ✅ Yes | Firebase app identifier |
| `VITE_PPLX_API_KEY` | `.env` | ❌ No | Perplexity API (client-side) |
| `VITE_PPLX_MODEL_FAST` | `.env` | ❌ No | Perplexity model choice |
| `VITE_GA4_MEASUREMENT_ID` | `.env` | ❌ No | Google Analytics 4 |
| `PPLX_API_KEY` | `functions/.env` | ✅ Yes | Perplexity API (backend) |
| `ANTHROPIC_API_KEY` | `functions/.env` | ✅ Yes | Claude API |
| `N8N_API_KEY` | `functions/.env` | ❌ No | n8N webhook auth |
| `N8N_WEBHOOK_URL` | `functions/.env` | ❌ No | n8N webhook URL |

---

## Troubleshooting

### Firebase Authentication Failed

```bash
# Re-authenticate
firebase logout
firebase login

# Verify
firebase projects:list
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# For functions
cd functions && rm -rf node_modules && npm install && cd ..
```

### Port 5173 Already in Use

```bash
# Run on different port
npm run dev -- --port 3000
```

### Firestore Emulator Connection Error

```bash
# Stop existing emulator
pkill -f "firestore-emulator"

# Restart with correct port
firebase emulators:start --inspect-functions
```

### Environment Variables Not Loading

```bash
# Verify .env file exists and is readable
cat .env

# Check file permissions
ls -la .env

# For functions/.env
cat functions/.env
```

### API Keys Invalid

Test your API keys:

```bash
# Perplexity
curl https://api.perplexity.ai/models \
  -H "Authorization: Bearer YOUR_PPLX_KEY"

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_ANTHROPIC_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-sonnet-20250514","messages":[]}'
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
# Open http://localhost:5173
```

### Run TypeScript Build

```bash
npm run build
```

### Run Linter

```bash
npm run lint  # If configured
```

### Run Tests

```bash
npm run test  # If configured
```

### Deploy Locally

```bash
firebase emulators:start
```

---

## Next Steps

1. ✅ Complete environment setup above
2. Run `npm run dev` to start development server
3. See [README.md](../README.md) for project overview
4. See [DAILY_INTEL_FRAMEWORK.md](DAILY_INTEL_FRAMEWORK.md) for content architecture
5. See [Contributing](../CONTRIBUTING.md) for development guidelines

---

## Quick Reference

```bash
# Clone and setup (one-time)
git clone https://github.com/nycsav/PlannerAPI.git
cd PlannerAPI
npm install
cd functions && npm install && cd ..
cp .env.example .env
cp functions/.env.example functions/.env
# Edit .env files with your keys

# Development workflow
npm run dev              # Start dev server
npm run build            # Build for production
firebase deploy          # Deploy to production
firebase emulators:start # Run local emulator

# Useful commands
firebase projects:list   # List Firebase projects
firebase functions:list  # List Cloud Functions
gcloud scheduler jobs list --location=us-central1 --project=plannerapi-prod
```

---

## Support

For setup issues:
1. Verify all prerequisites installed
2. Check environment variable values
3. Test API keys directly with curl
4. Review troubleshooting section above
5. Check Firebase docs: https://firebase.google.com/docs
