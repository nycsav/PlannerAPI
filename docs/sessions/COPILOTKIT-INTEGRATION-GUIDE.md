# CopilotKit Integration Guide for PlannerAPI

## ✅ Files Created

The following files have been created and are ready to use:

1. **Backend Runtime Handler**
   - `backend-integration/copilot-runtime.ts` - CopilotKit backend handler with intelligence action

2. **Frontend Components**
   - `components/IntelligenceBriefRenderer.tsx` - Custom renderer for intelligence briefings
   - `src/styles/copilot-overrides.css` - Design system styling for CopilotKit UI

---

## 🔧 Step 1: Fix NPM Permissions (REQUIRED)

Before installing packages, fix your npm cache permissions:

```bash
sudo chown -R 501:20 "/Users/savbanerjee/.npm"
```

Then clear the cache:

```bash
npm cache clean --force
```

---

## 📦 Step 2: Install Dependencies

### Frontend Dependencies

```bash
cd ~/Projects/PlannerAPI-clean
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime --legacy-peer-deps
```

### Backend Dependencies (if you have a separate backend package.json)

If your backend is separate:

```bash
cd backend  # or wherever your backend package.json is
npm install @copilotkit/backend
cd ..
```

---

## 🎨 Step 3: Update Frontend (App.tsx)

### Option A: Minimal Integration (Recommended for testing)

Add CopilotKit without disrupting existing code:

```typescript
// src/App.tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import "./styles/copilot-overrides.css";
import { IntelligenceBriefRenderer } from "../components/IntelligenceBriefRenderer";

// ... existing imports ...

export default function App() {
  const [currentAudience, setCurrentAudience] = useState<Audience>("CMO");

  const runtimeUrl = import.meta.env.MODE === 'production'
    ? 'https://planners-backend-865025512785.us-central1.run.app/api/copilot-runtime'
    : 'http://localhost:8080/api/copilot-runtime';

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {/* Custom renderer for intelligence briefs */}
      <IntelligenceBriefRenderer />

      <CopilotSidebar
        instructions={`You are a strategic marketing intelligence assistant for ${currentAudience}-level executives at Fortune 500 companies.

Your role:
- Provide data-driven insights with specific metrics and sources
- Focus on actionable intelligence for strategic planning
- Use the get_market_intelligence action to fetch comprehensive briefings
- Frame all responses for C-suite decision-makers

Key capabilities:
- Market trend analysis
- Competitive intelligence
- Strategic frameworks
- ROI and performance metrics
- Brand performance insights`}
        labels={{
          title: "Strategic Intelligence",
          initial: "Ask about market trends, competitors, brand strategy, or CMO priorities...",
          placeholder: "e.g., TikTok Shop commerce trends for CPG brands"
        }}
        defaultOpen={false}
      >
        {/* Your existing app content - UNCHANGED */}
        <AudienceProvider>
          <Navbar currentAudience={currentAudience} onAudienceChange={setCurrentAudience} />
          <HeroSearch />
          <TrustStrip />
          <DailyIntelligence />
          {/* ... rest of your existing components ... */}
        </AudienceProvider>
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

### Option B: Full Integration with Audience Context

If you want the CopilotKit to be aware of the current audience selection:

```typescript
// Create a wrapper component
function CopilotWrapper({ children, audience }: { children: React.ReactNode; audience: Audience }) {
  const runtimeUrl = import.meta.env.MODE === 'production'
    ? 'https://planners-backend-865025512785.us-central1.run.app/api/copilot-runtime'
    : 'http://localhost:8080/api/copilot-runtime';

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      actions={[
        {
          name: "get_market_intelligence",
          parameters: {
            audience: audience, // Pass current audience
          },
        },
      ]}
    >
      <IntelligenceBriefRenderer />
      <CopilotSidebar
        instructions={`You are a strategic marketing intelligence assistant specifically for ${audience}-level executives...`}
        labels={{
          title: `${audience} Intelligence`,
          initial: `Ask strategic questions relevant to ${audience} priorities...`,
          placeholder: "e.g., AI marketing ROI trends"
        }}
        defaultOpen={false}
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}

// Then in your App component:
export default function App() {
  const [currentAudience, setCurrentAudience] = useState<Audience>("CMO");

  return (
    <CopilotWrapper audience={currentAudience}>
      <AudienceProvider>
        <Navbar currentAudience={currentAudience} onAudienceChange={setCurrentAudience} />
        {/* ... rest of your app ... */}
      </AudienceProvider>
    </CopilotWrapper>
  );
}
```

---

## 🔌 Step 4: Update Backend Server

### Add the CopilotKit endpoint to your Express server

```typescript
// backend/src/server.ts (or wherever your Express app is)
import { copilotRuntimeHandler } from './copilot-runtime';

// ... existing imports and setup ...

// Add this route AFTER your existing routes
app.post('/api/copilot-runtime', copilotRuntimeHandler);

// Example full context:
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Existing routes
app.post('/chat-intel', chatIntelEndpoint);
app.post('/trending', trendingEndpoint);
app.post('/briefings', briefingsEndpoint);

