/**
 * Cloud Run Backend Integration Guide
 *
 * This file shows how to integrate all PlannerAPI endpoints into your Express server
 *
 * Location: Add this to your Cloud Run backend's main server file (e.g., index.ts or server.ts)
 */

import express from 'express';
import cors from 'cors';

// Import endpoint routers
import chatIntelRouter from './chat-intel-endpoint';
import briefingsRouter from './briefings-endpoint';
// import trendingRouter from './trending-endpoint'; // Uncomment after creating

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://plannerapi-clean.web.app',
    'https://plannerapi-clean.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount endpoint routers
app.use(chatIntelRouter);      // Adds: POST /chat-intel
app.use(briefingsRouter);       // Adds: GET /briefings/latest, POST /briefings/generate
// app.use(trendingRouter);     // Adds: GET /trending/topics (uncomment after creating)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PlannerAPI Backend running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  POST   /chat-intel`);
  console.log(`  GET    /briefings/latest`);
  console.log(`  POST   /briefings/generate`);
  console.log(`  GET    /trending/topics (pending)`);
  console.log(`  GET    /health`);
});

/**
 * ENVIRONMENT VARIABLES REQUIRED:
 *
 * - PPLX_API_KEY: Your Perplexity API key
 * - PPLX_MODEL_FAST: Perplexity model to use (default: 'sonar')
 * - PORT: Server port (default: 8080, Cloud Run uses env PORT)
 * - NODE_ENV: 'production' or 'development'
 *
 * Set these in your Cloud Run service configuration:
 * gcloud run services update planners-backend \
 *   --update-env-vars PPLX_API_KEY=your_key_here,PPLX_MODEL_FAST=sonar
 */

/**
 * DEPLOYMENT STEPS:
 *
 * 1. Copy endpoint files to your Cloud Run backend:
 *    - chat-intel-endpoint.ts
 *    - briefings-endpoint.ts
 *    - trending-endpoint.ts (after creation)
 *
 * 2. Update your main server file with the code above
 *
 * 3. Install dependencies (if not already installed):
 *    npm install express cors
 *    npm install -D @types/express @types/cors
 *
 * 4. Build and deploy to Cloud Run:
 *    gcloud run deploy planners-backend \
 *      --source . \
 *      --region us-central1 \
 *      --allow-unauthenticated \
 *      --set-env-vars PPLX_API_KEY=your_key_here
 *
 * 5. Test endpoints:
 *    curl https://planners-backend-865025512785.us-central1.run.app/health
 *    curl https://planners-backend-865025512785.us-central1.run.app/briefings/latest?audience=CMO&limit=6
 */