// NEW: CopilotKit runtime endpoint
app.post('/api/copilot-runtime', copilotRuntimeHandler);

app.listen(8080, () => {
  console.log('Server running on port 8080');
  console.log('CopilotKit runtime available at /api/copilot-runtime');
});
```

---

## 🧪 Step 5: Testing

### 1. Start Your Backend

```bash
# Make sure your backend is running on port 8080
cd backend  # or wherever your backend is
npm run dev  # or npm start
```

### 2. Start Your Frontend

```bash
cd ~/Projects/PlannerAPI-clean
npm run dev
```

### 3. Test the Integration

1. **Open the app** at http://localhost:3000
2. **Look for the CopilotKit toggle button** (usually bottom-right corner)
3. **Click to open the sidebar**
4. **Try a test query**: "What are the latest AI marketing ROI trends?"
5. **Verify**:
   - Loading state appears
   - Intelligence brief renders with your design system styling
   - Sources are clickable
   - No console errors

### 4. Check Console Logs

You should see:
```
[CopilotKit] Fetching intelligence for query: <your query>, audience: CMO
```

---

## 🎨 Customization Options

### Change Sidebar Position

```typescript
<CopilotSidebar
  position="right"  // or "left"
  defaultOpen={false}
  // ... other props
>
```

### Adjust Styling

Edit `src/styles/copilot-overrides.css` to customize:
- Colors (already set to your design system)
- Fonts (already set to Outfit/Inter/Roboto Mono)
- Spacing
- Border radius
- Shadows

### Add More Actions

In `backend-integration/copilot-runtime.ts`, add more actions to the `actions` array:

```typescript
actions: [
  {
    name: "get_market_intelligence",
    // ... existing action
  },
  {
    name: "get_competitor_analysis",
    description: "Analyze competitor strategies and market positioning",
    parameters: [
      { name: "competitor", type: "string", required: true },
      { name: "industry", type: "string", required: false }
    ],
    handler: async ({ competitor, industry }) => {
      // Your custom logic
      return { analysis: "..." };
    }
  }
]
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@copilotkit/react-core'"

**Solution**: Make sure you installed packages with `--legacy-peer-deps` flag:
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime --legacy-peer-deps
```

### Issue: "Failed to fetch from /api/copilot-runtime"

**Solution**:
1. Verify backend is running on port 8080
2. Check the endpoint is registered: `app.post('/api/copilot-runtime', copilotRuntimeHandler)`
3. Check CORS settings allow localhost:3000

### Issue: Intelligence brief not rendering

**Solution**:
1. Verify `IntelligenceBriefRenderer` is imported and rendered inside `CopilotKit` provider
2. Check browser console for errors
3. Verify the action name matches: `"intelligence-brief"` in both renderer and backend

### Issue: Styling looks wrong

**Solution**:
1. Verify `copilot-overrides.css` is imported AFTER CopilotKit's default styles
2. Check browser DevTools to see if styles are being overridden
3. Add `!important` to critical styles if needed

---

## 📊 Cost Considerations

CopilotKit uses your existing backend endpoints, so costs remain the same:
- **Perplexity API**: ~$0.50/month (unchanged)
- **Claude Sonnet 4**: ~$1.97/month with caching (unchanged)
- **Total**: ~$2.47/month

The only difference is **how** users interact with the intelligence (conversational sidebar vs modal).

---

## 🚀 Deployment

### Frontend (Vite/React)

No changes needed to your existing deployment process. The CopilotKit runtime URL automatically switches based on `import.meta.env.MODE`.

### Backend (Google Cloud Run)

1. Make sure `backend-integration/copilot-runtime.ts` is included in your deployment
2. Ensure the route is registered before deploying
3. Update any CORS settings to allow requests to `/api/copilot-runtime`

---

## 🔄 Migration Strategy

### Phase 1: Side-by-Side (Recommended)
- Keep existing `IntelligenceModal` as-is
- Add CopilotKit sidebar for users to opt-in
- Collect feedback

### Phase 2: Gradual Rollout
- Make CopilotKit the primary interface
- Keep modal as fallback
- Monitor usage analytics

### Phase 3: Full Migration
- Remove modal if CopilotKit proves superior
- Or keep both for different use cases:
  - **Modal**: Deep-dive intelligence reports
  - **Sidebar**: Quick conversational queries

---

## 📝 Next Steps

1. ✅ Fix npm permissions (Step 1)
2. ✅ Install dependencies (Step 2)
3. ✅ Update App.tsx (Step 3)
4. ✅ Update backend routes (Step 4)
5. ✅ Test locally (Step 5)
6. ✅ Customize styling if needed
7. ✅ Deploy to staging
8. ✅ Get user feedback
9. ✅ Deploy to production

---

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Check the backend logs for CopilotKit runtime errors
3. Verify the runtime URL is correct (dev vs production)
4. Test the `/chat-intel` endpoint directly to ensure it works
5. Review the CopilotKit docs: https://docs.copilotkit.ai/

---

**Created**: January 20, 2026
**Status**: Ready for implementation after npm permission fix
**Files Ready**: ✅ Backend handler, ✅ Frontend component, ✅ Custom styles
